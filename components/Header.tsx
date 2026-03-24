'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Mail } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/services', label: 'Services' },
  { href: '/admissibilite', label: 'Admissibilité gratuite' },
  { href: '/calculateur-crs', label: 'Calculateur CRS' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <div className="bg-navy text-white/80 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span>Cabinet de consultation en immigration - Montréal, Québec</span>
          <div className="flex items-center gap-6">
            <a href="tel:+15145551234" className="flex items-center gap-1 hover:text-gold transition-colors">
              <Phone className="w-3 h-3" /> (514) 555-1234
            </a>
            <a href="mailto:info@soshubcanada.com" className="flex items-center gap-1 hover:text-gold transition-colors">
              <Mail className="w-3 h-3" /> info@soshubcanada.com
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div className="leading-tight">
              <span className="text-navy font-bold text-lg tracking-tight">SOS Hub</span>
              <span className="text-gold font-bold text-lg ml-1">Canada</span>
              <p className="text-[10px] text-gray-400 tracking-wider uppercase">Immigration & Relocalisation</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-navy rounded-lg hover:bg-gray-50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/admissibilite"
              className="hidden sm:inline-flex px-5 py-2.5 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold-dark transition-colors shadow-md hover:shadow-lg"
            >
              Évaluation gratuite
            </Link>
            <Link
              href="https://soshubca.vercel.app/inscription"
              target="_blank"
              className="hidden md:inline-flex px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light transition-colors"
            >
              Espace client
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-gray-600 hover:text-navy"
              aria-label="Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in">
            <nav className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-gray-600 hover:text-navy hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 space-y-2">
                <Link
                  href="/admissibilite"
                  className="block text-center px-5 py-3 bg-gold text-white font-semibold rounded-lg"
                >
                  Évaluation gratuite
                </Link>
                <Link
                  href="https://soshubca.vercel.app/inscription"
                  target="_blank"
                  className="block text-center px-5 py-3 bg-navy text-white font-semibold rounded-lg"
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
