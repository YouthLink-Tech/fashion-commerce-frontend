

import { FRONTEND_URL } from "./config/site";
import { rawFetch } from "./lib/fetcher/rawFetch";

export default async function sitemap() {
  const [productsRes, categoriesRes] = await Promise.all([
    rawFetch("/api/products/all", { next: { revalidate: 7200 } }),
    rawFetch("/api/category/all", { next: { revalidate: 7200 } }),
  ]);

  const products = productsRes?.data ?? [];
  const categories = categoriesRes?.data ?? [];

  const staticRoutes = [
    {
      url: FRONTEND_URL,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${FRONTEND_URL}/shop`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/our-story`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const productRoutes = products
    .filter((p) => p.status === "active" && p.slug)
    .map((p) => ({
      url: `${FRONTEND_URL}/product/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const categoryRoutes = categories
    .filter((c) => c.categorySlug)
    .map((c) => ({
      url: `${FRONTEND_URL}/shop/${c.categorySlug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}