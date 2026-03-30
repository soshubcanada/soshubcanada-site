export const COLORS = {
  pri: "#085041",
  acc: "#1D9E75",
  light: "#E1F5EE",
  lighter: "#F0FAF5",
  gold: "#D97706",
  goldLight: "#FEF3C7",
  goldDark: "#92400E",
  qc: "#003DA5",
  qcLight: "#E8F0FE",
} as const;

export const NAV_ITEMS = [
  { href: "/", labelFr: "Accueil", labelEn: "Home" },
  { href: "/simulateur-arrima", labelFr: "Simulateur Arrima", labelEn: "Arrima Simulator" },
  { href: "/simulateur-crs", labelFr: "Simulateur CRS", labelEn: "CRS Simulator" },
  { href: "/francisation", labelFr: "Francisation", labelEn: "French" },
  { href: "/guide-etablissement", labelFr: "Guide", labelEn: "Guide" },
  { href: "/formation/eleve", labelFr: "Formation", labelEn: "Training" },
  { href: "/marketplace", labelFr: "Professionnels", labelEn: "Professionals" },
  { href: "/tarifs", labelFr: "Tarifs", labelEn: "Pricing" },
] as const;
