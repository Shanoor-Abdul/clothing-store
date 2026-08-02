"use client";

import Image from "next/image";
import { useEffect, useCallback, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, Plus, Trash2 } from "lucide-react";

import {
  ProductSchema,
  ProductFormData,
} from "../validation/product.schema";
import { generateSku, generateSlug } from "@/utils";
import { Option } from "../types/product";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  defaultValues?: Partial<ProductFormData>;
  loading?: boolean;
  categories?: Option[];
  subcategories?: Option[];
  brands?: Option[];
  colors?: Option[];
  sizes?: Option[];
  collections?: Option[];
  editingProduct?: any;
  onCancel?: () => void;
}

const ProductForm = ({
  onSubmit,
  defaultValues,
  loading = false,
  categories = [],
  subcategories = [],
  brands = [],
  colors = [],
  sizes = [],
  collections = [],
  onCancel,
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema) as any,
    mode: "onSubmit",
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      description: "",
      price: 0,
      discount: undefined,
      sellingPrice: 0,
      categoryId: "",
      subcategoryId: undefined,
      brandId: undefined,
      status: "PUBLISHED",
      isReturnable: true,
      collectionIds: [],
      images: [],
      variants: [],
      isActive: true,
      isFeatured: false,
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // State for Combined Variant Builder
  const [builderColorId, setBuilderColorId] = useState<string>("");
  const [builderSizeId, setBuilderSizeId] = useState<string>("");
  const [builderPrice, setBuilderPrice] = useState<string>("");
  const [builderStock, setBuilderStock] = useState<string>("10");

  useEffect(() => {
    reset({
      name: "",
      slug: "",
      sku: "",
      description: "",
      price: 0,
      discount: undefined,
      sellingPrice: 0,
      categoryId: "",
      subcategoryId: undefined,
      brandId: undefined,
      status: "PUBLISHED",
      isReturnable: true,
      collectionIds: [],
      images: [],
      variants: [],
      isActive: true,
      isFeatured: false,
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  const nameValue = watch("name");
  const categoryIdValue = watch("categoryId");
  const priceValue = watch("price");
  const discountValue = watch("discount");
  const imagesValue = useWatch({ control, name: "images" });
  const imagePreviews = imagesValue ?? [];

  // Filter subcategories by selected parent category if available
  const availableSubcategories = categoryIdValue
    ? subcategories.filter((sc: any) => !sc.parentId || sc.parentId === categoryIdValue)
    : subcategories;

  useEffect(() => {
    if (nameValue) {
      setValue("slug", generateSlug(nameValue), { shouldValidate: true });

      if (!watch("sku")) {
        const categoryName =
          categories.find((c) => c.id === categoryIdValue)?.name || "PROD";
        setValue("sku", generateSku(categoryName, nameValue), {
          shouldValidate: true,
        });
      }
    }
  }, [nameValue, categoryIdValue, categories, setValue, watch]);

  useEffect(() => {
    const priceNum = Number(priceValue) || 0;
    const discountNum = Number(discountValue) || 0;
    const sellingPrice = Math.max(0, priceNum - discountNum);
    setValue("sellingPrice", sellingPrice, { shouldValidate: true });
  }, [priceValue, discountValue, setValue]);

  const handleMultipleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const currentImages = watch("images") || [];

      const readPromises = files.map((file, idx) => {
        return new Promise<{ imageUrl: string; altText?: string; displayOrder: number }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              imageUrl: reader.result as string,
              altText: file.name,
              displayOrder: currentImages.length + idx,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      try {
        const newImageObjs = await Promise.all(readPromises);
        setValue("images", [...currentImages, ...newImageObjs], {
          shouldDirty: true,
          shouldValidate: true,
        });
      } catch (err) {
        console.error("Error reading uploaded images:", err);
      }

      e.target.value = "";
    },
    [setValue, watch]
  );

  const removeImage = useCallback(
    (index: number) => {
      const currentImages = watch("images") || [];
      setValue(
        "images",
        currentImages.filter((_: unknown, i: number) => i !== index),
        { shouldDirty: true }
      );
    },
    [setValue, watch]
  );

  // Add Combined Variant (Color + Size + Price + Stock combined)
  const handleAddCombinedVariant = useCallback(() => {
    const name = watch("name");
    const cat = watch("categoryId");
    const currentVariants = watch("variants") || [];

    const colorObj = colors.find((c) => c.id === builderColorId);
    const sizeObj = sizes.find((s) => s.id === builderSizeId);

    const suffix = [colorObj?.name, sizeObj?.name].filter(Boolean).join("-") || `VAR-${currentVariants.length + 1}`;

    const generatedSku = `${generateSku(
      categories.find((c) => c.id === cat)?.name || "PROD",
      name || "ITEM"
    )}-${suffix.toUpperCase().replace(/\s+/g, "")}`;

    append({
      sku: generatedSku,
      stock: Number(builderStock) || 0,
      isActive: true,
      barcode: null,
      price: builderPrice ? Number(builderPrice) : null,
      colorId: builderColorId || null,
      sizeId: builderSizeId || null,
    });

    // Reset builder inputs
    setBuilderColorId("");
    setBuilderSizeId("");
    setBuilderPrice("");
    setBuilderStock("10");
  }, [watch, categories, colors, sizes, append, builderColorId, builderSizeId, builderPrice, builderStock]);

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
    reset(); // Auto-clear form after submission
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Product Basic Info */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-3">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Product Name</label>
            <input
              {...register("name")}
              placeholder="e.g. Premium Silk Lehenga / Cotton Shirt"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Publishing Status</label>
            <select
              {...register("status")}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm font-bold bg-white outline-none focus:border-blue-500"
            >
              <option value="PUBLISHED">PUBLISHED (Live in store)</option>
              <option value="DRAFT">DRAFT (Hidden)</option>
              <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Category</label>
            <select
              {...register("categoryId")}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm bg-white outline-none focus:border-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Subcategory (Optional)</label>
            <select
              {...register("subcategoryId")}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm bg-white outline-none focus:border-blue-500"
            >
              <option value="">Select Subcategory</option>
              {availableSubcategories.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Product SKU</label>
            <input
              {...register("sku")}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm text-slate-600"
              readOnly
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Brand (Optional)</label>
            <select
              {...register("brandId")}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm bg-white outline-none focus:border-blue-500"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="Detailed description of fabric, design, and style..."
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-5 border-t pt-6">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-3">Pricing & Selling Price</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Original Price ($)</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Discount Amount ($)</label>
            <input
              type="number"
              step="0.01"
              {...register("discount", { valueAsNumber: true })}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Final Selling Price ($)</label>
            <input
              type="number"
              step="0.01"
              {...register("sellingPrice", { valueAsNumber: true })}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm font-bold text-slate-900"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-3">Product Images</h2>
        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-8 transition hover:border-blue-500 hover:bg-blue-50/50">
          <Upload size={24} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            Click to select multiple product photos
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleMultipleImageUpload}
          />
        </label>

        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-2">
            {imagePreviews.map((img, index) => (
              <div
                key={index}
                className="relative h-28 w-28 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 flex items-center justify-center shadow-sm"
              >
                <img
                  src={img.imageUrl}
                  alt={`Product photo ${index + 1}`}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Variants Combined Builder */}
      <div className="space-y-5 border-t pt-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Variants Builder</h2>
          <p className="text-xs text-slate-500 mt-1">
            Select Color, Size, Custom Price, and Stock together, then click &quot;Add Variant&quot; to append.
          </p>
        </div>

        {/* Combined Builder Box */}
        <div className="rounded-xl border border-slate-300 bg-slate-50/80 p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Variant Combination</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
              <select
                value={builderColorId}
                onChange={(e) => setBuilderColorId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-blue-500"
              >
                <option value="">Any / No Color</option>
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Size</label>
              <select
                value={builderSizeId}
                onChange={(e) => setBuilderSizeId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-blue-500"
              >
                <option value="">Any / No Size</option>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Optional override"
                value={builderPrice}
                onChange={(e) => setBuilderPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                placeholder="10"
                value={builderStock}
                onChange={(e) => setBuilderStock(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCombinedVariant}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow"
          >
            <Plus size={16} /> Add Variant Combination
          </button>
        </div>

        {/* Existing Variants List */}
        {fields.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Configured Variants ({fields.length})</h3>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 bg-white p-4 gap-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">SKU</span>
                      <span className="font-bold text-slate-900">{watch(`variants.${index}.sku`)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Color</span>
                      <select
                        {...register(`variants.${index}.colorId`)}
                        className="rounded border border-slate-300 px-2 py-1 bg-white"
                      >
                        <option value="">None</option>
                        {colors.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Size</span>
                      <select
                        {...register(`variants.${index}.sizeId`)}
                        className="rounded border border-slate-300 px-2 py-1 bg-white"
                      >
                        <option value="">None</option>
                        {sizes.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Price ($)</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`variants.${index}.price`, { valueAsNumber: true })}
                        placeholder="Base price"
                        className="w-24 rounded border border-slate-300 px-2 py-1 bg-white"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Stock</span>
                      <input
                        type="number"
                        {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                        className="w-20 rounded border border-slate-300 px-2 py-1 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-60"
        >
          {loading ? "Saving Product..." : "Save Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;