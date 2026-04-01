import { revalidateTag } from 'next/cache'
const SECRET = process.env.REVALIDATION_SECRET

export async function POST(request) {
  const auth = request.headers.get('x-revalidate-secret')

  if (auth !== SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { tags } = body;

  if (!Array.isArray(tags) ||
    !tags ||
    tags.some(tag => typeof tag !== 'string')) {
    return Response.json({ error: 'Missing tags' }, { status: 400 })
  }

  for (const tag of tags) {
    revalidateTag(tag)
  }

  return Response.json({ revalidated: true, tags })
}