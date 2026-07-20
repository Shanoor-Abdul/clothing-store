import { CollectionFormData } from "../validation/collection.schema";

export const COLLECTION_QUERY_KEY = ["collections"] as const;

export const COLLECTION_DEFAULT_VALUES: CollectionFormData = {
  name: "",
  slug: "",
  image: "",
  description: "",
  displayOrder: 0,
  isActive: true,
};
