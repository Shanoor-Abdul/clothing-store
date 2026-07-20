export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface UserLoginPayload {
  email?: string;
  mobile?: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  role: "ADMIN" | "USER";
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
