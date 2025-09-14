// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import AppNav from "@/components/navbar/AppNav";
import { Toaster } from "sonner";

export const metadata: Metadata = { title: "Fournisseur · Importateur" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppNav />
        <main className="container max-w-6xl mx-auto px-4 py-6">{children}</main>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
