// src/components/FrontParcours.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type Company = {
  id: string;
  name: string;
  country: string | null;
  score: number | null;
  product_families?: string[] | null;
  certificates?: string[] | null;
  created_at?: string | null;
};

type Product = {
  id: string;
  company_id: string;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string | null;
  company?: Pick<Company, "id" | "name" | "country" | "score">;
};

export default function FrontParcours() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [companiesCount, setCompaniesCount] = useState<number | null>(null);
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Compteurs rapides
        const [{ count: cCount, error: cErr }, { count: pCount, error: pErr }] = await Promise.all([
          supabase.from("companies").select("*", { count: "exact", head: true }),
          supabase.from("products").select("*", { count: "exact", head: true }), // table 'products'
        ]);
        if (cErr) throw cErr;
        if (pErr) throw pErr;

        if (!isMounted) return;
        setCompaniesCount(cCount ?? 0);
        setProductsCount(pCount ?? 0);

        // Derniers produits + jointure manuelle sur companies
        const { data: prodData, error: prodErr } = await supabase
          .from("products")
          .select("id, company_id, name, category, description, created_at")
          .order("created_at", { ascending: false })
          .limit(6);
        if (prodErr) throw prodErr;

        let enriched: Product[] = [];
        if (prodData && prodData.length) {
          const companyIds = Array.from(new Set(prodData.map((p) => p.company_id))).filter(Boolean) as string[];

          let companiesById: Record<string, Company> = {};
          if (companyIds.length) {
            const { data: companies, error: compErr } = await supabase
              .from("companies")
              .select("id, name, country, score")
              .in("id", companyIds);
            if (compErr) throw compErr;

            companiesById = (companies ?? []).reduce((acc, c) => {
              acc[c.id] = c as Company;
              return acc;
            }, {} as Record<string, Company>);
          }

          enriched = (prodData as Product[]).map((p) => ({
            ...p,
            company: companiesById[p.company_id]
              ? {
                  id: companiesById[p.company_id].id,
                  name: companiesById[p.company_id].name,
                  country: companiesById[p.company_id].country, // string | null
                  score: companiesById[p.company_id].score, // number | null
                }
              : undefined,
          }));
        }

        if (!isMounted) return;
        setLatestProducts(enriched);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Une erreur est survenue.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return (
    <main className="min-h-screen w-full bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Plateforme fournisseurs ↔ importateurs
          </h1>
          <p className="mt-3 text-gray-600">
            Trouve des fournisseurs, publie tes RFQ, vérifie les KYC et consulte les notations — tout au même endroit.
          </p>
        </header>

        {/* Parcours / CTA rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/companies"
            className="rounded-2xl bg-white shadow-sm border hover:shadow transition p-6 flex flex-col"
          >
            <div className="text-sm uppercase tracking-wider text-gray-500">Étape 1</div>
            <h2 className="mt-2 text-xl font-semibold">Explorer les fournisseurs</h2>
            <p className="mt-2 text-gray-600">Parcours les fiches entreprises, leurs scores et leurs certificats.</p>
            <div className="mt-auto pt-4 text-sm text-gray-500">
              {companiesCount === null ? "—" : `${companiesCount} entreprises`}
            </div>
          </Link>

          <Link
            href="/rfq/new"
            className="rounded-2xl bg-white shadow-sm border hover:shadow transition p-6 flex flex-col"
          >
            <div className="text-sm uppercase tracking-wider text-gray-500">Étape 2</div>
            <h2 className="mt-2 text-xl font-semibold">Publier un RFQ</h2>
            <p className="mt-2 text-gray-600">Décris ton besoin, reçois des offres et compare efficacement.</p>
            <div className="mt-auto pt-4 text-sm text-gray-500">Temps estimé: 3–5 min</div>
          </Link>

          <Link
            href="/evidence/upload"
            className="rounded-2xl bg-white shadow-sm border hover:shadow transition p-6 flex flex-col"
          >
            <div className="text-sm uppercase tracking-wider text-gray-500">Étape 3</div>
            <h2 className="mt-2 text-xl font-semibold">Déposer tes preuves (BL/PO/LC)</h2>
            <p className="mt-2 text-gray-600">
              Charge des documents pour la due diligence (lecture publique optionnelle).
            </p>
            <div className="mt-auto pt-4 text-sm text-gray-500">Formats: PDF, JPG, PNG</div>
          </Link>
        </div>

        {/* Stats / Aperçu */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-white shadow-sm border p-6">
            <div className="text-sm text-gray-500">Produits référencés</div>
            <div className="mt-2 text-3xl font-semibold">
              {productsCount === null ? "—" : productsCount}
            </div>
            <div className="mt-2 text-gray-600">Catégories variées, consultables par filtres.</div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border p-6">
            <div className="text-sm text-gray-500">KYC & Conformité</div>
            <div className="mt-2 text-3xl font-semibold">Centralisé</div>
            <div className="mt-2 text-gray-600">Stockage des pièces, suivi des validations, traçabilité.</div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border p-6">
            <div className="text-sm text-gray-500">Notation & Avis</div>
            <div className="mt-2 text-3xl font-semibold">Transparence</div>
            <div className="mt-2 text-gray-600">Retours vérifiés pour des décisions éclairées.</div>
          </div>
        </div>

        {/* Derniers produits */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Derniers produits publiés</h3>
            <Link href="/products" className="text-sm underline underline-offset-4">
              Tout voir
            </Link>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : latestProducts.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-gray-600">
              Aucun produit trouvé pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestProducts.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl bg-white shadow-sm border p-5 hover:shadow transition"
                >
                  <div className="text-xs text-gray-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) : "—"}
                  </div>
                  <h4 className="mt-1 text-lg font-semibold">{p.name}</h4>
                  <div className="text-sm text-gray-600">{p.category || "Sans catégorie"}</div>
                  {p.description && <p className="mt-2 line-clamp-3 text-gray-700">{p.description}</p>}

                  {p.company && (
                    <div className="mt-3 text-sm text-gray-600">
                      Fournisseur : <span className="font-medium">{p.company.name}</span>
                      {p.company.country ? ` · ${p.company.country}` : ""}
                      {p.company.score !== null ? ` · Score ${p.company.score}` : ""}
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      href={`/products/${p.id}`}
                      className="text-sm rounded-xl border px-3 py-1.5 hover:bg-gray-50"
                    >
                      Voir le produit
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
