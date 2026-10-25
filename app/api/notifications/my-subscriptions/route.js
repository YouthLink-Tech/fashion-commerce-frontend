import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function GET() {
  try {
    const result = await tokenizedFetch("/api/notifications/my-subscriptions");
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    console.error(
      "FetchError (api/notifications/my-subscriptions/GET):",
      error.message || error,
    );
    return NextResponse.json(
      { ok: false, message: error.message || "Unauthorized" },
      { status: error.status || 401 },
    );
  }
}