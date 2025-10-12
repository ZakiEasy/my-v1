// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import AppNavbar from "@/components/AppNavbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Fournisseurs ↔ Importateurs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <AppNavbar />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <Toaster richColors />
      </body>
    </html>
  );
}
