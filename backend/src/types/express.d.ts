export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        isSuperAdmin: boolean;
      };
      membership?: {
        teamId: string;
        roleId: string;
        roleName: string;
        permissions: string[];
      };
    }
  }
}
