import { BannerFormData } from "../validation/banner.schema";

export const BANNER_QUERY_KEY = ["banners"] as const;

export const BANNER_DEFAULT_VALUES: BannerFormData = {
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  buttonText: "",
  redirectUrl: "",
  displayOrder: 0,
  isActive: true,
};
