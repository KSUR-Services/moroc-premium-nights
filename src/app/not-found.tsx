import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-amber-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page introuvable</h2>
        <p className="text-zinc-400 mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/fr"
          className="inline-block px-6 py-3 bg-amber-500 text-zinc-950 font-semibold rounded-xl hover:bg-amber-400 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
