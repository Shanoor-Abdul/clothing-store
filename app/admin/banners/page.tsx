"use client";

import { useState } from "react";

import BannerForm from "@/features/banner/components/BannerForm";
import BannerTable from "@/features/banner/components/BannerTable";
import DeleteBannerModal from "@/features/banner/components/DeleteBannerModal";

import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from "@/features/banner/hooks/useBanners";

import { BANNER_DEFAULT_VALUES } from "@/features/banner/constants/banner";

import { BannerFormData } from "@/features/banner/validation/banner.schema";
import { Banner } from "@/features/banner/types/banner";

const BannersPage = () => {
  const { data: banners = [], isLoading } = useBanners();

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(
    null
  );

  const handleSubmit = async (data: BannerFormData) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data });
        setEditing(null);
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
          Banner Management
        </h1>
        <p className="mt-2 text-slate-500">
          Manage homepage banners.
        </p>
      </div>

      <BannerForm
        onSubmit={handleSubmit}
        defaultValues={
          editing
            ? {
                title: editing.title,
                subtitle: editing.subtitle ?? "",
                description: editing.description ?? "",
                imageUrl: editing.imageUrl,
                buttonText: editing.buttonText ?? "",
                redirectUrl: editing.redirectUrl ?? "",
                displayOrder: editing.displayOrder,
                isActive: editing.isActive,
              }
            : BANNER_DEFAULT_VALUES
        }
        loading={
          createMutation.isPending || updateMutation.isPending
        }
      />

      {isLoading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading Banners...
        </div>
      ) : (
        <BannerTable
          banners={banners}
          onEdit={setEditing}
          onDelete={setDeleteTarget}
        />
      )}

      <DeleteBannerModal
        open={!!deleteTarget}
        banner={deleteTarget}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BannersPage;
