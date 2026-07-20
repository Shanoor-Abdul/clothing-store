"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(CollectionSchema),
    defaultValues: { ...COLLECTION_DEFAULT_VALUES, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...COLLECTION_DEFAULT_VALUES, ...defaultValues });
  }, [defaultValues, reset]);

  const name = watch("name");

  useEffect(() => {
    if (!name) return;
    setValue("slug", generateSlug(name), { shouldValidate: true });
  }, [name, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border bg-white p-6 shadow-sm space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Collection Name
        </label>
        <input
          {...register("name")}
          placeholder="Summer Collection"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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
          placeholder="summer-collection"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-500">
            {errors.slug.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Image URL
        </label>
        <input
          {...register("image")}
          placeholder="https://..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
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
        {loading ? "Saving..." : "Save Collection"}
      </button>
    </form>
  );
};

export default CollectionForm;
