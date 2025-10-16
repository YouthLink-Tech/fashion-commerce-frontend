import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function POST(req) {
  try {
    const body = await req.json();

    const result = await tokenizedFetch("/api/order/add", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("UploadError (api/order):", error.message || error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
