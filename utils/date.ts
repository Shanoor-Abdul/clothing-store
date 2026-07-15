export const formatDate = (
  value: string | Date,
  locale = "en-GB"
) => {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
};

export const formatDateTime = (
  value: string | Date,
  locale = "en-GB"
) => {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};