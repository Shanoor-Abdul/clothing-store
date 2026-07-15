import { randomNumber } from "@/utils";

export const generateSku = (
  category: string,
  product: string
) => {
  const categoryCode = category
    .replace(/\s+/g, "")
    .substring(0, 3)
    .toUpperCase();

  const productCode = product
    .replace(/\s+/g, "")
    .substring(0, 4)
    .toUpperCase();

  return `${categoryCode}-${productCode}-${randomNumber(
    1000,
    9999
  )}`;
};

export const calculateSellingPrice = (
  price: number,
  discount = 0
) => {
  return Number((price - discount).toFixed(2));
};

export const calculateDiscountPercentage = (
  price: number,
  sellingPrice: number
) => {
  if (!price) return 0;

  return Number(
    (((price - sellingPrice) / price) * 100).toFixed(2)
  );
};