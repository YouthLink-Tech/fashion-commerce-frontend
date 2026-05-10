import { FRONTEND_URL } from "../app/config/site";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      // allow: "/",
      // disallow: [
      //   "/user",
      //   "/reset-password",
      //   "/api/",
      // ],
      allow: [
        "/",
        "/story",
      ],
      disallow: [
        "/shop",        // blocks /shop, /shop/[category]
        "/product",     // blocks all /product/[slug]
        "/user",
        "/reset-password",
        "/api/",
      ],
    },
    sitemap: `${FRONTEND_URL}/sitemap.xml`,
  };
}