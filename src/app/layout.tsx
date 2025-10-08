import "./globals.css";
import type { Metadata } from "next";
import AppNav from "@/components/navbar/AppNav";
import { Toaster } from "sonner";

export const metadata: Metadata = { title: "Fournisseur ↔ Importateur" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
