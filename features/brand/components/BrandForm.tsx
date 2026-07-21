"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-2 block">
          Brand Name
        </label>

        <input
          {...register("name")}
          className="w-full rounded-lg border p-3"
        />

        <p className="text-sm text-red-500">
          {errors.name?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block">
          Slug
        </label>

        <input
          {...register("slug")}
          className="w-full rounded-lg border p-3"
        />

        <p className="text-sm text-red-500">
          {errors.slug?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block">
          Brand Logo
        </label>

        <div className="flex flex-col gap-3">
          <input
            {...register("logo")}
            placeholder="https://... or upload a file"
            className="w-full rounded-lg border p-3"
          />

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Upload Logo
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
            <Image
              src={logoPreview}
              alt="Brand logo preview"
              width={128}
              height={128}
              className="max-h-32 rounded-lg border object-contain"
              unoptimized
            />
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block">
          Description
        </label>

        <textarea
          rows={4}
          {...register("description")}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          {...register("isActive")}
        />

        Active
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 text-white"
      >
        {loading ? "Saving..." : "Save Brand"}
      </button>
    </form>
  );
};

export default BrandForm;