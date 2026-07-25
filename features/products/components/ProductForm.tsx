"use client";

import { useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import Image from "next/image";

import {
  ProductSchema,
  ProductFormData,
  VariantFormItem,
} from "../validation/product.schema";

import { PRODUCT_DEFAULT_VALUES } from "../constants/product";

import { generateSlug } from "@/utils";
import { generateSku, calculateSellingPrice } from "../utils";
import MultiSelect from "@/components/common/MultiSelect";
import { Product } from "../types/product";
import { uploadProductImage } from "../api";

interface ImageFile {
  file: File;
  preview: string;
  status: "uploading" | "uploaded" | "error";
  id?: string;
  imageUrl?: string;
}

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
  const watchImages = watch("images");

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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const currentImages = watch("images") || [];
      const filesArray = Array.from(files);
      
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const newImage = {
            file,
            imageUrl: dataUrl,
            altText: file.name,
            displayOrder: (currentImages as any[]).filter(i => !(i instanceof File)).length + 1,
          };
          setValue("images", [...currentImages, newImage], {
            shouldDirty: true,
          });
        };
        reader.readAsDataURL(file);
      });

      // Reset input
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
        )}-${String(currentVariants.length + 1).padStart(2, "0")}`
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

  const isEditing = !!editingProduct;

const imageUrl = (img: unknown): string => {
    if (typeof img === "string") return img;
    if (img && typeof img === "object" && "imageUrl" in (img as Record<string, unknown>))
      return (img as Record<string, string>).imageUrl;
    return "";
  };

  const isFile = (img: unknown): boolean => img instanceof File;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-xl border bg-white p-6 shadow-sm"
    >
      {/* Basic Information */}
      <div>
        <h2 className="text-xl font-semibold">Basic Information</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block">Product Name</label>
          <input
            {...register("name")}
            placeholder="Product Name"
            className="w-full rounded-lg border p-3"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block">Slug</label>
          <input
            {...register("slug")}
            className="w-full rounded-lg border bg-slate-100 p-3"
            readOnly
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block">SKU</label>
          <input
            {...register("sku")}
            className="w-full rounded-lg border bg-slate-100 p-3"
            readOnly
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-500">{errors.sku.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block">Category</label>
          <select
            {...register("categoryId")}
            className="w-full rounded-lg border p-3"
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
          <label className="mb-2 block">Brand</label>
          <select
            {...register("brandId")}
            className="w-full rounded-lg border p-3"
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
          <label className="mb-2 block">Status</label>
          <select
            {...register("status")}
            className="w-full rounded-lg border p-3"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="OUT_OF_STOCK">Out Of Stock</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block">Short Description</label>
        <textarea
          rows={3}
          {...register("shortDescription")}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-2 block">Description</label>
        <textarea
          rows={6}
          {...register("description")}
          className="w-full rounded-lg border p-3"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-xl font-semibold">Pricing</h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="mb-2 block">Price</label>
          <input
            type="number"
            step="0.01"
            {...register("price")}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Discount</label>
          <input
            type="number"
            step="0.01"
            {...register("discount")}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Selling Price</label>
          <input
            type="number"
            step="0.01"
            readOnly
            {...register("sellingPrice")}
            className="w-full rounded-lg border bg-slate-100 p-3"
          />
        </div>
      </div>

      {/* Image Upload - inside form */}
      <div>
        <h2 className="text-xl font-semibold">Product Images</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload product images. First image will be the main display image.
        </p>

        <div className="mt-4">
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-6 transition hover:border-blue-400 hover:bg-blue-50/50">
            <Upload size={24} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              Click to upload images
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

        {(watchImages || []).length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
            {(watchImages || []).map((img: unknown, index: number) => (
              <div key={index} className="group relative aspect-square">
                <Image
                  src={imageUrl(img)}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="rounded-lg object-cover"
                  sizes="100px"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants Section with multiselect color/size */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Product Variants</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add color, size, stock, and pricing variants.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Variant
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed p-10 text-center text-slate-500">
            No variants added. Click Add Variant to create one.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">
                    Variant {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-lg bg-red-500 p-2 text-white hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {/* Hidden id for editing */}
                  {field.id && (
                    <input
                      type="hidden"
                      {...register(`variants.${index}.id`)}
                    />
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium">SKU</label>
                    <input
                      {...register(`variants.${index}.sku`)}
                      className="w-full rounded-lg border bg-slate-100 p-2.5 text-sm"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Barcode</label>
                    <input
                      {...register(`variants.${index}.barcode`)}
                      className="w-full rounded-lg border p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Stock</label>
                    <input
                      type="number"
                      {...register(`variants.${index}.stock`)}
                      className="w-full rounded-lg border p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Price (override)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`variants.${index}.price`)}
                      className="w-full rounded-lg border p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Color</label>
                    <select
                      {...register(`variants.${index}.colorId`)}
                      className="w-full rounded-lg border p-2.5 text-sm"
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
                    <label className="mb-1 block text-sm font-medium">Size</label>
                    <select
                      {...register(`variants.${index}.sizeId`)}
                      className="w-full rounded-lg border p-2.5 text-sm"
                    >
                      <option value="">Select Size</option>
                      {sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      {...register(`variants.${index}.isActive`)}
                    />
                    Active Variant
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collections */}
      <div>
        <h2 className="text-xl font-semibold">Product Collections</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {collections.map((collection) => (
            <label
              key={collection.id}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                value={collection.id}
                {...register("collectionIds")}
              />
              <span>{collection.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Product Details */}
      <div>
        <h2 className="text-xl font-semibold">Product Details</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block">Material</label>
          <input
            {...register("material")}
            placeholder="Cotton, Silk..."
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Weight (Kg)</label>
          <input
            type="number"
            step="0.01"
            {...register("weight")}
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      {/* Settings */}
      <div>
        <h2 className="text-xl font-semibold">Product Settings</h2>
        <div className="mt-5 grid grid-cols-3 gap-6">
          <label className="flex items-center gap-3">
            <input type="checkbox" {...register("isReturnable")} />
            <span>Returnable</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" {...register("isFeatured")} />
            <span>Featured Product</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" {...register("isActive")} />
            <span>Active</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 border-t pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-8 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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