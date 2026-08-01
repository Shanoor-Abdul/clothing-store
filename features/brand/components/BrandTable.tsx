"use client";

import { useState } from "react";
import { Pencil, Trash2, Maximize2, X } from "lucide-react";

import { Brand } from "../types/brand";

interface Props {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

const BrandTable = ({
  brands,
  onEdit,
  onDelete,
}: Props) => {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  if (!brands.length) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
        No Brands Found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-5 py-3">Logo</th>
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Slug</th>
            <th className="px-5 py-3 text-center">Status</th>
            <th className="px-5 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id} className="border-t hover:bg-slate-50 transition">
              <td className="px-5 py-3">
                <button
                  type="button"
                  onClick={() => brand.logo && setZoomImage(brand.logo)}
                  className="group relative h-12 w-12 rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                >
                  {brand.logo ? (
                    <>
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                        <Maximize2 size={14} />
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">No Logo</span>
                  )}
                </button>
              </td>

              <td className="px-5 py-4 font-semibold text-slate-900">{brand.name}</td>
              <td className="px-5 py-4 text-slate-600 font-mono text-xs">{brand.slug}</td>

              <td className="px-5 py-4 text-center">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    brand.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {brand.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-5 py-4">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(brand)}
                    className="rounded-lg bg-amber-500 p-2 text-white hover:bg-amber-600 transition"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(brand)}
                    className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700 transition"
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
              alt="Brand logo view"
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

export default BrandTable;