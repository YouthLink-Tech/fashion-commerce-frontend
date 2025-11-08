export const errorMessage = (err) => {
  if (!err) return "Something went wrong.";

  // Handle Zod-style array errors
  if (Array.isArray(err)) {
    return err
      .map((e) => {
        const field = e.path?.join(".") || "Field";
        const message = e.message || "Invalid value";
        return `${field}: ${message}`;
      })
      .join("\n");
  }

  // Handle objects with a message
  if (typeof err === "object") {
    // Axios-style nested response
    if (err?.message?.message) {
      try {
        const parsed = JSON.parse(err?.message?.message);
        if (Array.isArray(parsed)) return errorMessage(parsed);
        return parsed.message || err?.message?.message;
      } catch {
        return err?.message?.message;
      }
    }

    // Plain backend error object { message, stack }
    if (err.message) return err.message;

    // Any other object: stringify fallback
    return JSON.stringify(err);
  }

  // If it’s a string, return as is
  if (typeof err === "string") return err;

  // Fallback for anything else
  return "Something went wrong.";
};
