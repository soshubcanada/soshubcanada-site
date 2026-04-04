import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculateur de score CRS gratuit — Entrée Express Canada',
  description: 'Calculez votre score CRS pour l\'Entrée Express Canada. Estimation instantanée selon l\'âge, les études, l\'expérience et les langues. Stratégies pour maximiser votre score.',
  openGraph: {
    title: 'Calculateur CRS gratuit | SOS Hub Canada',
    description: 'Estimez votre score CRS pour l\'Entrée Express. Outil gratuit avec recommandations personnalisées.',
    url: 'https://soshubcanada.com/calculateur-crs',
  },
};

export default function CalculateurLayout({ children }: { children: React.ReactNode }) {
  return children;
}
