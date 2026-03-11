
import { getDb } from "@/lib/db";
import { users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";


export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) return Response.json({ error: "Token mancante" }, { status: 400 });

  const { env } = getCloudflareContext();
  const db = getDb(env);

  const vt = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });

  if (!vt) return Response.json({ error: "Token non valido" }, { status: 400 });
  if (new Date(vt.expires) < new Date()) {
    return Response.json({ error: "Token scaduto" }, { status: 400 });
  }

  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.email, vt.identifier));

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));

  return Response.json({ ok: true });
}
