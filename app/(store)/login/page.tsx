"use client";

import { useEffect } from "react";
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
      router.replace(role === "ADMIN" ? "/admin" : "/products");
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
      router.replace("/products");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  };

  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 text-white">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30">
            <UserIcon size={28} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Sign in to your account to continue shopping.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/80 shadow-inner shadow-slate-950/20 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-300/20">
              <Mail className="pointer-events-none absolute left-4 top-4 text-slate-500" size={18} />
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-3xl border-none bg-transparent py-4 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-rose-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Mobile (optional)
            </label>
            <input
              {...register("mobile")}
              placeholder="+9665..."
              className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-300/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/80 shadow-inner shadow-slate-950/20 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-300/20">
              <Lock className="pointer-events-none absolute left-4 top-4 text-slate-500" size={18} />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-3xl border-none bg-transparent py-4 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-rose-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending && <Loader2 className="animate-spin" size={18} />}
            Sign In
          </button>
        </form>

        <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-200">New to ClothingStore?</p>
          <p className="mt-1">
            Create an account to save shipping details and checkout faster.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Create account
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Admin login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
