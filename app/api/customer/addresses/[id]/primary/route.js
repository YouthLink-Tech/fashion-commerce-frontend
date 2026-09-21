import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

// PATCH set a specific address as primary
export async function PATCH(req, { params }) {
  try {
    const { id } = await (params || {});

    const result = await tokenizedFetch(`/api/customer/addresses/${id}/primary`, {
      method: "PATCH",
    });

    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    console.error("FetchError (api/customer/addresses/[id]/primary/PATCH):", error.message || error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }
}