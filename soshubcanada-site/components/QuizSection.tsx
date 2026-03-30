'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Loader2, Shield, Clock } from 'lucide-react';

const countries = [
  '🇲🇦 Maroc', '🇩🇿 Algérie', '🇹🇳 Tunisie', '🇫🇷 France',
  '🇨🇲 Cameroun', '🇨🇮 Côte d\'Ivoire', '🇸🇳 Sénégal', '🇭🇹 Haïti',
  '🇨🇴 Colombie', '🇧🇷 Brésil', '🇲🇽 Mexique',
  '🇱🇧 Liban', '🇪🇬 Égypte', '🇯🇴 Jordanie', 'Autre pays',
];

const interests = [
  'Travailler au Canada',
  'Étudier au Canada',
  'S\'installer définitivement',
  'Rejoindre ma famille',
  'Venir en visite',
  'Je ne suis pas encore sûr(e)',
];

export function QuizSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', interest: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.country || !form.interest) return;
    setLoading(true);

    try {
      await fetch('https://soshubca.vercel.app/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'website_quiz',
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.interest,
          message: `Pays: ${form.country} | Intérêt: ${form.interest}`,
        }),
      });
    } catch {
      // Silent fail — lead still captured
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <section className="py-24 md:py-32 bg-white" id="quiz">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="scroll-hidden-left">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Évaluation rapide</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">
              Testez vos chances en 60 secondes
            </h2>
            <div className="divider-gold mt-4 mb-6" />
            <p className="text-gray-500 mb-8 leading-relaxed font-sans text-lg">
              Découvrez gratuitement si le Canada est accessible pour vous. Réponse immédiate.
            </p>

            <div className="space-y-4">
              {[
                { icon: Clock, text: 'Résultat instantané — pas besoin d\'attendre' },
                { icon: Shield, text: '100% confidentiel — vos données sont protégées' },
                { icon: Sparkles, text: 'Plan d\'action personnalisé en 24h' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-sm text-gray-600 font-sans">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="scroll-hidden-right">
            {!sent ? (
              <form onSubmit={handleSubmit} className="bg-cream rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <h3 className="font-bold text-navy text-lg">Votre profil en 4 questions</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Votre prénom *</label>
                    <input
                      type="text" required value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Amina"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Votre courriel *</label>
                    <input
                      type="email" required value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="Ex: amina@gmail.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">WhatsApp / Téléphone</label>
                    <input
                      type="tel" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="Ex: +212 6XX XXX XXX"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Votre pays d&apos;origine *</label>
                    <select
                      required value={form.country}
                      onChange={e => setForm({ ...form, country: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans bg-white"
                    >
                      <option value="">Sélectionnez votre pays</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Qu&apos;est-ce qui vous intéresse? *</label>
                    <select
                      required value={form.interest}
                      onChange={e => setForm({ ...form, interest: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans bg-white"
                    >
                      <option value="">Sélectionnez</option>
                      {interests.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 disabled:opacity-50 transition-all font-sans text-lg animate-pulse-gold"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {loading ? 'Envoi en cours...' : 'Découvrir mes options gratuitement'}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3 font-sans">
                  <Shield className="w-3 h-3 inline mr-1" />
                  100% confidentiel. Aucun frais. Réponse en 24h maximum.
                </p>
              </form>
            ) : (
              <div className="bg-cream rounded-2xl p-8 border border-gray-100 shadow-lg text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-3">Merci {form.name}!</h3>
                <p className="text-gray-500 font-sans mb-6">
                  Notre équipe analyse votre profil et vous contacte dans les 24h avec un plan d&apos;action personnalisé.
                </p>
                <a
                  href="/admissibilite"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-all font-sans"
                >
                  Test d&apos;admissibilité détaillé <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
