"use client";

import Image from "next/image";
import { Upload, Trash2, Star } from "lucide-react";

interface ProductImage {
  id?: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isFeatured?: boolean;
}

interface ProductImageUploadProps {
  images: ProductImage[];
  onUpload: (files: FileList) => void;
  onDelete: (index: number) => void;
  onFeatured: (index: number) => void;
}

const ProductImageUpload = ({
  images,
  onUpload,
  onDelete,
  onFeatured,
}: ProductImageUploadProps) => {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Product Images
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload multiple product images
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">

          <Upload size={18} />

          Upload Images

          <input
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files) {
                onUpload(e.target.files);
              }
            }}
          />

        </label>
      </div>

      {images.length === 0 ? (
        <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-slate-300">

          <div className="text-center">

            <Upload
              className="mx-auto text-slate-400"
              size={40}
            />

            <p className="mt-3 text-slate-500">
              No Images Uploaded
            </p>

          </div>

        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5">

          {images.map((image, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl border"
            >
              <Image
                src={image.imageUrl}
                alt={image.altText || "Product"}
                width={300}
                height={300}
                className="h-48 w-full object-cover"
              />

              <div className="absolute right-2 top-2 flex gap-2">

                <button
                  type="button"
                  onClick={() =>
                    onFeatured(index)
                  }
                  className={`rounded-full p-2 ${
                    image.isFeatured
                      ? "bg-yellow-500 text-white"
                      : "bg-white"
                  }`}
                >
                  <Star size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDelete(index)
                  }
                  className="rounded-full bg-red-600 p-2 text-white"
                >
                  <Trash2 size={16} />
                </button>

              </div>

              {image.isFeatured && (
                <div className="absolute bottom-0 w-full bg-yellow-500 py-1 text-center text-xs font-medium text-white">
                  Featured Image
                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default ProductImageUpload;