export const capitalize = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const truncate = (
  value: string,
  length = 50
) => {
  if (value.length <= length) return value;

  return value.substring(0, length) + "...";
};

export const removeExtraSpaces = (
  value: string
) => {
  return value.replace(/\s+/g, " ").trim();
};