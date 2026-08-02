"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  adminLogin,
  getMe,
  logout,
  userLogin,
  userRegister,
} from "./api";

import { useAppDispatch, useAppSelector } from "@/store";
import { clearAuth, setAuth } from "./slice";

import {
  AdminLoginFormData,
  UserLoginFormData,
  UserRegisterFormData,
} from "./validation/auth.schema";

export const useAdminLogin = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: AdminLoginFormData) =>
      adminLogin(data),
    onSuccess: (res) => {
      if (res.accessToken) {
        localStorage.setItem("token", res.accessToken);
        localStorage.setItem("cs_access_token", res.accessToken);
      }
      dispatch(setAuth({ user: res.user }));
    },
  });
};

export const useUserLogin = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: UserLoginFormData) =>
      userLogin(data),
    onSuccess: (res) => {
      if (res.accessToken) {
        localStorage.setItem("token", res.accessToken);
        localStorage.setItem("cs_access_token", res.accessToken);
      }
      dispatch(setAuth({ user: res.user }));
    },
  });
};

export const useUserRegister = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: UserRegisterFormData) =>
      userRegister(data),
    onSuccess: (res) => {
      if (res.accessToken) {
        localStorage.setItem("token", res.accessToken);
        localStorage.setItem("cs_access_token", res.accessToken);
      }
      dispatch(setAuth({ user: res.user }));
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("cs_access_token");
      dispatch(clearAuth());
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: isAuthenticated,
  });
};
