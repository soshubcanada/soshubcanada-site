import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, CheckCircle2, Shield, Clock, Users, FileText,
  Building2, Briefcase, Globe2, Award, Heart, Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services pour Employeurs',
  description:
    'SOS Hub Canada prend en charge la paperasse et l\'intégration de vos nouveaux employés internationaux. EIMT, permis de travail, relocalisation. Service personnalisé à Montréal.',
  openGraph: {
    title: 'Services pour Employeurs — SOS Hub Canada',
    description:
      'Vous embauchez, on s\'occupe des démarches. Intégration complète de vos employés internationaux.',
    url: 'https://soshubcanada.com/employeurs',
  },
};

const services = [
  {
    icon: FileText,
    title: 'EIMT / LMIA',
    desc: 'Préparation et soumission de l\'Étude d\'impact sur le marché du travail pour vos employés étrangers.',
    tag: 'Permis de travail fermé',
  },
  {
    icon: Briefcase,
    title: 'Permis de travail',
    desc: 'Gestion complète du processus de permis de travail: fermé, ouvert, mobilité francophone, intra-entreprise.',
    tag: 'Tous types',
  },
  {
    icon: Globe2,
    title: 'Mobilité francophone',
    desc: 'Programme sans EIMT pour les travailleurs francophones hors Québec. Processus accéléré.',
    tag: 'Sans EIMT',
  },
  {
    icon: Users,
    title: 'Relocalisation employé',
    desc: 'Installation complète: logement, ouverture de comptes, inscriptions scolaires, intégration familiale.',
    tag: 'Service complet',
  },
  {
    icon: Heart,
    title: 'Famille de l\'employé',
    desc: 'Accompagnement du conjoint et des enfants: permis, école, emploi du conjoint, intégration.',
    tag: 'Accompagnement familial',
  },
  {
    icon: Shield,
    title: 'Conformité',
    desc: 'Vérification de conformité avec les exigences d\'IRCC et d\'EDSC. Audit de vos pratiques.',
    tag: 'Réglementaire',
  },
];

const steps = [
  { num: '1', title: 'Vous nous contactez', desc: 'Parlez-nous de votre besoin et de votre employé. On évalue la situation en 24h.' },
  { num: '2', title: 'On prépare le dossier', desc: 'EIMT, permis de travail, documents — on s\'occupe de toute la paperasse.' },
  { num: '3', title: 'On soumet et on suit', desc: 'Dépôt auprès d\'IRCC/EDSC et suivi proactif jusqu\'à l\'approbation.' },
  { num: '4', title: 'On installe l\'employé', desc: 'Logement, comptes, école — votre employé est opérationnel dès son arrivée.' },
];

const sectors = [
  'Technologies', 'Restauration', 'Agriculture', 'Santé',
  'Construction', 'Transport', 'Manufacturier', 'Commerce',
];

export default function EmployeursPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=600&fit=crop"
          alt="Services pour employeurs"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Services aux employeurs</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-4">
            Vous embauchez.<br />On s&apos;occupe des démarches.
          </h1>
          <div className="divider-gold mx-auto mt-4 mb-6" />
          <p className="text-white/70 max-w-2xl mx-auto text-lg font-sans mb-10">
            Vous avez trouvé votre employé? On prend en charge toute la paperasse, les démarches administratives,
            l&apos;installation et l&apos;intégration pour que votre nouvel employé soit opérationnel le plus vite possible.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-white/50 text-sm font-sans">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold font-serif">500+</div>
              <div className="mt-1">Employés intégrés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold font-serif">120+</div>
              <div className="mt-1">Entreprises accompagnées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold font-serif">100%</div>
              <div className="mt-1">Prise en charge</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="scroll-hidden-left">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Pourquoi nous?</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">
              Vous gérez votre business,<br />on gère le reste
            </h2>
            <div className="divider-gold mb-6" />
            <p className="text-gray-500 leading-relaxed font-sans text-lg mb-8">
              Embaucher un travailleur étranger implique de la paperasse, des délais et des règles complexes.
              Notre équipe s&apos;occupe de tout pour que vous puissiez vous concentrer sur ce que vous faites de mieux.
            </p>
            <div className="space-y-4">
              {[
                { title: 'Paperasse complexe?', desc: 'On prépare tous les formulaires et documents requis par IRCC et EDSC.' },
                { title: 'Délais serrés?', desc: 'Processus accéléré avec suivi proactif de chaque étape.' },
                { title: 'Intégration difficile?', desc: 'Logement, école, comptes — on installe votre employé et sa famille.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-cream rounded-xl border-l-4 border-gold">
                  <div>
                    <h4 className="font-bold text-navy text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 font-sans mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="scroll-hidden-right">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=480&fit=crop&crop=face"
                alt="Employeur satisfait"
                width={600}
                height={480}
                className="object-cover w-full h-[480px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-navy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Nos services</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">Ce qu&apos;on fait pour vous</h2>
            <div className="divider-gold mx-auto mt-4 mb-6" />
            <p className="text-white/50 max-w-xl mx-auto font-sans">
              Un accompagnement complet, de la demande de permis jusqu&apos;à l&apos;installation de votre employé.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={i} className="scroll-hidden bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-gold/30 hover:bg-white/[0.08] transition-all" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-5">
                  <s.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-white/50 text-sm font-sans leading-relaxed mb-4">{s.desc}</p>
                <span className="inline-block px-4 py-1.5 bg-gold/15 text-gold text-xs font-semibold rounded-full font-sans">
                  {s.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 scroll-hidden">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Comment ca marche</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">Simple et rapide</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center scroll-hidden" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold/30">
                  <span className="text-white font-bold text-2xl font-serif">{s.num}</span>
                </div>
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

      {/* Sectors */}
      <section className="py-16 bg-cream">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-navy text-center mb-10 scroll-hidden">Secteurs que nous desservons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sectors.map((s, i) => (
              <div key={i} className="scroll-hidden bg-white rounded-xl px-5 py-4 border border-gray-100 text-center font-semibold text-navy text-sm hover:border-gold/30 hover:text-gold-dark transition-all font-sans" style={{ transitionDelay: `${i * 50}ms` }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center scroll-hidden">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-xs font-bold px-4 py-2 rounded-full mb-8 font-sans uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Réponse en 24h
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Prêt à soumettre un dossier?</h2>
          <div className="divider-gold mx-auto mt-4 mb-6" />
          <p className="text-white/60 mb-10 max-w-2xl mx-auto font-sans text-lg">
            Contactez-nous avec les détails de votre employé. On vous revient en 24h avec un plan d&apos;action clair.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-gold/30 transition-all font-sans text-lg hover:scale-105 glow-gold"
            >
              Nous contacter <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/14386302869?text=Bonjour%2C%20je%20suis%20un%20employeur%20et%20j%27ai%20besoin%20d%27aide."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1db954] transition-all font-sans text-lg"
            >
              WhatsApp
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-white/40 text-sm font-sans">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gold" /> 100% prise en charge</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gold" /> 120+ entreprises</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gold" /> Tous secteurs</span>
          </div>
        </div>
      </section>
    </div>
  );
}
