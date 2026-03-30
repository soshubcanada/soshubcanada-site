"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { lang } = useLang();
  const fr = lang === "fr";

  return (
    <footer className="bg-[#085041] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-baseline mb-3">
              <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                etabli
              </span>
              <span className="text-2xl font-bold text-[#1D9E75]">.</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {fr
                ? "Sois etabli. Sois chez toi. Plateforme d'établissement et de francisation pour les nouveaux arrivants au Québec."
                : "Be established. Be home. Settlement and francization platform for newcomers to Québec."}
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">
              {fr ? "Plateforme" : "Platform"}
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/simulateur-arrima" className="text-sm text-white/70 hover:text-white">
                {fr ? "Simulateur Arrima" : "Arrima Simulator"}
              </Link>
              <Link href="/simulateur-crs" className="text-sm text-white/70 hover:text-white">
                {fr ? "Simulateur CRS" : "CRS Simulator"}
              </Link>
              <Link href="/marketplace" className="text-sm text-white/70 hover:text-white">
                {fr ? "Marketplace Pros" : "Pro Marketplace"}
              </Link>
              <Link href="/parcours" className="text-sm text-white/70 hover:text-white">
                {fr ? "6 Piliers" : "6 Pillars"}
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">
              {fr ? "Ressources" : "Resources"}
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/tarifs" className="text-sm text-white/70 hover:text-white">
                {fr ? "Tarifs" : "Pricing"}
              </Link>
              <span className="text-sm text-white/70">
                {fr ? "Préparation TCF/TEF" : "TCF/TEF Prep"}
              </span>
              <span className="text-sm text-white/70">
                {fr ? "Guides d'établissement" : "Settlement Guides"}
              </span>
              <span className="text-sm text-white/70">
                {fr ? "FAQ" : "FAQ"}
              </span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <span>info@etabli.ca</span>
              <span>Montreal, QC, Canada</span>
              <div className="flex gap-3 mt-2">
                <span className="text-xs bg-white/10 px-2 py-1 rounded">etabli.ca</span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded">etabli.app</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/50">
            &copy; 2026 etabli. &mdash; Organisme a but non lucratif | Entreprise d&apos;économie sociale | Montreal, QC
          </p>
          <p className="text-xs text-white/50">
            {fr
              ? "Tous les prix en dollars canadiens. Taxes applicables en sus."
              : "All prices in Canadian dollars. Applicable taxes extra."}
          </p>
        </div>
      </div>
    </footer>
  );
}
