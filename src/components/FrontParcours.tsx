"use client";
import Link from "next/link";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, FileUp, ShieldCheck, Receipt, ShoppingCart, CheckCircle2, Filter, RefreshCw } from "lucide-react";

// --- Types ---
interface Product {
  id: string;
  name: string;
  supplier_name: string;
  category: string;
  country: string;
  min_order: number;
  price: number;
  rating?: number;
  in_stock?: boolean;
}

// --- Mock data (à brancher sur Supabase plus tard) ---
const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "Huile d'olive extra vierge 1L", supplier: "Mediterra Foods", category: "Huiles", country: "Tunisie", minOrder: 500, price: 3.85, rating: 4.6, inStock: true },
  { id: "p2", name: "Semoule fine 25kg", supplier: "GraniX", category: "Céréales", country: "Algérie", minOrder: 200, price: 12.90, rating: 4.2, inStock: true },
  { id: "p3", name: "Dattes Deglet Nour 5kg", supplier: "Oasis Export", category: "Fruits secs", country: "Algérie", minOrder: 150, price: 16.50, rating: 4.8, inStock: false },
  { id: "p4", name: "Épices ras el hanout 1kg", supplier: "Atlas Spice", category: "Épices", country: "Maroc", minOrder: 100, price: 7.20, rating: 4.4, inStock: true },
  { id: "p5", name: "Harissa 190g x 24", supplier: "Cap Bon", category: "Condiments", country: "Tunisie", minOrder: 80, price: 28.0, rating: 4.7, inStock: true },
];
export default function FrontParcours({ produits = [] }: { produits: Product[] }) {
  const [tab, setTab] = useState<string>("fournisseur");
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white grid place-items-center text-sm font-bold">FI</div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Fournisseur ↔ Importateur</h1>
              <p className="text-xs text-slate-500 -mt-0.5">Bascule entre les parcours selon votre rôle</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm">Aide</Button>
            <Button size="sm">Se connecter</Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl p-4 md:p-6">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1">
            <TabsTrigger value="fournisseur" className="rounded-xl">Parcours Fournisseur</TabsTrigger>
            <TabsTrigger value="importateur" className="rounded-xl">Parcours Importateur</TabsTrigger>
          </TabsList>

          {/* --- PARCOURS FOURNISSEUR --- */}
          <TabsContent value="fournisseur" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <div className="grid gap-4 md:grid-cols-3">
                <EtapeCard
                   icon={<Receipt className="h-5 w-5" />}
  title="Créer une RFQ"
  desc="Décrivez votre offre, quantités, délais et incoterms."
  ctaLabel="Nouvelle RFQ"
  href="/rfq/new"        // <- TU AS DEJA src/app/rfq/new
/>
<EtapeCard
  icon={<FileUp className="h-5 w-5" />}
  title="Uploader des preuves (BL/PO/LC)"
  desc="Chargez vos documents dans le bucket 'evidence'."
  ctaLabel="Uploader"
  href="/evidence/upload" // <- TU AS DEJA src/app/evidence/upload
/>
<EtapeCard
  icon={<ShieldCheck className="h-5 w-5" />}
  title="Conformité & KYC"
  desc="Vérifiez la conformité, certificats et statuts."
  ctaLabel="Lancer contrôle"
  href="/compliance/check" // <- Dossier présent, ajoute page.tsx si manquant
/>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Suivi de vos RFQ</CardTitle>
                  <CardDescription>Visualisez le statut et les pièces associées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-slate-500">
                        <tr>
                          <th className="py-2">RFQ</th>
                          <th className="py-2">Produit</th>
                          <th className="py-2">Quantité</th>
                          <th className="py-2">Statut</th>
                          <th className="py-2">Preuves</th>
                          <th className="py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: "RFQ-2301", produit: "Huile d'olive 1L", qty: 5_000, statut: "En revue", preuves: 2 },
                          { id: "RFQ-2302", produit: "Semoule 25kg", qty: 2_500, statut: "Acceptée", preuves: 3 },
                        ].map((r) => (
                          <tr key={r.id} className="border-t">
                            <td className="py-3 font-medium">{r.id}</td>
                            <td className="py-3">{r.produit}</td>
                            <td className="py-3">{r.qty.toLocaleString('fr-FR')}</td>
                            <td className="py-3">
                              <Badge variant={r.statut === "Acceptée" ? "default" : "secondary"}>{r.statut}</Badge>
                            </td>
                            <td className="py-3">{r.preuves} fichier(s)</td>
                            <td className="py-3 text-right">
                              <Button variant="ghost" size="sm" className="gap-1">Détails <ChevronRight className="h-4 w-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* --- PARCOURS IMPORTATEUR --- */}
          <TabsContent value="importateur" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <FiltresProduits />
              <GrilleProduits produits={MOCK_PRODUCTS} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>

      <footer className="mt-12 border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          Projet Fournisseur–Importateur • v1 Front • Bascule parcours Fournisseur/Importateur
        </div>
      </footer>
    </main>
  );
}

function EtapeCard({ icon, title, desc, ctaLabel, href }: {
  icon: React.ReactNode; title: string; desc: string; ctaLabel: string; href: string;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">{icon}</div>
        <CardTitle className="leading-tight">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={href} className="inline-flex">
          <Button className="gap-2">
            {ctaLabel}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function FiltresProduits() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Catalogue fournisseurs</CardTitle>
            <CardDescription>Recherchez par nom, catégorie, origine…</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => console.log("refresh")}> <RefreshCw className="h-4 w-4"/> Rafraîchir</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <Label htmlFor="q">Recherche</Label>
          <Input id="q" placeholder="Ex: huile, dattes, semoule…" />
        </div>
        <div>
          <Label>Catégorie</Label>
          <Select>
            <SelectTrigger className="w-full"><SelectValue placeholder="Toutes" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Catégories</SelectLabel>
                {[
                  "Huiles",
                  "Céréales",
                  "Fruits secs",
                  "Épices",
                  "Condiments",
                ].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Origine</Label>
          <Select>
            <SelectTrigger className="w-full"><SelectValue placeholder="Tous pays" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pays</SelectLabel>
                {["Algérie", "Maroc", "Tunisie", "Turquie", "Italie"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function GrilleProduits({ produits }: { produits: Product[] }) {
  // état panier
const [cart, setCart] = useState<string[]>([]);

// add/remove avec types explicites
const add = (id: string) =>
  setCart((s: string[]) => (s.includes(id) ? s : [...s, id]));

const remove = (id: string) =>
  setCart((s: string[]) => s.filter((x: string) => x !== id));

// total avec reduce typé
const total = useMemo(() => {
  const map = new Map(produits.map((p) => [p.id, p.price]));
  return cart.reduce((sum: number, id: string) => sum + (map.get(id) ?? 0), 0);
}, [cart, produits]);

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-3 md:grid-cols-2">
      {produits.map((p) => (
        <Card key={p.id} className="rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDescription className="mt-1">{p.supplier} • {p.country}</CardDescription>
              </div>
              {p.inStock ? (
                <Badge>En stock</Badge>
              ) : (
                <Badge variant="secondary">Sur commande</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{p.category}</Badge>
              <span className="text-slate-500">MOQ: {p.minOrder.toLocaleString()}</span>
            </div>
            <div className="mt-2 text-lg font-semibold">{p.price.toFixed(2)} €</div>
            {p.rating && (
              <div className="mt-1 text-xs text-slate-500">Note fournisseur: {p.rating.toFixed(1)}/5</div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            {cart.includes(p.id) ? (
              <Button variant="outline" size="sm" onClick={() => remove(p.id)}>Retirer</Button>
            ) : (
              <Button size="sm" className="gap-2" onClick={() => add(p.id)}>
                <ShoppingCart className="h-4 w-4" /> Ajouter
              </Button>
            )}
            <Link href={`/products/${p.id}`} className="inline-flex">
  <Button variant="ghost" size="sm" className="gap-1">
    Détails <ChevronRight className="h-4 w-4" />
  </Button>
</Link>
          </CardFooter>
        </Card>
      ))}

      {/* Panier sticky */}
      <div className="lg:col-span-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="mt-2 border-dashed">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{cart.length}</span> article(s) sélectionné(s)
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm">Total indicatif: <span className="font-semibold">{total.toFixed(2)} €</span></div>
                <Button size="sm" className="gap-2"><CheckCircle2 className="h-4 w-4"/> Demander devis</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
