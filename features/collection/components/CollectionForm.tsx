"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";

import {
  CollectionSchema,
  CollectionFormData,
} from "../validation/collection.schema";
import { COLLECTION_DEFAULT_VALUES } from "../constants/collection";
import { generateSlug } from "@/utils";

interface CollectionFormProps {
  onSubmit: (data: CollectionFormData) => void;
  defaultValues?: Partial<CollectionFormData>;
  loading?: boolean;
}

const CollectionForm = ({
  onSubmit,
  defaultValues,
  loading = false,
}: CollectionFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(CollectionSchema),
    defaultValues: { ...COLLECTION_DEFAULT_VALUES, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...COLLECTION_DEFAULT_VALUES, ...defaultValues });
  }, [defaultValues, reset]);

  const name = useWatch({ control, name: "name" });
  const imageValue = useWatch({ control, name: "image" });
  const imagePreview = imageValue ?? "";

  useEffect(() => {
    if (!name) return;
    setValue("slug", generateSlug(name), { shouldValidate: true });
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
        reset(COLLECTION_DEFAULT_VALUES);
      })}
      className="rounded-xl border bg-white p-6 shadow-sm space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Collection Name
        </label>
        <input
          {...register("name")}
          placeholder="e.g. Summer Sale 2026, Wedding Collection"
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
          Collection Cover Image
        </label>
        <p className="mb-3 text-xs text-slate-500">
          Upload an image file for this collection. It will be converted to Data URL and stored in DB.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-6 transition hover:border-blue-500 hover:bg-blue-50/50">
            <Upload size={22} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Click to select collection image file
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
            <div className="relative w-48 h-32 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center justify-center">
              <Image
                src={imagePreview}
                alt="Collection image preview"
                width={192}
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
          placeholder="Short promotional description..."
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
        <label className="text-sm font-semibold text-slate-700 cursor-pointer">Active Collection</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Collection"}
      </button>
    </form>
  );
};

export default CollectionForm;
