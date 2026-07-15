"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
    watch,
    reset,
    setValue,
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

  const name = watch("name");

  useEffect(() => {
    if (!name) return;

    setValue("slug", generateSlug(name));
  }, [name, setValue]);

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
          Logo URL
        </label>

        <input
          {...register("logo")}
          placeholder="https://..."
          className="w-full rounded-lg border p-3"
        />
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