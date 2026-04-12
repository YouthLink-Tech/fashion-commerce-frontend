export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};