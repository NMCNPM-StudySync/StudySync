export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  expiresAt: string;
  user: User;
}
