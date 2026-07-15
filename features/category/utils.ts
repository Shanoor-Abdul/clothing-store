import { Category } from "./types/category";

export const getRootCategories = (
  categories: Category[]
) => {
  return categories.filter(
    (category) => !category.parentId
  );
};

export const getChildCategories = (
  categories: Category[],
  parentId: string
) => {
  return categories.filter(
    (category) => category.parentId === parentId
  );
};