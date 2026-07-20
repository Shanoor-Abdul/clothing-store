"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  BannerSchema,
  BannerFormData,
} from "../validation/banner.schema";
import { BANNER_DEFAULT_VALUES } from "../constants/banner";

interface BannerFormProps {
  onSubmit: (data: BannerFormData) => void;
  defaultValues?: Partial<BannerFormData>;
  loading?: boolean;
}

const BannerForm = ({
  onSubmit,
  defaultValues,
  loading = false,
}: BannerFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(BannerSchema),
    defaultValues: { ...BANNER_DEFAULT_VALUES, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...BANNER_DEFAULT_VALUES, ...defaultValues });
  }, [defaultValues, reset]);

  const imageUrl = watch("imageUrl");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border bg-white p-6 shadow-sm space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          {...register("title")}
          placeholder="Summer Sale"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Subtitle
        </label>
        <input
          {...register("subtitle")}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Image URL
        </label>
        <input
          {...register("imageUrl")}
          placeholder="https://..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-red-500">
            {errors.imageUrl.message}
          </p>
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="preview"
            className="mt-3 h-32 w-full rounded-lg object-cover"
          />
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Button Text
        </label>
        <input
          {...register("buttonText")}
          placeholder="Shop Now"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Redirect URL
        </label>
        <input
          {...register("redirectUrl")}
          placeholder="/products"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Display Order
        </label>
        <input
          type="number"
          {...register("displayOrder")}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" {...register("isActive")} />
        <label className="text-sm text-slate-700">Active</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Banner"}
      </button>
    </form>
  );
};

export default BannerForm;
