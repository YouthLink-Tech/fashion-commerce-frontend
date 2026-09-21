import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function GET() {
  try {
    const result = await tokenizedFetch("/api/cart");
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await tokenizedFetch("/api/cart", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: result.status || 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const result = await tokenizedFetch("/api/cart", { method: "DELETE" });
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }
}