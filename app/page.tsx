'use client';

import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, Users, FileText, Globe2, Shield,
  Star, TrendingUp, Award, MapPin, Clock, Sparkles, ChevronRight,
  GraduationCap, Briefcase, Heart, Plane
} from 'lucide-react';

const programs = [
  {
    icon: TrendingUp,
    title: 'Entrée Express',
    desc: 'Programme fédéral pour travailleurs qualifiés. Score CRS, tirage au sort et résidence permanente.',
    tags: ['FSW', 'CEC', 'FST'],
    color: 'from-blue-500 to-blue-700',
  },
  {
    icon: Award,
    title: 'PEQ Québec',
    desc: 'Programme de l\'expérience québécoise pour diplômés et travailleurs temporaires au Québec.',
    tags: ['Diplômés', 'Travailleurs', 'CSQ'],
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    icon: Briefcase,
    title: 'Permis de travail',
    desc: 'Permis fermé ou ouvert. EIMT/LMIA, mobilité francophone, permis post-diplôme (PGWP).',
    tags: ['EIMT', 'PTMO', 'PGWP'],
    color: 'from-purple-500 to-purple-700',
  },
  {
    icon: GraduationCap,
    title: 'Permis d\'études',
    desc: 'Étudiez au Canada avec possibilité de travail. Accès au permis post-diplôme après les études.',
    tags: ['CAQ', 'DLI', 'Co-op'],
    color: 'from-amber-500 to-amber-700',
  },
  {
    icon: Heart,
    title: 'Parrainage familial',
    desc: 'Parrainez votre conjoint, vos parents ou vos enfants pour la résidence permanente au Canada.',
    tags: ['Conjoint', 'Parents', 'Enfants'],
    color: 'from-rose-500 to-rose-700',
  },
  {
    icon: Plane,
    title: 'Relocalisation',
    desc: 'Service complet d\'intégration: logement, emploi, inscription scolaire, ouverture de compte.',
    tags: ['Logement', 'Emploi', 'Intégration'],
    color: 'from-cyan-500 to-cyan-700',
  },
];

const stats = [
  { value: '500+', label: 'Dossiers traités' },
  { value: '95%', label: 'Taux de satisfaction' },
  { value: '50+', label: 'Programmes maîtrisés' },
  { value: '24h', label: 'Délai de réponse' },
];

const steps = [
  { step: '01', title: 'Évaluation gratuite', desc: 'Remplissez notre formulaire d\'admissibilité en ligne pour une première analyse de votre profil.' },
  { step: '02', title: 'Consultation personnalisée', desc: 'Un de nos conseillers vous contacte pour discuter des options et du plan d\'action.' },
  { step: '03', title: 'Constitution du dossier', desc: 'Nous préparons et vérifions l\'ensemble de vos documents avec rigueur.' },
  { step: '04', title: 'Soumission et suivi', desc: 'Dépôt auprès de IRCC/MIFI et suivi jusqu\'à l\'obtention de votre statut.' },
];

const testimonials = [
  {
    name: 'Marie-Claire D.',
    origin: 'France',
    program: 'PEQ - Diplômés',
    text: 'Grâce à SOS Hub Canada, j\'ai obtenu mon CSQ en seulement 4 mois après mon diplôme. Leur connaissance du processus québécois est impressionnante.',
    rating: 5,
  },
  {
    name: 'Ahmed K.',
    origin: 'Maroc',
    program: 'Entrée Express',
    text: 'Un accompagnement professionnel du début à la fin. Mon score CRS a été optimisé et j\'ai reçu mon ITA au deuxième tirage. Merci infiniment!',
    rating: 5,
  },
  {
    name: 'Sofia L.',
    origin: 'Colombie',
    program: 'Permis de travail',
    text: 'L\'équipe m\'a aidée avec mon EIMT et mon permis de travail fermé. Processus clair, communication constante. Je recommande à 100%.',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative bg-navy overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Évaluation d&apos;admissibilité gratuite
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
              Votre avenir au{' '}
              <span className="text-gradient-gold">Canada</span>{' '}
              commence ici
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl leading-relaxed animate-fade-in-up delay-100">
              Cabinet de consultation en immigration à Montréal. Nous vous accompagnons dans toutes les étapes de votre projet d&apos;immigration et de relocalisation au Canada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up delay-200">
              <Link
                href="/admissibilite"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-white font-bold rounded-xl hover:bg-gold-dark transition-all shadow-lg hover:shadow-xl text-lg animate-pulse-gold"
              >
                Tester mon admissibilité
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                Nos services
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-6 text-white/50 text-sm animate-fade-in-up delay-300">
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
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="bg-white py-0 -mt-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 -mt-12 relative z-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {stats.map((s, i) => (
              <div key={i} className="p-6 md:p-8 text-center">
                <div className="text-3xl md:text-4xl font-bold text-navy mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PROGRAMMES ========== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Nos programmes</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">
              Tous les chemins vers le Canada
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Découvrez les programmes d&apos;immigration fédéraux et provinciaux adaptés à votre profil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-gold/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-md`}>
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-gold-dark transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-gold font-semibold hover:text-gold-dark transition-colors"
            >
              Voir tous nos services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== LEAD MAGNET SECTION ========== */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Outils gratuits</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-6">
                Évaluez vos chances gratuitement
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Utilisez nos outils en ligne pour obtenir une première évaluation de votre admissibilité.
                Ces résultats partiels vous donneront un aperçu de vos options — contactez-nous pour une analyse complète et personnalisée.
              </p>

              <div className="space-y-4">
                <Link
                  href="/admissibilite"
                  className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:border-gold/30 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-navy group-hover:text-gold-dark transition-colors">Test d&apos;admissibilité</h3>
                    <p className="text-sm text-gray-400">Découvrez les programmes auxquels vous pourriez être éligible</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gold transition-colors" />
                </Link>

                <Link
                  href="/calculateur-crs"
                  className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:border-gold/30 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-navy group-hover:text-gold-dark transition-colors">Calculateur CRS partiel</h3>
                    <p className="text-sm text-gray-400">Estimez votre score CRS pour Entrée Express</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gold transition-colors" />
                </Link>
              </div>
            </div>

            {/* Visual card */}
            <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe2 className="w-6 h-6 text-gold" />
                Pourquoi nous choisir?
              </h3>
              <ul className="space-y-4">
                {[
                  'Expertise en immigration fédérale (IRCC) et provinciale (MIFI)',
                  'Connaissance approfondie des programmes québécois (PEQ, PRTQ, Arrima)',
                  'Suivi personnalisé de votre dossier de A à Z',
                  'Service de relocalisation et intégration complet',
                  'Assistance en français, anglais, arabe et espagnol',
                  'Frais d\'ouverture de dossier: 250$ CAD seulement',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-white/10">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-colors"
                >
                  Consultation gratuite <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PROCESS ========== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Notre processus</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">
              Simple, transparent, efficace
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-gold">{s.step}</span>
                </div>
                <h3 className="font-bold text-navy mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gold/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Témoignages</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">
              Ils nous ont fait confiance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-navy/50" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.origin} — {t.program}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ MINI ========== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">
              Questions fréquentes
            </h2>
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
            ].map((faq, i) => (
              <details key={i} className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-navy hover:text-gold-dark transition-colors">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/contact" className="inline-flex items-center gap-2 text-gold font-semibold hover:text-gold-dark transition-colors">
              D&apos;autres questions? Contactez-nous <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== PARTNERS / TRUST ========== */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-300">
            {['IRCC', 'MIFI', 'Arrima', 'EIMT/LMIA', 'Entrée Express'].map(p => (
              <div key={p} className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="font-semibold text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
