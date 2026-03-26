'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Shield } from 'lucide-react';

const CONSENT_KEY = 'soshub_cookie_consent';
const CONSENT_VERSION = '1'; // bump when policy changes

type ConsentState = 'pending' | 'accepted' | 'declined';

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>('pending');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed.status);
          return;
        }
      } catch {
        // corrupted — re-ask
      }
    }
    // Show banner after a small delay (don't block first paint)
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      status: 'accepted',
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    }));
    setConsent('accepted');
    setVisible(false);
    // Reload to let AnalyticsProvider pick up consent
    window.location.reload();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      status: 'declined',
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    }));
    setConsent('declined');
    setVisible(false);
  };

  if (consent !== 'pending' || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 md:p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-navy rounded-2xl shadow-2xl shadow-black/30 border border-white/10 p-6 md:p-8">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="hidden md:flex w-12 h-12 rounded-xl bg-gold/20 items-center justify-center flex-shrink-0">
            <Cookie className="w-6 h-6 text-gold" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-gold md:hidden" />
              Nous utilisons des cookies
            </h3>
            <p className="text-gray-300 text-sm font-sans leading-relaxed mb-1">
              Nous utilisons des outils, tels que des cookies, pour activer les services essentiels
              et les fonctionnalites de notre site, et pour collecter des donnees sur la facon dont
              les visiteurs interagissent avec notre site, nos produits et nos services.
            </p>
            <p className="text-gray-400 text-xs font-sans mb-4">
              En cliquant sur <strong className="text-white">Accepter</strong>, vous acceptez notre utilisation
              de ces outils a des fins de publicite, d&apos;analyse et de support.{' '}
              <Link
                href="/politique-confidentialite"
                className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors"
              >
                Politique de confidentialite
              </Link>
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAccept}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all text-sm font-sans"
              >
                <Shield className="w-4 h-4" />
                Accepter tous les cookies
              </button>
              <button
                onClick={handleDecline}
                className="flex items-center justify-center gap-2 px-8 py-3 border border-white/20 text-gray-300 font-semibold rounded-xl hover:bg-white/5 transition-all text-sm font-sans"
              >
                Refuser les cookies optionnels
              </button>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={handleDecline}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0 mt-1"
            aria-label="Fermer la banniere de cookies"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Utility: check if user has accepted cookies (use in Analytics) */
export function hasConsentedToCookies(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed.version === CONSENT_VERSION && parsed.status === 'accepted';
  } catch {
    return false;
  }
}
