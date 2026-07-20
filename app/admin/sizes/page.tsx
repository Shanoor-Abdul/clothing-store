"use client";

import { useState } from "react";

import SizeForm from "@/features/size/components/SizeForm";
import SizeTable from "@/features/size/components/SizeTable";
import DeleteSizeModal from "@/features/size/components/DeleteSizeModal";

import {
  useSizes,
  useCreateSize,
  useUpdateSize,
  useDeleteSize,
} from "@/features/size/hooks/useSizes";

import { SIZE_DEFAULT_VALUES } from "@/features/size/constants/size";

import { SizeFormData } from "@/features/size/validation/size.schema";
import { Size } from "@/features/size/types/size";

const SizesPage = () => {
  const { data: sizes = [], isLoading } = useSizes();

  const createMutation = useCreateSize();
  const updateMutation = useUpdateSize();
  const deleteMutation = useDeleteSize();

  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Size | null>(
    null
  );

  const handleSubmit = async (data: SizeFormData) => {
    try {
      if (editingSize) {
        await updateMutation.mutateAsync({
          id: editingSize.id,
          data,
        });
        setEditingSize(null);
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
          Size Management
        </h1>
        <p className="mt-2 text-slate-500">Manage product sizes.</p>
      </div>

      <SizeForm
        onSubmit={handleSubmit}
        defaultValues={
          editingSize
            ? {
                name: editingSize.name,
                displayOrder: editingSize.displayOrder,
                isActive: editingSize.isActive,
              }
            : SIZE_DEFAULT_VALUES
        }
        loading={
          createMutation.isPending || updateMutation.isPending
        }
      />

      {isLoading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading Sizes...
        </div>
      ) : (
        <SizeTable
          sizes={sizes}
          onEdit={setEditingSize}
          onDelete={setDeleteTarget}
        />
      )}

      <DeleteSizeModal
        open={!!deleteTarget}
        size={deleteTarget}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default SizesPage;
