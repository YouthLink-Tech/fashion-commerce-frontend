import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function PATCH(req, { params }) {
  try {
    const { variantId } = await params;
    const body = await req.json();
    const result = await tokenizedFetch(`/api/cart/${variantId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { variantId } = await params;
    const result = await tokenizedFetch(`/api/cart/${variantId}`, { method: "DELETE" });
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }
}