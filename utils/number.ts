export const randomNumber = (
  min: number,
  max: number
) => {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
};

export const percentage = (
  value: number,
  total: number
) => {
  if (!total) return 0;

  return Number(((value / total) * 100).toFixed(2));
};