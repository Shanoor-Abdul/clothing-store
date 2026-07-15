export const calculateOrderTotal = (
  subtotal: number,
  shipping: number,
  tax: number,
  discount: number
) => {
  return subtotal + shipping + tax - discount;
};

export const calculateItemTotal = (
  quantity: number,
  price: number
) => {
  return quantity * price;
};