import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await tokenizedFetch("/api/cart/sync", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }
}