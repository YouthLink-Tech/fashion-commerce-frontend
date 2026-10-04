export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://fashion-commerce-backend-664306765395.asia-southeast1.run.app"
    : "http://localhost:5000");

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://poshax.vercel.app"
    : "http://localhost:3000");

