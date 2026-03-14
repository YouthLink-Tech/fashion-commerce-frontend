import { getServerSession } from "next-auth";
import { authOptions } from "../../utils/authOptions";
import { BACKEND_URL, FRONTEND_URL } from "@/app/config/site";
import handleResponse from "./handleResponse";
import fetchWithRetry from "./fetchWithRetry";

// Fetch for routes that require access token
export const tokenizedFetch = async (path, options = {}) => {
  if (typeof window !== "undefined")
    throw new Error(
      "UnauthorizedError (tokenizedFetch/window): Forbidden in client-side.",
    );

  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error(
      "UnauthorizedError (tokenizedFetch/sessionAccessToken): Access token unavailable inside session.",
    );
  }

  const method = (options.method || "GET").toUpperCase();
  const isGetMethod = method === "GET";
  const hasCustomCache =
    options.cache === "force-cache" ||
    (options.next && "revalidate" in options.next);

  const headers = {
    ...(options.headers || {}),
    "x-client-origin": FRONTEND_URL,
    Authorization: `Bearer ${session.accessToken}`,
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
    credentials: "include", // ensure httpOnly cookie is sent
  });

  return handleResponse(res);
};