import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { verifyAccessToken } from "../utils/jwt.util";
import { User } from "../models/User.model";

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    isSuperAdmin: boolean;
  };
}

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
): Promise<void> {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error("Missing authentication token"));
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (!user) {
      return next(new Error("Account no longer exists"));
    }

    socket.data.userId = user._id.toString();
    socket.data.isSuperAdmin = user.isSuperAdmin;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}
