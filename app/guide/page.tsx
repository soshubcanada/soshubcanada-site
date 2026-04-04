'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, ArrowRight, FileText, Shield, Clock, Star,
  Download, BookOpen, Users, Globe2, Award, Sparkles
} from 'lucide-react';

const chapters = [
  { icon: Globe2, title: 'Choisir le bon programme', desc: 'Entrée Express, PEQ, permis de travail, parrainage — lequel est fait pour vous?' },
  { icon: FileText, title: 'Documents requis', desc: 'Liste complète des documents exigés par IRCC et MIFI selon votre programme.' },
  { icon: Award, title: 'Maximiser votre score CRS', desc: 'Stratégies concrètes pour gagner jusqu\'à 100+ points supplémentaires.' },
  { icon: BookOpen, title: 'Tests de langue (IELTS/TEF)', desc: 'Comment préparer et réussir vos tests pour maximiser vos points.' },
  { icon: Users, title: 'Erreurs courantes à éviter', desc: 'Les 10 erreurs qui retardent ou font refuser les dossiers chaque année.' },
  { icon: Clock, title: 'Délais et calendrier 2026', desc: 'Tirages prévus, dates limites et fenêtres d\'opportunité à ne pas manquer.' },
  { icon: Sparkles, title: 'Plan d\'action personnalisé', desc: 'Votre feuille de route étape par étape pour les 12 prochains mois.' },
];

const socialProof = [
  { name: 'Karim M.', origin: 'Algérie', text: 'Ce guide m\'a aidé à comprendre exactement quoi faire. J\'ai eu mon ITA 2 mois après!' },
  { name: 'Fatima Z.', origin: 'Tunisie', text: 'Très clair et bien structuré. J\'ai évité des erreurs qui m\'auraient coûté des mois.' },
  { name: 'Youssef E.', origin: 'Maroc', text: 'Le chapitre sur le score CRS m\'a permis de gagner 60 points. Merci SOS Hub!' },
];

export default function GuidePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setLoading(true);

    try {
      await fetch('https://soshubca.vercel.app/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'lead_magnet_guide',
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: 'Telechargement Guide Immigration 2026',
          message: 'Lead magnet: Guide 7 etapes pour immigrer au Canada en 2026',
        }),
      });
    } catch {
      // Silent fail
    }

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy via-navy-dark to-navy overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gold rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-xs font-bold px-4 py-2 rounded-full mb-6 font-sans uppercase tracking-wider">
                <Download className="w-3.5 h-3.5" /> Guide gratuit 2026
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                Les 7 étapes pour <span className="text-gold">immigrer au Canada</span> en 2026
              </h1>
              <p className="text-gray-300 text-lg font-sans leading-relaxed mb-6">
                Le guide complet utilisé par +500 familles pour réussir leur projet
                d&apos;immigration. Programmes, documents, délais, stratégies — tout est là.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-sans">
                <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-gold" /> 32 pages</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold" /> 10 min de lecture</span>
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-gold" /> 100% gratuit</span>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
              {!submitted ? (
                <>
                  <h2 className="text-navy font-bold text-xl mb-1">Téléchargez le guide</h2>
                  <p className="text-gray-400 text-sm font-sans mb-5">Recevez-le instantanément par courriel.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-navy mb-1 block font-sans">Prénom et nom *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Ex: Amina Bouchard"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-sans focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-navy mb-1 block font-sans">Courriel *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="Ex: amina@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-sans focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-navy mb-1 block font-sans">Téléphone (optionnel)</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="Ex: +212 6XX XXX XXX"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-sans focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all text-sm font-sans disabled:opacity-50"
                    >
                      {loading ? 'Envoi en cours...' : (
                        <>
                          <Download className="w-4 h-4" /> Recevoir mon guide gratuit
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-400 text-center font-sans">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Vos données sont protégées. Aucun spam.
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-navy font-bold text-xl mb-2">Guide envoyé!</h3>
                  <p className="text-gray-500 text-sm font-sans mb-6">
                    Vérifiez votre boîte courriel ({form.email}). Le guide arrive dans quelques secondes.
                  </p>
                  <Link
                    href="/admissibilite"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-all text-sm font-sans"
                  >
                    Tester mon admissibilité maintenant <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Chapters */}
      <section className="py-16 bg-cream">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-navy text-center mb-3">Ce que vous allez apprendre</h2>
          <div className="divider-gold mx-auto mb-10" />
          <div className="grid md:grid-cols-2 gap-4">
            {chapters.map((ch, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <ch.icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-gold font-bold font-sans mb-0.5">CHAPITRE {i + 1}</p>
                  <h3 className="font-bold text-navy text-sm mb-1">{ch.title}</h3>
                  <p className="text-xs text-gray-500 font-sans">{ch.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-navy text-center mb-8">Ils ont téléchargé le guide</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {socialProof.map((t, i) => (
              <div key={i} className="bg-cream rounded-xl p-5 border border-gray-100">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 font-sans mb-3">&quot;{t.text}&quot;</p>
                <p className="text-xs font-bold text-navy">{t.name} <span className="text-gray-400 font-normal">— {t.origin}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-navy text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Prêt à commencer votre projet?</h2>
          <p className="text-gray-300 font-sans mb-8">
            Testez votre admissibilité gratuitement et recevez votre plan d&apos;action personnalisé.
          </p>
          <Link
            href="/admissibilite"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all font-sans"
          >
            Tester mon admissibilité <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
