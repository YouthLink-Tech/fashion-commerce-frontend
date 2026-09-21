import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

// GET all addresses for the logged-in customer
export async function GET() {
  try {
    const result = await tokenizedFetch("/api/customer/addresses");
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    console.error("FetchError (api/customer/addresses/GET):", error.message || error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }
}

// POST a new address for the logged-in customer
export async function POST(req) {
  try {
    const body = await req.json();
    const result = await tokenizedFetch("/api/customer/addresses", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: result.status || 201 });
  } catch (error) {
    console.error("FetchError (api/customer/addresses/POST):", error.message || error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }
}