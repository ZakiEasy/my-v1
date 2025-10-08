export default function NotFound() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Page introuvable</h1>
      <p>La route demandée n’existe pas.</p>
      <a href="/" style={{ textDecoration: "underline" }}>Retour à l’accueil</a>
    </main>
  );
}