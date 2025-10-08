type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Produit #{params.id}</h1>
      <p className="text-sm text-slate-600">
        Ici tu mettras la fiche détaillée du produit (infos, prix, fournisseur, etc.).
      </p>
    </main>
  );
}
