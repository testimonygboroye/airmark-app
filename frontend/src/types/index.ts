export interface AuthUser {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  isSuperAdmin: boolean;
  isEmailVerified?: boolean;
}

export interface Team {
  _id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  teamId: string;
  name: string;
  rank: number;
  permissions: string[];
  isSystemRole: boolean;
}

export interface Membership {
  _id: string;
  userId: string;
  teamId: Team;
  roleId: Role;
  status: "active" | "invited" | "suspended";
  createdAt: string;
}

export interface TeamMemberEntry {
  _id: string;
  userId: { _id: string; firstName: string; lastName: string; email: string };
  roleId: { _id: string; name: string; rank: number };
  status: string;
}

export type EventStatus = "scheduled" | "live" | "ended";

export interface EventRecord {
  _id: string;
  teamId: string;
  title: string;
  scheduledStart: string;
  status: EventStatus;
  currentSegmentId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CameraAssignmentRecord {
  _id: string;
  eventId: string;
  teamId: string;
  cameraNumber: number;
  operatorUserId?: { _id: string; firstName: string; lastName: string; email: string } | null;
  label: string;
  isLive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RunOfShowSegmentRecord {
  _id: string;
  eventId: string;
  teamId: string;
  order: number;
  title: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export type SignalType = "battery_low" | "need_backup" | "audio_issue" | "custom";

export interface SignalRecord {
  _id: string;
  eventId: string;
  teamId: string;
  fromUserId: { _id: string; firstName: string; lastName: string };
  type: SignalType;
  customText?: string;
  acknowledged: boolean;
  acknowledgedBy?: { _id: string; firstName: string; lastName: string };
  acknowledgedAt?: string;
  createdAt: string;
}

export interface TalkbackMessageRecord {
  _id: string;
  eventId: string;
  teamId: string;
  toUserId: string;
  fromUserId: { _id: string; firstName: string; lastName: string };
  text: string;
  createdAt: string;
}

export interface HighlightMarkerRecord {
  _id: string;
  eventId: string;
  teamId: string;
  createdBy: { _id: string; firstName: string; lastName: string };
  label?: string;
  offsetSeconds: number;
  createdAt: string;
}

export function formatOffset(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export type EquipmentIssueType = "battery_low" | "storage_full" | "equipment_fault" | "other";

export interface EquipmentIssueRecord {
  _id: string;
  eventId: string;
  teamId: string;
  cameraId?: string;
  reportedBy: { _id: string; firstName: string; lastName: string };
  issueType: EquipmentIssueType;
  note?: string;
  status: "open" | "resolved";
  resolvedBy?: { _id: string; firstName: string; lastName: string };
  resolvedAt?: string;
  createdAt: string;
}

export interface ChecklistItemState {
  itemId: string;
  text: string;
  completed: boolean;
}

export interface ReadinessEntry {
  userId: string;
  name: string;
  role: string;
  totalItems: number;
  completedItems: number;
}

export interface ScheduleAssignmentRecord {
  _id: string;
  teamId: string;
  userId: { _id: string; firstName: string; lastName: string };
  roleId: { _id: string; name: string };
  date: string;
  note?: string;
}

export interface ObsSceneRecord {
  sceneName: string;
  sceneIndex: number;
}

export interface ObsConnectionRecord {
  status: "connected" | "disconnected";
  obsVersion?: string;
  currentProgramScene?: string;
  scenes: ObsSceneRecord[];
  transitions?: string[];
  currentTransition?: string;
  transitionDurationMs?: number;
  sceneItems?: ObsSceneItemRecord[];
  fallbackSceneName?: string;
  streamStatus?: ObsStreamStatus;
  recordStatus?: ObsRecordStatus;
  favoriteOverlays?: FavoriteOverlayRecord[];
  watermarkSceneItemId?: number;
  introSceneName?: string;
  introDurationSeconds?: number;
  outroSceneName?: string;
  outroDurationSeconds?: number;
}

export interface ObsSceneItemRecord {
  sceneItemId: number;
  sourceName: string;
  sceneItemEnabled: boolean;
}

export interface ObsStreamStatus {
  active: boolean;
  outputSkippedFrames: number;
  outputTotalFrames: number;
}

export interface ObsRecordStatus {
  active: boolean;
}

export interface FavoriteOverlayRecord {
  label: string;
  sceneItemId: number;
}

export interface AdminTeamEntry {
  _id: string;
  name: string;
  slug: string;
  createdBy: { _id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
  memberCount: number;
}

export interface AdminUserEntry {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AdminStats {
  teamCount: number;
  userCount: number;
  verifiedCount: number;
  unverifiedCount: number;
}
