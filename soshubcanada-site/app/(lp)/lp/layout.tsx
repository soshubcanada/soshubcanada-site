import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Immigrer au Canada — Evaluation Gratuite en 24h | SOS Hub Canada',
  description:
    'Recevez votre analyse d\'admissibilite personnalisee en 24h. Plus de 2000 familles accompagnees. Entree Express, PEQ Quebec, permis de travail, parrainage familial. 100% gratuit, confidentiel, sans engagement.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Votre reve canadien commence ici — Evaluation Gratuite',
    description:
      'Decouvrez vos options d\'immigration au Canada en 24h. +2000 familles accompagnees. Gratuit et sans engagement.',
    type: 'website',
    locale: 'fr_CA',
    url: 'https://soshubcanada.com/lp',
    siteName: 'SOS Hub Canada',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Immigrer au Canada - SOS Hub Canada',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immigrer au Canada — Evaluation Gratuite en 24h',
    description:
      '+2000 familles accompagnees. Testez votre admissibilite gratuitement.',
  },
};

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Minimal sticky top bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-serif text-navy font-bold text-lg tracking-tight select-none">
            SOS Hub Canada
          </span>
          <span className="text-sm text-navy/70 font-medium hidden sm:block">
            4.9/5 (200+ avis)
          </span>
          <span className="text-sm text-navy/70 font-medium sm:hidden">
            4.9/5
          </span>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Minimal legal footer */}
      <footer className="bg-navy-dark text-white/50 text-xs text-center py-5 px-4">
        <p>
          &copy; 2026 SOS Hub Canada |{' '}
          Confidentiel |{' '}
          <Link
            href="/politique-confidentialite"
            className="underline hover:text-white/70 transition-colors"
          >
            Politique de confidentialite
          </Link>
        </p>
      </footer>
    </>
  );
}
