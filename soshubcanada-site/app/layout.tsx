import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { SocialProofToast } from '@/components/SocialProofToast';
import { ScrollAnimator } from '@/components/ScrollAnimator';
import { AnalyticsProvider } from '@/components/Analytics';
import { CookieBanner } from '@/components/CookieBanner';
import { ExitIntentPopup } from '@/components/ExitIntentPopup';

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
    default: 'SOS Hub Canada | Immigration et Relocalisation à Montréal — Évaluation Gratuite',
    template: '%s | SOS Hub Canada',
  },
  description: 'Immigrer au Canada depuis la France, le Maroc, l\'Afrique ou l\'Amérique latine. Service de relocalisation à Montréal. Entrée Express, PEQ Québec, permis de travail, parrainage familial. Évaluation d\'admissibilité gratuite. +500 familles accompagnées.',
  keywords: 'immigrer au canada, immigration canada 2026, relocalisation montréal, PEQ québec, entrée express canada, permis travail canada, permis études canada, CSQ certificat sélection québec, MIFI, IRCC, score CRS, mobilité francophone, parrainage conjoint canada, visa canada, résidence permanente canada, travailler au canada, étudier au canada, vivre au canada, immigration québec, EIMT LMIA, permis post-diplôme PGWP, installation montréal, accompagnement immigration',
  authors: [{ name: 'SOS Hub Canada Inc.' }],
  creator: 'SOS Hub Canada',
  publisher: 'SOS Hub Canada Inc.',
  metadataBase: new URL('https://soshubcanada.com'),
  alternates: {
    canonical: '/',
    languages: { 'fr-CA': '/' },
  },
  openGraph: {
    title: 'Immigrer au Canada — Évaluation Gratuite | SOS Hub Canada',
    description: 'Votre partenaire de confiance pour immigrer au Canada. +500 familles accompagnées. Entrée Express, PEQ, permis de travail, parrainage. Évaluation gratuite en 2 minutes.',
    type: 'website',
    locale: 'fr_CA',
    url: 'https://soshubcanada.com',
    siteName: 'SOS Hub Canada',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=630&fit=crop&crop=faces',
        width: 1200,
        height: 630,
        alt: 'SOS Hub Canada - Immigration et Relocalisation à Montréal - Familles heureuses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immigrer au Canada — Évaluation Gratuite | SOS Hub Canada',
    description: '+500 familles accompagnées. Entrée Express, PEQ, permis de travail. Testez votre admissibilité gratuitement.',
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
  description: 'Service de relocalisation et d\'intégration au Canada. Accompagnement pour Entrée Express, PEQ Québec, permis de travail, parrainage familial. +500 familles accompagnées à Montréal.',
  url: 'https://soshubcanada.com',
  telephone: '+1-514-533-0482',
  email: 'info@soshubcanada.com',
  image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=630&fit=crop&crop=faces',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '3737 Crémazie Est #402',
    addressLocality: 'Montréal',
    addressRegion: 'QC',
    postalCode: 'H1Z 2K4',
    addressCountry: 'CA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 45.5536,
    longitude: -73.5985,
  },
  areaServed: [
    { '@type': 'Country', name: 'Canada' },
    { '@type': 'Country', name: 'France' },
    { '@type': 'Country', name: 'Morocco' },
    { '@type': 'Country', name: 'Algeria' },
    { '@type': 'Country', name: 'Tunisia' },
    { '@type': 'Country', name: 'Cameroon' },
    { '@type': 'Country', name: 'Haiti' },
    { '@type': 'Country', name: 'Colombia' },
    { '@type': 'Country', name: 'Brazil' },
  ],
  serviceType: ['Immigration Services', 'Relocation Services', 'Integration Services', 'Settlement Services', 'Express Entry', 'PEQ Quebec', 'Work Permit', 'Study Permit', 'Family Sponsorship'],
  knowsLanguage: ['fr', 'en', 'ar', 'es'],
  priceRange: 'Contactez-nous',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '200',
    bestRating: '5',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Comment immigrer au Canada depuis la France, le Maroc ou l\'Afrique?',
      acceptedAnswer: { '@type': 'Answer', text: 'Plusieurs programmes s\'offrent à vous: Entrée Express (fédéral), PEQ (Québec), permis de travail via la mobilité francophone, ou parrainage familial. SOS Hub Canada analyse votre profil gratuitement pour identifier la meilleure voie.' },
    },
    {
      '@type': 'Question',
      name: 'Combien de temps prend un processus d\'immigration au Canada?',
      acceptedAnswer: { '@type': 'Answer', text: 'Entrée Express 6-8 mois, PEQ 6-12 mois, permis de travail 2-6 mois, parrainage conjugal 12-18 mois.' },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que le score CRS et comment l\'améliorer?',
      acceptedAnswer: { '@type': 'Answer', text: 'Le score CRS classe les candidats à l\'Entrée Express selon l\'âge, les études, l\'expérience et les langues. Notre calculateur gratuit vous donne une estimation et nos experts identifient des stratégies pour maximiser votre score.' },
    },
    {
      '@type': 'Question',
      name: 'Peut-on travailler au Canada avec un permis d\'études?',
      acceptedAnswer: { '@type': 'Answer', text: 'Oui! Les étudiants internationaux peuvent travailler jusqu\'à 20h/semaine pendant les études. Après le diplôme, le permis post-diplôme (PGWP) permet de travailler jusqu\'à 3 ans.' },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preconnect to image CDN — saves ~200ms on first image load */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <StickyMobileCTA />
        <SocialProofToast />
        <ScrollAnimator />
        <AnalyticsProvider />
        <CookieBanner />
        <ExitIntentPopup />
      </body>
    </html>
  );
}
