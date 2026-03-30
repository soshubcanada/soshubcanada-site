"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AnimateIn from "@/components/AnimateIn";
import {
  User,
  Globe,
  MapPin,
  BookOpen,
  Target,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  GraduationCap,
  Zap,
  Star,
} from "lucide-react";

/* ─── Types ─── */

interface OnboardingData {
  name: string;
  program: string;
  city: string;
  level: string;
  goal: string;
  dailyGoal: number;
  completedAt: string;
}

/* ─── Constants ─── */

const PROGRAMS = [
  { id: "pstq", fr: "PSTQ / Arrima", en: "PSTQ / Arrima" },
  { id: "express-entry", fr: "Entree Express", en: "Express Entry" },
  { id: "caq", fr: "CAQ", en: "CAQ" },
  { id: "citoyennete", fr: "Citoyennete", en: "Citizenship" },
  { id: "undecided", fr: "Pas encore decide", en: "Not yet decided" },
];

const CITIES = [
  { id: "montreal", label: "Montreal" },
  { id: "quebec", label: "Quebec" },
  { id: "laval", label: "Laval" },
  { id: "gatineau", label: "Gatineau" },
  { id: "autre", fr: "Autre", en: "Other" },
];

const LEVELS = [
  {
    id: "A1",
    fr: "Debutant (A1)",
    en: "Beginner (A1)",
    descFr: "Je ne parle pas francais",
    descEn: "I don't speak French",
    emoji: "🌱",
    nclc7months: 18,
  },
  {
    id: "A2",
    fr: "Elementaire (A2)",
    en: "Elementary (A2)",
    descFr: "Je comprends les phrases simples",
    descEn: "I understand simple sentences",
    emoji: "🌿",
    nclc7months: 12,
  },
  {
    id: "B1",
    fr: "Intermediaire (B1)",
    en: "Intermediate (B1)",
    descFr: "Je peux avoir des conversations basiques",
    descEn: "I can have basic conversations",
    emoji: "🌳",
    nclc7months: 6,
  },
  {
    id: "B2",
    fr: "Intermediaire-avance (B2)",
    en: "Upper-Intermediate (B2)",
    descFr: "Je suis a l'aise en francais",
    descEn: "I'm comfortable in French",
    emoji: "🏔️",
    nclc7months: 3,
  },
  {
    id: "C1",
    fr: "Avance (C1)",
    en: "Advanced (C1)",
    descFr: "Je maitrise bien le francais",
    descEn: "I'm fluent in French",
    emoji: "🏆",
    nclc7months: 0,
  },
];

const GOALS = [
  { id: "tcf-tef", fr: "Passer le TCF/TEF", en: "Pass the TCF/TEF", icon: GraduationCap },
  { id: "quebecois", fr: "Ameliorer mon francais quebecois", en: "Improve my Quebec French", icon: Globe },
  { id: "citoyennete", fr: "Obtenir la citoyennete", en: "Obtain citizenship", icon: Star },
  { id: "entretien", fr: "Preparer un entretien d'embauche", en: "Prepare for a job interview", icon: Target },
];

const DAILY_GOALS = [
  { minutes: 10, fr: "10 min / jour", en: "10 min / day", desc: { fr: "Decontracte", en: "Casual" } },
  { minutes: 15, fr: "15 min / jour", en: "15 min / day", desc: { fr: "Regulier", en: "Regular" } },
  { minutes: 30, fr: "30 min / jour", en: "30 min / day", desc: { fr: "Serieux", en: "Serious" } },
  { minutes: 60, fr: "60 min / jour", en: "60 min / day", desc: { fr: "Intensif", en: "Intensive" } },
];

/* ─── Progress Bar ─── */

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                done
                  ? "bg-[#1D9E75] text-white"
                  : active
                  ? "bg-[#085041] text-white ring-4 ring-[#1D9E75]/20"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {done ? <Check size={16} /> : step}
            </div>
            {step < total && (
              <div
                className={`w-10 sm:w-16 h-1 rounded-full transition-all duration-300 ${
                  done ? "bg-[#1D9E75]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1: Welcome & Profile ─── */

function StepWelcome({
  fr,
  name,
  program,
  city,
  setName,
  setProgram,
  setCity,
}: {
  fr: boolean;
  name: string;
  program: string;
  city: string;
  setName: (v: string) => void;
  setProgram: (v: string) => void;
  setCity: (v: string) => void;
}) {
  return (
    <AnimateIn direction="up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E1F5EE] mb-4">
          <User size={32} className="text-[#085041]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#085041] font-[family-name:var(--font-heading)] mb-2">
          {fr ? "Bienvenue sur etabli." : "Welcome to etabli."}
        </h1>
        <p className="text-gray-500 text-lg">
          {fr
            ? "Configurons votre parcours personnalise."
            : "Let's set up your personalized path."}
        </p>
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {fr ? "Votre prenom" : "Your first name"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={fr ? "Ex: Marie" : "E.g. Marie"}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 outline-none text-gray-800 transition-all"
          />
        </div>

        {/* Établissement program */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Globe size={14} className="inline mr-1.5 -mt-0.5" />
            {fr ? "Votre programme" : "Établissement program"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROGRAMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProgram(p.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                  program === p.id
                    ? "border-[#1D9E75] bg-[#E1F5EE] text-[#085041]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {fr ? p.fr : p.en}
              </button>
            ))}
          </div>
        </div>

        {/* Target city */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin size={14} className="inline mr-1.5 -mt-0.5" />
            {fr ? "Ville cible" : "Target city"}
          </label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCity(c.id)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  city === c.id
                    ? "border-[#1D9E75] bg-[#E1F5EE] text-[#085041]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {"label" in c ? c.label : fr ? c.fr : c.en}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}

/* ─── Step 2: Language Level ─── */

function StepLevel({
  fr,
  level,
  setLevel,
}: {
  fr: boolean;
  level: string;
  setLevel: (v: string) => void;
}) {
  return (
    <AnimateIn direction="up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E1F5EE] mb-4">
          <BookOpen size={32} className="text-[#085041]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)] mb-2">
          {fr
            ? "Quel est votre niveau actuel de francais?"
            : "What is your current French level?"}
        </h2>
        <p className="text-gray-500">
          {fr
            ? "Selectionnez le niveau qui vous correspond le mieux."
            : "Select the level that best matches you."}
        </p>
      </div>

      <div className="space-y-3 max-w-lg mx-auto">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLevel(l.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all ${
              level === l.id
                ? "border-[#1D9E75] bg-[#E1F5EE] ring-2 ring-[#1D9E75]/20"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span className="text-2xl">{l.emoji}</span>
            <div className="flex-1">
              <div className={`font-semibold ${level === l.id ? "text-[#085041]" : "text-gray-800"}`}>
                {fr ? l.fr : l.en}
              </div>
              <div className={`text-sm ${level === l.id ? "text-[#085041]/70" : "text-gray-500"}`}>
                {fr ? l.descFr : l.descEn}
              </div>
            </div>
            {level === l.id && (
              <div className="w-6 h-6 rounded-full bg-[#1D9E75] flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </AnimateIn>
  );
}

/* ─── Step 3: Goal Setting ─── */

function StepGoal({
  fr,
  goal,
  dailyGoal,
  setGoal,
  setDailyGoal,
}: {
  fr: boolean;
  goal: string;
  dailyGoal: number;
  setGoal: (v: string) => void;
  setDailyGoal: (v: number) => void;
}) {
  return (
    <AnimateIn direction="up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E1F5EE] mb-4">
          <Target size={32} className="text-[#085041]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)] mb-2">
          {fr ? "Quel est votre objectif?" : "What is your goal?"}
        </h2>
        <p className="text-gray-500">
          {fr
            ? "Choisissez votre objectif principal et votre rythme quotidien."
            : "Choose your main goal and daily pace."}
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-8">
        {/* Main goal */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            {fr ? "Objectif principal" : "Main goal"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOALS.map((g) => {
              const Icon = g.icon;
              return (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                    goal === g.id
                      ? "border-[#1D9E75] bg-[#E1F5EE] text-[#085041]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} className={goal === g.id ? "text-[#1D9E75]" : "text-gray-400"} />
                  <span className="text-sm font-medium">{fr ? g.fr : g.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily goal */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            <Clock size={14} className="inline mr-1.5 -mt-0.5" />
            {fr ? "Objectif quotidien" : "Daily goal"}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DAILY_GOALS.map((d) => (
              <button
                key={d.minutes}
                onClick={() => setDailyGoal(d.minutes)}
                className={`flex flex-col items-center px-4 py-4 rounded-xl border transition-all ${
                  dailyGoal === d.minutes
                    ? "border-[#1D9E75] bg-[#E1F5EE] text-[#085041]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg font-bold">{d.minutes}</span>
                <span className="text-xs">min</span>
                <span className={`text-xs mt-1 ${dailyGoal === d.minutes ? "text-[#1D9E75]" : "text-gray-400"}`}>
                  {fr ? d.desc.fr : d.desc.en}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}

/* ─── Step 4: Personalized Plan ─── */

function StepPlan({
  fr,
  name,
  level,
  goal,
  dailyGoal,
}: {
  fr: boolean;
  name: string;
  level: string;
  goal: string;
  dailyGoal: number;
}) {
  const levelData = LEVELS.find((l) => l.id === level) ?? LEVELS[2];
  const goalData = GOALS.find((g) => g.id === goal);

  const recommendedModules: { title: string; href: string }[] = [];
  if (level === "A1" || level === "A2") {
    recommendedModules.push(
      { title: fr ? "Lecons de grammaire de base" : "Basic grammar lessons", href: "/francisation/grammaire" },
      { title: fr ? "Guide de prononciation" : "Pronunciation guide", href: "/francisation/prononciation" },
      { title: fr ? "Vocabulaire quotidien" : "Daily vocabulary", href: "/francisation/vocabulaire" },
    );
  } else if (level === "B1") {
    recommendedModules.push(
      { title: fr ? "Exercices interactifs" : "Interactive exercises", href: "/francisation/exercices" },
      { title: fr ? "Comprehension orale" : "Listening comprehension", href: "/francisation/ecoute" },
      { title: fr ? "Francais quebecois" : "Quebec French", href: "/francisation/quebecois" },
    );
  } else {
    recommendedModules.push(
      { title: fr ? "Preparation TCF/TEF" : "TCF/TEF preparation", href: "/francisation/placement" },
      { title: fr ? "Pratique rapide avancee" : "Advanced quick practice", href: "/francisation/pratique-rapide" },
      { title: fr ? "Revision espacee" : "Spaced review", href: "/francisation/revision" },
    );
  }

  // First exercise link
  const firstLink = recommendedModules[0]?.href ?? "/francisation";

  const suggestedPlan = level === "A1" || level === "A2" || dailyGoal >= 30 ? "Premium" : "Standard";

  return (
    <AnimateIn direction="up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D9E75] to-[#085041] mb-4">
          <Sparkles size={32} className="text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)] mb-2">
          {fr
            ? `Votre plan personnalise${name ? `, ${name}` : ""}`
            : `Your personalized plan${name ? `, ${name}` : ""}`}
        </h2>
        <p className="text-gray-500">
          {fr
            ? "Voici nos recommandations basees sur votre profil."
            : "Here are our recommendations based on your profile."}
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Summary card */}
        <div className="bg-gradient-to-br from-[#E1F5EE] to-white rounded-2xl border border-[#1D9E75]/20 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{levelData.emoji}</span>
            <div>
              <div className="font-semibold text-[#085041]">
                {fr ? `Niveau actuel: ${levelData.fr}` : `Current level: ${levelData.en}`}
              </div>
              {goalData && (
                <div className="text-sm text-gray-500">
                  {fr ? `Objectif: ${goalData.fr}` : `Goal: ${goalData.en}`}
                </div>
              )}
            </div>
          </div>

          {levelData.nclc7months > 0 && (
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[#1D9E75]/10">
              <Clock size={18} className="text-[#D97706]" />
              <div className="text-sm">
                <span className="font-semibold text-[#085041]">
                  {fr ? "Temps estime pour NCLC 7: " : "Estimated time to NCLC 7: "}
                </span>
                <span className="text-[#D97706] font-bold">
                  ~{levelData.nclc7months} {fr ? "mois" : "months"}
                </span>
                <span className="text-gray-400 ml-1">
                  ({dailyGoal} min/{fr ? "jour" : "day"})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recommended modules */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            <Zap size={14} className="inline mr-1.5 -mt-0.5 text-[#D97706]" />
            {fr ? "Modules recommandes" : "Recommended modules"}
          </h3>
          <div className="space-y-2">
            {recommendedModules.map((mod, i) => (
              <div
                key={mod.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E1F5EE] flex items-center justify-center text-xs font-bold text-[#085041]">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-gray-700 flex-1">{mod.title}</span>
                <ArrowRight size={14} className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Suggested plan */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#D97706]/30 bg-[#FFF8F0]">
          <Star size={18} className="text-[#D97706]" />
          <span className="text-sm text-gray-700">
            {fr ? "Plan suggere: " : "Suggested plan: "}
            <span className="font-bold text-[#D97706]">{suggestedPlan}</span>
          </span>
        </div>

        {/* CTA stored as data for the parent to use */}
        <div className="text-center text-xs text-gray-400">
          {fr
            ? `Premier exercice: ${recommendedModules[0]?.title}`
            : `First exercise: ${recommendedModules[0]?.title}`}
        </div>
      </div>
    </AnimateIn>
  );
}

/* ─── Main Onboarding Page ─── */

export default function OnboardingPage() {
  return (
    <Shell>
      <OnboardingWizard />
    </Shell>
  );
}

function OnboardingWizard() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [program, setProgram] = useState("");
  const [city, setCity] = useState("");
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [dailyGoal, setDailyGoal] = useState(15);

  const totalSteps = 4;

  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return level !== "";
      case 3:
        return goal !== "";
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, name, level, goal]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = () => {
    const data: OnboardingData = {
      name: name.trim(),
      program,
      city,
      level,
      goal,
      dailyGoal,
      completedAt: new Date().toISOString(),
    };

    // Save onboarding data
    localStorage.setItem("etabli_onboarding", JSON.stringify(data));

    // Update user profile if it exists
    try {
      const existing = localStorage.getItem("etabli_user_profile");
      const profile = existing ? JSON.parse(existing) : {};
      localStorage.setItem(
        "etabli_user_profile",
        JSON.stringify({
          ...profile,
          name: data.name,
          program: data.program,
          city: data.city,
          level: data.level,
          goal: data.goal,
          dailyGoal: data.dailyGoal,
          onboardingCompletedAt: data.completedAt,
        }),
      );
    } catch {
      // Ignore parse errors
    }

    // Determine first exercise link based on level
    let firstLink = "/francisation";
    if (level === "A1" || level === "A2") {
      firstLink = "/francisation/grammaire";
    } else if (level === "B1") {
      firstLink = "/francisation/exercices";
    } else {
      firstLink = "/francisation/placement";
    }

    router.push(firstLink);
  };

  return (
    <section className="py-10 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <StepProgress current={step} total={totalSteps} />

        {/* Step content */}
        <div key={step}>
          {step === 1 && (
            <StepWelcome
              fr={fr}
              name={name}
              program={program}
              city={city}
              setName={setName}
              setProgram={setProgram}
              setCity={setCity}
            />
          )}
          {step === 2 && <StepLevel fr={fr} level={level} setLevel={setLevel} />}
          {step === 3 && (
            <StepGoal
              fr={fr}
              goal={goal}
              dailyGoal={dailyGoal}
              setGoal={setGoal}
              setDailyGoal={setDailyGoal}
            />
          )}
          {step === 4 && (
            <StepPlan fr={fr} name={name} level={level} goal={goal} dailyGoal={dailyGoal} />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10 max-w-lg mx-auto">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-[#085041] hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              {fr ? "Retour" : "Back"}
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                canProceed()
                  ? "bg-[#1D9E75] text-white hover:bg-[#178a65]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {fr ? "Suivant" : "Next"}
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#1D9E75] to-[#085041] text-white hover:opacity-90 transition-all shadow-md"
            >
              {fr ? "Commencer" : "Start"}
              <Sparkles size={16} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
