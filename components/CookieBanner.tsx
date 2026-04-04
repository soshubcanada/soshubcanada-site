'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[9999] animate-slide-up">
      <div className="bg-navy/95 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 border border-white/10 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <Cookie className="w-4 h-4 text-gold flex-shrink-0" />
          <p className="text-white text-xs font-sans leading-snug flex-1">
            Ce site utilise des cookies pour l&apos;analyse et la publicite.{' '}
            <Link
              href="/politique-confidentialite"
              className="text-gold hover:text-gold-light underline underline-offset-2"
            >
              En savoir plus
            </Link>
          </p>
          <button
            onClick={handleDecline}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 px-3 py-1.5 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-lg text-xs font-sans hover:shadow-md transition-all"
          >
            Accepter
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 px-3 py-1.5 border border-white/20 text-gray-300 font-medium rounded-lg text-xs font-sans hover:bg-white/5 transition-all"
          >
            Refuser
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
