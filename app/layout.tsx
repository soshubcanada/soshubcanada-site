import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollAnimator } from '@/components/ScrollAnimator';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SOS Hub Canada | Immigration et Relocalisation à Montréal',
    template: '%s | SOS Hub Canada',
  },
  description: 'Service de relocalisation et d\'intégration au Canada. Accompagnement complet pour votre installation à Montréal. Entrée Express, PEQ, permis de travail. Évaluation gratuite.',
  keywords: 'immigration canada, relocalisation montréal, PEQ québec, entrée express, permis travail canada, permis études, CSQ, MIFI, IRCC, consultation immigration, intégration canada',
  authors: [{ name: 'SOS Hub Canada Inc.' }],
  creator: 'SOS Hub Canada',
  publisher: 'SOS Hub Canada Inc.',
  metadataBase: new URL('https://soshubcanada.com'),
  alternates: {
    canonical: '/',
    languages: { 'fr-CA': '/' },
  },
  openGraph: {
    title: 'SOS Hub Canada | Immigration et Relocalisation',
    description: 'Votre partenaire de confiance pour immigrer au Canada. Évaluation d\'admissibilité gratuite. Entrée Express, PEQ, permis de travail.',
    type: 'website',
    locale: 'fr_CA',
    url: 'https://soshubcanada.com',
    siteName: 'SOS Hub Canada',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1519832979-6fa011b87667?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'SOS Hub Canada - Immigration et Relocalisation à Montréal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOS Hub Canada | Immigration et Relocalisation',
    description: 'Votre partenaire de confiance pour immigrer au Canada.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'SOS Hub Canada Inc.',
  description: 'Service de relocalisation et d\'intégration au Canada, situé à Montréal.',
  url: 'https://soshubcanada.com',
  telephone: '+1-514-533-0482',
  email: 'info@soshubcanada.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '3737 Crémazie Est #402',
    addressLocality: 'Montréal',
    addressRegion: 'QC',
    postalCode: 'H1Z 2K4',
    addressCountry: 'CA',
  },
  areaServed: { '@type': 'Country', name: 'Canada' },
  serviceType: ['Relocation Services', 'Integration Services', 'Settlement Services'],
  priceRange: '$$',
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <ScrollAnimator />
      </body>
    </html>
  );
}
