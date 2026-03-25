'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import {
  ArrowRight, CheckCircle2, Users, FileText, Globe2, Shield,
  Star, TrendingUp, Award, MapPin, Clock, Sparkles, ChevronRight,
  GraduationCap, Briefcase, Heart, Plane, Quote, Play
} from 'lucide-react';

const programs = [
  {
    icon: TrendingUp,
    title: 'Entrée Express',
    desc: 'Programme fédéral pour travailleurs qualifiés. Score CRS, tirage au sort et résidence permanente.',
    tags: ['FSW', 'CEC', 'FST'],
    color: 'from-blue-500 to-blue-700',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&h=250&fit=crop',
  },
  {
    icon: Award,
    title: 'PEQ Québec',
    desc: 'Programme de l\'expérience québécoise pour diplômés et travailleurs temporaires au Québec.',
    tags: ['Diplômés', 'Travailleurs', 'CSQ'],
    color: 'from-emerald-500 to-emerald-700',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop',
  },
  {
    icon: Briefcase,
    title: 'Permis de travail',
    desc: 'Permis fermé ou ouvert. EIMT/LMIA, mobilité francophone, permis post-diplôme (PGWP).',
    tags: ['EIMT', 'PTMO', 'PGWP'],
    color: 'from-purple-500 to-purple-700',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop',
  },
  {
    icon: GraduationCap,
    title: 'Permis d\'études',
    desc: 'Étudiez au Canada avec possibilité de travail. Accès au permis post-diplôme après les études.',
    tags: ['CAQ', 'DLI', 'Co-op'],
    color: 'from-amber-500 to-amber-700',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
  },
  {
    icon: Heart,
    title: 'Parrainage familial',
    desc: 'Parrainez votre conjoint, vos parents ou vos enfants pour la résidence permanente au Canada.',
    tags: ['Conjoint', 'Parents', 'Enfants'],
    color: 'from-rose-500 to-rose-700',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=250&fit=crop',
  },
  {
    icon: Plane,
    title: 'Relocalisation',
    desc: 'Service complet d\'intégration: logement, emploi, inscription scolaire, ouverture de compte.',
    tags: ['Logement', 'Emploi', 'Intégration'],
    color: 'from-cyan-500 to-cyan-700',
    image: 'https://images.unsplash.com/photo-1519832979-6fa011b87667?w=400&h=250&fit=crop',
  },
];

const steps = [
  { step: '01', title: 'Évaluation gratuite', desc: 'Remplissez notre formulaire d\'admissibilité en ligne pour une première analyse de votre profil.', icon: Sparkles },
  { step: '02', title: 'Consultation personnalisée', desc: 'Un de nos conseillers vous contacte pour discuter des options et du plan d\'action.', icon: Users },
  { step: '03', title: 'Constitution du dossier', desc: 'Nous préparons et vérifions l\'ensemble de vos documents avec rigueur.', icon: FileText },
  { step: '04', title: 'Soumission et suivi', desc: 'Dépôt auprès de IRCC/MIFI et suivi jusqu\'à l\'obtention de votre statut.', icon: CheckCircle2 },
];

const testimonials = [
  {
    name: 'Marie-Claire D.',
    origin: 'France',
    program: 'PEQ - Diplômés',
    text: 'Grâce à SOS Hub Canada, j\'ai obtenu mon CSQ en seulement 4 mois après mon diplôme. Leur connaissance du processus québécois est impressionnante.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Ahmed K.',
    origin: 'Maroc',
    program: 'Entrée Express',
    text: 'Un accompagnement professionnel du début à la fin. Mon score CRS a été optimisé et j\'ai reçu mon ITA au deuxième tirage. Merci infiniment!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Sofia L.',
    origin: 'Colombie',
    program: 'Permis de travail',
    text: 'L\'équipe m\'a aidée avec mon EIMT et mon permis de travail fermé. Processus clair, communication constante. Je recommande à 100%.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ========== HERO WITH IMAGE ========== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1920&h=1080&fit=crop"
          alt="Skyline de Montréal"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-40 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-5 py-2 glass rounded-full text-gold text-sm font-medium mb-8 animate-fade-in font-sans">
              <Sparkles className="w-4 h-4" />
              Évaluation d&apos;admissibilité gratuite
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 animate-fade-in-up">
              Votre avenir au{' '}
              <span className="text-gradient-gold">Canada</span>{' '}
              commence ici
            </h1>

            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl leading-relaxed animate-fade-in-up delay-100 font-sans">
              Service de relocalisation et d&apos;intégration à Montréal. Nous vous accompagnons dans toutes les étapes de votre projet d&apos;installation et d&apos;intégration au Canada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-14 animate-fade-in-up delay-200">
              <Link
                href="/admissibilite"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-gold/30 transition-all text-lg animate-pulse-gold hover:scale-105 font-sans"
              >
                Tester mon admissibilité
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 glass text-white font-semibold rounded-xl hover:bg-white/20 transition-all font-sans"
              >
                <Play className="w-4 h-4" />
                Nos services
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-8 text-white/40 text-sm animate-fade-in-up delay-300 font-sans">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold" />
                <span>Consultation confidentielle</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" />
                <span>Réponse en 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                <span>Montréal, Québec</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-gold" />
                <span>4 langues parlées</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-3 bg-gold rounded-full animate-fade-in" />
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="bg-white py-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl shadow-navy/10 border border-gray-100 -mt-16 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { value: 500, suffix: '+', label: 'Dossiers traités' },
              { value: 95, suffix: '%', label: 'Taux de satisfaction' },
              { value: 50, suffix: '+', label: 'Programmes maîtrisés' },
              { value: 24, suffix: 'h', label: 'Délai de réponse' },
            ].map((s, i) => (
              <div key={i} className="p-6 md:p-8 text-center group">
                <div className="text-3xl md:text-4xl font-bold text-navy mb-1 font-serif">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-gray-400 font-sans">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PROGRAMMES WITH IMAGES ========== */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Nos programmes</span>
            <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">
              Tous les chemins vers le Canada
            </h2>
            <div className="divider-gold mx-auto mt-4 mb-6" />
            <p className="text-gray-500 max-w-2xl mx-auto font-sans">
              Découvrez les programmes d&apos;immigration fédéraux et provinciaux adaptés à votre profil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((p, i) => (
              <div
                key={i}
                className="scroll-hidden group bg-white border border-gray-100 rounded-2xl overflow-hidden card-premium"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover img-zoom group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className={`absolute bottom-4 left-4 w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg`}>
                    <p.icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-gold-dark transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed font-sans">{p.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 bg-cream text-gray-500 rounded-full font-sans font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 scroll-hidden">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-all hover:shadow-lg font-sans"
            >
              Voir tous nos services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== LEAD MAGNET SECTION ========== */}
      <section className="py-24 md:py-32 bg-cream relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="scroll-hidden-left">
              <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Outils gratuits</span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">
                Évaluez vos chances gratuitement
              </h2>
              <div className="divider-gold mt-4 mb-6" />
              <p className="text-gray-500 mb-10 leading-relaxed font-sans text-lg">
                Utilisez nos outils en ligne pour obtenir une première évaluation de votre admissibilité.
                Ces résultats partiels vous donneront un aperçu de vos options — contactez-nous pour une analyse complète et personnalisée.
              </p>

              <div className="space-y-4">
                <Link
                  href="/admissibilite"
                  className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-gold/30 hover:shadow-xl transition-all group card-premium"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-navy text-lg group-hover:text-gold-dark transition-colors">Test d&apos;admissibilité</h3>
                    <p className="text-sm text-gray-400 font-sans">Découvrez les programmes auxquels vous pourriez être éligible</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/calculateur-crs"
                  className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-gold/30 hover:shadow-xl transition-all group card-premium"
                >
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

            {/* Visual card */}
            <div className="scroll-hidden-right">
              <div className="relative">
                {/* Background image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=700&fit=crop"
                    alt="Accompagnement et orientation"
                    width={600}
                    height={700}
                    className="object-cover w-full h-[500px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Globe2 className="w-6 h-6 text-gold" />
                      Pourquoi nous choisir?
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Expertise IRCC et MIFI',
                        'Programmes québécois (PEQ, PRTQ, Arrima)',
                        'Suivi personnalisé de A à Z',
                        'Service multilingue (FR, EN, AR, ES)',
                        'Frais d\'ouverture: 250$ CAD',
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                          <span className="text-white/80 text-sm font-sans">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-colors font-sans"
                      >
                        Consultation gratuite <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 glass-white rounded-2xl p-4 shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">95%</p>
                      <p className="text-[10px] text-gray-400 font-sans">Satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PROCESS ========== */}
      <section className="py-24 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Notre processus</span>
            <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">
              Simple, transparent, efficace
            </h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center scroll-hidden" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center mx-auto mb-6 border border-gold/20 animate-border-glow group hover:shadow-lg transition-all">
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

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-24 md:py-32 bg-navy relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gold rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Témoignages</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">
              Ils nous ont fait confiance
            </h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="scroll-hidden glass rounded-2xl p-8 hover:bg-white/12 transition-all" style={{ transitionDelay: `${i * 100}ms` }}>
                <Quote className="w-10 h-10 text-gold/30 mb-4" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6 italic font-sans">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gold/70 font-sans">{t.origin} — {t.program}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">
              Questions fréquentes
            </h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Quels sont les frais pour ouvrir un dossier?',
                a: 'Les frais d\'ouverture de dossier sont de 250$ CAD, non remboursables. Ce montant couvre l\'analyse initiale de votre dossier et la première consultation. Les honoraires complets dépendent du programme choisi et vous seront détaillés sur devis.',
              },
              {
                q: 'Combien de temps prend un processus d\'immigration?',
                a: 'Les délais varient selon le programme: Entrée Express peut prendre 6-8 mois, le PEQ environ 6-12 mois, un permis de travail 2-6 mois. Nous vous donnerons une estimation réaliste lors de la consultation.',
              },
              {
                q: 'Est-ce que le test d\'admissibilité en ligne est fiable?',
                a: 'Notre test en ligne fournit une première indication basée sur les critères principaux. Pour une analyse complète et précise tenant compte de tous les facteurs de votre profil, nous recommandons une consultation personnalisée avec notre équipe.',
              },
              {
                q: 'Travaillez-vous avec IRCC et le MIFI?',
                a: 'Nous préparons et soumettons vos demandes auprès d\'Immigration, Réfugiés et Citoyenneté Canada (IRCC) au niveau fédéral et au Ministère de l\'Immigration, de la Francisation et de l\'Intégration (MIFI) au niveau provincial.',
              },
              {
                q: 'En quelles langues offrez-vous vos services?',
                a: 'Notre équipe offre ses services en français, anglais, arabe et espagnol. Nous pouvons ainsi accompagner une clientèle diversifiée dans leur langue de préférence.',
              },
            ].map((faq, i) => (
              <details key={i} className="group scroll-hidden bg-cream rounded-2xl border border-gray-100 overflow-hidden" style={{ transitionDelay: `${i * 50}ms` }}>
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-navy hover:text-gold-dark transition-colors font-sans">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform duration-300 shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-500 leading-relaxed font-sans">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-12 scroll-hidden">
            <Link href="/contact" className="inline-flex items-center gap-2 text-gold font-semibold hover:text-gold-dark transition-colors font-sans">
              D&apos;autres questions? Contactez-nous <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== PARTNERS / TRUST ========== */}
      <section className="py-16 bg-cream border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs text-gray-400 uppercase tracking-[0.2em] mb-8 font-sans">Nous travaillons avec les programmes officiels</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-300">
            {[
              { name: 'IRCC', sub: 'Fédéral' },
              { name: 'MIFI', sub: 'Québec' },
              { name: 'Arrima', sub: 'Portail QC' },
              { name: 'EIMT/LMIA', sub: 'Employeurs' },
              { name: 'Entrée Express', sub: 'Fédéral' },
            ].map(p => (
              <div key={p.name} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="font-bold text-sm text-gray-400">{p.name}</span>
                </div>
                <span className="text-[10px] text-gray-300 font-sans">{p.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1462536943532-57a629f6cc60?w=1920&h=800&fit=crop"
          alt="Canada landscape"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy/90" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 scroll-hidden">
            Prêt à commencer votre nouvelle vie au Canada?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto font-sans scroll-hidden">
            Faites le premier pas. Notre équipe d&apos;experts est là pour vous guider à chaque étape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-hidden">
            <Link
              href="/admissibilite"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-gold/30 transition-all text-lg hover:scale-105 font-sans"
            >
              Évaluation gratuite <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 glass text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-lg font-sans"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
