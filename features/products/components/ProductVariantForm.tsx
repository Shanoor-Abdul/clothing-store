"use client";

import { Plus, Trash2 } from "lucide-react";

export interface ProductVariant {
  id?: string;
  colorId: string;
  sizeId: string;
  sku: string;
  barcode?: string;
  stock: number;
  price?: number;
  isActive: boolean;
}

interface Option {
  id: string;
  name: string;
}

interface ProductVariantFormProps {
  variants: ProductVariant[];

  colors: Option[];
  sizes: Option[];

  onAdd: () => void;

  onRemove: (index: number) => void;

  onChange: (
    index: number,
    field: keyof ProductVariant,
    value: string | number | boolean
  ) => void;
}

const ProductVariantForm = ({
  variants,
  colors,
  sizes,
  onAdd,
  onRemove,
  onChange,
}: ProductVariantFormProps) => {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold">
            Product Variants
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage colors, sizes and stock.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Variant
        </button>

      </div>

      {variants.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-slate-500">
          No variants added.
        </div>
      ) : (
        <div className="space-y-5">

          {variants.map((variant, index) => (
            <div
              key={index}
              className="rounded-xl border p-5"
            >

              <div className="mb-5 flex items-center justify-between">

                <h3 className="font-semibold">
                  Variant {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    onRemove(index)
                  }
                  className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                >
                  <Trash2 size={18} />
                </button>

              </div>

              <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">

                <div>
                  <label className="mb-2 block">
                    Color
                  </label>

                  <select
                    value={variant.colorId}
                    onChange={(e) =>
                      onChange(
                        index,
                        "colorId",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  >
                    <option value="">
                      Select Color
                    </option>

                    {colors.map((color) => (
                      <option
                        key={color.id}
                        value={color.id}
                      >
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block">
                    Size
                  </label>

                  <select
                    value={variant.sizeId}
                    onChange={(e) =>
                      onChange(
                        index,
                        "sizeId",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  >
                    <option value="">
                      Select Size
                    </option>

                    {sizes.map((size) => (
                      <option
                        key={size.id}
                        value={size.id}
                      >
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block">
                    SKU
                  </label>

                  <input
                    value={variant.sku}
                    onChange={(e) =>
                      onChange(
                        index,
                        "sku",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border bg-slate-100 p-3"
                    readOnly
                  />
                </div>

                <div>
                  <label className="mb-2 block">
                    Barcode
                  </label>

                  <input
                    value={variant.barcode ?? ""}
                    onChange={(e) =>
                      onChange(
                        index,
                        "barcode",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block">
                    Stock
                  </label>

                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      onChange(
                        index,
                        "stock",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block">
                    Variant Price
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={variant.price ?? ""}
                    onChange={(e) =>
                      onChange(
                        index,
                        "price",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  />
                </div>

              </div>

              <div className="mt-5">

                <label className="flex items-center gap-3">

                  <input
                    type="checkbox"
                    checked={variant.isActive}
                    onChange={(e) =>
                      onChange(
                        index,
                        "isActive",
                        e.target.checked
                      )
                    }
                  />

                  Active Variant

                </label>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default ProductVariantForm;