export type UserRole = "user" | "admin" | "guide" | "lead-guide";
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  photo: string;
  favorites?: string[];
}

export interface AuthUserData {
  user: User;
}