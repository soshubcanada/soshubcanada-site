import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test d\'admissibilité gratuit — Évaluez vos chances d\'immigrer',
  description: 'Testez votre admissibilité à l\'immigration au Canada en 2 minutes. Entrée Express, PEQ Québec, permis de travail, parrainage familial. Résultat instantané et plan d\'action personnalisé.',
  openGraph: {
    title: 'Test d\'admissibilité gratuit | SOS Hub Canada',
    description: 'Évaluez vos chances d\'immigrer au Canada. Résultat en 2 minutes. +500 familles accompagnées.',
    url: 'https://soshubcanada.com/admissibilite',
  },
};

export default function AdmissibiliteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
