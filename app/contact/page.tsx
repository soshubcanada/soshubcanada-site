'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(false);

    try {
      const res = await fetch('https://soshubca.vercel.app/api/crm/leads', {
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
      if (!res.ok) throw new Error('API error');
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-navy mb-3">Message envoyé!</h1>
          <p className="text-gray-500 mb-6 font-sans">
            Merci de nous avoir contactés. Notre équipe vous répondra dans les 24 heures ouvrables.
          </p>
          <a href="/" className="text-gold font-semibold hover:text-gold-dark transition-colors font-sans">
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=1920&h=500&fit=crop"
          alt="Contactez-nous"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Contactez-nous</h1>
          <div className="divider-gold mx-auto mt-4 mb-6" />
          <p className="text-white/60 max-w-xl mx-auto font-sans text-lg">
            Notre équipe est disponible pour répondre à vos questions et vous accompagner dans votre projet d&apos;immigration.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 scroll-hidden-left">
              <h2 className="font-bold text-navy text-lg">Nos coordonnées</h2>
              <div className="divider-gold mb-2" />

              {[
                { icon: MapPin, label: 'Adresse', value: '3737 Crémazie Est #402\nMontréal, QC H1Z 2K4' },
                { icon: Phone, label: 'Téléphone', value: '(514) 533-0482', href: 'tel:+15145330482' },
                { icon: Mail, label: 'Courriel', value: 'info@soshubcanada.com', href: 'mailto:info@soshubcanada.com' },
                { icon: MessageCircle, label: 'WhatsApp', value: '(438) 630-2869', href: 'https://wa.me/14386302869' },
                { icon: Clock, label: 'Heures', value: 'Lun-Ven: 9h-17h\nSam: Sur rendez-vous' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center shrink-0 border border-gold/20">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold font-sans">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-navy hover:text-gold transition-colors whitespace-pre-line font-sans">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-navy whitespace-pre-line font-sans">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="scroll-hidden-left relative rounded-2xl overflow-hidden shadow-xl" style={{ transitionDelay: '100ms' }}>
              <Image
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&h=300&fit=crop"
                alt="Consultation"
                width={500}
                height={300}
                className="object-cover w-full h-[200px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-bold text-white mb-2">Consultation gratuite</h3>
                <p className="text-white/60 text-sm mb-3 font-sans">
                  Faites évaluer votre admissibilité gratuitement.
                </p>
                <a href="/admissibilite" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-colors text-sm font-sans">
                  Test d&apos;admissibilité
                </a>
              </div>
            </div>

            <a
              href="https://wa.me/14386302869"
              target="_blank"
              rel="noopener noreferrer"
              className="scroll-hidden-left flex items-center gap-4 p-5 bg-[#25D366]/10 rounded-2xl border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors"
              style={{ transitionDelay: '200ms' }}
            >
              <MessageCircle className="w-8 h-8 text-[#25D366]" />
              <div>
                <p className="font-bold text-navy text-sm">WhatsApp</p>
                <p className="text-xs text-gray-500 font-sans">Réponse rapide par messagerie</p>
              </div>
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 scroll-hidden-right">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-5">
              <h2 className="font-bold text-navy text-xl mb-1">Envoyez-nous un message</h2>
              <div className="divider-gold mb-4" />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Nom complet *</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Courriel *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans" placeholder="votre@email.com" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Téléphone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans" placeholder="+1 (514) ..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Sujet *</label>
                  <select required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white font-sans">
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Message *</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none resize-none font-sans"
                  placeholder="Décrivez brièvement votre situation et vos questions..." />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 disabled:opacity-50 transition-all font-sans"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {sending ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>

              {error && (
                <p className="text-red-500 text-sm text-center font-sans">
                  Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone au (514) 533-0482.
                </p>
              )}
              <p className="text-xs text-gray-400 text-center font-sans">
                En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
