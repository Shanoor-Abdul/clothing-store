"use client";

import { useState } from "react";

import BrandForm from "@/features/brand/components/BrandForm";
import BrandTable from "@/features/brand/components/BrandTable";
import DeleteBrandModal from "@/features/brand/components/DeleteBrandModal";

import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "@/features/brand/hooks/useBrands";

import { BRAND_DEFAULT_VALUES } from "@/features/brand/constants/brand";

import { Brand } from "@/features/brand/types/brand";
import { BrandFormData } from "@/features/brand/validation/brand.schema";
import { mapBrandToForm } from "@/features/brand/mapper";

const BrandsPage = () => {
  const { data: brands = [], isLoading } = useBrands();

  const createMutation = useCreateBrand();

  const updateMutation = useUpdateBrand();

  const deleteMutation = useDeleteBrand();

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);

  const handleSubmit = async (data: BrandFormData) => {
    try {
      if (editingBrand) {
        await updateMutation.mutateAsync({
          id: editingBrand.id,
          data,
        });

        setEditingBrand(null);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteBrand) return;

    try {
      await deleteMutation.mutateAsync(deleteBrand.id);

      setDeleteBrand(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Brand Management</h1>

        <p className="mt-2 text-slate-500">Manage all brands</p>
      </div>

      <BrandForm
        onSubmit={handleSubmit}
        defaultValues={
          editingBrand ? mapBrandToForm(editingBrand) : BRAND_DEFAULT_VALUES
        }
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {isLoading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading...
        </div>
      ) : (
        <BrandTable
          brands={brands}
          onEdit={setEditingBrand}
          onDelete={setDeleteBrand}
        />
      )}

      <DeleteBrandModal
        open={!!deleteBrand}
        brand={deleteBrand}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteBrand(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BrandsPage;
