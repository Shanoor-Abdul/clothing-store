"use client";

import { useState } from "react";

import CategoryForm from "@/features/category/components/CategoryForm";
import CategoryTable from "@/features/category/components/CategoryTable";
import DeleteCategoryModal from "@/features/category/components/DeleteCategoryModal";

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/features/category/hooks/useCategories";

import { CATEGORY_DEFAULT_VALUES } from "@/features/category/constants/category";

import { CategoryFormData } from "@/features/category/validation/category.schema";
import { Category } from "@/features/category/types/category";

const CategoriesPage = () => {
  const { data: categories = [], isLoading } = useCategories();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deleteCategory, setDeleteCategory] =
    useState<Category | null>(null);

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data,
        });

        setEditingCategory(null);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;

    try {
      await deleteMutation.mutateAsync(deleteCategory.id);

      setDeleteCategory(null);
    } catch (error) {
      console.error(error);
    }
  };

  const parentCategories = categories.filter(
    (c) => !c.parentId
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Category Management
        </h1>

        <p className="mt-2 text-slate-600">
          Create and manage product categories.
        </p>
      </div>

      <CategoryForm
        onSubmit={handleSubmit}
        defaultValues={
          editingCategory
            ? {
                name: editingCategory.name,
                slug: editingCategory.slug,
                image: editingCategory.image ?? "",
                icon: editingCategory.icon ?? "",
                description: editingCategory.description ?? "",
                parentId: editingCategory.parentId ?? "",
                displayOrder: editingCategory.displayOrder,
                isFeatured: editingCategory.isFeatured,
                isActive: editingCategory.isActive,
              }
            : CATEGORY_DEFAULT_VALUES
        }
        loading={
          createMutation.isPending ||
          updateMutation.isPending
        }
        parentCategories={parentCategories}
        onCancel={() => setEditingCategory(null)}
      />

      {isLoading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading Categories...
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={setEditingCategory}
          onDelete={setDeleteCategory}
        />
      )}

      <DeleteCategoryModal
        open={!!deleteCategory}
        category={deleteCategory}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CategoriesPage;