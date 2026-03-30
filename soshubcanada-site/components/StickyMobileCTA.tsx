'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slide-up">
      <div className="bg-navy/95 backdrop-blur-lg border-t border-gold/20 px-4 py-3 safe-area-bottom">
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-8 right-3 w-6 h-6 bg-navy/80 rounded-full flex items-center justify-center"
          aria-label="Fermer"
        >
          <X className="w-3 h-3 text-white/60" />
        </button>
        <div className="flex gap-3">
          <a
            href="tel:+15145330482"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl text-sm font-sans"
          >
            <Phone className="w-4 h-4" />
            Appeler maintenant
          </a>
          <a
            href="https://wa.me/14386302869?text=Bonjour%20SOS%20Hub%20Canada!%20Je%20souhaite%20obtenir%20des%20informations."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm font-sans"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
