export const formatCurrency = (
  amount: number,
  currency = "INR",
  locale = "en-SA"
) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};