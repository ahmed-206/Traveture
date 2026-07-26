export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  photo: string;
}

export interface AuthUserData {
  user: User;
}