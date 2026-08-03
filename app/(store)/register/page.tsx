"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Lock, Loader2, User as UserIcon, Phone } from "lucide-react";
import { toast } from "sonner";

import {
  UserRegisterSchema,
  UserRegisterFormData,
} from "@/features/auth/validation/auth.schema";
import { useUserRegister } from "@/features/auth/hooks";
import { useAppSelector } from "@/store";

const RegisterPage = () => {
  const router = useRouter();
  const registerMutation = useUserRegister();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (isAuthenticated) router.replace("/products");
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserRegisterFormData>({
    resolver: zodResolver(UserRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserRegisterFormData) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success("Account created");
      router.replace("/products");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  };

  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-white flex items-center justify-center">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
            <UserIcon size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Create Account
          </h1>
          <p className="mt-2 text-xs text-slate-300 sm:text-sm">
            Join us to start shopping curated drops.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 sm:text-sm">
              Full Name
            </label>
            <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80 shadow-inner focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
              <UserIcon className="pointer-events-none absolute left-4 top-3.5 text-slate-500" size={16} />
              <input
                {...register("name")}
                placeholder="John Doe"
                className="w-full rounded-2xl border-none bg-transparent py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 sm:text-sm">
              Email Address
            </label>
            <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80 shadow-inner focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
              <Mail className="pointer-events-none absolute left-4 top-3.5 text-slate-500" size={16} />
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl border-none bg-transparent py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 sm:text-sm">
              Mobile Number
            </label>
            <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80 shadow-inner focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
              <Phone className="pointer-events-none absolute left-4 top-3.5 text-slate-500" size={16} />
              <input
                {...register("mobile")}
                placeholder="+966 5..."
                className="w-full rounded-2xl border-none bg-transparent py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            {errors.mobile && (
              <p className="text-xs text-rose-400">
                {errors.mobile.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 sm:text-sm">
              Password
            </label>
            <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80 shadow-inner focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
              <Lock className="pointer-events-none absolute left-4 top-3.5 text-slate-500" size={16} />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border-none bg-transparent py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {registerMutation.isPending && (
              <Loader2 className="animate-spin" size={18} />
            )}
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 sm:text-sm">
          <p>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
