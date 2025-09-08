export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Bienvenue 👋</h1>
      <p className="mt-2">App Next.js + Supabase opérationnelle.</p>
      <ul className="list-disc ml-6 mt-4">
        <li><a className="underline" href="/companies">Voir mes companies</a></li>
        <li><a className="underline" href="/companies/new">Créer une company</a></li>
      </ul>
    </main>
  );
}