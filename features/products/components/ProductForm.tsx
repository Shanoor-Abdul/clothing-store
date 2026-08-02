"use client";

import { useEffect, useCallback, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, Plus, Trash2, Tag, CheckSquare, Sparkles, ShieldCheck, Film, Video } from "lucide-react";

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

// Canvas-based image compressor to convert multi-megabyte photos into lightweight ~40KB JPEG data URLs
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 750;
        const MAX_HEIGHT = 750;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        // High-compression 0.65 JPEG
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.65);
        resolve(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

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
      material: "",
      status: "PUBLISHED",
      isReturnable: true,
      isFeatured: false,
      isActive: true,
      collectionIds: [],
      images: [],
      videos: [],
      variants: [],
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

  // State for Video URL input
  const [videoUrlInput, setVideoUrlInput] = useState<string>("");

  const collectionIdsValue = watch("collectionIds") || [];
  const videosValue = watch("videos") || [];

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
      material: "",
      status: "PUBLISHED",
      isReturnable: true,
      isFeatured: false,
      isActive: true,
      collectionIds: [],
      images: [],
      videos: [],
      variants: [],
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

  // Handle high-performance compressed image upload
  const handleMultipleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const currentImages = watch("images") || [];

      try {
        const compressedUrls = await Promise.all(files.map((file) => compressImageFile(file)));
        const newImageObjs = compressedUrls.map((dataUrl, idx) => ({
          imageUrl: dataUrl,
          altText: files[idx]?.name || "Product Image",
          displayOrder: currentImages.length + idx + 1,
        }));

        setValue("images", [...currentImages, ...newImageObjs], {
          shouldDirty: true,
          shouldValidate: true,
        });
      } catch (err) {
        console.error("Error compressing uploaded images:", err);
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

  // Video Upload / Video URL handlers
  const handleVideoFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const currentVideos = watch("videos") || [];
        setValue(
          "videos",
          [
            ...currentVideos,
            { videoUrl: reader.result as string, thumbnailUrl: null, duration: null },
          ],
          { shouldDirty: true, shouldValidate: true }
        );
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [setValue, watch]
  );

  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    const currentVideos = watch("videos") || [];
    setValue(
      "videos",
      [
        ...currentVideos,
        { videoUrl: videoUrlInput.trim(), thumbnailUrl: null, duration: null },
      ],
      { shouldDirty: true, shouldValidate: true }
    );
    setVideoUrlInput("");
  };

  const removeVideo = useCallback(
    (index: number) => {
      const currentVideos = watch("videos") || [];
      setValue(
        "videos",
        currentVideos.filter((_: unknown, i: number) => i !== index),
        { shouldDirty: true }
      );
    },
    [setValue, watch]
  );

  // Toggle collection check handler
  const toggleCollection = (id: string) => {
    const current = watch("collectionIds") || [];
    if (current.includes(id)) {
      setValue("collectionIds", current.filter((cId) => cId !== id), { shouldDirty: true });
    } else {
      setValue("collectionIds", [...current, id], { shouldDirty: true });
    }
  };

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
              <option value="DRAFT">DRAFT (Hidden draft)</option>
              <option value="OUT_OF_STOCK">OUT OF STOCK</option>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Product SKU</label>
            <input
              {...register("sku")}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm text-slate-600 font-mono"
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

          {/* Material Field */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Material / Fabric (Optional)</label>
            <input
              {...register("material")}
              placeholder="e.g. 100% Pure Silk, Organic Cotton, Chiffon"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Detailed Description</label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="Detailed description of fabric, design, care instructions, and style..."
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>
      </div>

      {/* Product Collections Assignment Section */}
      {collections.length > 0 && (
        <div className="space-y-3 border-t pt-6">
          <h2 className="text-xl font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
            <Tag size={20} className="text-purple-600" /> Assign Collections
          </h2>
          <p className="text-xs text-slate-500">
            Select one or more store collections to feature this product under:
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {collections.map((col) => {
              const isSelected = collectionIdsValue.includes(col.id);
              return (
                <button
                  type="button"
                  key={col.id}
                  onClick={() => toggleCollection(col.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow"
                      : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <CheckSquare size={14} className={isSelected ? "text-white" : "text-slate-400"} />
                  {col.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Display Flags & Preferences */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
          <Sparkles size={20} className="text-amber-500" /> Display Preferences & Visibility Flags
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* isActive */}
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:border-slate-300 transition">
            <input
              type="checkbox"
              {...register("isActive")}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-bold text-slate-900 block">Active Product</span>
              <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                Enable to show this product in storefront search and categories.
              </span>
            </div>
          </label>

          {/* isFeatured */}
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:border-slate-300 transition">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span className="text-sm font-bold text-slate-900 block flex items-center gap-1">
                Featured Product <Sparkles size={14} className="text-amber-500" />
              </span>
              <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                Display this product in the Homepage &quot;Featured Showcase&quot; section.
              </span>
            </div>
          </label>

          {/* isReturnable */}
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:border-slate-300 transition">
            <input
              type="checkbox"
              {...register("isReturnable")}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-bold text-slate-900 block flex items-center gap-1">
                Return Eligible <ShieldCheck size={14} className="text-emerald-600" />
              </span>
              <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                Allows customers to see the 24-Hour Return Window button on delivered orders.
              </span>
            </div>
          </label>
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

      {/* Product Images Upload */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-3">Product Images</h2>
        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-8 transition hover:border-blue-500 hover:bg-blue-50/50">
          <Upload size={24} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            Click to select high-res photos (Auto-compressed for fast loading)
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

      {/* Product Showcase Video Upload & Video URL */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
          <Film size={20} className="text-rose-600" /> Product Showcase Videos & 360° Fit Reels
        </h2>
        <p className="text-xs text-slate-500">
          Upload short MP4/WEBM videos or paste video streaming URLs (*e.g. Cloudinary, MP4 link, or S3 bucket*):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Direct File Upload */}
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-6 transition hover:border-rose-400 hover:bg-rose-50">
            <Video size={24} className="text-rose-500" />
            <span className="text-xs font-bold text-rose-800">
              Upload MP4 / WEBM Video File
            </span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              hidden
              onChange={handleVideoFileUpload}
            />
          </label>

          {/* Paste Video URL */}
          <div className="flex gap-2 items-center">
            <input
              type="url"
              placeholder="Paste Video URL (https://.../video.mp4)"
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddVideoUrl}
              className="shrink-0 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white hover:bg-rose-700 transition shadow"
            >
              Add Video
            </button>
          </div>
        </div>

        {/* Uploaded Videos List Preview */}
        {videosValue.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-3">
            {videosValue.map((vid, index) => (
              <div
                key={index}
                className="relative w-64 rounded-xl border border-slate-200 overflow-hidden bg-slate-900 p-1 shadow-sm"
              >
                <video
                  src={vid.videoUrl}
                  controls
                  className="w-full h-36 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition z-10"
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