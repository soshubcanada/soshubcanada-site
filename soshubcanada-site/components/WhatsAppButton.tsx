'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(true);
  const phone = '14386302869';
  const message = encodeURIComponent('Bonjour SOS Hub Canada! Je souhaite obtenir des informations sur vos services d\'immigration.');

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:flex items-end gap-3">
      {showTooltip && (
        <div className="glass-white rounded-2xl p-4 shadow-xl max-w-[260px] animate-fade-in-left relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <X className="w-3 h-3 text-gray-600" />
          </button>
          <p className="text-sm text-navy font-medium">Besoin d&apos;aide?</p>
          <p className="text-xs text-gray-500 mt-1">Écrivez-nous sur WhatsApp pour une réponse rapide!</p>
        </div>
      )}
      <a
        href={`https://wa.me/${phone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-pulse-gold"
        aria-label="Contacter sur WhatsApp"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </a>
    </div>
  );
}
