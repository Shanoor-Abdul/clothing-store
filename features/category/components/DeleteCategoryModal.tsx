"use client";

import { Category } from "../types/category";

interface DeleteCategoryModalProps {
  open: boolean;
  loading?: boolean;
  category: Category | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteCategoryModal = ({
  open,
  loading = false,
  category,
  onClose,
  onConfirm,
}: DeleteCategoryModalProps) => {
  if (!open || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-900">
          Delete Category
        </h2>

        <p className="mt-4 text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900">
            {category.name}
          </span>
          ?
        </p>

        <p className="mt-2 text-sm text-red-600">
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-5 py-2 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryModal;