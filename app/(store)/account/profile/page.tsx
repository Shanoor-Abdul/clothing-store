"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, User as UserIcon, Phone, Mail, Lock, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useAppSelector } from "@/store";
import { getProfile, updateProfile } from "@/features/auth/api";

const ProfilePage = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "UNISEX",
    currentPassword: "",
    newPassword: "",
    address: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    getProfile()
      .then((data: any) => {
        setForm((prev) => ({
          ...prev,
          name: data.name ?? "",
          email: data.email ?? "",
          mobile: data.mobile ?? "",
          gender: data.gender ?? "UNISEX",
          address: data.addresses && data.addresses[0]
            ? `${data.addresses[0].street}, ${data.addresses[0].city}, ${data.addresses[0].country}`
            : "",
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
        gender: form.gender,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      toast.success("Profile updated successfully!");
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserIcon className="text-blue-600" size={24} /> User Profile & Security Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, gender preferences for personalized recommendations, and password security.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Personal Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <UserIcon size={14} className="text-slate-400" /> Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" /> Mobile Number
              </label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="+966 50 000 0000"
                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-blue-500"
              />
            </div>

            {/* Gender Preference */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Shopping Preference / Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs bg-white font-bold outline-none focus:border-blue-500"
              >
                <option value="MALE">MEN / BOYS</option>
                <option value="FEMALE">WOMEN / GIRLS</option>
                <option value="KIDS">KIDS COLLECTION</option>
                <option value="UNISEX">ALL DEPARTMENTS (UNISEX)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Helps us highlight relevant apparel and recommendations for you.
              </p>
            </div>
          </div>

          {/* Address summary */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" /> Saved Shipping Address
            </label>
            <input
              type="text"
              value={form.address}
              readOnly
              placeholder="No address added yet. Add under Addresses tab."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"
            />
          </div>
        </div>

        {/* Security & Password Update */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2 flex items-center gap-1.5">
            <Lock size={16} className="text-rose-600" /> Security & Password Update
          </h2>
          <p className="text-xs text-slate-400">
            Leave password fields blank if you do not wish to change your password.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Password with Eye Lash Toggle */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password with Eye Lash Toggle */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving && <Loader2 className="animate-spin" size={16} />}
            {saving ? "Saving Profile..." : "Save Profile & Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
