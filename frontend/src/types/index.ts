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
