import { Request, Response } from "express";
import { Types } from "mongoose";
import { authenticator } from "otplib";
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

export const login = asyncHandler(async (req: Request, res: Response) => {
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

  if (user.twoFactorEnabled) {
    const pendingToken = signPending2FAToken((user._id as Types.ObjectId).toString());
    return res.json({
      success: true,
      data: { requires2FA: true, pendingToken },
    });
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

  const isValidTotp = authenticator.check(code, user.twoFactorSecret);

  let usedBackupCode = false;
  if (!isValidTotp) {
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

/** 2FA setup — restricted to Super Admin accounts per security baseline recommendation. */
export const setup2FA = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");
  if (!user.isSuperAdmin) throw ApiError.forbidden("Two-factor authentication is currently available for Founder/Super Admin accounts only");

  const secret = authenticator.generateSecret();
  user.twoFactorSecret = secret;
  await user.save();

  const otpauthUrl = authenticator.keyuri(user.email, "Airmark", secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  res.json({ success: true, data: { qrCodeDataUrl, secret } });
});

export const confirmSetup2FA = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  const user = await User.findById(req.user!.id).select("+twoFactorSecret");
  if (!user?.twoFactorSecret) throw ApiError.badRequest("Start 2FA setup first");

  const isValid = authenticator.check(code, user.twoFactorSecret);
  if (!isValid) throw ApiError.badRequest("Invalid code. Please try again.");

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
