import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function POST(req, { params }) {
  try {
    const { orderNumber } = await params;
    const body = await req.json();

    const result = await tokenizedFetch(
      `/api/order/${orderNumber}/return-request`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "ReturnRequestError (api/order/[orderNumber]/return-request):",
      error.message || error,
    );
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit return request",
      },
      { status: 500 },
    );
  }
}