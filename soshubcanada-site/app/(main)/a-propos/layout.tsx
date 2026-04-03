import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos — Qui sommes-nous | SOS Hub Canada',
  description: 'SOS Hub Canada Inc. est un cabinet de relocalisation et d\'intégration basé à Montréal. +500 familles accompagnées. Expertise IRCC et MIFI. Service multilingue.',
  openGraph: {
    title: 'À propos de SOS Hub Canada',
    description: 'Cabinet de relocalisation à Montréal. +500 familles accompagnées depuis le Maroc, l\'Algérie, la Tunisie et plus.',
    url: 'https://soshubcanada.com/a-propos',
  },
};

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return children;
}
