import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cats, shareTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateToken } from "@/lib/utils";
import { nanoid } from "nanoid";
import { getCloudflareContext } from "@opennextjs/cloudflare";


export async function POST(req: Request, { params }: { params: Promise<{ catId: string }> }) {
  const { catId } = await params;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Non autenticato" }, { status: 401 });

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env);

  const cat = await db.query.cats.findFirst({
    where: and(eq(cats.id, catId), eq(cats.userId, session.user.id)),
  });
  if (!cat) return Response.json({ error: "Non trovato" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const days = Number(body.expiresInDays ?? 30);

  const token = generateToken(12);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  await db.insert(shareTokens).values({
    id: nanoid(),
    catId,
    token,
    expiresAt,
  });

  const url = `${env.NEXT_PUBLIC_BASE_URL}/share/${token}`;

  return Response.json({ token, url, expiresAt }, { status: 201 });
}
