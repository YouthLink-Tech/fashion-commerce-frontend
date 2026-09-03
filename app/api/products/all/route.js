import { NextResponse } from "next/server";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";

export async function GET(request) {
  const { search } = new URL(request.url);
  try {
    const result = await rawFetch(`/api/products/all${search}`);
    return NextResponse.json(result.data ?? result);
  } catch (err) {
    return NextResponse.json({ ok: false, message: "Failed to fetch products." }, { status: 502 });
  }
}