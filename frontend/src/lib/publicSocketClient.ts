import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "https://airmark-backend.onrender.com";

let publicSocket: Socket | null = null;

export function connectPublicSocket(publicShareToken: string): Socket {
  if (publicSocket) publicSocket.disconnect();
  publicSocket = io(SOCKET_URL, { auth: { publicShareToken } });
  return publicSocket;
}

export function getPublicSocket(): Socket | null {
  return publicSocket;
}

export function disconnectPublicSocket(): void {
  publicSocket?.disconnect();
  publicSocket = null;
}
