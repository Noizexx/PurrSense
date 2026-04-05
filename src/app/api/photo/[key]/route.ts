import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  const { env } = await getCloudflareContext({ async: true });
  const object = await env.R2.get(key);

  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType ?? "image/jpeg");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body as ReadableStream, { headers });
}
