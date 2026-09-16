import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type BridgePurpose = "obs-bridge-pairing" | "direct-stream-bridge-pairing";

export interface BridgePairingPayload {
  eventId: string;
  teamId: string;
  purpose: BridgePurpose;
}

export function signBridgePairingToken(data: { eventId: string; teamId: string }, purpose: BridgePurpose): string {
  return jwt.sign({ ...data, purpose }, env.OBS_BRIDGE_SECRET, { expiresIn: "10m" });
}

/** Verifies the token AND confirms it was issued for this exact bridge —
 * this is the real fix for tokens being interchangeable between OBS and
 * Direct Stream, which was silently allowing the wrong one to "work." */
export function verifyBridgePairingToken(token: string, expectedPurpose: BridgePurpose): BridgePairingPayload {
  const decoded = jwt.verify(token, env.OBS_BRIDGE_SECRET) as BridgePairingPayload;
  if (decoded.purpose !== expectedPurpose) {
    throw new Error(`This pairing code is for ${decoded.purpose === "obs-bridge-pairing" ? "OBS" : "Direct Stream"}, not this bridge.`);
  }
  return decoded;
}
