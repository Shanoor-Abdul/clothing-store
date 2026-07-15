export const calculateGrowth = (
  current: number,
  previous: number
) => {
  if (!previous) return 100;

  return Number(
    (((current - previous) / previous) * 100).toFixed(2)
  );
};