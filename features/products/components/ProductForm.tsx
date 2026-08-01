"use client";

import { useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import Image from "next/image";

import {
  ProductSchema,
  ProductFormData,
} from "../validation/product.schema";

import { PRODUCT_DEFAULT_VALUES } from "../constants/product";
import { generateSlug } from "@/utils";
import { generateSku, calculateSellingPrice } from "../utils";
import { Product } from "../types/product";

interface Option {
  id: string;
  name: string;
}

interface CollectionOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  loading?: boolean;
  uploading?: boolean;
  categories: Option[];
  subcategories: Option[];
  brands: Option[];
  colors: Option[];
  sizes: Option[];
  collections: CollectionOption[];
  editingProduct?: Product | null;
  onCancel?: () => void;
  onSubmit: (data: ProductFormData) => void;
}

const ProductForm = ({
  defaultValues,
  loading = false,
  uploading = false,
  categories,
  subcategories,
  brands,
  colors,
  sizes,
  collections,
  editingProduct,
  onCancel,
  onSubmit,
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      ...PRODUCT_DEFAULT_VALUES,
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    reset({
      ...PRODUCT_DEFAULT_VALUES,
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  const productName = watch("name");
  const categoryId = watch("categoryId");
  const price = watch("price");
  const discount = watch("discount");
  const watchImages = watch("images") || [];

  const selectedCategory = categories.find(
    (category) => category.id === categoryId
  );

  useEffect(() => {
    if (!productName) return;
    setValue("slug", generateSlug(productName), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [productName, setValue]);

  useEffect(() => {
    if (!productName || !selectedCategory) return;
    setValue(
      "sku",
      generateSku(selectedCategory.name, productName),
      { shouldDirty: true, shouldValidate: true }
    );
  }, [productName, selectedCategory, setValue]);

  useEffect(() => {
    setValue(
      "sellingPrice",
      calculateSellingPrice(Number(price || 0), Number(discount || 0)),
      { shouldDirty: true, shouldValidate: true }
    );
  }, [price, discount, setValue]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const currentImages = watch("images") || [];
      const fileArray = Array.from(files);

      const readPromises = fileArray.map((file) => {
        return new Promise<{ imageUrl: string; altText: string; displayOrder: number }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve({
                imageUrl: reader.result,
                altText: file.name,
                displayOrder: currentImages.length + 1,
              });
            } else {
              reject(new Error("Failed to read image"));
            }
          };
          reader.onerror = reject;
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

  const addVariant = useCallback(() => {
    const name = watch("name");
    const cat = watch("categoryId");
    const currentVariants = watch("variants") || [];
    const generatedSku = name
      ? `${generateSku(
          categories.find((c) => c.id === cat)?.name || "PROD",
          name
        )}-VAR-${String(currentVariants.length + 1).padStart(2, "0")}`
      : `VAR-${Date.now().toString().slice(-4)}`;

    append({
      sku: generatedSku,
      stock: 0,
      isActive: true,
      barcode: null,
      price: null,
      colorId: null,
      sizeId: null,
    });
  }, [watch, categories, append]);

  const addVariantsFromSelection = useCallback((
    selectedColorIds: string[],
    selectedSizeIds: string[]
  ) => {
    if (selectedColorIds.length === 0 && selectedSizeIds.length === 0) return;

    const name = watch("name");
    const cat = watch("categoryId");
    const currentVariants = watch("variants") || [];
    
    const colorIds = selectedColorIds.length > 0 ? selectedColorIds : [""];
    const sizeIds = selectedSizeIds.length > 0 ? selectedSizeIds : [""];

    const newVariants = colorIds.flatMap((colorId, colorIdx) => {
      const colorVariants = sizeIds.map((sizeId, sizeIdx) => {
        const isColorOnly = selectedSizeIds.length === 0 && selectedColorIds.length > 0;
        const isSizeOnly = selectedColorIds.length === 0 && selectedSizeIds.length > 0;
        const isBoth = selectedColorIds.length > 0 && selectedSizeIds.length > 0;
        
        if (isColorOnly && colorId !== "") {
          return {
            sku: `${generateSku(
              categories.find((c) => c.id === cat)?.name || "PROD",
              name
            )}-${String(currentVariants.length + colorIdx).padStart(2, "0")}`,
            stock: 0,
            isActive: true,
            barcode: null,
            price: null,
            colorId,
            sizeId: null,
          };
        }
        
        if (isSizeOnly && sizeId !== "") {
          return {
            sku: `${generateSku(
              categories.find((c) => c.id === cat)?.name || "PROD",
              name
            )}-${String(currentVariants.length + sizeIdx).padStart(2, "0")}`,
            stock: 0,
            isActive: true,
            barcode: null,
            price: null,
            colorId: null,
            sizeId,
          };
        }
        
        if (isBoth) {
          return {
            sku: `${generateSku(
              categories.find((c) => c.id === cat)?.name || "PROD",
              name
            )}-${String(currentVariants.length + colorIdx * sizeIds.length + sizeIdx).padStart(2, "0")}`,
            stock: 0,
            isActive: true,
            barcode: null,
            price: null,
            colorId,
            sizeId,
          };
        }
        
        return null;
      }).filter(Boolean);
      
      return colorVariants;
    }).filter(Boolean) as any[];

    newVariants.forEach(variant => {
      append(variant);
    });
  }, [watch, categories, append]);

  const isEditing = !!editingProduct;

  const imageUrl = (img: unknown): string => {
    if (typeof img === "string") return img;
    if (img && typeof img === "object" && "imageUrl" in (img as Record<string, unknown>))
      return (img as Record<string, string>).imageUrl;
    return "";
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-xl border bg-white p-6 shadow-sm"
    >
      {/* Basic Information */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Product Name</label>
          <input
            {...register("name")}
            placeholder="e.g. Wedding Men Suit"
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Slug</label>
          <input
            {...register("slug")}
            className="w-full rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm text-slate-600"
            readOnly
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">SKU</label>
          <input
            {...register("sku")}
            className="w-full rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm text-slate-600"
            readOnly
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-500">{errors.sku.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
          <select
            {...register("categoryId")}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block">Subcategory</label>
          <select
            {...register("subcategoryId")}
            className="w-full rounded-lg border p-3"
          >
            <option value="">No Subcategory (Optional)</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          {errors.subcategoryId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.subcategoryId.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block">Brand</label>
          <select
            {...register("brandId")}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="OUT_OF_STOCK">Out Of Stock</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Short Description</label>
        <textarea
          rows={2}
          {...register("shortDescription")}
          placeholder="Brief summary of the product..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
        <textarea
          rows={4}
          {...register("description")}
          placeholder="Full product specification and details..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Pricing & Discount</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Price ($)</label>
          <input
            type="number"
            step="0.01"
            {...register("price")}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Discount ($)</label>
          <input
            type="number"
            step="0.01"
            {...register("discount")}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Selling Price ($)</label>
          <input
            type="number"
            step="0.01"
            readOnly
            {...register("sellingPrice")}
            className="w-full rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm text-slate-600"
          />
        </div>
      </div>

      {/* Multiple Image Upload */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Product Images</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload one or multiple images for this product. Selected images will be uploaded to the server upon saving.
        </p>

        <div className="mt-4">
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-6 transition hover:border-blue-500 hover:bg-blue-50/50">
            <Upload size={24} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Click to select multiple image files
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {watchImages.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {watchImages.map((img: unknown, index: number) => {
              const src = imageUrl(img);
              return (
                <div key={index} className="group relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  {src ? (
                    <Image
                      src={src}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No Image
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition"
                  >
                    <X size={14} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      Main
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Variants Section */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Product Variants</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add color, size, stock, and custom pricing overrides for specific variants.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Add Variant
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-dashed p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-700">Quick Add Variants</h3>
          <p className="mb-3 text-xs text-slate-500">
            Select colors and sizes to auto-generate all combinations
          </p>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Colors</label>
              <select
                multiple
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 max-h-40 overflow-y-auto"
                onChange={(e) => {
                  const selectedColors = Array.from(e.target.selectedOptions).map(o => o.value);
                  addVariantsFromSelection(selectedColors, []);
                }}
              >
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Sizes</label>
              <select
                multiple
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 max-h-40 overflow-y-auto"
                onChange={(e) => {
                  const selectedSizes = Array.from(e.target.selectedOptions).map(o => o.value);
                  addVariantsFromSelection([], selectedSizes);
                }}
              >
                {sizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">Base Price</label>
            <input
              type="number"
              step="0.01"
              value={watch("price") || 0}
              onChange={(e) => setValue("price", Number(e.target.value))}
              className="w-full rounded-lg border p-2.5 text-sm"
              placeholder="Default price for all variants"
            />
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No variants added yet. Click &quot;Add Variant&quot; to configure colors, sizes, and custom pricing.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-800">
                    Variant #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex items-center gap-1 rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {field.id && (
                    <input
                      type="hidden"
                      {...register(`variants.${index}.id`)}
                    />
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Variant SKU</label>
                    <input
                      {...register(`variants.${index}.sku`)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-sm text-slate-600"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Color</label>
                    <select
                      {...register(`variants.${index}.colorId`)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white outline-none focus:border-blue-500"
                    >
                      <option value="">Select Color</option>
                      {colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Size</label>
                    <select
                      {...register(`variants.${index}.sizeId`)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white outline-none focus:border-blue-500"
                    >
                      <option value="">Select Size</option>
                      {sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Stock Quantity</label>
                    <input
                      type="number"
                      {...register(`variants.${index}.stock`)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Variant Custom Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Default (uses base price)"
                      {...register(`variants.${index}.price`)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Barcode</label>
                    <input
                      {...register(`variants.${index}.barcode`)}
                      placeholder="Optional barcode"
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`variants.${index}.isActive`)}
                      className="h-4 w-4 text-blue-600"
                    />
                    Active Variant
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900">Product Collections</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {collections.map((collection) => (
            <label
              key={collection.id}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer"
            >
              <input
                type="checkbox"
                value={collection.id}
                {...register("collectionIds")}
                className="h-4 w-4 text-blue-600"
              />
              <span>{collection.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Details */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Product Attributes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Material</label>
          <input
            {...register("material")}
            placeholder="e.g. Cotton, Silk, Leather"
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Weight (Kg)</label>
          <input
            type="number"
            step="0.01"
            {...register("weight")}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Settings */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" {...register("isReturnable")} className="h-4 w-4 text-blue-600" />
            <span>Returnable Item</span>
          </label>

          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 text-blue-600" />
            <span>Featured Product</span>
          </label>

          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" {...register("isActive")} className="h-4 w-4 text-blue-600" />
            <span>Active Product</span>
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center gap-4 border-t pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel Edit
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading
            ? uploading
              ? "Uploading Images..."
              : "Saving Product..."
            : isEditing
            ? "Update Product"
            : "Create Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;