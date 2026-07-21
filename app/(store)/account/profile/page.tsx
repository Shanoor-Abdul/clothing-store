"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAppSelector } from "@/store";
import { useCart } from "@/features/cart/hooks";
import { getProfile, updateProfile } from "@/features/auth/api";

const ProfilePage = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    getProfile()
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          name: data.name ?? "",
          email: data.email ?? "",
          mobile: data.mobile ?? "",
        }));
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      toast.success("Profile updated");
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Full Name
          </label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Mobile
          </label>
          <input
            value={form.mobile}
            onChange={(e) =>
              setForm({ ...form, mobile: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <hr className="border-slate-200" />

        <h2 className="font-semibold">Change Password</h2>
        <p className="text-xs text-slate-400">
          Leave blank if you don&apos;t want to change it.
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Current Password
          </label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) =>
              setForm({
                ...form,
                currentPassword: e.target.value,
              })
            }
            className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            New Password
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) =>
              setForm({ ...form, newPassword: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving && <Loader2 className="animate-spin" size={18} />}
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
