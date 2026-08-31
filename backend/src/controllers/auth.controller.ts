import { Request, Response } from "express";
import { Types } from "mongoose";
import { generateSecret, verify } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import { User } from "../models/User.model";
import { RefreshToken } from "../models/RefreshToken.model";
import { TeamInvite } from "../models/TeamInvite.model";
import { Membership } from "../models/Membership.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  issueTokenPair,
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
} from "../services/token.service";
import { generateSecureToken, hashRefreshToken } from "../utils/jwt.util";
import { signPending2FAToken, verifyPending2FAToken } from "../utils/twoFactorToken.util";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email.service";
import { env } from "../config/env";
import bcrypt from "bcryptjs";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, middleName, lastName, email, password, inviteToken } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  let pendingInviteId: Types.ObjectId | undefined;
  if (inviteToken) {
    const tokenHash = hashRefreshToken(inviteToken);
    const invite = await TeamInvite.findOne({ tokenHash, status: "pending", expiresAt: { $gt: new Date() } });
    if (invite && invite.email === email) {
      pendingInviteId = invite._id as Types.ObjectId;
    }
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const { raw: verifyToken, hash: verifyTokenHash } = generateSecureToken();

  const user = await User.create({
    firstName,
    middleName: middleName || undefined,
    lastName,
    email,
    passwordHash,
    emailVerificationTokenHash: verifyTokenHash,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    pendingInviteId,
  });

  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${verifyToken}`;
  await sendVerificationEmail(user.email, user.firstName, verifyUrl);

  res.status(201).json({
    success: true,
    message: "Account created. Please check your email to verify your account.",
    data: { userId: user._id },
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const tokenHash = hashRefreshToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationTokenHash +emailVerificationExpires +pendingInviteId");

  if (!user) {
    throw ApiError.badRequest("Verification link is invalid or has expired");
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;

  let joinedTeamName: string | undefined;

  if (user.pendingInviteId) {
    const invite = await TeamInvite.findOne({ _id: user.pendingInviteId, status: "pending" }).populate("teamId");
    if (invite && invite.expiresAt > new Date()) {
      const alreadyMember = await Membership.findOne({ userId: user._id, teamId: invite.teamId });
      if (!alreadyMember) {
        await Membership.create({
          userId: user._id,
          teamId: invite.teamId,
          roleId: invite.roleId,
          status: "active",
          createdBy: invite.invitedBy,
        });
        joinedTeamName = (invite.teamId as any).name;
      }
      invite.status = "accepted";
      await invite.save();
    }
    user.pendingInviteId = undefined;
  }

  await user.save();

  res.json({
    success: true,
    message: joinedTeamName
      ? `Email verified. You've joined ${joinedTeamName}.`
      : "Email verified successfully",
  });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+passwordHash +twoFactorEnabled");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw ApiError.forbidden("Please verify your email before logging in");
  }

  // Kill switch: TWO_FACTOR_ENFORCEMENT_ENABLED=false on Render bypasses
  // this entirely, regardless of any account's twoFactorEnabled setting.
  if (user.twoFactorEnabled && env.TWO_FACTOR_ENFORCEMENT_ENABLED) {
    const pendingToken = signPending2FAToken((user._id as Types.ObjectId).toString());
    res.json({
      success: true,
      data: { requires2FA: true, pendingToken },
    });
    return;
  }

  const { accessToken } = await issueTokenPair(
    user._id as Types.ObjectId,
    user.isSuperAdmin,
    res,
    { userAgent: req.headers["user-agent"], ipAddress: req.ip }
  );

  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
      },
    },
  });
});

export const verify2FALogin = asyncHandler(async (req: Request, res: Response) => {
  const { pendingToken, code } = req.body;

  let payload;
  try {
    payload = verifyPending2FAToken(pendingToken);
  } catch {
    throw ApiError.unauthorized("This login attempt has expired. Please log in again.");
  }

  const user = await User.findById(payload.userId).select(
    "+twoFactorSecret +twoFactorEnabled +twoFactorBackupCodeHashes"
  );
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw ApiError.unauthorized("Two-factor authentication is not set up correctly for this account");
  }

  const totpResult = await verify({ secret: user.twoFactorSecret, token: code });

  let usedBackupCode = false;
  if (!totpResult.valid) {
    const codeHash = crypto.createHash("sha256").update(code.trim()).digest("hex");
    const backupIndex = user.twoFactorBackupCodeHashes.indexOf(codeHash);
    if (backupIndex === -1) {
      throw ApiError.unauthorized("Invalid authentication code");
    }
    user.twoFactorBackupCodeHashes.splice(backupIndex, 1);
    await user.save();
    usedBackupCode = true;
  }

  const { accessToken } = await issueTokenPair(
    user._id as Types.ObjectId,
    user.isSuperAdmin,
    res,
    { userAgent: req.headers["user-agent"], ipAddress: req.ip }
  );

  res.json({
    success: true,
    data: {
      accessToken,
      usedBackupCode,
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
      },
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw ApiError.unauthorized("No refresh token provided");
  }

  const tokenHash = hashRefreshToken(token);
  const stored = await RefreshToken.findOne({ tokenHash, revoked: false });

  if (!stored || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token is invalid or expired");
  }

  const user = await User.findById(stored.userId);
  if (!user) {
    throw ApiError.unauthorized("Account no longer exists");
  }

  stored.revoked = true;
  await stored.save();

  const { accessToken } = await issueTokenPair(
    user._id as Types.ObjectId,
    user.isSuperAdmin,
    res,
    { userAgent: req.headers["user-agent"], ipAddress: req.ip }
  );

  res.json({ success: true, data: { accessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    const tokenHash = hashRefreshToken(token);
    await RefreshToken.updateOne({ tokenHash }, { revoked: true });
  }
  clearRefreshCookie(res);
  res.json({ success: true, message: "Logged out successfully" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const { raw, hash } = generateSecureToken();
    user.passwordResetTokenHash = hash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${raw}`;
    await sendPasswordResetEmail(user.email, user.firstName, resetUrl);
  }

  res.json({
    success: true,
    message: "If that email is registered, a reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const tokenHash = hashRefreshToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpires");

  if (!user) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }

  user.passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await RefreshToken.updateMany({ userId: user._id }, { revoked: true });

  res.json({ success: true, message: "Password reset successfully. Please log in." });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).select("+twoFactorEnabled");
  if (!user) throw ApiError.notFound("User not found");

  res.json({
    success: true,
    data: {
      id: user._id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, middleName, lastName } = req.body;
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");

  user.firstName = firstName;
  user.middleName = middleName || undefined;
  user.lastName = lastName;
  await user.save();

  res.json({
    success: true,
    data: {
      id: user._id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user!.id).select("+passwordHash");
  if (!user) throw ApiError.notFound("User not found");

  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw ApiError.unauthorized("Current password is incorrect");

  user.passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
  await user.save();

  await RefreshToken.updateMany({ userId: user._id }, { revoked: true });

  res.json({ success: true, message: "Password changed. Please log in again." });
});

export const setup2FA = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");

  const secret = await generateSecret();
  user.twoFactorSecret = secret;
  await user.save();

  const issuer = "Airmark";
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  res.json({ success: true, data: { qrCodeDataUrl, secret } });
});

export const confirmSetup2FA = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  const user = await User.findById(req.user!.id).select("+twoFactorSecret");
  if (!user?.twoFactorSecret) throw ApiError.badRequest("Start 2FA setup first");

  const result = await verify({ secret: user.twoFactorSecret, token: code });
  if (!result.valid) throw ApiError.badRequest("Invalid code. Please try again.");

  const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(5).toString("hex"));
  const backupCodeHashes = backupCodes.map((c) => crypto.createHash("sha256").update(c).digest("hex"));

  user.twoFactorEnabled = true;
  user.twoFactorBackupCodeHashes = backupCodeHashes;
  await user.save();

  res.json({ success: true, data: { backupCodes } });
});

export const disable2FA = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  const user = await User.findById(req.user!.id).select("+passwordHash");
  if (!user) throw ApiError.notFound("User not found");

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized("Password is incorrect");

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorBackupCodeHashes = [];
  await user.save();

  res.json({ success: true, message: "Two-factor authentication disabled" });
});

/**
 * Uses the still-valid pendingToken from the login attempt (which already
 * proves the person knows the account password) rather than asking them
 * to re-enter it — they're stuck specifically because they can't produce
 * a TOTP code, not because they've forgotten their password.
 */
export const request2FARecovery = asyncHandler(async (req: Request, res: Response) => {
  const { pendingToken } = req.body;

  let payload;
  try {
    payload = verifyPending2FAToken(pendingToken);
  } catch {
    throw ApiError.unauthorized("This login attempt has expired. Please log in again.");
  }

  const user = await User.findById(payload.userId);
  if (!user) throw ApiError.notFound("Account not found");

  const { raw, hash } = generateSecureToken();
  user.twoFactorRecoveryTokenHash = hash;
  user.twoFactorRecoveryExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const { send2FARecoveryEmail } = await import("../services/email.service");
  const recoveryUrl = `${env.CLIENT_URL}/2fa-recovery?token=${raw}`;
  await send2FARecoveryEmail(user.email, user.firstName, recoveryUrl);

  res.json({ success: true, message: `Recovery instructions sent to ${user.email}.` });
});

export const confirm2FARecovery = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const tokenHash = hashRefreshToken(token);

  const user = await User.findOne({
    twoFactorRecoveryTokenHash: tokenHash,
    twoFactorRecoveryExpires: { $gt: new Date() },
  }).select("+twoFactorRecoveryTokenHash +twoFactorRecoveryExpires");

  if (!user) throw ApiError.badRequest("This recovery link is invalid or has expired");

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorBackupCodeHashes = [];
  user.twoFactorRecoveryTokenHash = undefined;
  user.twoFactorRecoveryExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Two-factor authentication disabled. You can now log in with just your password." });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const { confirmationText, password } = req.body;

  if (confirmationText !== "DELETE MY ACCOUNT") {
    throw ApiError.badRequest('You must type exactly "DELETE MY ACCOUNT" to confirm');
  }

  const user = await User.findById(req.user!.id).select("+passwordHash");
  if (!user) throw ApiError.notFound("User not found");

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized("Password is incorrect");

  const { Membership } = await import("../models/Membership.model");
  const { Role } = await import("../models/Role.model");
  const { Team } = await import("../models/Team.model");

  const memberships = await Membership.find({ userId: user._id, status: "active" }).populate("roleId teamId");

  const ownedTeamsWithOthers: string[] = [];
  for (const m of memberships) {
    const role = m.roleId as any;
    if (role?.name === "Team Owner") {
      const otherMembers = await Membership.countDocuments({ teamId: m.teamId, status: "active", userId: { $ne: user._id } });
      if (otherMembers > 0) {
        ownedTeamsWithOthers.push((m.teamId as any).name);
      }
    }
  }

  if (ownedTeamsWithOthers.length > 0) {
    throw ApiError.badRequest(
      `Remove all other members from these teams first (or delete the teams): ${ownedTeamsWithOthers.join(", ")}`
    );
  }

  // Safe to proceed — delete solo-owned teams and this account entirely.
  for (const m of memberships) {
    const role = m.roleId as any;
    if (role?.name === "Team Owner") {
      await Team.findByIdAndDelete(m.teamId);
    }
  }

  await Membership.deleteMany({ userId: user._id });
  await RefreshToken.deleteMany({ userId: user._id });
  await User.findByIdAndDelete(user._id);

  clearRefreshCookie(res);
  res.json({ success: true, message: "Account permanently deleted" });
});
