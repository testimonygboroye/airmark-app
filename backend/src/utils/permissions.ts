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
  TALLY_CONTROL: "tally:control",
  TALLY_VIEW: "tally:view",
  ROS_MANAGE: "ros:manage",
  ROS_CONTROL: "ros:control",
  COUNTDOWN_CONTROL: "countdown:control",
  SIGNAL_SEND: "signal:send",
  SIGNAL_MANAGE: "signal:manage",
  TALKBACK_SEND: "talkback:send",
  HIGHLIGHT_CREATE: "highlight:create",
  HIGHLIGHT_VIEW: "highlight:view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

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
      PERMISSIONS.TALLY_CONTROL,
      PERMISSIONS.TALLY_VIEW,
      PERMISSIONS.ROS_MANAGE,
      PERMISSIONS.ROS_CONTROL,
      PERMISSIONS.COUNTDOWN_CONTROL,
      PERMISSIONS.SIGNAL_SEND,
      PERMISSIONS.SIGNAL_MANAGE,
      PERMISSIONS.TALKBACK_SEND,
      PERMISSIONS.HIGHLIGHT_CREATE,
      PERMISSIONS.HIGHLIGHT_VIEW,
    ],
  },
  {
    name: "Operator",
    rank: 2,
    isSystemRole: true,
    permissions: [
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.EVENT_VIEW,
      PERMISSIONS.TALLY_VIEW,
      PERMISSIONS.SIGNAL_SEND,
      PERMISSIONS.HIGHLIGHT_CREATE,
    ],
  },
  {
    name: "Editor",
    rank: 2,
    isSystemRole: true,
    permissions: [
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.EVENT_VIEW,
      PERMISSIONS.HIGHLIGHT_VIEW,
    ],
  },
  {
    name: "Viewer",
    rank: 3,
    isSystemRole: true,
    permissions: [PERMISSIONS.TEAM_VIEW, PERMISSIONS.EVENT_VIEW, PERMISSIONS.TALLY_VIEW],
  },
];
