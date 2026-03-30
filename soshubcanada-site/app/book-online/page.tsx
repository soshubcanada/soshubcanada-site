import type { Metadata } from 'next';
import { Phone, MessageCircle, Mail, ShieldCheck, Heart, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Réserver une consultation | SOS Hub Canada',
  description:
    'Réservez votre consultation gratuite avec un conseiller en immigration de SOS Hub Canada. Choisissez le créneau qui vous convient.',
};

export default function BookOnlinePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-navy py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-serif">
            Réservez votre consultation
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-sans">
            Choisissez le créneau qui vous convient et rencontrez un conseiller en immigration qualifié.
          </p>
        </div>
      </section>

      {/* Booking iframe */}
      <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10 pb-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <iframe
            src="https://soshubca.vercel.app/rdv/equipe-sos"
            title="Réserver une consultation"
            className="w-full border-0"
            style={{ height: '700px' }}
            loading="lazy"
            allow="payment"
          />
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Heart, label: 'Gratuite', desc: 'Première consultation offerte' },
            { icon: ShieldCheck, label: 'Sans engagement', desc: 'Aucune obligation de votre part' },
            { icon: Lock, label: 'Confidentiel', desc: 'Vos informations restent privées' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-gold-dark" />
              </div>
              <p className="font-semibold text-navy font-sans">{label}</p>
              <p className="text-sm text-gray-500 font-sans mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact fallback */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-navy/5 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-navy mb-2 font-serif">
            Vous préférez nous contacter directement?
          </h2>
          <p className="text-gray-500 font-sans mb-6">
            Notre équipe est disponible par téléphone, WhatsApp ou courriel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15145330482"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-colors font-sans"
            >
              <Phone className="w-4 h-4" /> +1 (514) 533-0482
            </a>
            <a
              href="https://wa.me/14386302869"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#20bd5a] transition-colors font-sans"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a
              href="mailto:info@soshubcanada.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-white rounded-xl font-semibold hover:bg-gold-dark transition-colors font-sans"
            >
              <Mail className="w-4 h-4" /> Courriel
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
