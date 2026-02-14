import { getServerSession } from "next-auth";
import { authOptions } from "../../utils/authOptions";
import { BACKEND_URL, FRONTEND_URL } from "@/app/config/site";
import handleResponse from "./handleResponse";

// Fetch for routes that require access token
export const tokenizedFetch = async (path, options = {}) => {
  if (typeof window !== "undefined")
    throw new Error(
      "UnauthorizedError (tokenizedFetch/window): Forbidden in client-side.",
    );

  console.log("----- TOKENIZED FETCH START -----");
  console.log("PATH:", path);
  console.log("TIME:", Date.now());

  const session = await getServerSession(authOptions);

  console.log("SESSION EXISTS:", !!session);
  console.log("ACCESS TOKEN EXISTS:", !!session?.accessToken);

  if (!session || session.error) {
    throw new Error("SessionExpired");
  }

  if (!session.accessToken) {
    throw new Error("Unauthorized");
  }

  // if (!session?.accessToken) {
  //   console.log("NO ACCESS TOKEN - SESSION EXPIRED");
  //   throw new Error(
  //     "UnauthorizedError (tokenizedFetch/sessionAccessToken): Access token unavailable inside session.",
  //   );
  // }

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

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    method,
    headers,
    ...(isGetMethod && !hasCustomCache && { cache: "no-store" }),
    credentials: "include", // ensure httpOnly cookie is sent
  });

  console.log("BACKEND RESPONSE STATUS:", res.status);
  console.log("----- TOKENIZED FETCH END -----");

  return handleResponse(res);
};