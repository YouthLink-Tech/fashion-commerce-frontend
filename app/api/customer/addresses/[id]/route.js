import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

// PATCH update a specific address by its UUID
export async function PATCH(req, { params }) {
  try {
    const { id } = await (params || {});
    const body = await req.json();

    const result = await tokenizedFetch(`/api/customer/addresses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    console.error("FetchError (api/customer/addresses/[id]/PATCH):", error.message || error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }
}

// DELETE a specific address by its UUID
export async function DELETE(req, { params }) {
  try {
    const { id } = await (params || {});

    const result = await tokenizedFetch(`/api/customer/addresses/${id}`, {
      method: "DELETE",
    });

    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    console.error("FetchError (api/customer/addresses/[id]/DELETE):", error.message || error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }
}