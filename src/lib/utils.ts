import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/D";
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function calcAge(birthDate: string | null | undefined): string {
  if (!birthDate) return "Età non nota";
  const b = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - b.getFullYear()) * 12 +
    (now.getMonth() - b.getMonth());
  if (months < 1)  return "Meno di 1 mese";
  if (months < 12) return `${months} mes${months === 1 ? "e" : "i"}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y} ann${y === 1 ? "o" : "i"} e ${m} mes${m === 1 ? "e" : "i"}` : `${y} ann${y === 1 ? "o" : "i"}`;
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateToken(length = 16): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}
