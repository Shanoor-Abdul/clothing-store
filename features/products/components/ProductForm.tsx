"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ProductSchema,
  ProductFormData,
} from "../validation/product.schema";

import { PRODUCT_DEFAULT_VALUES } from "../constants/product";

import { generateSlug } from "@/utils";

import {
  generateSku,
  calculateSellingPrice,
} from "../utils";

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

  categories: Option[];
  brands: Option[];
  collections: CollectionOption[];

  onSubmit: (data: ProductFormData) => void;
}

const ProductForm = ({
  defaultValues,
  loading = false,
  categories,
  brands,
  collections,
  onSubmit,
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
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

  const selectedCategory = categories.find(
    (category) => category.id === categoryId
  );

  useEffect(() => {
    if (!productName) return;

    setValue(
      "slug",
      generateSlug(productName),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  }, [productName, setValue]);

  useEffect(() => {
    if (!productName || !selectedCategory) return;

    setValue(
      "sku",
      generateSku(
        selectedCategory.name,
        productName
      ),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  }, [
    productName,
    selectedCategory,
    setValue,
  ]);

  useEffect(() => {
    setValue(
      "sellingPrice",
      calculateSellingPrice(
        Number(price || 0),
        Number(discount || 0)
      ),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  }, [
    price,
    discount,
    setValue,
  ]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-xl border bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold">
          Basic Information
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="mb-2 block">
            Product Name
          </label>

          <input
            {...register("name")}
            placeholder="Product Name"
            className="w-full rounded-lg border p-3"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block">
            Slug
          </label>

          <input
            {...register("slug")}
            className="w-full rounded-lg border bg-slate-100 p-3"
            readOnly
          />

          {errors.slug && (
            <p className="mt-1 text-sm text-red-500">
              {errors.slug.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block">
            SKU
          </label>

          <input
            {...register("sku")}
            className="w-full rounded-lg border bg-slate-100 p-3"
            readOnly
          />

          {errors.sku && (
            <p className="mt-1 text-sm text-red-500">
              {errors.sku.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block">
            Category
          </label>

          <select
            {...register("categoryId")}
            className="w-full rounded-lg border p-3"
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
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
          <label className="mb-2 block">
            Brand
          </label>

          <select
            {...register("brandId")}
            className="w-full rounded-lg border p-3"
          >
            <option value="">
              Select Brand
            </option>

            {brands.map((brand) => (
              <option
                key={brand.id}
                value={brand.id}
              >
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block">
            Status
          </label>

          <select
            {...register("status")}
            className="w-full rounded-lg border p-3"
          >
            <option value="DRAFT">
              Draft
            </option>

            <option value="PUBLISHED">
              Published
            </option>

            <option value="OUT_OF_STOCK">
              Out Of Stock
            </option>

            <option value="ARCHIVED">
              Archived
            </option>
          </select>
        </div>

      </div>

      <div>
        <label className="mb-2 block">
          Short Description
        </label>

        <textarea
          rows={3}
          {...register("shortDescription")}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-2 block">
          Description
        </label>

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

      <div>
        <h2 className="text-xl font-semibold">
          Pricing
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6">

        <div>
          <label className="mb-2 block">
            Price
          </label>

          <input
            type="number"
            step="0.01"
            {...register("price")}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block">
            Discount
          </label>

          <input
            type="number"
            step="0.01"
            {...register("discount")}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block">
            Selling Price
          </label>

          <input
            type="number"
            step="0.01"
            readOnly
            {...register("sellingPrice")}
            className="w-full rounded-lg border bg-slate-100 p-3"
          />
        </div>

      </div>
            <div>
        <h2 className="text-xl font-semibold">
          Product Collections
        </h2>

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

      <div>
        <h2 className="text-xl font-semibold">
          Product Details
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="mb-2 block">
            Material
          </label>

          <input
            {...register("material")}
            placeholder="Cotton, Silk..."
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block">
            Weight (Kg)
          </label>

          <input
            type="number"
            step="0.01"
            {...register("weight")}
            className="w-full rounded-lg border p-3"
          />
        </div>

      </div>

      <div>
        <h2 className="text-xl font-semibold">
          Product Settings
        </h2>

        <div className="mt-5 grid grid-cols-3 gap-6">

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register("isReturnable")}
            />

            <span>Returnable</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register("isFeatured")}
            />

            <span>Featured Product</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register("isActive")}
            />

            <span>Active</span>
          </label>

        </div>
      </div>

      <div className="border-t pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Saving Product..."
            : "Save Product"}
        </button>
      </div>

    </form>
  );
};

export default ProductForm;