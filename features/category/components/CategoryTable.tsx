"use client";

import { useState } from "react";
import { Pencil, Trash2, Maximize2, X } from "lucide-react";
import { Category } from "../types/category";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryTable = ({
  categories,
  onEdit,
  onDelete,
}: CategoryTableProps) => {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  if (!categories.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          No Categories Found
        </h3>
        <p className="mt-2 text-slate-500">
          Create your first category to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-5 py-3 text-left text-sm font-semibold text-slate-700">
              Image
            </th>
            <th className="px-5 py-3 text-left text-sm font-semibold text-slate-700">
              Name
            </th>
            <th className="px-5 py-3 text-left text-sm font-semibold text-slate-700">
              Slug
            </th>
            <th className="px-5 py-3 text-left text-sm font-semibold text-slate-700">
              Parent
            </th>
            <th className="px-5 py-3 text-center text-sm font-semibold text-slate-700">
              Featured
            </th>
            <th className="px-5 py-3 text-center text-sm font-semibold text-slate-700">
              Status
            </th>
            <th className="px-5 py-3 text-center text-sm font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              className="border-t hover:bg-slate-50 transition"
            >
              <td className="px-5 py-3">
                <button
                  type="button"
                  onClick={() => category.image && setZoomImage(category.image)}
                  className="group relative h-12 w-12 rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                >
                  {category.image ? (
                    <>
                      <img
                        src={category.image}
                        alt={category.name}
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

              <td className="px-5 py-4 font-medium text-slate-900">
                {category.name}
              </td>

              <td className="px-5 py-4 text-slate-600">
                {category.slug}
              </td>

              <td className="px-5 py-4 text-slate-600">
                {category.parent?.name || category.parentId || "-"}
              </td>

              <td className="px-5 py-4 text-center">
                {category.isFeatured ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Yes
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    No
                  </span>
                )}
              </td>

              <td className="px-5 py-4 text-center">
                {category.isActive ? (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    Inactive
                  </span>
                )}
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="rounded-lg bg-amber-500 p-2 text-white transition hover:bg-amber-600"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(category)}
                    className="rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
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
              alt="Category view"
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

export default CategoryTable;