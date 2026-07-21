"use client";

import { useEffect } from "react";
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_30%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_35%)]" />

      <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30">
            <Lock size={28} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Admin Dashboard Login
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Secure access to inventory, orders, and store settings.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/80 shadow-inner shadow-slate-950/20 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-300/20">
              <Mail
                className="pointer-events-none absolute left-4 top-4 text-slate-400"
                size={18}
              />
              <input
                {...register("email")}
                type="email"
                placeholder="admin@store.com"
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
              Password
            </label>
            <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/80 shadow-inner shadow-slate-950/20 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-300/20">
              <Lock
                className="pointer-events-none absolute left-4 top-4 text-slate-400"
                size={18}
              />
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
            {loginMutation.isPending && (
              <Loader2 className="animate-spin" size={18} />
            )}
            Sign In
          </button>
        </form>

        <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-200">Need help?</p>
          <p className="mt-1 text-slate-400">
            Use your admin credentials to sign in. If you do not have access, contact your team lead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
