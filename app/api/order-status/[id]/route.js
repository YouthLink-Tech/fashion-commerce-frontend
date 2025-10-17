import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const result = await tokenizedFetch(`/api/order/change-status/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("UploadError (api/orderStatus):", error.message || error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
