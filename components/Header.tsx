'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Mail, ChevronDown } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Accueil' },
  {
    href: '/services',
    label: 'Services',
    children: [
      { href: '/services#entree-express', label: 'Entrée Express' },
      { href: '/services#peq', label: 'PEQ Québec' },
      { href: '/services#permis-travail', label: 'Permis de travail' },
      { href: '/services#permis-etudes', label: 'Permis d\'études' },
      { href: '/services#parrainage', label: 'Parrainage familial' },
      { href: '/services#relocalisation', label: 'Relocalisation' },
    ],
  },
  { href: '/admissibilite', label: 'Admissibilité gratuite' },
  { href: '/calculateur-crs', label: 'Calculateur CRS' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-navy-dark text-white/70 text-xs py-2.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span className="tracking-wide">Service de relocalisation et d'intégration — Montréal, Québec</span>
          <div className="flex items-center gap-8">
            <a href="tel:+15145330482" className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <Phone className="w-3 h-3" /> +1 (514) 533-0482
            </a>
            <a href="mailto:info@soshubcanada.com" className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <Mail className="w-3 h-3" /> info@soshubcanada.com
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-navy/5'
          : 'bg-white/90 backdrop-blur-md'
      } border-b border-gray-100/50`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
              <span className="text-white font-bold text-2xl font-serif">S</span>
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="leading-tight">
              <div className="flex items-baseline gap-1">
                <span className="text-navy font-bold text-xl tracking-tight font-serif">SOS Hub</span>
                <span className="text-gold font-bold text-xl font-serif">Canada</span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-sans">Relocalisation & Intégration</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(link => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.children ? setDropdown(link.href) : undefined}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-navy rounded-lg hover:bg-gold/5 transition-all flex items-center gap-1 font-sans"
                >
                  {link.label}
                  {link.children && <ChevronDown className="w-3 h-3" />}
                </Link>

                {/* Dropdown */}
                {link.children && dropdown === link.href && (
                  <div className="absolute top-full left-0 pt-1 animate-fade-in z-50">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2 min-w-[220px]">
                      {link.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:text-navy hover:bg-gold/5 transition-all font-sans"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/admissibilite"
              className="hidden sm:inline-flex px-5 py-2.5 bg-gradient-to-r from-gold to-gold-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all hover:scale-105 font-sans"
            >
              Évaluation gratuite
            </Link>
            <Link
              href="https://soshubca.vercel.app/inscription"
              target="_blank"
              className="hidden md:inline-flex px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-light transition-all hover:shadow-lg font-sans"
            >
              Espace client
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-gray-600 hover:text-navy rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in shadow-xl">
            <nav className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              {navLinks.map(link => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-gray-600 hover:text-navy hover:bg-gold/5 rounded-xl transition-colors font-medium font-sans"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-4 space-y-1">
                      {link.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-500 hover:text-navy hover:bg-gold/5 rounded-lg transition-colors font-sans"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-100 mt-2">
                <Link
                  href="/admissibilite"
                  onClick={() => setOpen(false)}
                  className="block text-center px-5 py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-xl font-sans"
                >
                  Évaluation gratuite
                </Link>
                <Link
                  href="https://soshubca.vercel.app/inscription"
                  target="_blank"
                  className="block text-center px-5 py-3 bg-navy text-white font-semibold rounded-xl font-sans"
                >
                  Espace client
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
