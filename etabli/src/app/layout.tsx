import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import AIChatWidget from "@/components/ai-chat-widget";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SOS Hub Canada — Relocalisation & Services",
  description:
    "SOS Hub Canada — Services de relocalisation et accompagnement pour les nouveaux arrivants au Canada. Simulateur CRS + Arrima, accompagnement complet, jumelage employeurs.",
  keywords: [
    "établissement Québec",
    "CRS simulator",
    "Arrima PSTQ",
    "TCF TEF préparation",
    "établissement Québec",
    "RCIC consultant",
    "nouveaux arrivants",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        {children}
        <AIChatWidget />
      </body>
    </html>
  );
}
