import { CategoryFormData } from "../validation/category.schema";

export const CATEGORY_QUERY_KEY = ["categories"] as const;

export const CATEGORY_DEFAULT_VALUES: CategoryFormData = {
  name: "",
  slug: "",
  image: "",
  icon: "",
  description: "",
  parentId: "",
  displayOrder: 0,
  isFeatured: false,
  isActive: true,
};

export const CATEGORY_STATUS = [
  {
    label: "Active",
    value: true,
  },
  {
    label: "Inactive",
    value: false,
  },
] as const;

export const CATEGORY_MESSAGES = {
  FETCH_SUCCESS: "Categories fetched successfully",
  FETCH_ERROR: "Failed to fetch categories",

  CREATE_SUCCESS: "Category created successfully",
  CREATE_ERROR: "Failed to create category",

  UPDATE_SUCCESS: "Category updated successfully",
  UPDATE_ERROR: "Failed to update category",

  DELETE_SUCCESS: "Category deleted successfully",
  DELETE_ERROR: "Failed to delete category",
} as const;

export const CATEGORY_TABLE_COLUMNS = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "slug",
    label: "Slug",
  },
  {
    key: "parent",
    label: "Parent Category",
  },
  {
    key: "isFeatured",
    label: "Featured",
  },
  {
    key: "isActive",
    label: "Status",
  },
  {
    key: "actions",
    label: "Actions",
  },
] as const;