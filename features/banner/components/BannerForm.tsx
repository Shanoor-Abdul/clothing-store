"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";

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
    setValue,
    control,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(BannerSchema),
    defaultValues: { ...BANNER_DEFAULT_VALUES, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...BANNER_DEFAULT_VALUES, ...defaultValues });
  }, [defaultValues, reset]);

  const imageUrl = useWatch({ control, name: "imageUrl" }) ?? "";

  const handleImageUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValue("imageUrl", reader.result, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setValue("imageUrl", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data);
        reset(BANNER_DEFAULT_VALUES);
      })}
      className="rounded-xl border bg-white p-6 shadow-sm space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Banner Title
        </label>
        <input
          {...register("title")}
          placeholder="e.g. Summer Sale 50% Off, New Wedding Arrivals"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Subtitle
        </label>
        <input
          {...register("subtitle")}
          placeholder="e.g. Limited Edition Essentials"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Banner Image
        </label>
        <p className="mb-3 text-xs text-slate-500">
          Upload an image file for this hero banner.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-6 transition hover:border-blue-500 hover:bg-blue-50/50">
            <Upload size={22} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Click to select banner image file
            </span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
            />
          </label>

          {imageUrl && (
            <div className="relative w-full max-w-lg aspect-[21/9] rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
              <Image
                src={imageUrl}
                alt="Banner preview"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition z-10"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-red-500">
            {errors.imageUrl.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Button Text
        </label>
        <input
          {...register("buttonText")}
          placeholder="e.g. Shop Collection, Explore Deals"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Redirect URL
        </label>
        <input
          {...register("redirectUrl")}
          placeholder="e.g. /products or /products?featured=true"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Display Order
        </label>
        <input
          type="number"
          {...register("displayOrder")}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 text-blue-600 cursor-pointer"
        />
        <label className="text-sm font-semibold text-slate-700 cursor-pointer">Active Banner</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Banner"}
      </button>
    </form>
  );
};

export default BannerForm;
