import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Página No Encontrada</h1>
        <p className="text-muted mb-8">La página que buscas no existe.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
