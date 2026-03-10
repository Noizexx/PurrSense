// src/env.d.ts
interface CloudflareEnv {
  DB: D1Database;
  R2: R2Bucket;
  SHARE_SECRET: string;
  AUTH_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  NEXT_PUBLIC_BASE_URL: string;
  NEXT_PUBLIC_R2_PUBLIC_URL: string;
  AUTH_GOOGLE_ID?: string;
  AUTH_GOOGLE_SECRET?: string;
}
