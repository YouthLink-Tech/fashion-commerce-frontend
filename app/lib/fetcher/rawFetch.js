import { BACKEND_URL, FRONTEND_URL } from "@/app/config/site";
import handleResponse from "./handleResponse";
import fetchWithRetry from "./fetchWithRetry";

// Fetch for routes that do not require access token
export const rawFetch = async (path, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const isGetMethod = method === "GET";
  const hasCustomCache =
    options.cache === "force-cache" ||
    (options.next && "revalidate" in options.next);

  const headers = {
    ...(options.headers || {}),
    "x-client-origin": FRONTEND_URL,
  };

  const isFormData = options.body instanceof FormData;
  const isContentTypeNotSet =
    !headers["Content-Type"] && !headers["content-type"];

  if (options.body && !isFormData && isContentTypeNotSet) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetchWithRetry(`${BACKEND_URL}${path}`, {
    ...options,
    method,
    headers,
    ...(isGetMethod && !hasCustomCache && { cache: "no-store" }),
  });

  return handleResponse(res);
};
