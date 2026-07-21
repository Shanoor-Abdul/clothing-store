import api from "@/lib/axios";

import {
  AdminLoginPayload,
  AuthResponse,
  UserLoginPayload,
} from "./types";
import { UserRegisterFormData } from "./validation/auth.schema";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const adminLogin = async (
  payload: AdminLoginPayload
): Promise<AuthResponse> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    "/auth/admin/login",
    payload
  );

  return data.data;
};

export const userLogin = async (
  payload: UserLoginPayload
): Promise<AuthResponse> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    "/auth/user/login",
    payload
  );

  return data.data;
};

export const userRegister = async (
  payload: UserRegisterFormData
): Promise<AuthResponse> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    "/auth/user/register",
    payload
  );

  return data.data;
};

export const getMe = async (): Promise<AuthResponse> => {
  const { data } = await api.get<ApiResponse<AuthResponse>>("/auth/me");

  return data.data;
};

export const getProfile = async (): Promise<any> => {
  const { data } = await api.get<ApiResponse<any>>("/user");
  return data.data;
};

export const updateProfile = async (
  payload: Record<string, unknown>
): Promise<any> => {
  const { data } = await api.put<ApiResponse<any>>(
    "/user",
    payload
  );
  return data.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
