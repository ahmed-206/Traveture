export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  photo: string;
  favorites?: string[];
}

export interface AuthUserData {
  user: User;
}