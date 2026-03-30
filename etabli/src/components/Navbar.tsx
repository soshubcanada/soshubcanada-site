"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";
import NotificationCenter from "./NotificationCenter";

/* ─── Nav structure with grouped dropdowns ─── */

interface NavLink {
  href: string;
  labelFr: string;
  labelEn: string;
}

interface NavGroup {
  labelFr: string;
  labelEn: string;
  items: NavLink[];
  activePrefix: string; // highlight group when pathname starts with this
}

type NavEntry = NavLink | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const NAV: NavEntry[] = [
  { href: "/", labelFr: "Accueil", labelEn: "Home" },
  {
    labelFr: "Simulateurs", labelEn: "Simulators", activePrefix: "/simulateur",
    items: [
      { href: "/simulateur-arrima", labelFr: "Simulateur Arrima", labelEn: "Arrima Simulator" },
      { href: "/simulateur-crs", labelFr: "Simulateur CRS", labelEn: "CRS Simulator" },
    ],
  },
  {
    labelFr: "Francisation", labelEn: "French", activePrefix: "/francisation",
    items: [
      { href: "/francisation", labelFr: "Cours de français", labelEn: "French Courses" },
      { href: "/formation/eleve", labelFr: "Formation en classe", labelEn: "In-Class Training" },
      { href: "/francisation/placement", labelFr: "Test de placement", labelEn: "Placement Test" },
      { href: "/francisation/tableau-de-bord", labelFr: "Tableau de bord", labelEn: "Dashboard" },
      { href: "/francisation/ielts", labelFr: "Préparation IELTS", labelEn: "IELTS Preparation" },
    ],
  },
  { href: "/guide-etablissement", labelFr: "Guide", labelEn: "Guide" },
  {
    labelFr: "Portail", labelEn: "Portal", activePrefix: "/portail",
    items: [
      { href: "/portail", labelFr: "Espace partenaires", labelEn: "Partner Space" },
      { href: "/marketplace", labelFr: "Professionnels", labelEn: "Professionals" },
      { href: "/emplois", labelFr: "Emplois", labelEn: "Jobs" },
    ],
  },
  { href: "/tarifs", labelFr: "Tarifs", labelEn: "Pricing" },
];

/* ─── Dropdown component ─── */

function Dropdown({ group, lang, pathname, close }: { group: NavGroup; lang: "fr" | "en"; pathname: string; close: () => void }) {
  const fr = lang === "fr";
  const active = pathname.startsWith(group.activePrefix);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-[#E1F5EE] text-[#085041]"
            : "text-gray-600 hover:text-[#085041] hover:bg-gray-50"
        }`}
      >
        {fr ? group.labelFr : group.labelEn}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50">
          {group.items.map((item) => {
            const itemActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { setOpen(false); close(); }}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  itemActive
                    ? "bg-[#E1F5EE] text-[#085041] font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#085041]"
                }`}
              >
                {fr ? item.labelFr : item.labelEn}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main Navbar ─── */

export default function Navbar() {
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const fr = lang === "fr";

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-0">
            <span className="text-2xl font-bold text-[#085041] font-[family-name:var(--font-heading)]">
              etabli
            </span>
            <span className="text-2xl font-bold text-[#1D9E75]">.</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV.map((entry, i) => {
              if (isGroup(entry)) {
                return <Dropdown key={i} group={entry} lang={lang} pathname={pathname} close={() => {}} />;
              }
              const active = pathname === entry.href;
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#E1F5EE] text-[#085041]"
                      : "text-gray-600 hover:text-[#085041] hover:bg-gray-50"
                  }`}
                >
                  {fr ? entry.labelFr : entry.labelEn}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <NotificationCenter />

            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    lang === l
                      ? "bg-white text-[#085041] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <Link
              href="/portail"
              className="hidden sm:inline-flex px-4 py-2 bg-[#1D9E75] text-white text-sm font-semibold rounded-lg hover:bg-[#178a65] transition-colors shadow-sm"
            >
              {fr ? "Commencer" : "Get Started"}
            </Link>

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            {NAV.map((entry, i) => {
              if (isGroup(entry)) {
                const groupActive = pathname.startsWith(entry.activePrefix);
                const expanded = mobileExpanded === entry.labelFr;
                return (
                  <div key={i}>
                    <button
                      onClick={() => setMobileExpanded(expanded ? null : entry.labelFr)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                        groupActive ? "bg-[#E1F5EE] text-[#085041]" : "text-gray-600"
                      }`}
                    >
                      {fr ? entry.labelFr : entry.labelEn}
                      <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {expanded && (
                      <div className="ml-4 border-l-2 border-[#1D9E75]/20 pl-3 mb-1">
                        {entry.items.map((item) => {
                          const itemActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                              className={`block px-3 py-2 rounded-lg text-sm ${
                                itemActive
                                  ? "text-[#085041] font-semibold bg-[#E1F5EE]"
                                  : "text-gray-500 hover:text-[#085041] hover:bg-gray-50"
                              }`}
                            >
                              {fr ? item.labelFr : item.labelEn}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              const active = pathname === entry.href;
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-[#E1F5EE] text-[#085041]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {fr ? entry.labelFr : entry.labelEn}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
