"use client";

interface DeleteCollectionModalProps {
  open: boolean;
  collection: { name: string } | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteCollectionModal = ({
  open,
  collection,
  loading = false,
  onClose,
  onConfirm,
}: DeleteCollectionModalProps) => {
  if (!open || !collection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Delete Collection
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-medium">{collection.name}</span>?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCollectionModal;
