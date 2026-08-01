"use client";

import React from "react";
import Image from "next/image";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Product, ProductVariant } from "../types/product";

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
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const hasMultiplePrices = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return false;
    const prices = new Set(product.variants.map(v => v.price).filter((p): p is number => p !== null));
    return prices.size > 1;
  };

  const getVariantLabel = (variant: ProductVariant) => {
    const parts: string[] = [];
    if (variant.color?.name) parts.push(variant.color.name);
    if (variant.size?.name) parts.push(variant.size.name);
    return parts.length > 0 ? parts.join(" / ") : "Base";
  };

  const sortVariants = (variants: ProductVariant[]) => {
    return [...variants].sort((a, b) => {
      const colorA = a.color?.name || "";
      const colorB = b.color?.name || "";
      const colorCompare = colorA.localeCompare(colorB);
      if (colorCompare !== 0) return colorCompare;
      
      const sizeA = a.size?.name || "";
      const sizeB = b.size?.name || "";
      return sizeA.localeCompare(sizeB);
    });
  };

  if (!products.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">
          No Products Found
        </h3>

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
          {products.map((product) => {
            const isExpanded = expandedProductId === product.id;
            const showPriceDropdown = hasMultiplePrices(product);

            return (
              <React.Fragment key={product.id}>
                <tr className="border-t hover:bg-slate-50">
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
                    <div>
                      {product.category?.name}
                      {product.subcategory && (
                        <div className="text-xs text-slate-500">
                          → {product.subcategory.name}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center">
                    {showPriceDropdown ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-sm text-slate-700 hover:bg-slate-200"
                        >
                          ₹{Number(product.sellingPrice).toFixed(2)}
                          <ChevronDown size={14} className={`transition ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isExpanded && product.variants && (
                          <div className="mt-2 inline-block w-48 rounded-lg border bg-white p-2 shadow-lg">
                            <div className="max-h-48 overflow-y-auto">
                              {sortVariants(product.variants).map((variant) => (
                                <div
                                  key={variant.id}
                                  className="flex justify-between items-center px-2 py-1 text-sm hover:bg-slate-50 rounded"
                                >
                                  <span className="truncate">
                                    {getVariantLabel(variant)}
                                  </span>
                                  <span className="font-medium text-blue-600">
                                    ₹{Number(variant.price).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>₹{Number(product.sellingPrice).toFixed(2)}</span>
                    )}
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
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;