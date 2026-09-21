import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function DELETE(req, { params }) {
  try {
    const { productId } = await params;
    const result = await tokenizedFetch(`/api/wishlist/${productId}`, { method: "DELETE" });
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }
}