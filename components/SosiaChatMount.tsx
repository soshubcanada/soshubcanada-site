'use client';

// ============================================================
// SOS Hub Canada · SosiaChatMount
// ============================================================
//
// Wrapper qui décide si le widget SOSIA doit être rendu selon
// l'URL courante. Monté une seule fois dans app/layout.tsx.
//
// Pages exclues :
//   - /peq · test d'admissibilité (ne pas distraire l'utilisateur
//     qui remplit déjà le formulaire)
//   - /peq-v2 · variante landing du test
//   - /checkout · tunnel de paiement
//   - /admin · interface interne
//   - /lp/* · funnel landing (déjà un formulaire qualifié)
//   - /inscription · page dédiée
//
// Lazy-load du composant lourd pour éviter d'embarquer
// nanoid + SVG + CSS sur chaque page.

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const SosiaChat = dynamic(
  () => import('./SosiaChat').then((m) => m.SosiaChat),
  { ssr: false }
);

const EXCLUDED_PREFIXES = [
  '/peq',
  '/peq-v2',
  '/checkout',
  '/admin',
  '/lp',
  '/inscription',
  '/api',
];

export function SosiaChatMount() {
  const pathname = usePathname() || '/';
  const excluded = EXCLUDED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (excluded) return null;
  return <SosiaChat />;
}

export default SosiaChatMount;
