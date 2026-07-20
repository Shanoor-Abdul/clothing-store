"use client";

import { useState } from "react";

import ColorForm from "@/features/color/components/ColorForm";
import ColorTable from "@/features/color/components/ColorTable";
import DeleteColorModal from "@/features/color/components/DeleteColorModal";

import {
  useColors,
  useCreateColor,
  useUpdateColor,
  useDeleteColor,
} from "@/features/color/hooks/useColors";

import { COLOR_DEFAULT_VALUES } from "@/features/color/constants/color";

import { ColorFormData } from "@/features/color/validation/color.schema";
import { Color } from "@/features/color/types/color";

const ColorsPage = () => {
  const { data: colors = [], isLoading } = useColors();

  const createMutation = useCreateColor();
  const updateMutation = useUpdateColor();
  const deleteMutation = useDeleteColor();

  const [editingColor, setEditingColor] = useState<Color | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<Color | null>(
    null
  );

  const handleSubmit = async (data: ColorFormData) => {
    try {
      if (editingColor) {
        await updateMutation.mutateAsync({
          id: editingColor.id,
          data,
        });
        setEditingColor(null);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Color Management
        </h1>
        <p className="mt-2 text-slate-500">
          Manage product colors.
        </p>
      </div>

      <ColorForm
        onSubmit={handleSubmit}
        defaultValues={
          editingColor
            ? {
                name: editingColor.name,
                hexCode: editingColor.hexCode,
                isActive: editingColor.isActive,
              }
            : COLOR_DEFAULT_VALUES
        }
        loading={
          createMutation.isPending || updateMutation.isPending
        }
      />

      {isLoading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading Colors...
        </div>
      ) : (
        <ColorTable
          colors={colors}
          onEdit={setEditingColor}
          onDelete={setDeleteTarget}
        />
      )}

      <DeleteColorModal
        open={!!deleteTarget}
        color={deleteTarget}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ColorsPage;
