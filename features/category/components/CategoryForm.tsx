"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CategorySchema,
  CategoryFormData,
} from "../validation/category.schema";

import { CATEGORY_DEFAULT_VALUES } from "../constants/category";
import { generateSlug } from "@/utils";

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  defaultValues?: Partial<CategoryFormData>;
  loading?: boolean;
}

const CategoryForm = ({
  onSubmit,
  defaultValues,
  loading = false,
}: CategoryFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      ...CATEGORY_DEFAULT_VALUES,
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      ...CATEGORY_DEFAULT_VALUES,
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  const name = watch("name");

  useEffect(() => {
    if (!name) return;

    setValue("slug", generateSlug(name), {
  shouldValidate: true,
});
  }, [name, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border bg-white p-6 shadow-sm space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Category Name
        </label>

        <input
          {...register("name")}
          placeholder="Category Name"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Slug
        </label>

        <input
          {...register("slug")}
          placeholder="category-slug"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

        {errors.slug && (
          <p className="mt-1 text-sm text-red-500">
            {errors.slug.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea
          {...register("description")}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isFeatured")}
        />

        <label className="text-sm text-slate-700">
          Featured Category
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isActive")}
        />

        <label className="text-sm text-slate-700">
          Active
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Category"}
      </button>
    </form>
  );
};

export default CategoryForm;