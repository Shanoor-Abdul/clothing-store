"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

import { Product } from "../types/product";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable = ({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) => {
  if (!products.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">
          No Products Found
        </h2>

        <p className="mt-2 text-slate-500">
          Create your first product.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-3 text-left">
              Image
            </th>

            <th className="px-4 py-3 text-left">
              Product
            </th>

            <th className="px-4 py-3 text-left">
              SKU
            </th>

            <th className="px-4 py-3 text-left">
              Category
            </th>

            <th className="px-4 py-3 text-center">
              Price
            </th>

            <th className="px-4 py-3 text-center">
              Status
            </th>

            <th className="px-4 py-3 text-center">
              Active
            </th>

            <th className="px-4 py-3 text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-t hover:bg-slate-50"
            >
              <td className="px-4 py-4">
                {product.images?.length ? (
                  <Image
                    src={product.images[0].imageUrl}
                    alt={product.name}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                    No Image
                  </div>
                )}
              </td>

              <td className="px-4 py-4">
                <div className="font-medium">
                  {product.name}
                </div>

                <div className="text-sm text-slate-500">
                  {product.slug}
                </div>
              </td>

              <td className="px-4 py-4">
                {product.sku}
              </td>

              <td className="px-4 py-4">
                {product.category?.name}
              </td>

              <td className="px-4 py-4 text-center">
                ₹{product.sellingPrice}
              </td>

              <td className="px-4 py-4 text-center">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                  {product.status}
                </span>
              </td>

              <td className="px-4 py-4 text-center">
                {product.isActive ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                    Inactive
                  </span>
                )}
              </td>

              <td className="px-4 py-4">
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="rounded-lg bg-amber-500 p-2 text-white hover:bg-amber-600"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
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

export default ProductTable;