import { getDb } from "@/lib/db";
import { users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validators";
import { generateToken } from "@/lib/utils";
import { nanoid } from "nanoid";
import { hashPassword } from "@/lib/password";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env);

  // Check duplicate email
  const existing = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email.toLowerCase()),
  });
  if (existing) {
    return Response.json({ error: "Email già registrata" }, { status: 409 });
  }

  const userId = nanoid();
  const passwordHash = await hashPassword(parsed.data.password);

  await db.insert(users).values({
    id: userId,
    email: parsed.data.email.toLowerCase(),
    name: parsed.data.name,
    passwordHash,
    emailVerified: false,
  });

  // Verification token
  const token = generateToken(32);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await db.insert(verificationTokens).values({
    identifier: parsed.data.email.toLowerCase(),
    token,
    expires,
  });

  // Send email
  try {
    const verifyUrl = `${env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
    const from = env.RESEND_FROM || "Sally <noreply@tuodominio.com>";

    const bodyJson = {
      from,
      to: parsed.data.email,
      subject: "Verifica la tua email 🐾 Sally",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#92400e">🐾 Benvenuto su Sally!</h2>
          <p>Ciao <strong>${parsed.data.name}</strong>,</p>
          <p>Clicca il pulsante per verificare il tuo account:</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:white;text-decoration:none;border-radius:12px;font-weight:bold;margin:16px 0">
            Verifica Email
          </a>
          <p style="color:#6b7280;font-size:14px">Il link scade tra 24 ore.<br>Se non ti sei registrato, ignora questa email.</p>
          <hr style="border:none;border-top:1px solid #fde68a;margin:24px 0">
          <p style="color:#9ca3af;font-size:12px">Sally · Strumento personale, non medico</p>
        </div>
      `,
    };

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyJson),
    });
  } catch (e) {
    console.error("Email send failed:", e);
    // Non bloccare la registrazione se l'email fallisce
  }

  return Response.json({ ok: true }, { status: 201 });
}
