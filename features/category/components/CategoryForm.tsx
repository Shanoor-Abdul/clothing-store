"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";

import {
  CategorySchema,
  CategoryFormData,
} from "../validation/category.schema";

import { CATEGORY_DEFAULT_VALUES } from "../constants/category";
import { generateSlug } from "@/utils";

interface Option {
  id: string;
  name: string;
}

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  defaultValues?: Partial<CategoryFormData>;
  loading?: boolean;
  parentCategories?: Option[];
  onCancel?: () => void;
}

const CategoryForm = ({
  onSubmit,
  defaultValues,
  loading = false,
  parentCategories = [],
  onCancel,
}: CategoryFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
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
  const imageValue = useWatch({ control, name: "image" });
  const imagePreview = imageValue ?? "";

  useEffect(() => {
    if (!name) return;

    setValue("slug", generateSlug(name), {
      shouldValidate: true,
    });
  }, [name, setValue]);

  const handleImageUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValue("image", reader.result, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setValue("image", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data);
        reset(CATEGORY_DEFAULT_VALUES);
      })}
      className="rounded-xl border bg-white p-6 shadow-sm space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Category Name
        </label>
        <input
          {...register("name")}
          placeholder="e.g. Men's Wear, Kids, Dresses"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Slug
        </label>
        <input
          {...register("slug")}
          className="w-full rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm text-slate-600"
          readOnly
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-500">
            {errors.slug.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Category Image
        </label>
        <p className="mb-3 text-xs text-slate-500">
          Upload an image for this category department.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-6 transition hover:border-blue-500 hover:bg-blue-50/50">
            <Upload size={22} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Click to select category image file
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

          {imagePreview && (
            <div className="relative w-40 h-32 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center justify-center">
              <Image
                src={imagePreview}
                alt="Category image preview"
                width={160}
                height={128}
                className="max-h-full max-w-full object-contain"
                unoptimized
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Department summary..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Parent Category (Optional)
        </label>
        <select
          {...register("parentId")}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm bg-white outline-none focus:border-blue-500"
        >
          <option value="">No Parent (Top Level Category)</option>
          {parentCategories.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            {...register("isFeatured")}
            className="h-4 w-4 text-blue-600"
          />
          Featured Category
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4 text-blue-600"
          />
          Active Category
        </label>
      </div>

      <div className="flex items-center gap-3 border-t pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Category"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;