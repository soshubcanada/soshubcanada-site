import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SOS Hub Canada | Services de Relocalisation et Immigration',
  description: 'Cabinet de consultation en immigration canadienne. Services de relocalisation, intégration et accompagnement complet pour votre projet d\'immigration au Canada. Évaluation gratuite disponible.',
  keywords: 'immigration canada, relocalisation, PEQ, entrée express, permis travail, permis études, CSQ, MIFI, IRCC, Québec, Montréal',
  openGraph: {
    title: 'SOS Hub Canada | Immigration et Relocalisation',
    description: 'Votre partenaire de confiance pour immigrer au Canada. Évaluation d\'admissibilité gratuite.',
    type: 'website',
    locale: 'fr_CA',
    url: 'https://soshubcanada.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
