'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Compass,
  AlertTriangle,
  TrendingDown,
  CircleDollarSign,
  ClipboardCheck,
  FileSearch,
  Rocket,
  ChevronDown,
  Star,
} from 'lucide-react';

/* ===== CTA BUTTON (reusable) ===== */
function CTAButton({ label = 'Decouvrir mes options gratuitement' }: { label?: string }) {
  return (
    <button
      onClick={() => {
        document.getElementById('evaluation')?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl px-10 py-5 text-lg hover:shadow-2xl hover:shadow-gold/30 hover:scale-105 transition-all animate-pulse-gold cursor-pointer w-full sm:w-auto"
    >
      {label} &rarr;
    </button>
  );
}

/* ===== COUNTDOWN TIMER ===== */
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function getEndOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    function calc() {
      const diff = getEndOfMonth().getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: 'Jours', value: timeLeft.days },
    { label: 'Heures', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-5">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-bold text-gold tabular-nums">
            {String(u.value).padStart(2, '0')}
          </span>
          <span className="text-xs text-white/60 mt-1">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ===== FAQ ACCORDION ===== */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-navy/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
      >
        <span className="font-serif text-navy font-semibold text-base sm:text-lg pr-4">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-gold shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 pb-5' : 'max-h-0'}`}
      >
        <p className="text-navy/70 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ===== TESTIMONIAL AVATARS (unique Unsplash IDs not used elsewhere) ===== */
const TESTIMONIALS = [
  {
    name: 'Amina B.',
    route: 'Casablanca \u2192 Montreal',
    quote:
      'CSQ obtenu en 4 mois. Mon expert m\'a evite les erreurs qui retardent 80% des dossiers.',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face',
  },
  {
    name: 'Karim M.',
    route: 'Alger \u2192 Toronto',
    quote:
      'Score CRS optimise de 410 a 468 points. ITA recu au 2e tirage.',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=face',
  },
  {
    name: 'Sofia L.',
    route: 'Bogota \u2192 Montreal',
    quote:
      'Apres un refus, SOS Hub a repris mon dossier. Approuvee en 6 mois.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
  },
];

/* ===== MAIN PAGE ===== */
export default function LandingPage() {
  /* Form state */
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    prenom: '',
    email: '',
    pays: '',
    objectif: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.pays || !formData.objectif) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('https://soshubca.vercel.app/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: formData.prenom,
          email: formData.email,
          pays: formData.pays,
          objectif: formData.objectif,
          source: 'lp_funnel',
        }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      window.location.href = '/merci';
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
      setSubmitting(false);
    }
  }

  return (
    <div className="overflow-x-hidden">
      {/* ============================================================
          SECTION 1 — HERO
      ============================================================ */}
      <section className="bg-white py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-navy text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
            Vous revez d&apos;immigrer au Canada mais vous ne savez pas par ou commencer?
          </h1>
          <p className="text-navy/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Recevez votre analyse d&apos;admissibilite personnalisee en 24h &mdash; gratuit, confidentiel, sans engagement.
          </p>
          <CTAButton />

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-navy/60">
            <span>Confidentiel</span>
            <span>Resultat en 24h</span>
            <span>+2000 familles accompagnees</span>
            <span>4 langues</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — PAIN POINTS
      ============================================================ */}
      <section className="bg-navy py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-white text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            Pourquoi 35% des demandes d&apos;immigration sont refusees?
          </h2>
          <div className="divider-gold mx-auto mb-12" />

          <div className="space-y-4">
            {[
              { Icon: Compass, title: 'Plus de 50 programmes', desc: 'lequel est fait pour vous?' },
              { Icon: AlertTriangle, title: 'Un seul formulaire mal rempli', desc: '= 6-12 mois de retard' },
              { Icon: TrendingDown, title: 'Les quotas diminuent chaque annee', desc: 'le temps joue contre vous' },
              { Icon: CircleDollarSign, title: 'Les frais d\'un refus?', desc: '$2,000-$5,000 perdus' },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="glass rounded-xl p-5 flex items-start gap-4"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-white font-bold">{title}</p>
                  <p className="text-white/60 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gold font-semibold mt-12 text-lg">
            La bonne nouvelle? Avec le bon accompagnement, votre taux d&apos;approbation passe de 65% a 95%.
          </p>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — SOLUTION
      ============================================================ */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-navy text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Ce que vous recevez &mdash; gratuitement
          </h2>
          <div className="divider-gold mx-auto mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { emoji: '\uD83D\uDCCB', title: 'Analyse personnalisee', desc: 'Vos programmes eligibles, classes par chances de succes' },
              { emoji: '\uD83D\uDCCA', title: 'Score d\'admissibilite', desc: 'Votre score CRS/Arrima estime avec recommandations' },
              { emoji: '\uD83D\uDCDE', title: 'Plan d\'action', desc: 'Un expert vous contacte avec les prochaines etapes concretes' },
            ].map((item) => (
              <div
                key={item.title}
                className="card-premium bg-cream rounded-2xl p-8 text-center"
              >
                <span className="text-4xl mb-4 block">{item.emoji}</span>
                <h3 className="font-serif text-navy font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-navy/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-navy/70 text-lg mb-8">
            Tout ca en 24h. Gratuit. Sans engagement.
          </p>
          <CTAButton />
        </div>
      </section>

      {/* ============================================================
          SECTION 4 — HOW IT WORKS
      ============================================================ */}
      <section className="bg-cream py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-navy text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Comment ca marche? 3 etapes simples
          </h2>
          <div className="divider-gold mx-auto mb-14" />

          <div className="relative max-w-md mx-auto">
            {/* Connecting line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gold/20 hidden sm:block" />

            <div className="space-y-10">
              {[
                { Icon: ClipboardCheck, num: '1', title: 'Remplissez le formulaire', time: '2 minutes' },
                { Icon: FileSearch, num: '2', title: 'Recevez votre analyse', time: '24h' },
                { Icon: Rocket, num: '3', title: 'Demarrez votre projet', time: 'avec votre expert' },
              ].map(({ Icon, num, title, time }) => (
                <div key={num} className="flex items-start gap-5 text-left">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center font-bold text-lg relative z-10">
                    {num}
                  </div>
                  <div className="pt-1">
                    <p className="font-serif text-navy font-bold text-lg">{title}</p>
                    <p className="text-navy/50 text-sm flex items-center gap-1 mt-1">
                      <Icon className="w-4 h-4" /> {time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5 — SOCIAL PROOF
      ============================================================ */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-navy text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            Ils ont reussi leur immigration
          </h2>
          <div className="divider-gold mx-auto mb-12" />

          <div className="space-y-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-cream rounded-2xl p-6 sm:p-8 border border-gold/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                <blockquote className="font-serif text-navy text-lg sm:text-xl font-semibold leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover w-12 h-12"
                  />
                  <div>
                    <p className="font-bold text-navy">{t.name}</p>
                    <p className="text-navy/50 text-sm">{t.route}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <CTAButton />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6 — EVALUATION FORM
      ============================================================ */}
      <section id="evaluation" className="bg-navy py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Votre evaluation gratuite commence ici
          </h2>
          <p className="text-white/60 mb-10">
            Repondez a 4 questions. Recevez votre analyse en 24h.
          </p>

          <form onSubmit={handleSubmit} className="text-left">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="prenom" className="block text-white/80 text-sm mb-1.5 font-medium">
                    Prenom
                  </label>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Votre prenom"
                    className="w-full py-4 px-5 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors text-base"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-white/80 text-sm mb-1.5 font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className="w-full py-4 px-5 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors text-base"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.prenom && formData.email) setStep(2);
                  }}
                  className="w-full bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl px-10 py-5 text-lg hover:shadow-2xl hover:shadow-gold/30 hover:scale-105 transition-all cursor-pointer mt-2"
                >
                  Suivant &rarr;
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="pays" className="block text-white/80 text-sm mb-1.5 font-medium">
                    Pays d&apos;origine
                  </label>
                  <select
                    id="pays"
                    name="pays"
                    required
                    value={formData.pays}
                    onChange={handleChange}
                    className="w-full py-4 px-5 rounded-xl border-2 border-white/20 bg-white/10 text-white focus:border-gold focus:outline-none transition-colors text-base appearance-none cursor-pointer"
                  >
                    <option value="" className="text-navy">Selectionnez votre pays</option>
                    {[
                      'Maroc', 'Algerie', 'Tunisie', 'France', 'Cameroun', 'Senegal',
                      'Haiti', 'Colombie', 'Bresil', 'Mexique', 'Liban', 'Egypte', 'Autre',
                    ].map((p) => (
                      <option key={p} value={p} className="text-navy">{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="objectif" className="block text-white/80 text-sm mb-1.5 font-medium">
                    Objectif
                  </label>
                  <select
                    id="objectif"
                    name="objectif"
                    required
                    value={formData.objectif}
                    onChange={handleChange}
                    className="w-full py-4 px-5 rounded-xl border-2 border-white/20 bg-white/10 text-white focus:border-gold focus:outline-none transition-colors text-base appearance-none cursor-pointer"
                  >
                    <option value="" className="text-navy">Selectionnez votre objectif</option>
                    {[
                      'Residence permanente',
                      'Permis de travail',
                      'Permis d\'etudes',
                      'Parrainage familial',
                      'Je ne sais pas encore',
                    ].map((o) => (
                      <option key={o} value={o} className="text-navy">{o}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-4 px-6 rounded-xl border-2 border-white/20 text-white/70 font-medium hover:border-white/40 transition-colors cursor-pointer"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl px-8 py-5 text-lg hover:shadow-2xl hover:shadow-gold/30 hover:scale-105 transition-all cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {submitting ? 'Envoi en cours...' : 'Recevoir mon analyse gratuite \u2192'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-white/40 text-sm mt-6">
            Vos donnees sont confidentielles. Aucun spam. Desinscription en un clic.
          </p>
          <p className="text-gold/80 text-sm mt-3 font-medium">
            Satisfaction garantie ou remboursee
          </p>
        </div>
      </section>

      {/* ============================================================
          SECTION 7 — FAQ
      ============================================================ */}
      <section className="bg-cream py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-navy text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            Questions frequentes
          </h2>
          <div className="divider-gold mx-auto mb-10" />

          <div className="bg-white rounded-2xl p-6 sm:p-8">
            <FAQItem
              q="Est-ce vraiment gratuit?"
              a="Oui, l'evaluation d'admissibilite est 100% gratuite et sans engagement. Nous vous contactons uniquement pour vous presenter vos options."
            />
            <FAQItem
              q="Combien de temps prend le processus?"
              a="L'evaluation prend 2 minutes. Vous recevez votre analyse en 24h. Le processus d'immigration varie de 2 a 18 mois selon le programme."
            />
            <FAQItem
              q="Mes donnees sont-elles protegees?"
              a="Absolument. Vos informations sont confidentielles et ne sont jamais partagees avec des tiers. Nous respectons la Loi 25 du Quebec sur la protection des renseignements personnels."
            />
            <FAQItem
              q="Pourquoi faire appel a un expert?"
              a="35% des demandes sont refusees a cause d'erreurs evitables. Nos experts identifient le bon programme, optimisent votre dossier et maximisent vos chances d'approbation."
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 8 — FINAL CTA
      ============================================================ */}
      <section className="bg-navy py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-8">
            Ne laissez pas passer votre chance
          </h2>

          <CountdownTimer />

          <p className="text-white/60 mt-6 mb-10">
            Il ne reste que quelques places pour l&apos;accompagnement ce mois-ci
          </p>

          <CTAButton label="Recevoir mon analyse gratuite" />

          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/50">
            <span>Confidentiel</span>
            <span>24h</span>
            <span>Sans engagement</span>
            <span>2000+ familles</span>
          </div>
        </div>
      </section>
    </div>
  );
}
