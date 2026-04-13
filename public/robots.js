import { FRONTEND_URL } from "../app/config/site";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/user",
        "/reset-password",
        "/api/",
      ],
    },
    sitemap: `${FRONTEND_URL}/sitemap.xml`,
  };
}