import { auth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return Response.json({ error: "Nessun file" }, { status: 400 });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: "Formato non supportato. Usa JPG, PNG o WebP." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "File troppo grande. Massimo 5MB." }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `${session.user.id}-${nanoid()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  await env.R2.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  return Response.json({ url: `/api/photo/${key}` });
}
