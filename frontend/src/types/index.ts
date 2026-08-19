export interface AuthUser {
  id: string;
  firstName: string;
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
