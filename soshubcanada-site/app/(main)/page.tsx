'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { CommunautesSection } from '@/components/CommunautesSection';
import {
  ArrowRight, CheckCircle2, Users, FileText, Globe2, Shield,
  Star, TrendingDown, Award, Clock, Sparkles, ChevronRight,
  GraduationCap, Briefcase, Heart, Plane, Quote,
  Phone, ShieldAlert, CalendarClock, Zap, BadgeCheck, Timer, AlertTriangle,
  MessageCircle
} from 'lucide-react';

/* ===== IMAGES — Every Unsplash ID appears ONLY ONCE ===== */
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1602471615287-d2838af03547?w=1920&h=1080&fit=crop&crop=faces',
  ctaBg: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1920&h=800&fit=crop',
};

/* Social proof avatars — 8 unique IDs, none reused elsewhere */
const socialAvatars = [
  { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face', country: 'Cameroun' },
  { image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face', country: 'Haiti' },
  { image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', country: 'Colombie' },
  { image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face', country: 'France' },
  { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', country: 'Maroc' },
  { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', country: 'Tunisie' },
  { image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face', country: 'Algerie' },
  { image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=80&h=80&fit=crop&crop=face', country: 'Senegal' },
];

/* Testimonials — 4 unique face images */
const testimonials = [
  {
    name: 'Amina B.', origin: 'Maroc', program: 'PEQ - Diplomes',
    text: 'Grace a SOS Hub Canada, j\'ai obtenu mon CSQ en seulement 4 mois apres mon diplome. Leur connaissance du processus quebecois est impressionnante.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Karim M.', origin: 'Algerie', program: 'Entree Express',
    text: 'Un accompagnement professionnel du debut a la fin. Mon score CRS a ete optimise et j\'ai recu mon ITA au deuxieme tirage. Merci infiniment!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Fatima Z.', origin: 'Tunisie', program: 'Permis de travail',
    text: 'L\'equipe m\'a aidee avec mon EIMT et mon permis de travail ferme. Processus clair, communication constante. Je recommande a 100%.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Youssef E.', origin: 'Maroc', program: 'Relocalisation',
    text: 'Toute ma famille a ete accompagnee pour notre installation a Montreal. Logement, ecole pour les enfants, tout a ete gere. On se sent chez nous!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
];

const steps = [
  { step: '01', title: 'Faites le test gratuit', desc: 'Remplissez le formulaire d\'admissibilite en 2 minutes. C\'est gratuit et sans engagement.', icon: Sparkles },
  { step: '02', title: 'Consultation personnalisee', desc: 'Un membre de notre equipe vous contacte dans les 24h pour discuter de vos options.', icon: Users },
  { step: '03', title: 'Constitution du dossier', desc: 'Nous preparons et verifions l\'ensemble de vos documents avec rigueur et precision.', icon: FileText },
  { step: '04', title: 'Soumission et suivi', desc: 'Depot aupres des autorites competentes et suivi jusqu\'a l\'obtention de votre statut.', icon: CheckCircle2 },
];

const countries = [
  'France', 'Maroc', 'Algerie', 'Tunisie', 'Cameroun', 'Cote d\'Ivoire', 'Senegal',
  'Haiti', 'Colombie', 'Republique Democratique du Congo', 'Liban', 'Bresil', 'Mexique', 'Autre',
];

/* ===== COUNTDOWN TIMER COMPONENT ===== */
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function getEndOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    function calcTimeLeft() {
      const now = new Date();
      const end = getEndOfMonth();
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }

    setTimeLeft(calcTimeLeft());
    const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: 'Jours', value: timeLeft.days },
    { label: 'Heures', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Secondes', value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-5">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <span className="text-2xl sm:text-3xl font-bold text-white font-serif tabular-nums">
              {String(u.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-white/60 mt-1.5 font-sans uppercase tracking-wider">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ===== MAIN PAGE ===== */
export default function HomePage() {
  const router = useRouter();
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCountry, setFormCountry] = useState('');

  async function handleHeroSubmit(e: FormEvent) {
    e.preventDefault();
    // POST lead to CRM immediately (fire-and-forget)
    try {
      fetch('https://soshubca.vercel.app/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'hero_form',
          name: formName,
          email: formEmail,
          message: `Pays: ${formCountry}`,
        }),
      });
    } catch {
      // Don't block navigation on API failure
    }
    const params = new URLSearchParams();
    if (formName) params.set('name', formName);
    if (formEmail) params.set('email', formEmail);
    if (formCountry) params.set('country', formCountry);
    router.push(`/admissibilite?${params.toString()}`);
  }

  return (
    <>
      {/* ========== 1. HERO — Inline Mini Form ========== */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <Image src={IMAGES.hero} alt="Famille heureuse au Canada" fill sizes="100vw" className="object-cover object-top animate-kenburns" priority quality={90} />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-28 md:py-36 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div>
              <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-gold text-sm font-medium font-sans glow-gold">
                  <Sparkles className="w-4 h-4" />
                  +500 familles accompagnees
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full text-red-300 text-xs font-semibold font-sans animate-pulse">
                  <Timer className="w-3.5 h-3.5" />
                  Places limitees 2026
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-5 animate-fade-in-up">
                Testez votre admissibilite au{' '}
                <span className="text-gradient-gold">Canada</span>{' '}
                — Gratuit, 2 minutes
              </h1>

              <p className="text-lg md:text-xl text-white/60 mb-8 max-w-xl leading-relaxed animate-fade-in-up delay-100 font-sans">
                Entree Express, PEQ Quebec, permis de travail, parrainage familial — decouvrez votre meilleur programme en 2 minutes. Resultat en 24h.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 text-white/40 text-sm animate-fade-in-up delay-300 font-sans">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-gold" /><span>Confidentiel</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /><span>Reponse 24h</span></div>
                <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-gold" /><span>Sans engagement</span></div>
                <div className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-gold" /><span>4 langues</span></div>
              </div>
            </div>

            {/* Right — Mini form */}
            <div className="animate-fade-in-up delay-200">
              <form onSubmit={handleHeroSubmit} className="glass-white rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-navy mb-1">Evaluation gratuite</h2>
                  <p className="text-sm text-gray-500 font-sans">Decouvrez vos options en 2 minutes</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="hero-name" className="block text-xs font-semibold text-navy mb-1.5 font-sans">Votre prenom</label>
                    <input
                      id="hero-name"
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Amina"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-sans focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all bg-white text-navy"
                    />
                  </div>
                  <div>
                    <label htmlFor="hero-email" className="block text-xs font-semibold text-navy mb-1.5 font-sans">Adresse courriel</label>
                    <input
                      id="hero-email"
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-sans focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all bg-white text-navy"
                    />
                  </div>
                  <div>
                    <label htmlFor="hero-country" className="block text-xs font-semibold text-navy mb-1.5 font-sans">Pays de residence</label>
                    <select
                      id="hero-country"
                      required
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-sans focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all bg-white text-navy appearance-none"
                    >
                      <option value="">Selectionnez votre pays</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-gold/30 transition-all text-lg animate-pulse-gold hover:scale-[1.02] font-sans glow-gold"
                >
                  Tester mon admissibilite <ArrowRight className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400 font-sans">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 100% confidentiel</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 2 min</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Gratuit</span>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-3 bg-gold rounded-full animate-slide-up" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }} />
          </div>
        </div>
      </section>

      {/* ========== 2. SOCIAL PROOF BAR ========== */}
      <section className="bg-white py-5 border-b border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-sans font-semibold">Nos clients viennent de:</span>
            <div className="flex -space-x-3">
              {socialAvatars.map((s, i) => (
                <div key={i} className="relative w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-md hover:scale-110 hover:z-10 transition-transform" title={s.country}>
                  <Image src={s.image} alt={s.country} fill sizes="36px" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
              <span className="text-sm font-bold text-navy ml-1 font-sans">4.9</span>
              <span className="text-xs text-gray-400 font-sans">(200+ avis)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 3. URGENCY COUNTDOWN ========== */}
      <section className="py-14 md:py-16 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-32 h-32 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full text-white text-sm font-bold font-sans mb-4">
              <AlertTriangle className="w-4 h-4" />
              Les quotas IRCC diminuent. Places limitees pour 2026.
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Temps restant pour agir ce mois-ci</h2>
            <CountdownTimer />
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-10 text-white">
            <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1 font-sans">Apres 30 ans = moins de points</h4>
                <p className="text-xs text-white/80 font-sans">Chaque annee apres 30 ans vous fait perdre des points CRS cruciaux pour l&apos;Entree Express.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1 font-sans">Quotas IRCC en baisse</h4>
                <p className="text-xs text-white/80 font-sans">Le Canada reduit ses quotas de residents temporaires. Les fenetres d&apos;opportunite se ferment.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1 font-sans">Rentree automne 2026</h4>
                <p className="text-xs text-white/80 font-sans">Les dossiers d&apos;admission universitaire doivent etre soumis rapidement pour la rentree.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/admissibilite" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-white/90 transition-all text-lg shadow-xl hover:shadow-2xl hover:scale-105 font-sans">
              <Sparkles className="w-5 h-5" /> Evaluer mon admissibilite — C&apos;est gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* ========== 4. PROCESS STEPS ========== */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Notre processus</span>
            <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">Comment ca marche?</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center scroll-hidden" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border animate-border-glow hover:shadow-lg hover:scale-110 transition-all cursor-default ${i === 0 ? 'bg-gradient-to-br from-gold/20 to-gold/10 border-gold/40' : 'bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20'}`}>
                  <s.icon className="w-8 h-8 text-gold" />
                </div>
                <span className="text-xs text-gold font-bold tracking-wider font-sans">ETAPE {s.step}</span>
                <h3 className="font-bold text-navy mt-1 mb-3 text-lg">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-sans">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[65%] w-[70%] h-px bg-gradient-to-r from-gold/30 to-transparent" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12 scroll-hidden">
            <Link href="/admissibilite" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all font-sans text-lg hover:scale-105">
              Commencer l&apos;etape 1 — C&apos;est gratuit <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== 5. STATS + TRUST ========== */}
      <section className="bg-navy py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
            {[
              { value: 500, suffix: '+', label: 'Familles accompagnees' },
              { value: 95, suffix: '%', label: 'Taux de satisfaction' },
              { value: 50, suffix: '+', label: 'Programmes maitrises' },
              { value: 24, suffix: 'h', label: 'Delai de reponse' },
            ].map((s, i) => (
              <div key={i} className="text-center p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-serif counter-glow">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-white/40 font-sans">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BadgeCheck, title: 'Certifie IRCC', desc: 'Conforme aux normes federales', color: 'text-emerald-400' },
              { icon: Shield, title: 'Donnees protegees', desc: 'Confidentialite 100% garantie', color: 'text-blue-400' },
              { icon: Zap, title: 'Resultat en 24h', desc: 'Evaluation rapide et precise', color: 'text-gold' },
              { icon: Award, title: '4.9/5 Satisfaction', desc: '200+ avis verifies', color: 'text-amber-400' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${b.color}`}>
                  <b.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm font-sans">{b.title}</p>
                  <p className="text-white/40 text-[11px] font-sans">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 6. PROGRAMMES TABLE ========== */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Comparez</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">Quel programme est fait pour vous?</h2>
            <div className="divider-gold mx-auto" />
          </div>
          <div className="overflow-x-auto scroll-hidden">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left p-4 rounded-tl-xl font-semibold">Programme</th>
                  <th className="p-4 text-center font-semibold">Delai</th>
                  <th className="p-4 text-center font-semibold">Profil ideal</th>
                  <th className="p-4 text-center font-semibold">Residence permanente</th>
                  <th className="p-4 text-center rounded-tr-xl font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Entree Express', delay: '6-8 mois', profile: 'Travailleurs qualifies', rp: true, hot: true },
                  { name: 'PEQ Quebec', delay: '6-12 mois', profile: 'Diplomes / Travailleurs QC', rp: true, hot: true },
                  { name: 'Permis de travail', delay: '2-6 mois', profile: 'Offre d\'emploi confirmee', rp: false, hot: false },
                  { name: 'Permis d\'etudes', delay: '2-4 mois', profile: 'Etudiants internationaux', rp: false, hot: false },
                  { name: 'Parrainage familial', delay: '12-18 mois', profile: 'Conjoint / Famille', rp: true, hot: false },
                  { name: 'Mobilite francophone', delay: '2-4 mois', profile: 'Francophones hors QC', rp: false, hot: true },
                ].map((p, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-cream' : 'bg-white'} hover:bg-gold/5 transition-colors`}>
                    <td className="p-4 font-bold text-navy flex items-center gap-2">
                      {p.hot && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Programme populaire" />}
                      {p.name}
                    </td>
                    <td className="p-4 text-center text-gray-600">{p.delay}</td>
                    <td className="p-4 text-center text-gray-500">{p.profile}</td>
                    <td className="p-4 text-center">
                      {p.rp
                        ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="p-4 text-center">
                      {p.hot
                        ? <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">Populaire</span>
                        : <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">Disponible</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-10 scroll-hidden">
            <Link
              href="/admissibilite"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all font-sans text-lg"
            >
              Decouvrir mon programme ideal <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-gray-400 mt-3 font-sans">Evaluation gratuite - Resultat en 24h - Sans engagement</p>
          </div>
        </div>
      </section>

      {/* ========== 7. TESTIMONIALS + Before/After ========== */}
      <section className="py-20 md:py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Temoignages</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">Ils nous ont fait confiance</h2>
            <div className="divider-gold mx-auto" />
          </div>

          {/* Before / After success story */}
          <div className="scroll-hidden mb-12 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-10 bg-gray-50 border-r border-gray-100">
                <span className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold font-sans mb-4">AVANT</span>
                <h3 className="text-lg font-bold text-navy mb-3">La famille Benmoussa (Casablanca)</h3>
                <ul className="space-y-2 text-sm text-gray-500 font-sans">
                  <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> Perdue dans les demarches complexes d&apos;IRCC</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> Premiere demande refusee (dossier incomplet)</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> Score CRS trop bas pour recevoir une ITA</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> Stress et incertitude depuis 2 ans</li>
                </ul>
              </div>
              <div className="p-8 md:p-10">
                <span className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold font-sans mb-4">APRES SOS HUB CANADA</span>
                <h3 className="text-lg font-bold text-navy mb-3">Installes a Montreal en 8 mois</h3>
                <ul className="space-y-2 text-sm text-gray-500 font-sans">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Score CRS optimise de 420 a 478 points</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> ITA recue au 3e tirage apres optimisation</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Residence permanente obtenue pour toute la famille</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Logement, ecoles et emploi organises avant l&apos;arrivee</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="scroll-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-gold/20 mb-2" />
                <p className="text-gray-600 font-sans text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={44}
                    height={44}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-navy text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 font-sans">{t.origin} — {t.program}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 8. COMMUNAUTES ========== */}
      <CommunautesSection />

      {/* ========== 9. FAQ ========== */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">Questions frequentes</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="space-y-4">
            {[
              { q: 'Comment immigrer au Canada depuis la France, le Maroc ou l\'Afrique?', a: 'Plusieurs programmes s\'offrent a vous: Entree Express (federal), PEQ (Quebec), permis de travail via la mobilite francophone, ou parrainage familial. Notre equipe analyse votre profil gratuitement pour identifier la meilleure voie.' },
              { q: 'Combien de temps prend un processus d\'immigration au Canada?', a: 'Les delais varient selon le programme: Entree Express 6-8 mois, PEQ 6-12 mois, permis de travail 2-6 mois, parrainage conjugal 12-18 mois. Nous vous donnerons une estimation realiste lors de la consultation gratuite.' },
              { q: 'Qu\'est-ce que le score CRS et comment l\'ameliorer?', a: 'Le score CRS (Comprehensive Ranking System) classe les candidats a l\'Entree Express selon l\'age, les etudes, l\'experience et les langues. Notre calculateur gratuit vous donne une estimation, et nos experts identifient des strategies pour maximiser votre score.' },
              { q: 'Est-ce que l\'evaluation d\'admissibilite est vraiment gratuite?', a: 'Oui, notre test d\'admissibilite en ligne et la premiere analyse de votre profil sont entierement gratuits et sans engagement. Contactez-nous pour une consultation personnalisee.' },
              { q: 'Satisfaction garantie ou remboursee?', a: 'Oui. Si vous n\'etes pas satisfait de notre service de consultation, nous vous remboursons integralement. Votre confiance est notre priorite. Nous nous engageons a fournir un accompagnement de qualite ou a vous rembourser.' },
            ].map((faq, i) => (
              <details key={i} className="group scroll-hidden bg-cream rounded-2xl border border-gray-100 overflow-hidden" style={{ transitionDelay: `${i * 50}ms` }}>
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-navy hover:text-gold-dark transition-colors font-sans">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform duration-300 shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-500 leading-relaxed font-sans">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 10. FINAL CTA ========== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image src={IMAGES.ctaBg} alt="Canada" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy/92" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 scroll-hidden">
            Votre reve canadien commence ici
          </h2>
          <p className="text-white/60 text-lg mb-4 max-w-2xl mx-auto font-sans scroll-hidden">
            Testez votre admissibilite en 2 minutes. Notre equipe vous contacte dans les 24h avec un plan d&apos;action personnalise.
          </p>

          {/* Guarantee badge */}
          <div className="inline-flex items-center gap-3 px-5 py-3 glass rounded-full mb-10 scroll-hidden">
            <Shield className="w-5 h-5 text-gold" />
            <span className="text-white/80 text-sm font-sans font-medium">Satisfaction garantie ou remboursee</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-10 scroll-hidden">
            <div className="flex items-center gap-2 text-white/50 text-sm font-sans"><Shield className="w-4 h-4 text-gold" /> Confidentiel</div>
            <div className="flex items-center gap-2 text-white/50 text-sm font-sans"><Zap className="w-4 h-4 text-gold" /> Resultat en 24h</div>
            <div className="flex items-center gap-2 text-white/50 text-sm font-sans"><BadgeCheck className="w-4 h-4 text-gold" /> Sans engagement</div>
            <div className="flex items-center gap-2 text-white/50 text-sm font-sans"><Star className="w-4 h-4 text-gold" /> 500+ familles</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-hidden">
            <Link href="/admissibilite" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-gold/30 transition-all text-lg hover:scale-105 font-sans animate-pulse-gold glow-gold">
              Evaluation gratuite <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/15145330482?text=Bonjour%2C%20je%20souhaite%20des%20informations%20sur%20l%27immigration%20au%20Canada"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all text-lg font-sans hover:shadow-lg"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </a>
          </div>

          <p className="text-xs text-white/30 mt-6 font-sans scroll-hidden">
            +1 (514) 533-0482 - 3737 Cremazie Est #402, Montreal QC
          </p>
        </div>
      </section>
    </>
  );
}
