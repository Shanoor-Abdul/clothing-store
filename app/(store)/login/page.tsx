"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Lock, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import {
  UserLoginSchema,
  UserLoginFormData,
} from "@/features/auth/validation/auth.schema";
import { useUserLogin } from "@/features/auth/hooks";
import { useAppSelector } from "@/store";

const LoginPage = () => {
  const router = useRouter();
  const loginMutation = useUserLogin();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const role = useAppSelector((state) => state.auth.role);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(role === "ADMIN" ? "/admin" : "/account");
    }
  }, [isAuthenticated, role, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginFormData>({
    resolver: zodResolver(UserLoginSchema),
    defaultValues: { email: "", mobile: "", password: "" },
  });

  const onSubmit = async (data: UserLoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      toast.success("Login successful");
      router.replace("/account");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to your account to continue.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Mobile (optional)
            </label>
            <input
              {...register("mobile")}
              placeholder="+9665..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loginMutation.isPending && (
              <Loader2 className="animate-spin" size={18} />
            )}
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Are you an admin?{" "}
          <Link
            href="/admin/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
