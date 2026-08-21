import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface BridgePairingPayload {
  eventId: string;
  teamId: string;
  purpose: "obs-bridge-pairing";
}

/** Short-lived — the founder pastes this into the bridge script within minutes, not hours. */
export function signBridgePairingToken(payload: Omit<BridgePairingPayload, "purpose">): string {
  return jwt.sign(
    { ...payload, purpose: "obs-bridge-pairing" },
    env.OBS_BRIDGE_SECRET,
    { expiresIn: "10m" }
  );
}

export function verifyBridgePairingToken(token: string): BridgePairingPayload {
  const decoded = jwt.verify(token, env.OBS_BRIDGE_SECRET) as BridgePairingPayload;
  if (decoded.purpose !== "obs-bridge-pairing") {
    throw new Error("Invalid token purpose");
  }
  return decoded;
}
