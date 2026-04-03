import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guide GRATUIT — Les 7 etapes pour immigrer au Canada en 2026',
  description: 'Telechargez le guide complet pour immigrer au Canada. Programmes, documents, score CRS, delais, erreurs a eviter. Utilise par +500 familles. 100% gratuit.',
  openGraph: {
    title: 'Guide gratuit: 7 etapes pour immigrer au Canada | SOS Hub Canada',
    description: 'Le guide complet utilise par +500 familles. Programmes, documents, strategies CRS. Telechargez gratuitement.',
    url: 'https://soshubcanada.com/guide',
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
