import { SizeFormData } from "../validation/size.schema";

export const SIZE_QUERY_KEY = ["sizes"] as const;

export const SIZE_DEFAULT_VALUES: SizeFormData = {
  name: "",
  displayOrder: 0,
  isActive: true,
};
