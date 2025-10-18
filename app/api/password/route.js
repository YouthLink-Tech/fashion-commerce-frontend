import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function POST(req) {
  try {
    const body = await req.json();

    const result = await tokenizedFetch("/api/customer/set-password", {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PasswordError (api/set/password):", error.message || error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const result = await tokenizedFetch("/api/customer/update-password", {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "PasswordError (api/update/password):",
      error.message || error,
    );
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
