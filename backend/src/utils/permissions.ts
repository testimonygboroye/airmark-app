/**
 * Canonical permission key registry.
 * Every new feature module MUST register its permission keys here rather
 * than using ad-hoc strings elsewhere — this is the single source of truth
 * the dynamic role system checks against.
 */
export const PERMISSIONS = {
  TEAM_MANAGE: "team:manage",
  TEAM_VIEW: "team:view",
  MEMBER_INVITE: "member:invite",
  MEMBER_REMOVE: "member:remove",
  MEMBER_VIEW: "member:view",
  ROLE_MANAGE: "role:manage",
  EVENT_CREATE: "event:create",
  EVENT_MANAGE: "event:manage",
  EVENT_VIEW: "event:view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** A role holding this wildcard bypasses individual permission checks entirely. */
export const WILDCARD_PERMISSION = "*";

export const DEFAULT_TEAM_ROLES: Array<{
  name: string;
  rank: number;
  isSystemRole: true;
  permissions: string[];
}> = [
  {
    name: "Team Owner",
    rank: 0,
    isSystemRole: true,
    permissions: [WILDCARD_PERMISSION],
  },
  {
    name: "Director",
    rank: 1,
    isSystemRole: true,
    permissions: [
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.MEMBER_VIEW,
      PERMISSIONS.MEMBER_INVITE,
      PERMISSIONS.EVENT_CREATE,
      PERMISSIONS.EVENT_MANAGE,
      PERMISSIONS.EVENT_VIEW,
    ],
  },
  {
    name: "Operator",
    rank: 2,
    isSystemRole: true,
    permissions: [PERMISSIONS.TEAM_VIEW, PERMISSIONS.EVENT_VIEW],
  },
  {
    name: "Editor",
    rank: 2,
    isSystemRole: true,
    permissions: [PERMISSIONS.TEAM_VIEW, PERMISSIONS.EVENT_VIEW],
  },
  {
    name: "Viewer",
    rank: 3,
    isSystemRole: true,
    permissions: [PERMISSIONS.TEAM_VIEW, PERMISSIONS.EVENT_VIEW],
  },
];
