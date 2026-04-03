'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cream">
      <div className="max-w-xl mx-auto px-6 text-center py-24">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-navy mb-4">Une erreur est survenue</h1>
        <p className="text-gray-500 mb-10 font-sans text-lg">
          Nous nous excusons pour ce désagrément. Veuillez réessayer ou retourner à l&apos;accueil.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg transition-all font-sans"
          >
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-all font-sans"
          >
            <Home className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
