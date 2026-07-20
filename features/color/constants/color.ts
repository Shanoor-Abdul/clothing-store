import { ColorFormData } from "../validation/color.schema";

export const COLOR_QUERY_KEY = ["colors"] as const;

export const COLOR_DEFAULT_VALUES: ColorFormData = {
  name: "",
  hexCode: "#000000",
  isActive: true,
};

export const COLOR_MESSAGES = {
  CREATE_SUCCESS: "Color created successfully",
  CREATE_ERROR: "Failed to create color",
  UPDATE_SUCCESS: "Color updated successfully",
  UPDATE_ERROR: "Failed to update color",
  DELETE_SUCCESS: "Color deleted successfully",
  DELETE_ERROR: "Failed to delete color",
} as const;
