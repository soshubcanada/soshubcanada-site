"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";
import AnimateIn from "@/components/AnimateIn";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const DURATIONS = [3, 6, 9, 12] as const;
type Duration = (typeof DURATIONS)[number];

const CLIENT_UPFRONT: Record<string, Record<Duration, number>> = {
  standard: { 3: 59.99, 6: 49.99, 9: 39.99, 12: 34.99 },
  premium: { 3: 149.99, 6: 129.99, 9: 109.99, 12: 89.99 },
};
const CLIENT_MONTHLY: Record<string, Record<Duration, number>> = {
  standard: { 3: 69.99, 6: 59.99, 9: 49.99, 12: 44.99 },
  premium: { 3: 159.99, 6: 139.99, 9: 119.99, 12: 99.99 },
};

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG to avoid extra deps)                             */
/* ------------------------------------------------------------------ */

function Check({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Dash({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M5 12h14" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function Badge({ children, color = "green" }: { children: React.ReactNode; color?: "green" | "gold" | "gray" }) {
  const colors = {
    green: "bg-[#E1F5EE] text-[#1D9E75]",
    gold: "bg-[#FEF3C7] text-[#D97706]",
    gray: "bg-gray-100 text-gray-500",
  };
  return <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors[color]}`}>{children}</span>;
}

/* ------------------------------------------------------------------ */
/*  Pricing Page Inner                                                 */
/* ------------------------------------------------------------------ */

function TarifsPage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [view, setView] = useState<"client" | "pro">("client");
  const [duration, setDuration] = useState<Duration>(12);
  const [payUpfront, setPayUpfront] = useState(true);

  /* ---------- feature lists ---------- */
  const baseFeatsFr = [
    "Parcours 6 piliers",
    "Checklists de base",
    "Tuteur AI (5 msg/jour)",
    "Score CRS de base",
    "Guides generaux",
    "Marketplace (consultation seulement)",
  ];
  const baseFeatsEn = [
    "6-pillar journey",
    "Basic checklists",
    "AI tutor (5 msg/day)",
    "Basic CRS score",
    "General guides",
    "Marketplace (browse only)",
  ];

  const stdFeatsFr = [
    "AI illimitée 24/7",
    "Rapport CRS complet",
    "Éligibilité 10 programmes",
    "Checklists documents personnalisées",
    "Tuteur français illimité",
    "Rappels intelligents",
    "CV canadien AI",
    "Reprises TCF/TEF",
    "Simulation entrevue AI",
  ];
  const stdFeatsEn = [
    "Unlimited AI 24/7",
    "Full CRS report",
    "10-program eligibility",
    "Personalized doc checklists",
    "Unlimited French tutor",
    "Smart reminders",
    "Canadian résumé AI",
    "TCF/TEF replays",
    "AI interview simulation",
  ];

  const premFeatsFr = [
    "10% rabais pros Premium",
    "Rendez-vous bureau Montreal",
    "1 consultation gratuite 30 min",
    "Cours TCF/TEF live (valeur 499$+)",
    "Plan d'action AI mensuel",
    "Support prioritaire (<4h)",
    "Scénarios CRS what-if",
    "Webinaires experts",
    "Certificat de complétion",
    "Conseiller dédié",
  ];
  const premFeatsEn = [
    "10% off Premium pros",
    "Montreal office appointments",
    "1 free 30-min consultation",
    "TCF/TEF live classes (value $499+)",
    "Monthly AI action plan",
    "Priority support (<4h)",
    "What-if CRS scenarios",
    "Expert webinars",
    "Completion certificate",
    "Dedicated advisor",
  ];

  const baseFeats = fr ? baseFeatsFr : baseFeatsEn;
  const stdFeats = fr ? stdFeatsFr : stdFeatsEn;
  const premFeats = fr ? premFeatsFr : premFeatsEn;

  const prices = payUpfront ? CLIENT_UPFRONT : CLIENT_MONTHLY;

  /* ---------- pro features ---------- */
  const proEssFr = [
    "Profil vérifié",
    "15 leads / mois",
    "Badge CICC / Barreau",
    "Notifications courriel",
    "Statistiques de base",
  ];
  const proEssEn = [
    "Verified profile",
    "15 leads / month",
    "CICC / Bar badge",
    "Email notifications",
    "Basic stats",
  ];
  const proProFr = [
    "Tout dans Essentiel",
    "Leads illimités",
    "Placement prioritaire",
    "Analytiques avancées",
    "Profil enrichi avec vidéo",
    "Intégration calendrier",
  ];
  const proProEn = [
    "Everything in Essential",
    "Unlimited leads",
    "Priority placement",
    "Advanced analytics",
    "Enhanced profile with video",
    "Calendar integration",
  ];
  const proPremFr = [
    "Tout dans Pro",
    "Bureau Montreal (10h/mois)",
    "Badge Gold",
    "Placement #1",
    "Co-marketing",
    "Webinaires",
    "Clients Premium -10%",
  ];
  const proPremEn = [
    "Everything in Pro",
    "Montreal office (10h/mo)",
    "Gold badge",
    "#1 placement",
    "Co-marketing",
    "Webinars",
    "Premium client -10%",
  ];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            {fr ? "Tarifs simples, transparents" : "Simple, transparent pricing"}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            {fr
              ? "Commence gratuitement. Passe au niveau supérieur quand tu es prêt."
              : "Start for free. Upgrade when you're ready."}
          </p>

          {/* View toggle */}
          <div className="inline-flex bg-white/10 rounded-xl p-1 backdrop-blur">
            <button
              onClick={() => setView("client")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${view === "client" ? "bg-white text-[#085041] shadow" : "text-white/70 hover:text-white"}`}
            >
              {fr ? "Nouveaux arrivants" : "Newcomers"}
            </button>
            <button
              onClick={() => setView("pro")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${view === "pro" ? "bg-white text-[#085041] shadow" : "text-white/70 hover:text-white"}`}
            >
              {fr ? "Professionnels réglementés" : "Regulated Professionals"}
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CLIENT PLANS                                                 */}
      {/* ============================================================ */}
      {view === "client" && (
        <>
          {/* Duration + payment selectors */}
          <section className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* Duration */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium mr-1">{fr ? "Durée :" : "Duration:"}</span>
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        duration === d ? "bg-[#085041] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {d} {fr ? "mois" : "mo"}
                    </button>
                  ))}
                </div>

                {/* Payment toggle */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                  <span className={`text-sm font-medium ${payUpfront ? "text-[#085041]" : "text-gray-400"}`}>
                    {fr ? "Paiement unique" : "Upfront"}
                  </span>
                  <button
                    onClick={() => setPayUpfront(!payUpfront)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ backgroundColor: payUpfront ? "#085041" : "#9ca3af" }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                      style={{ transform: payUpfront ? "translateX(0)" : "translateX(20px)" }}
                    />
                  </button>
                  <span className={`text-sm font-medium ${!payUpfront ? "text-[#085041]" : "text-gray-400"}`}>
                    {fr ? "Mensuel" : "Monthly"}
                  </span>
                </div>
              </div>

              {duration === 12 && payUpfront && (
                <p className="text-center text-sm text-[#1D9E75] font-semibold mt-3">
                  {fr ? "Meilleure valeur — économise jusqu'à 60%!" : "Best value — save up to 60%!"}
                </p>
              )}
            </div>
          </section>

          {/* Plan cards */}
          <section className="py-12 md:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                {/* ---------- Base (Free) ---------- */}
                <AnimateIn delay={0}>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col card-hover">
                  <div className="mb-6">
                    <Badge color="gray">Base</Badge>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                        {fr ? "Gratuit" : "Free"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {fr ? "Pour explorer la plateforme" : "To explore the platform"}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {baseFeats.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <Check className="text-gray-400 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-gray-500 font-medium mb-1">{fr ? "Module en option" : "Optional add-on"}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {fr ? "Rapport CRS complet" : "Full CRS report"}: <span className="text-[#D97706]">49,99$</span>
                    </p>
                  </div>
                  <Link
                    href="/inscription"
                    className="block text-center px-6 py-3 rounded-xl font-semibold text-[#085041] bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    {fr ? "Commencer gratuitement" : "Start for free"}
                  </Link>
                </div>
                </AnimateIn>

                {/* ---------- Standard ---------- */}
                <AnimateIn delay={150}>
                <div className="bg-white rounded-2xl border-2 border-[#1D9E75] p-8 flex flex-col relative shadow-lg shadow-[#1D9E75]/10 card-hover">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge color="green">{fr ? "Populaire" : "Popular"}</Badge>
                  </div>
                  <div className="mb-6">
                    <span className="text-xs font-bold text-[#1D9E75] uppercase tracking-wide">Standard</span>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                        {prices.standard[duration].toFixed(2)}$
                      </span>
                      <span className="text-gray-400 text-sm">/ {fr ? "mois" : "mo"}</span>
                    </div>
                    {payUpfront && (
                      <p className="text-xs text-gray-400 mt-1">
                        {fr ? "Facture" : "Billed"} {(prices.standard[duration] * duration).toFixed(2)}$ {fr ? "d'avancé" : "upfront"}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {fr ? "Pour s'établir sérieusement" : "For serious settlement"}
                    </p>
                  </div>

                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {fr ? "Tout dans Base, plus :" : "Everything in Base, plus:"}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {stdFeats.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <Check className="text-[#1D9E75] mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/checkout?plan=standard&duration=3"
                    className="block text-center px-6 py-3 rounded-xl font-semibold text-white bg-[#1D9E75] hover:bg-[#178a65] transition-all shadow-lg shadow-[#1D9E75]/25"
                  >
                    {fr ? "Choisir Standard" : "Choose Standard"}
                  </Link>
                </div>
                </AnimateIn>

                {/* ---------- Premium ---------- */}
                <AnimateIn delay={300}>
                <div className="relative bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] rounded-2xl border-2 border-[#D97706] p-8 flex flex-col shadow-lg shadow-amber-500/10 card-hover glass-premium">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge color="gold">{fr ? "Recommandé" : "Recommended"}</Badge>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#D97706] uppercase tracking-wide font-[family-name:var(--font-heading)]">
                        etabli Premium
                      </span>
                      <span className="text-[#D97706]">&#9733;</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                        {prices.premium[duration].toFixed(2)}$
                      </span>
                      <span className="text-gray-500 text-sm">/ {fr ? "mois" : "mo"}</span>
                    </div>
                    {payUpfront && (
                      <p className="text-xs text-gray-500 mt-1">
                        {fr ? "Facture" : "Billed"} {(prices.premium[duration] * duration).toFixed(2)}$ {fr ? "d'avancé" : "upfront"}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      {fr ? "L'expérience complète etabli." : "The complete etabli. experience"}
                    </p>
                  </div>

                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {fr ? "Tout dans Standard, plus :" : "Everything in Standard, plus:"}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {premFeats.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <Check className="text-[#D97706] mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/checkout?plan=premium&duration=3"
                    className="block text-center px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:opacity-90 transition-all shadow-lg shadow-amber-500/25"
                  >
                    {fr ? "Choisir Premium" : "Choose Premium"}
                  </Link>
                </div>
                </AnimateIn>
              </div>
            </div>
          </section>

          {/* ---------- Complete Pricing Grid ---------- */}
          <section className="py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimateIn>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-8 text-center">
                {fr ? "Grille tarifaire complète" : "Complete Pricing Grid"}
              </h2>
              </AnimateIn>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-500">{fr ? "Durée" : "Duration"}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900" colSpan={2}>Standard</th>
                      <th className="text-center py-3 px-4 font-semibold text-[#D97706]" colSpan={2}>etabli Premium</th>
                    </tr>
                    <tr className="border-b border-gray-100 text-xs text-gray-400">
                      <th />
                      <th className="py-2 px-4 font-medium">{fr ? "Unique" : "Upfront"}</th>
                      <th className="py-2 px-4 font-medium">{fr ? "Mensuel" : "Monthly"}</th>
                      <th className="py-2 px-4 font-medium">{fr ? "Unique" : "Upfront"}</th>
                      <th className="py-2 px-4 font-medium">{fr ? "Mensuel" : "Monthly"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DURATIONS.map((d) => (
                      <tr key={d} className={`border-b border-gray-100 ${d === 12 ? "bg-[#F0FAF5]" : ""}`}>
                        <td className="py-3 px-4 font-semibold text-gray-700">
                          {d} {fr ? "mois" : "months"}
                          {d === 12 && <span className="ml-2 text-xs text-[#1D9E75] font-bold">{fr ? "MEILLEUR PRIX" : "BEST VALUE"}</span>}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">{CLIENT_UPFRONT.standard[d].toFixed(2)}$/mo</td>
                        <td className="py-3 px-4 text-center text-gray-500">{CLIENT_MONTHLY.standard[d].toFixed(2)}$/mo</td>
                        <td className="py-3 px-4 text-center font-medium text-[#D97706]">{CLIENT_UPFRONT.premium[d].toFixed(2)}$/mo</td>
                        <td className="py-3 px-4 text-center text-gray-500">{CLIENT_MONTHLY.premium[d].toFixed(2)}$/mo</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                {fr
                  ? "Plan Base toujours gratuit. Prix en dollars canadiens, taxes en sus."
                  : "Base plan always free. Prices in Canadian dollars, taxes extra."}
              </p>
            </div>
          </section>

          {/* ---------- Premium Advantage Callout ---------- */}
          <section className="py-12 md:py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimateIn direction="scale">
              <div className="bg-gradient-to-br from-[#FFFBEB] via-white to-[#FEF3C7] rounded-2xl border border-[#D97706]/30 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#D97706]/10 to-transparent rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">&#9733;</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                      {fr ? "L'avantage etabli Premium" : "The etabli Premium advantage"}
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-6 max-w-2xl leading-relaxed">
                    {fr
                      ? "En choisissant Premium, tu obtiens l'équivalent de 499$+ en cours TCF/TEF live, une consultation gratuite avec un professionnel réglementé, l'accès au bureau de Montréal, et un conseiller dédié pour chaque étape de ton parcours."
                      : "By choosing Premium, you get the equivalent of $499+ in live TCF/TEF classes, a free consultation with a regulated professional, access to the Montreal office, and a dedicated advisor for every step of your journey."}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-white/80 rounded-xl p-4 border border-[#D97706]/20">
                      <p className="text-2xl font-bold text-[#D97706] font-[family-name:var(--font-heading)]">499$+</p>
                      <p className="text-xs text-gray-500 mt-1">{fr ? "Valeur cours TCF/TEF live" : "TCF/TEF live class value"}</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-[#D97706]/20">
                      <p className="text-2xl font-bold text-[#D97706] font-[family-name:var(--font-heading)]">10%</p>
                      <p className="text-xs text-gray-500 mt-1">{fr ? "Rabais pros marketplace" : "Marketplace pro discount"}</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-[#D97706]/20">
                      <p className="text-2xl font-bold text-[#D97706] font-[family-name:var(--font-heading)]">&lt;4h</p>
                      <p className="text-xs text-gray-500 mt-1">{fr ? "Temps de réponse support" : "Support response time"}</p>
                    </div>
                  </div>
                </div>
              </div>
              </AnimateIn>
            </div>
          </section>

          {/* ---------- TCF/TEF Programs ---------- */}
          <section className="py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
                  {fr ? "Programmes TCF / TEF" : "TCF / TEF Programs"}
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                  {fr
                    ? "Préparation complète pour les examens de français requis par l'immigration. Les membres Premium ont accès aux cours live sans frais supplémentaires."
                    : "Complete preparation for the French exams required by immigration. Premium members access live classes at no extra cost."}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    name: fr ? "Intensif" : "Intensive",
                    price: "499$",
                    desc: fr
                      ? "Cours accéléré 4 semaines, idéal pour les niveaux intermédiaires+"
                      : "4-week accelerated course, ideal for intermediate+ levels",
                    feats: fr
                      ? ["4 semaines", "20h de cours live", "Exercices AI illimités", "1 examen blanc"]
                      : ["4 weeks", "20h live classes", "Unlimited AI exercises", "1 mock exam"],
                  },
                  {
                    name: "Standard",
                    price: "799$",
                    desc: fr
                      ? "Programme 8 semaines, rythme équilibré avec suivi personnalisé"
                      : "8-week program, balanced pace with personalized follow-up",
                    feats: fr
                      ? ["8 semaines", "40h de cours live", "Tuteur AI dédié", "3 examens blancs"]
                      : ["8 weeks", "40h live classes", "Dedicated AI tutor", "3 mock exams"],
                  },
                  {
                    name: fr ? "Hybride QC" : "Hybrid QC",
                    price: "1 199$",
                    desc: fr
                      ? "Combiné en ligne + sessions en personne à Montréal, focus Québec"
                      : "Online + in-person sessions in Montreal, Québec focus",
                    feats: fr
                      ? ["12 semaines", "60h live + présentiel", "Vocabulaire QC", "5 examens blancs"]
                      : ["12 weeks", "60h live + in-person", "QC vocabulary", "5 mock exams"],
                    popular: true,
                  },
                  {
                    name: fr ? "Hybride Canada" : "Hybrid Canada",
                    price: "1 499$",
                    desc: fr
                      ? "Préparation fédérale complète, couvre TCF Canada et TEF Canada"
                      : "Complete federal prep, covers TCF Canada and TEF Canada",
                    feats: fr
                      ? ["16 semaines", "80h live + présentiel", "Double prépa TCF+TEF", "Examens illimités"]
                      : ["16 weeks", "80h live + in-person", "Dual TCF+TEF prep", "Unlimited mock exams"],
                  },
                ].map((prog, i) => (
                  <AnimateIn key={i} delay={i * 100}>
                  <div
                    className={`bg-white rounded-2xl border ${prog.popular ? "border-[#1D9E75] shadow-lg shadow-[#1D9E75]/10" : "border-gray-200"} p-6 flex flex-col relative`}
                  >
                    {prog.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge color="green">{fr ? "Populaire" : "Popular"}</Badge>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">{prog.name}</h3>
                    <p className="text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)] mt-2">{prog.price}</p>
                    <p className="text-xs text-gray-500 mt-2 mb-4 leading-relaxed">{prog.desc}</p>
                    <ul className="space-y-2 flex-1">
                      {prog.feats.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="text-[#1D9E75]" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/inscription?program=tcf-tef"
                      className={`block text-center mt-6 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        prog.popular
                          ? "bg-[#1D9E75] text-white hover:bg-[#178a65] shadow"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {fr ? "S'inscrire" : "Enroll"}
                    </Link>
                    <p className="text-xs text-[#D97706] font-semibold mt-3 text-center">
                      {fr ? "Inclus dans Premium" : "Included in Premium"}
                    </p>
                  </div>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- CRS Report Section ---------- */}
          <section className="py-12 md:py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimateIn>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
                      {fr ? "Rapport CRS complet" : "Full CRS Report"}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
                      {fr
                        ? "Analyse détaillée de ton profil avec éligibilité aux 10 programmes, recommandations personnalisées et plan d'amélioration du score."
                        : "Detailed profile analysis with eligibility for 10 programs, personalized recommendations and score improvement plan."}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {fr ? "Éligibilité 10 programmes" : "10-program eligibility"}
                      </span>
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {fr ? "Recommandations AI" : "AI recommendations"}
                      </span>
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {fr ? "Plan d'amélioration" : "Improvement plan"}
                      </span>
                    </div>
                  </div>
                  <div className="text-center md:text-right flex-shrink-0">
                    <p className="text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)]">49,99$</p>
                    <p className="text-xs text-gray-400 mt-1">{fr ? "Achat unique" : "One-time purchase"}</p>
                    <p className="text-xs text-[#1D9E75] font-semibold mt-2">
                      {fr ? "Inclus dans Standard et Premium" : "Included in Standard & Premium"}
                    </p>
                  </div>
                </div>
              </div>
              </AnimateIn>
            </div>
          </section>
        </>
      )}

      {/* ============================================================ */}
      {/*  PRO PLANS                                                    */}
      {/* ============================================================ */}
      {view === "pro" && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
                {fr ? "Abonnements pour professionnels réglementés" : "Plans for regulated professionals"}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {fr
                  ? "Rejoins la marketplace etabli. et connecte avec des milliers de nouveaux arrivants. Tous les profils sont vérifiés via CICC et Barreau."
                  : "Join the etabli. marketplace and connect with thousands of newcomers. All profiles are verified through CICC and Bar registries."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

              {/* ---------- Essentiel ---------- */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
                <div className="mb-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Essentiel</span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">299$</span>
                    <span className="text-gray-400 text-sm">/ {fr ? "mois" : "mo"}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{fr ? "Commission : 10% par mandat" : "Commission: 10% per engagement"}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {(fr ? proEssFr : proEssEn).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="text-gray-400 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pro/inscription?plan=essentiel"
                  className="block text-center px-6 py-3 rounded-xl font-semibold text-[#085041] bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  {fr ? "Commencer" : "Get started"}
                </Link>
              </div>

              {/* ---------- Pro ---------- */}
              <div className="bg-white rounded-2xl border-2 border-[#1D9E75] p-8 flex flex-col relative shadow-lg shadow-[#1D9E75]/10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge color="green">{fr ? "Populaire" : "Popular"}</Badge>
                </div>
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#1D9E75] uppercase tracking-wide">Pro</span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">599$</span>
                    <span className="text-gray-400 text-sm">/ {fr ? "mois" : "mo"}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{fr ? "Commission : 7% par mandat" : "Commission: 7% per engagement"}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {(fr ? proProFr : proProEn).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="text-[#1D9E75] mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pro/inscription?plan=pro"
                  className="block text-center px-6 py-3 rounded-xl font-semibold text-white bg-[#1D9E75] hover:bg-[#178a65] transition-all shadow-lg shadow-[#1D9E75]/25"
                >
                  {fr ? "Choisir Pro" : "Choose Pro"}
                </Link>
              </div>

              {/* ---------- Premium ---------- */}
              <div className="relative bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] rounded-2xl border-2 border-[#D97706] p-8 flex flex-col shadow-lg shadow-amber-500/10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge color="gold">Premium</Badge>
                </div>
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#D97706] uppercase tracking-wide">Premium</span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">999$</span>
                    <span className="text-gray-500 text-sm">/ {fr ? "mois" : "mo"}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{fr ? "Commission : 5% par mandat" : "Commission: 5% per engagement"}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {(fr ? proPremFr : proPremEn).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <Check className="text-[#D97706] mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pro/inscription?plan=premium"
                  className="block text-center px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:opacity-90 transition-all shadow-lg shadow-amber-500/25"
                >
                  {fr ? "Choisir Premium" : "Choose Premium"}
                </Link>
              </div>
            </div>

            {/* Pro commission comparison */}
            <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 max-w-3xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-4 text-center">
                {fr ? "Comparaison des commissions" : "Commission comparison"}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-400">10%</p>
                  <p className="text-xs text-gray-500 mt-1">Essentiel</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1D9E75]">7%</p>
                  <p className="text-xs text-gray-500 mt-1">Pro</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#D97706]">5%</p>
                  <p className="text-xs text-gray-500 mt-1">Premium</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- FAQ / CTA ---------- */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#085041] to-[#0a6350]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            {fr ? "Des questions?" : "Questions?"}
          </h2>
          <p className="text-white/70 mb-8">
            {fr
              ? "Notre équipe est là pour t'aider à choisir le plan qui correspond à ta situation."
              : "Our team is here to help you choose the plan that matches your situation."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 bg-white text-[#085041] font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg"
            >
              {fr ? "Nous contacter" : "Contact us"}
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              {fr ? "Retour à l'accueil" : "Back to home"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Shell>
      <TarifsPage />
    </Shell>
  );
}
