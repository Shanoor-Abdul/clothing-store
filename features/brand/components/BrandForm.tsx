"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";

import {
  BrandSchema,
  BrandFormData,
} from "../validation/brand.schema";

import { BRAND_DEFAULT_VALUES } from "../constants/brand";
import { generateSlug } from "@/utils/slug";

interface BrandFormProps {
  onSubmit: (data: BrandFormData) => void;
  defaultValues?: Partial<BrandFormData>;
  loading?: boolean;
}

const BrandForm = ({
  onSubmit,
  defaultValues,
  loading = false,
}: BrandFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(BrandSchema),
    defaultValues: {
      ...BRAND_DEFAULT_VALUES,
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      ...BRAND_DEFAULT_VALUES,
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  const name = useWatch({ control, name: "name" });
  const logoValue = useWatch({ control, name: "logo" });
  const logoPreview = logoValue ?? "";

  useEffect(() => {
    if (!name) return;

    setValue("slug", generateSlug(name));
  }, [name, setValue]);

  const handleLogoUpload = async (
    file: File | undefined
  ) => {
    if (!file) return;

    const dataUrl = await new Promise<string>(
      (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Unable to read logo file"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      }
    );

    setValue("logo", dataUrl, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeLogo = () => {
    setValue("logo", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data);
        reset(BRAND_DEFAULT_VALUES);
      })}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-2 block font-semibold text-slate-700">
          Brand Name
        </label>

        <input
          {...register("name")}
          placeholder="e.g. Nike, Adidas, Shanoor"
          className="w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
        />

        <p className="mt-1 text-sm text-red-500">
          {errors.name?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block font-semibold text-slate-700">
          Slug
        </label>

        <input
          {...register("slug")}
          className="w-full rounded-lg border bg-slate-100 p-3 text-sm text-slate-600"
          readOnly
        />

        <p className="mt-1 text-sm text-red-500">
          {errors.slug?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block font-semibold text-slate-700">
          Brand Logo
        </label>
        <p className="mb-3 text-xs text-slate-500">
          Upload an image file for the brand logo. It will be converted and stored securely.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-6 transition hover:border-blue-500 hover:bg-blue-50/50">
            <Upload size={22} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Click to select brand logo file
            </span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleLogoUpload(e.target.files[0]);
                }
              }}
            />
          </label>

          {logoPreview && (
            <div className="relative w-36 h-36 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center justify-center">
              <Image
                src={logoPreview}
                alt="Brand logo preview"
                width={128}
                height={128}
                className="max-h-full max-w-full object-contain"
                unoptimized
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block font-semibold text-slate-700">
          Description
        </label>

        <textarea
          rows={3}
          {...register("description")}
          placeholder="Brand summary or details..."
          className="w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <label className="flex items-center gap-3 font-semibold text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 text-blue-600"
        />
        Active Brand
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Brand"}
      </button>
    </form>
  );
};

export default BrandForm;