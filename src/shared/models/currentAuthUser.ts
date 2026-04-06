export interface CurrentAuthUser {
  id: number;
  email: string;
  roles: string[];
  isActive?: boolean;
}
