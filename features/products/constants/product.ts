import { ProductFormData } from "../validation/product.schema";

export const PRODUCT_QUERY_KEY = ["products"] as const;

export const PRODUCT_DEFAULT_VALUES: ProductFormData = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  categoryId: "",
  subcategoryId: undefined,
  brandId: undefined,
  collectionIds: [],
  material: "",
  price: 0,
  discount: 0,
  sellingPrice: 0,
  status: "PUBLISHED",
  isReturnable: true,
  isFeatured: false,
  isActive: true,
  images: [],
  videos: [],
  variants: [],
};

export const PRODUCT_STATUS_OPTIONS = [
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Out Of Stock", value: "OUT_OF_STOCK" },
  { label: "Archived", value: "ARCHIVED" },
] as const;

export const PRODUCT_MESSAGES = {
  FETCH_SUCCESS: "Products fetched successfully",
  FETCH_ERROR: "Failed to fetch products",
  CREATE_SUCCESS: "Product created successfully",
  CREATE_ERROR: "Failed to create product",
  UPDATE_SUCCESS: "Product updated successfully",
  UPDATE_ERROR: "Failed to update product",
  DELETE_SUCCESS: "Product deleted successfully",
  DELETE_ERROR: "Failed to delete product",
} as const;

export const PRODUCT_TABLE_COLUMNS = [
  { key: "image", label: "Image" },
  { key: "name", label: "Product" },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Category / Subcategory" },
  { key: "price", label: "Price" },
  { key: "stock", label: "Stock" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
] as const;