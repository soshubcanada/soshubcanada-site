'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Send lead to CRM API
    try {
      await fetch('https://soshubca.vercel.app/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'website_contact',
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
        }),
      });
    } catch {
      // Silently fail - form still shows success
    }

    setTimeout(() => {
      setSent(true);
      setSending(false);
    }, 1000);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">Message envoyé!</h1>
          <p className="text-gray-500 mb-6">
            Merci de nous avoir contactés. Notre équipe vous répondra dans les 24 heures ouvrables.
          </p>
          <a href="/" className="text-gold font-semibold hover:text-gold-dark transition-colors">
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Contactez-nous</h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Notre équipe est disponible pour répondre à vos questions et vous accompagner dans votre projet d&apos;immigration.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <h2 className="font-bold text-navy text-lg">Nos coordonnées</h2>

              {[
                { icon: MapPin, label: 'Adresse', value: 'Montréal, Québec\nCanada' },
                { icon: Phone, label: 'Téléphone', value: '(514) 555-1234', href: 'tel:+15145551234' },
                { icon: Mail, label: 'Courriel', value: 'info@soshubcanada.com', href: 'mailto:info@soshubcanada.com' },
                { icon: Clock, label: 'Heures', value: 'Lun-Ven: 9h-17h\nSam: Sur rendez-vous' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-navy hover:text-gold transition-colors whitespace-pre-line">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-navy whitespace-pre-line">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2">Consultation gratuite</h3>
              <p className="text-white/60 text-sm mb-4">
                Faites évaluer votre admissibilité gratuitement avec notre outil en ligne.
              </p>
              <a href="/admissibilite" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-colors text-sm">
                Test d&apos;admissibilité
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
              <h2 className="font-bold text-navy text-lg mb-2">Envoyez-nous un message</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet *</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Courriel *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none" placeholder="votre@email.com" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none" placeholder="+1 (514) ..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sujet *</label>
                  <select required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                    <option value="">Sélectionnez</option>
                    <option value="admissibility">Évaluation d&apos;admissibilité</option>
                    <option value="express_entry">Entrée Express</option>
                    <option value="peq">PEQ / Programmes Québec</option>
                    <option value="work_permit">Permis de travail</option>
                    <option value="study_permit">Permis d&apos;études</option>
                    <option value="family">Parrainage familial</option>
                    <option value="relocation">Relocalisation</option>
                    <option value="employer">Services employeurs</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none resize-none"
                  placeholder="Décrivez brièvement votre situation et vos questions..." />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-white font-bold rounded-xl hover:bg-gold-dark disabled:opacity-50 transition-colors"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {sending ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                Nous ne partageons jamais vos informations.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
