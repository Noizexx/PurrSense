import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "@node-rs/bcrypt";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth(() => {
  const { env } = getCloudflareContext();
  const db = getDb(env);

  return {
    adapter: DrizzleAdapter(db as any),
    providers: [
      ...(env.AUTH_GOOGLE_ID
        ? [
            Google({
              clientId: env.AUTH_GOOGLE_ID,
              clientSecret: env.AUTH_GOOGLE_SECRET ?? "",
            }),
          ]
        : []),
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const parsed = z
            .object({ email: z.string().email(), password: z.string().min(8) })
            .safeParse(credentials);
          if (!parsed.success) return null;

          const user = await db.query.users.findFirst({
            where: eq(users.email, parsed.data.email.toLowerCase()),
          });

          if (!user?.passwordHash) return null;

          const ok = await bcrypt.verify(parsed.data.password, user.passwordHash);
          if (!ok) return null;

          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          return { id: user.id, email: user.email, name: user.name };
        },
      }),
    ],
    pages: {
      signIn: "/login",
      signOut: "/login",
      error: "/login",
    },
    session: { strategy: "jwt" },
    callbacks: {
      jwt({ token, user }) {
        if (user) token.id = user.id;
        return token;
      },
      session({ session, token }) {
        if (token.id) session.user.id = token.id as string;
        return session;
      },
    },
  };
});