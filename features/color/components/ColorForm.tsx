"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ColorSchema,
  ColorFormData,
} from "../validation/color.schema";
import { COLOR_DEFAULT_VALUES } from "../constants/color";

interface ColorFormProps {
  onSubmit: (data: ColorFormData) => void;
  defaultValues?: Partial<ColorFormData>;
  loading?: boolean;
}

const ColorForm = ({
  onSubmit,
  defaultValues,
  loading = false,
}: ColorFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ColorFormData>({
    resolver: zodResolver(ColorSchema),
    defaultValues: { ...COLOR_DEFAULT_VALUES, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...COLOR_DEFAULT_VALUES, ...defaultValues });
  }, [defaultValues, reset]);

  const hexCode = watch("hexCode");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border bg-white p-6 shadow-sm space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Color Name
        </label>
        <input
          {...register("name")}
          placeholder="Red"
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
          Hex Code
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={hexCode}
            {...register("hexCode")}
            className="h-11 w-16 cursor-pointer rounded border border-slate-300"
          />
          <input
            {...register("hexCode")}
            placeholder="#ff0000"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        {errors.hexCode && (
          <p className="mt-1 text-sm text-red-500">
            {errors.hexCode.message}
          </p>
        )}
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
        {loading ? "Saving..." : "Save Color"}
      </button>
    </form>
  );
};

export default ColorForm;
