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
