"use client";

import React, { useState } from "react";
import { Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { Product, ProductVariant } from "../types/product";
import { formatCurrency } from "@/utils";

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
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});

  const hasMultiplePrices = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return false;
    const prices = new Set(product.variants.map((v) => v.price).filter((p): p is number => p !== null));
    return prices.size > 1;
  };

  const getVariantLabel = (variant: ProductVariant) => {
    const parts: string[] = [];
    if (variant.color?.name) parts.push(variant.color.name);
    if (variant.size?.name) parts.push(variant.size.name);
    return parts.length > 0 ? parts.join(" / ") : "Base";
  };

  const handleNextImage = (productId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages,
    }));
  };

  const handlePrevImage = (productId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  if (!products.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">No Products Found</h3>
        <p className="mt-2 text-slate-500">Create your first product.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3 text-left">Photos</th>
            <th className="px-4 py-3 text-left">Product</th>
            <th className="px-4 py-3 text-left">SKU</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-center">Price</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Active</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const isExpanded = expandedProductId === product.id;
            const showPriceDropdown = hasMultiplePrices(product);
            const images = product.images || [];
            const activeIdx = activeImageIndexes[product.id] || 0;
            const currentImg = images[activeIdx]?.imageUrl || product.imageUrl || null;

            return (
              <React.Fragment key={product.id}>
                <tr className="border-t hover:bg-slate-50 transition">
                  {/* Multi-Image Thumbnail Box with LightBox & Side Buttons */}
                  <td className="px-4 py-3">
                    <div className="relative h-14 w-14 shrink-0 rounded-lg border bg-slate-50 p-1 flex items-center justify-center group overflow-hidden shadow-sm">
                      {currentImg ? (
                        <>
                          <img
                            src={currentImg}
                            alt={product.name}
                            onClick={() => setZoomImage(currentImg)}
                            className="max-h-full max-w-full object-contain cursor-pointer"
                          />
                          <div
                            onClick={() => setZoomImage(currentImg)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition"
                          >
                            <Maximize2 size={14} />
                          </div>

                          {images.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handlePrevImage(product.id, images.length, e)}
                                className="absolute left-0.5 top-1/2 -translate-y-1/2 bg-slate-900/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                              >
                                <ChevronLeft size={10} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleNextImage(product.id, images.length, e)}
                                className="absolute right-0.5 top-1/2 -translate-y-1/2 bg-slate-900/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                              >
                                <ChevronRight size={10} />
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">No Img</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{product.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{product.slug}</div>
                  </td>

                  <td className="px-4 py-4 font-mono text-xs text-slate-600">{product.sku}</td>

                  <td className="px-4 py-4 text-xs">
                    <div className="font-semibold text-slate-800">{product.category?.name}</div>
                    {product.subcategory && (
                      <div className="text-slate-400">→ {product.subcategory.name}</div>
                    )}
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-slate-900">
                    {showPriceDropdown ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-800 hover:bg-slate-200"
                        >
                          {formatCurrency(Number(product.sellingPrice))}
                          <ChevronDown size={14} className={`transition ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        {isExpanded && product.variants && (
                          <div className="mt-2 inline-block w-48 rounded-lg border bg-white p-2 shadow-lg">
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {product.variants.map((variant) => (
                                <div
                                  key={variant.id}
                                  className="flex justify-between items-center px-2 py-1 text-xs hover:bg-slate-50 rounded"
                                >
                                  <span className="truncate">{getVariantLabel(variant)}</span>
                                  <span className="font-bold text-blue-600">
                                    {formatCurrency(Number(variant.price || product.sellingPrice))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>{formatCurrency(Number(product.sellingPrice))}</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {product.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    {product.isActive ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="rounded-lg bg-amber-500 p-2 text-white hover:bg-amber-600 transition"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
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
              alt="Product view"
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

export default ProductTable;