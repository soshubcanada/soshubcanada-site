import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contactez-nous — SOS Hub Canada Montréal',
  description: 'Contactez SOS Hub Canada pour votre projet d\'immigration. Bureau à Montréal, 3737 Crémazie Est #402. Téléphone, WhatsApp, courriel. Consultation gratuite.',
  openGraph: {
    title: 'Nous contacter | SOS Hub Canada',
    description: 'Bureau à Montréal. Consultation gratuite en français, anglais, arabe et espagnol.',
    url: 'https://soshubcanada.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
