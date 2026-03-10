import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Gatto 🐾",
  description: "Monitora la salute e il benessere del tuo gatto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-amber-50 text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
