'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { VideoTestimonial } from '@/components/VideoTestimonial';
import {
  ArrowRight, CheckCircle2, Users, FileText, Globe2, Shield,
  Star, TrendingUp, Award, MapPin, Clock, Sparkles, ChevronRight,
  GraduationCap, Briefcase, Heart, Plane, Quote, Play,
  Send, Loader2, Phone
} from 'lucide-react';

/* ===== IMAGES - Familles heureuses et diversifiées ===== */
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1920&h=1080&fit=crop&crop=faces',
  familyAirport: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=500&fit=crop&crop=faces',
  familyPark: 'https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=600&h=700&fit=crop',
  happyCouple: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
  graduationJoy: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=400&h=250&fit=crop',
  happyCoupleCity: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=400&h=250&fit=crop',
  diverseGroup: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=250&fit=crop',
  kidSchool: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
  newHome: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=250&fit=crop',
  ctaBg: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1920&h=800&fit=crop',
  montreal: 'https://images.unsplash.com/photo-1519178614-68673b201f36?w=800&h=400&fit=crop',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop',
};

const programs = [
  {
    icon: TrendingUp, title: 'Entrée Express',
    desc: 'Programme fédéral pour travailleurs qualifiés. Score CRS, tirage au sort et résidence permanente.',
    tags: ['FSW', 'CEC', 'FST'], color: 'from-blue-500 to-blue-700',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&h=250&fit=crop',
  },
  {
    icon: Award, title: 'PEQ Québec',
    desc: 'Programme de l\'expérience québécoise pour diplômés et travailleurs temporaires.',
    tags: ['Diplômés', 'Travailleurs', 'CSQ'], color: 'from-emerald-500 to-emerald-700',
    image: IMAGES.montreal,
  },
  {
    icon: Briefcase, title: 'Permis de travail',
    desc: 'Permis fermé ou ouvert. EIMT/LMIA, mobilité francophone, permis post-diplôme.',
    tags: ['EIMT', 'PTMO', 'PGWP'], color: 'from-purple-500 to-purple-700',
    image: IMAGES.office,
  },
  {
    icon: GraduationCap, title: 'Permis d\'études',
    desc: 'Étudiez au Canada avec possibilité de travail et accès au permis post-diplôme.',
    tags: ['CAQ', 'DLI', 'Co-op'], color: 'from-amber-500 to-amber-700',
    image: IMAGES.graduationJoy,
  },
  {
    icon: Heart, title: 'Parrainage familial',
    desc: 'Parrainez votre conjoint, vos parents ou vos enfants pour la résidence permanente.',
    tags: ['Conjoint', 'Parents', 'Enfants'], color: 'from-rose-500 to-rose-700',
    image: IMAGES.happyCouple,
  },
  {
    icon: Plane, title: 'Relocalisation',
    desc: 'Service complet: logement, emploi, inscription scolaire, ouverture de compte.',
    tags: ['Logement', 'Emploi', 'Intégration'], color: 'from-cyan-500 to-cyan-700',
    image: IMAGES.newHome,
  },
];

const steps = [
  { step: '01', title: 'Évaluation gratuite', desc: 'Remplissez notre formulaire d\'admissibilité en ligne pour une première analyse de votre profil.', icon: Sparkles },
  { step: '02', title: 'Consultation personnalisée', desc: 'Un membre de notre équipe vous contacte pour discuter des options et du plan d\'action.', icon: Users },
  { step: '03', title: 'Constitution du dossier', desc: 'Nous préparons et vérifions l\'ensemble de vos documents avec rigueur et précision.', icon: FileText },
  { step: '04', title: 'Soumission et suivi', desc: 'Dépôt auprès des autorités compétentes et suivi jusqu\'à l\'obtention de votre statut.', icon: CheckCircle2 },
];

const testimonials = [
  {
    name: 'Marie-Claire D.', origin: 'France', program: 'PEQ - Diplômés',
    text: 'Grâce à SOS Hub Canada, j\'ai obtenu mon CSQ en seulement 4 mois après mon diplôme. Leur connaissance du processus québécois est impressionnante.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Ahmed K.', origin: 'Maroc', program: 'Entrée Express',
    text: 'Un accompagnement professionnel du début à la fin. Mon score CRS a été optimisé et j\'ai reçu mon ITA au deuxième tirage. Merci infiniment!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Sofia L.', origin: 'Colombie', program: 'Permis de travail',
    text: 'L\'équipe m\'a aidée avec mon EIMT et mon permis de travail fermé. Processus clair, communication constante. Je recommande à 100%.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Jean-Baptiste M.', origin: 'Cameroun', program: 'Relocalisation',
    text: 'Toute ma famille a été accompagnée pour notre installation à Montréal. Logement, école pour les enfants, tout a été géré. On se sent chez nous!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
  },
];

const successStories = [
  { image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=300&h=300&fit=crop&crop=face', country: '🇫🇷 France' },
  { image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face', country: '🇲🇦 Maroc' },
  { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face', country: '🇧🇷 Brésil' },
  { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', country: '🇹🇳 Tunisie' },
  { image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face', country: '🇨🇴 Colombie' },
  { image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face', country: '🇨🇲 Cameroun' },
  { image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face', country: '🇭🇹 Haïti' },
  { image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', country: '🇩🇿 Algérie' },
];

export default function HomePage() {
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

  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <Image src={IMAGES.hero} alt="Famille heureuse au Canada" fill sizes="100vw" className="object-cover object-top animate-kenburns" priority quality={90} />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 bg-gold/15 rounded-full animate-particle" style={{ left: `${20 + i * 20}%`, top: `${30 + (i % 2) * 30}%`, animationDelay: `${i * 1.2}s` }} />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-40 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2 glass rounded-full text-gold text-sm font-medium mb-8 animate-fade-in font-sans glow-gold">
                <Sparkles className="w-4 h-4" />
                +500 familles accompagnées — Évaluation gratuite en 2 min
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6 animate-fade-in-up">
                Immigrer au{' '}
                <span className="text-gradient-gold">Canada</span>{' '}
                avec confiance
              </h1>

              <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl leading-relaxed animate-fade-in-up delay-100 font-sans">
                Entrée Express, PEQ Québec, permis de travail, parrainage familial — notre équipe multilingue à Montréal vous accompagne de A à Z. Résultat en 24h.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in-up delay-200">
                <Link href="/admissibilite" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-gold/30 transition-all text-lg animate-pulse-gold hover:scale-105 font-sans glow-gold">
                  Tester mon admissibilité <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="tel:+15145330482" className="inline-flex items-center justify-center gap-2 px-8 py-4 glass text-white font-semibold rounded-xl hover:bg-white/20 transition-all font-sans">
                  <Phone className="w-4 h-4" /> +1 (514) 533-0482
                </a>
              </div>

              <div className="flex flex-wrap gap-8 text-white/40 text-sm animate-fade-in-up delay-300 font-sans">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-gold" /><span>Confidentiel</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /><span>Réponse 24h</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /><span>Montréal</span></div>
                <div className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-gold" /><span>4 langues</span></div>
              </div>
            </div>

            {/* Hero floating image card */}
            <div className="hidden lg:block animate-fade-in-up delay-300">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                  <Image src={IMAGES.familyAirport} alt="Famille heureuse à l'aéroport" width={500} height={350} className="object-cover w-full h-[350px] animate-kenburns" />
                </div>
                <div className="absolute -bottom-6 -left-6 glass-white rounded-2xl p-4 shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-navy font-sans">500+</p>
                      <p className="text-xs text-gray-400 font-sans">Familles accompagnées</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 glass-white rounded-2xl p-3 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />)}
                    </div>
                    <span className="text-xs font-bold text-navy font-sans">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-3 bg-gold rounded-full animate-slide-up" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }} />
          </div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF BAR ========== */}
      <section className="bg-white py-6 border-b border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-sans font-semibold">Nos clients viennent de:</span>
            <div className="flex -space-x-3">
              {successStories.map((s, i) => (
                <div key={i} className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md hover:scale-110 hover:z-10 transition-transform" title={s.country}>
                  <Image src={s.image} alt={s.country} fill sizes="40px" className="object-cover" />
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

      {/* ========== STATS ========== */}
      <section className="bg-white py-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl shadow-navy/10 border border-gray-100 -mt-1 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { value: 500, suffix: '+', label: 'Familles accompagnées' },
              { value: 95, suffix: '%', label: 'Taux de satisfaction' },
              { value: 50, suffix: '+', label: 'Programmes maîtrisés' },
              { value: 24, suffix: 'h', label: 'Délai de réponse' },
            ].map((s, i) => (
              <div key={i} className="p-6 md:p-8 text-center group hover:bg-gold/5 transition-colors">
                <div className="text-3xl md:text-4xl font-bold text-navy mb-1 font-serif">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-gray-400 font-sans">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HAPPY FAMILIES SHOWCASE ========== */}
      <section className="py-24 md:py-32 bg-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Images mosaic */}
            <div className="scroll-hidden-left relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative h-[220px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                    <Image src={IMAGES.happyCouple} alt="Couple heureux" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="relative h-[180px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                    <Image src={IMAGES.kidSchool} alt="Enfant à l'école" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative h-[180px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                    <Image src={IMAGES.happyCoupleCity} alt="Couple heureux au Canada" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="relative h-[220px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                    <Image src={IMAGES.graduationJoy} alt="Graduation" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </div>
              {/* Overlay badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-white rounded-2xl p-5 shadow-2xl text-center">
                <p className="text-3xl font-bold text-navy font-serif">500+</p>
                <p className="text-xs text-gray-500 font-sans">Familles heureuses</p>
              </div>
            </div>

            {/* Content */}
            <div className="scroll-hidden-right">
              <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Pourquoi nous choisir</span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">
                +500 familles heureuses au Canada grâce à nous
              </h2>
              <div className="divider-gold mt-4 mb-6" />
              <p className="text-gray-500 mb-8 leading-relaxed font-sans text-lg">
                Depuis Montréal, nous accompagnons des familles du monde entier — France, Maroc, Tunisie, Cameroun, Haïti, Colombie — dans leur projet d&apos;immigration au Canada.
                Évaluation gratuite, suivi personnalisé, résultat garanti.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { title: 'Accompagnement personnalisé', desc: 'Chaque famille est unique. Nous adaptons nos services à votre situation.' },
                  { title: 'Expertise multi-programmes', desc: 'Entrée Express, PEQ, permis de travail, parrainage — nous maîtrisons tous les programmes.' },
                  { title: 'Service multilingue', desc: 'Français, anglais, arabe et espagnol pour mieux vous servir.' },
                  { title: 'Intégration complète', desc: 'Logement, école, emploi, démarches — on s\'occupe de tout.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gold/20 hover:shadow-md transition-all">
                    <CheckCircle2 className="w-6 h-6 text-gold shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-navy text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-400 font-sans mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/admissibilite" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all font-sans">
                Commencer maintenant <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PROGRAMMES ========== */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Nos programmes</span>
            <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">Tous les chemins vers le Canada</h2>
            <div className="divider-gold mx-auto mt-4 mb-6" />
            <p className="text-gray-500 max-w-2xl mx-auto font-sans">
              Découvrez les programmes d&apos;immigration fédéraux et provinciaux adaptés à votre profil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((p, i) => (
              <div key={i} className="scroll-hidden group bg-white border border-gray-100 rounded-2xl overflow-hidden card-premium" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="relative h-48 overflow-hidden">
                  <Image src={p.image} alt={p.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className={`absolute bottom-4 left-4 w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg`}>
                    <p.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-gold-dark transition-colors">{p.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed font-sans">{p.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 bg-cream text-gray-500 rounded-full font-sans font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 scroll-hidden">
            <Link href="/services" className="inline-flex items-center gap-2 px-8 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-all hover:shadow-lg font-sans">
              Voir tous nos services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== LEAD MAGNET ========== */}
      <section className="py-24 md:py-32 bg-cream relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="scroll-hidden-left">
              <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Outils gratuits</span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">Évaluez vos chances gratuitement</h2>
              <div className="divider-gold mt-4 mb-6" />
              <p className="text-gray-500 mb-10 leading-relaxed font-sans text-lg">
                Nos outils en ligne vous donnent un premier aperçu de vos options — contactez-nous pour une analyse complète et personnalisée.
              </p>

              <div className="space-y-4">
                <Link href="/admissibilite" className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-gold/30 hover:shadow-xl transition-all group card-premium">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-navy text-lg group-hover:text-gold-dark transition-colors">Test d&apos;admissibilité</h3>
                    <p className="text-sm text-gray-400 font-sans">Découvrez les programmes accessibles pour votre profil</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </Link>

                <Link href="/calculateur-crs" className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-gold/30 hover:shadow-xl transition-all group card-premium">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-7 h-7 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-navy text-lg group-hover:text-gold-dark transition-colors">Calculateur CRS partiel</h3>
                    <p className="text-sm text-gray-400 font-sans">Estimez votre score CRS pour Entrée Express</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

            <div className="scroll-hidden-right">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src={IMAGES.familyPark} alt="Famille heureuse au parc" width={600} height={700} className="object-cover w-full h-[520px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Globe2 className="w-6 h-6 text-gold" /> Ce que nous offrons
                  </h3>
                  <ul className="space-y-3">
                    {['Expertise IRCC et MIFI', 'Programmes québécois (PEQ, PRTQ, Arrima)', 'Suivi personnalisé de A à Z', 'Service multilingue (FR, EN, AR, ES)', 'Évaluation d\'admissibilité gratuite'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gold shrink-0" /><span className="text-white/80 text-sm font-sans">{item}</span></li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-colors font-sans">
                      Consultation gratuite <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 glass-white rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-sm font-bold text-navy">95%</p><p className="text-[10px] text-gray-400 font-sans">Satisfaction</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PROCESS ========== */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Notre processus</span>
            <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">Simple, transparent, efficace</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center scroll-hidden" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center mx-auto mb-6 border border-gold/20 animate-border-glow hover:shadow-lg hover:scale-110 transition-all cursor-default">
                  <s.icon className="w-8 h-8 text-gold" />
                </div>
                <span className="text-xs text-gold font-bold tracking-wider font-sans">ÉTAPE {s.step}</span>
                <h3 className="font-bold text-navy mt-1 mb-3 text-lg">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-sans">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[65%] w-[70%] h-px bg-gradient-to-r from-gold/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== VIDEO TESTIMONIALS ========== */}
      <VideoTestimonial />

      {/* ========== NEWSLETTER ========== */}
      <section className="py-16 bg-gradient-to-r from-gold-dark via-gold to-gold-light relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Restez informé des dernières nouvelles</h2>
          <p className="text-white/80 mb-8 font-sans">Tirages Entrée Express, changements de programmes, conseils — directement dans votre boîte courriel.</p>
          {nlSent ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-xl text-white font-semibold font-sans">
              <CheckCircle2 className="w-5 h-5" /> Merci! Vous êtes inscrit.
            </div>
          ) : (
            <>
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input type="email" required value={nlEmail} onChange={e => setNlEmail(e.target.value)} placeholder="Votre courriel" className="flex-1 px-5 py-3.5 rounded-xl border-0 outline-none text-navy font-sans shadow-lg" />
                <button type="submit" disabled={nlLoading} className="px-8 py-3.5 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-colors flex items-center justify-center gap-2 font-sans shadow-lg disabled:opacity-50">
                  {nlLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  S&apos;inscrire
                </button>
              </form>
              {nlError && (
                <p className="text-white/90 text-sm mt-3 font-sans">Une erreur est survenue. Veuillez réessayer ou nous contacter directement.</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">Questions fréquentes</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="space-y-4">
            {[
              { q: 'Comment immigrer au Canada depuis la France, le Maroc ou l\'Afrique?', a: 'Plusieurs programmes s\'offrent à vous: Entrée Express (fédéral), PEQ (Québec), permis de travail via la mobilité francophone, ou parrainage familial. Notre équipe analyse votre profil gratuitement pour identifier la meilleure voie.' },
              { q: 'Combien de temps prend un processus d\'immigration au Canada?', a: 'Les délais varient selon le programme: Entrée Express 6-8 mois, PEQ 6-12 mois, permis de travail 2-6 mois, parrainage conjugal 12-18 mois. Nous vous donnerons une estimation réaliste lors de la consultation gratuite.' },
              { q: 'Qu\'est-ce que le score CRS et comment l\'améliorer?', a: 'Le score CRS (Comprehensive Ranking System) classe les candidats à l\'Entrée Express selon l\'âge, les études, l\'expérience et les langues. Notre calculateur gratuit vous donne une estimation, et nos experts identifient des stratégies pour maximiser votre score.' },
              { q: 'Peut-on travailler au Canada avec un permis d\'études?', a: 'Oui! Les étudiants internationaux peuvent travailler jusqu\'à 20h/semaine pendant les études et à temps plein pendant les vacances. Après le diplôme, le permis post-diplôme (PGWP) permet de travailler jusqu\'à 3 ans.' },
              { q: 'En quelles langues offrez-vous vos services?', a: 'Notre équipe offre ses services en français, anglais, arabe et espagnol pour accompagner les candidats du monde entier.' },
              { q: 'Est-ce que l\'évaluation d\'admissibilité est vraiment gratuite?', a: 'Oui, notre test d\'admissibilité en ligne et la première analyse de votre profil sont entièrement gratuits et sans engagement. Contactez-nous pour une consultation personnalisée.' },
              { q: 'Où êtes-vous situés à Montréal?', a: 'Nos bureaux sont au 3737 Crémazie Est #402, Montréal QC H1Z 2K4, facilement accessible en métro (station Crémazie). Nous offrons aussi des consultations à distance par vidéoconférence.' },
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

      {/* ========== PARTNERS ========== */}
      <section className="py-16 bg-cream border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs text-gray-400 uppercase tracking-[0.2em] mb-8 font-sans">Programmes officiels</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-300">
            {[{ name: 'IRCC', sub: 'Fédéral' }, { name: 'MIFI', sub: 'Québec' }, { name: 'Arrima', sub: 'Portail QC' }, { name: 'EIMT/LMIA', sub: 'Employeurs' }, { name: 'Entrée Express', sub: 'Fédéral' }].map(p => (
              <div key={p.name} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2"><FileText className="w-5 h-5" /><span className="font-bold text-sm text-gray-400">{p.name}</span></div>
                <span className="text-[10px] text-gray-300 font-sans">{p.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image src={IMAGES.ctaBg} alt="Canada" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy/90" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 scroll-hidden">Votre projet d&apos;immigration commence maintenant</h2>
          <p className="text-white/60 text-lg mb-4 max-w-2xl mx-auto font-sans scroll-hidden">
            Testez votre admissibilité en 2 minutes. Notre équipe vous contacte dans les 24h avec un plan d&apos;action personnalisé.
          </p>
          <p className="text-gold font-semibold text-sm mb-10 scroll-hidden font-sans">
            Rejoignez les +500 familles qui ont choisi SOS Hub Canada
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-hidden">
            <Link href="/admissibilite" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-gold/30 transition-all text-lg hover:scale-105 font-sans">
              Évaluation gratuite <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-10 py-4 glass text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-lg font-sans">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
