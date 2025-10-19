import { NextResponse } from "next/server";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const result = await tokenizedFetch("/api/gcs-file-upload/upload-multiple-files", {
      method: "POST",
      body: formData,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("UploadError (api/upload-files):", error.message || error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
