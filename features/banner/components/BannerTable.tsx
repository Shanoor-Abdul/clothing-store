"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

import { Banner } from "../types/banner";

interface BannerTableProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
}

const BannerTable = ({ banners, onEdit, onDelete }: BannerTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {banners.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-slate-500"
              >
                No banners found.
              </td>
            </tr>
          ) : (
            banners.map((banner) => (
              <tr key={banner.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    width={80}
                    height={40}
                    className="h-10 w-20 rounded object-cover"
                  />
                </td>
                <td className="px-4 py-3 font-medium">
                  {banner.title}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {banner.displayOrder}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      banner.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(banner)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(banner)}
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
    </div>
  );
};

export default BannerTable;
