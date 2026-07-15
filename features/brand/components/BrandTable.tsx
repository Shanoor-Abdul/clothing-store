"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

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
  if (!brands.length) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        No Brands Found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">

      <table className="min-w-full">

        <thead className="bg-slate-100">

          <tr>
            <th className="px-5 py-3 text-left">
              Logo
            </th>

            <th className="px-5 py-3 text-left">
              Name
            </th>

            <th className="px-5 py-3 text-left">
              Slug
            </th>

            <th className="px-5 py-3 text-center">
              Status
            </th>

            <th className="px-5 py-3 text-center">
              Actions
            </th>
          </tr>

        </thead>

        <tbody>

          {brands.map((brand) => (
            <tr
              key={brand.id}
              className="border-t"
            >
              <td className="px-5 py-4">

                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={50}
                    height={50}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  "-"
                )}

              </td>

              <td className="px-5 py-4">
                {brand.name}
              </td>

              <td className="px-5 py-4">
                {brand.slug}
              </td>

              <td className="px-5 py-4 text-center">

                <span
                  className={`rounded px-3 py-1 text-sm ${
                    brand.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {brand.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

              </td>

              <td className="px-5 py-4">

                <div className="flex justify-center gap-3">

                  <button
                    onClick={() =>
                      onEdit(brand)
                    }
                    className="rounded-lg bg-yellow-500 p-2 text-white"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() =>
                      onDelete(brand)
                    }
                    className="rounded-lg bg-red-600 p-2 text-white"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
};

export default BrandTable;