import { createContext } from 'react';
import type { AuthResponseData, LoginRequest, RegisterRequest, User } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponseData>;
  register: (payload: RegisterRequest) => Promise<AuthResponseData>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
