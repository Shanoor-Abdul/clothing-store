"use client";

import { useState } from "react";

import CollectionForm from "@/features/collection/components/CollectionForm";
import CollectionTable from "@/features/collection/components/CollectionTable";
import DeleteCollectionModal from "@/features/collection/components/DeleteCollectionModal";

import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from "@/features/collection/hooks/useCollections";

import { COLLECTION_DEFAULT_VALUES } from "@/features/collection/constants/collection";

import { CollectionFormData } from "@/features/collection/validation/collection.schema";
import { Collection } from "@/features/collection/types/collection";

const CollectionsPage = () => {
  const { data: collections = [], isLoading } = useCollections();

  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  const [editing, setEditing] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(
    null
  );

  const handleSubmit = async (data: CollectionFormData) => {
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
          Collection Management
        </h1>
        <p className="mt-2 text-slate-500">
          Group products into collections.
        </p>
      </div>

      <CollectionForm
        onSubmit={handleSubmit}
        defaultValues={
          editing
            ? {
                name: editing.name,
                slug: editing.slug,
                image: editing.image ?? "",
                description: editing.description ?? "",
                displayOrder: editing.displayOrder,
                isActive: editing.isActive,
              }
            : COLLECTION_DEFAULT_VALUES
        }
        loading={
          createMutation.isPending || updateMutation.isPending
        }
      />

      {isLoading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading Collections...
        </div>
      ) : (
        <CollectionTable
          collections={collections}
          onEdit={setEditing}
          onDelete={setDeleteTarget}
        />
      )}

      <DeleteCollectionModal
        open={!!deleteTarget}
        collection={deleteTarget}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CollectionsPage;
