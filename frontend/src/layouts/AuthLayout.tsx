import { Outlet } from "react-router";

/** Wraps public, unauthenticated routes (login, register, password flows). */
export function AuthLayout() {
  return <Outlet />;
}
