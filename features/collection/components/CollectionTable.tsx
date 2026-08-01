"use client";

import { useState } from "react";
import { Pencil, Trash2, Maximize2, X } from "lucide-react";

import { Collection } from "../types/collection";

interface CollectionTableProps {
  collections: Collection[];
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

const CollectionTable = ({
  collections,
  onEdit,
  onDelete,
}: CollectionTableProps) => {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {collections.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-slate-500"
              >
                No collections found.
              </td>
            </tr>
          ) : (
            collections.map((collection) => (
              <tr
                key={collection.id}
                className="border-b last:border-0 hover:bg-slate-50 transition"
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => collection.image && setZoomImage(collection.image)}
                    className="group relative h-12 w-12 rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                  >
                    {collection.image ? (
                      <>
                        <img
                          src={collection.image}
                          alt={collection.name}
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                          <Maximize2 size={14} />
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">No Img</span>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 font-medium">
                  {collection.name}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {collection.slug}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {collection.displayOrder}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      collection.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {collection.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(collection)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(collection)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Lightbox Zoom Modal */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
        >
          <div className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center">
            <img
              src={zoomImage}
              alt="Collection view"
              className="max-h-[80vh] max-w-[80vw] object-contain rounded-xl"
            />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow hover:bg-rose-600 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionTable;
