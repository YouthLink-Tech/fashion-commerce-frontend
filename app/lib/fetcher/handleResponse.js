// Handles response parsing and error catching
export default async function handleResponse(res) {
  const contentType = res.headers.get("Content-Type") || "";
  const isJson = contentType.includes("application/json");

  let data = null;
  let message = "";
  let ok = res.ok;
  let errorCode = null;
  let status = res.status;

  try {
    const text = await res.text();

    if (isJson && text) {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        data = parsed;
        message = res.statusText;
      } else if (parsed && typeof parsed === "object") {
        message = parsed.message || parsed.error || res.statusText;
        errorCode = parsed.errorCode || null;

        const { message: _msg, errorCode: _e, error: _err, success: _s, data: innerData, ...rest } = parsed;
        data = innerData !== undefined ? innerData : (Object.keys(rest).length > 0 ? rest : null);
      } else {
        message = res.statusText || "Unexpected response structure";
        data = null;
      }
    } else {
      message = res.statusText || "No content";
    }
  } catch (error) {
    console.error("Failed to parse JSON:", error.message || error);
    return {
      ok: false,
      status,
      message: "Invalid response format",
      data: null,
      errorCode: null,
    };
  }

  return {
    ok,
    status,
    message,
    errorCode,
    data,
  };
}
