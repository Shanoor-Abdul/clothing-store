"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SizeSchema, SizeFormData } from "../validation/size.schema";
import { SIZE_DEFAULT_VALUES } from "../constants/size";

interface SizeFormProps {
  onSubmit: (data: SizeFormData) => void;
  defaultValues?: Partial<SizeFormData>;
  loading?: boolean;
}

const SizeForm = ({
  onSubmit,
  defaultValues,
  loading = false,
}: SizeFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SizeFormData>({
    resolver: zodResolver(SizeSchema),
    defaultValues: { ...SIZE_DEFAULT_VALUES, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...SIZE_DEFAULT_VALUES, ...defaultValues });
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border bg-white p-6 shadow-sm space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Size Name
        </label>
        <input
          {...register("name")}
          placeholder="M"
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
        {loading ? "Saving..." : "Save Size"}
      </button>
    </form>
  );
};

export default SizeForm;
