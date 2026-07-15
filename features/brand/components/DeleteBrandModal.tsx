"use client";

import { Brand } from "../types/brand";

interface Props {
  open: boolean;
  brand: Brand | null;
  loading?: boolean;

  onClose: () => void;
  onConfirm: () => void;
}

const DeleteBrandModal = ({
  open,
  brand,
  loading = false,
  onClose,
  onConfirm,
}: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-md rounded-xl bg-white p-6">

        <h2 className="text-xl font-semibold">
          Delete Brand
        </h2>

        <p className="mt-4">
          Delete
          <strong>
            {" "}
            {brand?.name}
          </strong>
          ?
        </p>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-2 text-white"
          >
            {loading
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default DeleteBrandModal;