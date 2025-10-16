import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const result = await tokenizedFetch(`/api/customer/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("UploadError (api/userData):", error.message || error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
