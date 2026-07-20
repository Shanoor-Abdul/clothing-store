"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AdminLoginSchema,
  AdminLoginFormData,
} from "@/features/auth/validation/auth.schema";
import { useAdminLogin } from "@/features/auth/hooks";
import { useAppSelector } from "@/store";

const AdminLoginPage = () => {
  const router = useRouter();
  const loginMutation = useAdminLogin();
  const role = useAppSelector((state) => state.auth.role);
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (isAuthenticated && role === "ADMIN") {
      router.replace("/admin");
    }
  }, [isAuthenticated, role, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);

      toast.success("Login successful");
      router.replace("/admin");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid credentials";

      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Clothing Admin
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to your admin account
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
                placeholder="admin@store.com"
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
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
      </div>
    </div>
  );
};

export default AdminLoginPage;
