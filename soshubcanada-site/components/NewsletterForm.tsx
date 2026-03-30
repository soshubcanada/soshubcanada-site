'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

export function NewsletterForm() {
  const [nlEmail, setNlEmail] = useState('');
  const [nlSent, setNlSent] = useState(false);
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNlLoading(true);
    setNlError(false);
    try {
      const res = await fetch('https://soshubca.vercel.app/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'newsletter', email: nlEmail, name: nlEmail.split('@')[0] }),
      });
      if (!res.ok) throw new Error('API error');
      setNlSent(true);
    } catch {
      setNlError(true);
    } finally {
      setNlLoading(false);
    }
  };

  if (nlSent) {
    return (
      <div className="flex items-center justify-center gap-2 text-white font-sans">
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <span>Merci! Vous recevrez nos conseils chaque semaine.</span>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
        <input type="email" required value={nlEmail} onChange={e => setNlEmail(e.target.value)} placeholder="Votre courriel" className="flex-1 px-5 py-3.5 rounded-xl border-0 outline-none text-navy font-sans shadow-lg" />
        <button type="submit" disabled={nlLoading} className="px-8 py-3.5 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-colors flex items-center justify-center gap-2 font-sans shadow-lg disabled:opacity-50">
          {nlLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          S&apos;abonner
        </button>
      </form>
      {nlError && (
        <p className="text-white/90 text-sm mt-3 font-sans">Une erreur est survenue. Veuillez réessayer ou nous contacter directement.</p>
      )}
    </div>
  );
}
