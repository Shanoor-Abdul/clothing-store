"use client";

import Image from "next/image";

interface PreviewImage {
  imageUrl: string;
  isFeatured?: boolean;
}

interface PreviewVariant {
  color?: {
    name: string;
  };

  size?: {
    name: string;
  };

  stock: number;
}

interface ProductPreviewProps {
  name: string;
  shortDescription?: string;
  description?: string;

  price: number;
  discount?: number;
  sellingPrice: number;

  images: PreviewImage[];

  variants: PreviewVariant[];

  material?: string;

  isFeatured: boolean;
}

const ProductPreview = ({
  name,
  shortDescription,
  description,
  price,
  discount,
  sellingPrice,
  images,
  variants,
  material,
  isFeatured,
}: ProductPreviewProps) => {
  const featuredImage =
    images.find((img) => img.isFeatured) ??
    images[0];

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Live Preview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Customer storefront preview
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">

        <div className="aspect-square bg-slate-100">

          {featuredImage ? (
            <Image
              src={featuredImage.imageUrl}
              alt={name}
              width={700}
              height={700}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              No Image
            </div>
          )}

        </div>

        <div className="space-y-5 p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              {name || "Product Name"}
            </h2>

            {isFeatured && (
              <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-medium text-white">
                Featured
              </span>
            )}

          </div>

          {shortDescription && (
            <p className="text-slate-500">
              {shortDescription}
            </p>
          )}

          <div className="flex items-center gap-3">

            <span className="text-3xl font-bold text-blue-600">
              SAR {sellingPrice || 0}
            </span>

            {discount ? (
              <>
                <span className="text-lg text-slate-400 line-through">
                  SAR {price}
                </span>

                <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-600">
                  -{discount}
                </span>
              </>
            ) : null}

          </div>

          {material && (
            <div>
              <span className="font-medium">
                Material:
              </span>{" "}
              {material}
            </div>
          )}

          {variants.length > 0 && (
            <div>

              <h3 className="mb-3 font-semibold">
                Available Variants
              </h3>

              <div className="space-y-2">

                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >

                    <div className="flex gap-3">

                      <span>
                        {variant.color?.name}
                      </span>

                      <span>
                        {variant.size?.name}
                      </span>

                    </div>

                    <span className="text-sm text-slate-500">
                      Stock : {variant.stock}
                    </span>

                  </div>
                ))}

              </div>

            </div>
          )}

          <div>

            <h3 className="mb-2 font-semibold">
              Description
            </h3>

            <p className="whitespace-pre-line text-slate-600">
              {description ||
                "Product description will appear here."}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductPreview;