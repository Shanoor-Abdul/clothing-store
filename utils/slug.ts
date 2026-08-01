export const generateSlug = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const generateSku = (category: string, name: string): string => {
  const catPrefix = (category || "CAT").slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "X");
  const nameCode = (name || "PROD").slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "Y");
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${catPrefix}-${nameCode}-${randomNum}`;
};