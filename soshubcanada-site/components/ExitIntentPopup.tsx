'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Gift, ArrowRight, CheckCircle2 } from 'lucide-react';

const POPUP_KEY = 'soshub_exit_popup_shown';
const POPUP_COOLDOWN_DAYS = 3;

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => {
    // Don't show if already shown recently
    const lastShown = localStorage.getItem(POPUP_KEY);
    if (lastShown) {
      const diff = Date.now() - parseInt(lastShown);
      if (diff < POPUP_COOLDOWN_DAYS * 86400000) return;
    }
    // Don't show if already on admissibilite page
    if (window.location.pathname.includes('admissibilite')) return;
    setVisible(true);
    localStorage.setItem(POPUP_KEY, Date.now().toString());
  }, []);

  useEffect(() => {
    // Desktop: mouse leaves viewport (exit intent)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    // Mobile: scroll up quickly (intent to leave) or back button behavior
    let lastScrollY = window.scrollY;
    let scrollUpCount = 0;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY && currentY < 200) {
        scrollUpCount++;
        if (scrollUpCount >= 3) show();
      } else {
        scrollUpCount = 0;
      }
      lastScrollY = currentY;
    };

    // Wait 10s before activating (don't interrupt new visitors immediately)
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      onClick={() => setVisible(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold header */}
        <div className="bg-gradient-to-r from-navy to-navy-light px-6 py-5 text-center relative">
          <button
            onClick={() => setVisible(false)}
            className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3">
            <Gift className="w-7 h-7 text-gold" />
          </div>
          <h3 className="text-white font-bold text-xl mb-1">
            Avant de partir...
          </h3>
          <p className="text-gray-300 text-sm font-sans">
            Recevez votre guide GRATUIT pour immigrer au Canada
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <h4 className="font-bold text-navy text-lg mb-3">
            Les 7 étapes pour immigrer au Canada en 2026
          </h4>
          <ul className="space-y-2 mb-5">
            {[
              'Programmes disponibles selon votre profil',
              'Documents requis par IRCC et MIFI',
              'Comment maximiser votre score CRS',
              'Erreurs courantes à éviter',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-sans">
                <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/admissibilite"
            onClick={() => setVisible(false)}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all text-sm font-sans"
          >
            Tester mon admissibilité gratuitement <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-center text-xs text-gray-400 mt-3 font-sans">
            +500 familles accompagnées — Résultat en 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
