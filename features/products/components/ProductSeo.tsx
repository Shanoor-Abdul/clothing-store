"use client";

interface ProductSeoProps {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;

  onChange: (
    field:
      | "metaTitle"
      | "metaDescription"
      | "keywords"
      | "canonicalUrl"
      | "ogImage",
    value: string
  ) => void;
}

const ProductSeo = ({
  metaTitle,
  metaDescription,
  keywords,
  canonicalUrl,
  ogImage,
  onChange,
}: ProductSeoProps) => {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          SEO Settings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Improve search engine visibility for this product.
        </p>
      </div>

      <div className="space-y-6">

        <div>
          <label className="mb-2 block font-medium">
            Meta Title
          </label>

          <input
            value={metaTitle}
            onChange={(e) =>
              onChange(
                "metaTitle",
                e.target.value
              )
            }
            placeholder="SEO Title"
            className="w-full rounded-lg border p-3"
          />

          <p className="mt-1 text-xs text-slate-500">
            {metaTitle.length}/60 characters
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Meta Description
          </label>

          <textarea
            rows={4}
            value={metaDescription}
            onChange={(e) =>
              onChange(
                "metaDescription",
                e.target.value
              )
            }
            placeholder="Meta Description"
            className="w-full rounded-lg border p-3"
          />

          <p className="mt-1 text-xs text-slate-500">
            {metaDescription.length}/160 characters
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Keywords
          </label>

          <input
            value={keywords}
            onChange={(e) =>
              onChange(
                "keywords",
                e.target.value
              )
            }
            placeholder="shirt, cotton shirt, men's fashion"
            className="w-full rounded-lg border p-3"
          />

          <p className="mt-1 text-xs text-slate-500">
            Separate keywords using commas.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Canonical URL
          </label>

          <input
            value={canonicalUrl}
            onChange={(e) =>
              onChange(
                "canonicalUrl",
                e.target.value
              )
            }
            placeholder="https://yourstore.com/products/product-slug"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Open Graph Image
          </label>

          <input
            value={ogImage}
            onChange={(e) =>
              onChange(
                "ogImage",
                e.target.value
              )
            }
            placeholder="https://..."
            className="w-full rounded-lg border p-3"
          />
        </div>

      </div>

      <div className="mt-8 rounded-lg border bg-slate-50 p-5">

        <h3 className="mb-4 font-semibold">
          Google Search Preview
        </h3>

        <div>

          <p className="text-xl text-blue-700">
            {metaTitle || "Product Title"}
          </p>

          <p className="mt-1 text-sm text-green-700">
            {canonicalUrl ||
              "https://yourstore.com/product"}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            {metaDescription ||
              "Your product meta description will appear here."}
          </p>

        </div>

      </div>

    </div>
  );
};

export default ProductSeo;