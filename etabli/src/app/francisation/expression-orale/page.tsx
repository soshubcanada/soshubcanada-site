"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { EO_EXERCISES } from "@/lib/francisation-data";
import type { ExerciseLevel } from "@/lib/francisation-data";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import {
  Mic,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  Square,
  RotateCcw,
  Info,
  Lightbulb,
  ArrowRight,
  BookText,
  CheckCircle2,
  Circle,
  MessageCircle,
  Users,
  AlertTriangle,
} from "lucide-react";

/* ─── type badge labels ─── */
const TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  entretien: { fr: "Entretien dirige", en: "Guided interview" },
  interaction: { fr: "Interaction", en: "Interaction" },
  opinion: { fr: "Opinion argumentee", en: "Argued opinion" },
};

const TYPE_ICONS: Record<string, typeof Mic> = {
  entretien: MessageCircle,
  interaction: Users,
  opinion: Lightbulb,
};

/* ─── Timer component per exercise ─── */
function ExerciseCard({
  task,
  fr,
  checks,
  onToggleCheck,
}: {
  task: (typeof EO_EXERCISES)[number];
  fr: boolean;
  checks: Record<string, boolean>;
  onToggleCheck: (key: string) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(task.duration);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Timer logic */
  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setRunning(false);
            setFinished(true);
            setRecording(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, timeLeft]);

  const handleStart = useCallback(() => {
    if (finished) return;
    setRunning(true);
  }, [finished]);

  const handleStop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleReset = useCallback(() => {
    setRunning(false);
    setFinished(false);
    setRecording(false);
    setTimeLeft(task.duration);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [task.duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((task.duration - timeLeft) / task.duration) * 100;

  const TypeIcon = TYPE_ICONS[task.type] || Mic;

  return (
    <div
      className={`bg-white rounded-2xl border-2 transition-all ${
        finished
          ? "border-red-300 shadow-lg shadow-red-100"
          : running
          ? "border-purple-400 shadow-lg shadow-purple-100"
          : "border-purple-200"
      }`}
    >
      <div className="p-6">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
            {task.level}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 flex items-center gap-1">
            <TypeIcon size={12} />
            {fr ? TYPE_LABELS[task.type].fr : TYPE_LABELS[task.type].en}
          </span>
          {task.topic && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
              {task.topic}
            </span>
          )}
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {fr ? `Duree: ${task.duration}s` : `Duration: ${task.duration}s`}
          </span>
        </div>

        {/* Prompt */}
        <AudioPlayer
          text={fr ? task.prompt_fr : task.prompt_en}
          label={fr ? "Écouter la consigne" : "Listen to instructions"}
          variant="compact"
        />
        <p className="text-gray-800 leading-relaxed mb-5">
          {fr ? task.prompt_fr : task.prompt_en}
        </p>

        {/* Timer display */}
        <div className="flex flex-col items-center mb-5">
          {/* Large number */}
          <div
            className={`text-5xl font-bold font-[family-name:var(--font-heading)] tabular-nums mb-3 ${
              finished
                ? "text-red-500"
                : timeLeft <= 10 && running
                ? "text-red-500 animate-pulse"
                : running
                ? "text-purple-600"
                : "text-gray-700"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                finished
                  ? "bg-red-400"
                  : progress > 75
                  ? "bg-orange-400"
                  : "bg-purple-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time's up alert */}
          {finished && (
            <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold">
              <AlertTriangle size={16} />
              {fr ? "Temps ecoule !" : "Time is up!"}
            </div>
          )}
        </div>

        {/* Timer controls */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {!running ? (
            <button
              onClick={handleStart}
              disabled={finished}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              {fr ? "Demarrer" : "Start"}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              <Square size={14} />
              {fr ? "Arreter" : "Stop"}
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={14} />
            {fr ? "Reinitialiser" : "Reset"}
          </button>
        </div>

        {/* Record button */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={() => setRecording(!recording)}
            className="group relative"
          >
            {/* Pulsing ring when recording */}
            {recording && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
                <span className="absolute -inset-1 rounded-full bg-red-400 animate-pulse opacity-20" />
              </>
            )}
            <div
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                recording
                  ? "bg-red-500 shadow-lg shadow-red-200 scale-110"
                  : "bg-red-500 hover:bg-red-600 shadow-md"
              }`}
            >
              <Mic size={24} className="text-white" />
            </div>
          </button>
          <span className="text-xs text-gray-400 mt-2">
            {recording
              ? fr
                ? "Enregistrement en cours... (simulation)"
                : "Recording... (simulation)"
              : fr
              ? "Enregistrer (simulation)"
              : "Record (simulation)"}
          </span>
        </div>

        {/* Talking points (collapsible) */}
        {task.samplePoints && task.samplePoints.length > 0 && (
          <div className="mb-5">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
            >
              {showHints ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {fr ? "Voir les points clés" : "Show key points"}
            </button>
            {showHints && (
              <div className="mt-3 bg-purple-50 rounded-xl p-4 border border-purple-100">
                <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
                  {fr ? "Points de discussion" : "Talking points"}
                </h4>
                <ul className="space-y-1.5">
                  {task.samplePoints.map((pt, i) => (
                    <li
                      key={i}
                      className="text-sm text-purple-800 flex items-start gap-2"
                    >
                      <span className="text-purple-400 mt-0.5 shrink-0">
                        &bull;
                      </span>
                      <span className="italic">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Self-assessment checklist */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            {fr ? "Auto-évaluation" : "Self-assessment"}
          </h4>
          <div className="space-y-2">
            {task.criteria.map((criterion, i) => {
              const key = `${task.id}-${i}`;
              const checked = !!checks[key];
              return (
                <label
                  key={i}
                  className="flex items-start gap-2.5 cursor-pointer group"
                >
                  <button
                    onClick={() => onToggleCheck(key)}
                    className="mt-0.5 shrink-0"
                  >
                    {checked ? (
                      <CheckCircle2
                        size={18}
                        className="text-[#1D9E75]"
                      />
                    ) : (
                      <Circle
                        size={18}
                        className="text-gray-300 group-hover:text-purple-400 transition-colors"
                      />
                    )}
                  </button>
                  <span
                    className={`text-sm ${
                      checked ? "text-gray-500 line-through" : "text-gray-700"
                    }`}
                  >
                    {criterion}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
function ExpressionOralePage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const levels: ExerciseLevel[] = ["A2", "B1", "B2", "C1"];
  const [selectedLevel, setSelectedLevel] = useState<ExerciseLevel>("A2");
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const filtered = EO_EXERCISES.filter((ex) => ex.level === selectedLevel);

  const toggleCheck = useCallback((key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <Link
            href="/francisation"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={14} />
            {fr ? "Francisation" : "Francisation"}
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Mic size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                {fr ? "Expression orale (EO)" : "Oral Expression (EO)"}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {fr
                  ? "Francisation > Expression orale"
                  : "Francisation > Oral Expression"}
              </p>
            </div>
          </div>

          <p className="text-white/80 max-w-2xl leading-relaxed">
            {fr
              ? "Entrainez-vous a parler avec des sujets lies a l'immigration et l'établissement au Québec. Chronometre, auto-évaluation et points de discussion inclus."
              : "Practice speaking with topics related to immigration and settling in Québec. Timer, self-assessment, and talking points included."}
          </p>
        </div>
      </section>

      {/* Info box: TCF EO format */}
      <section className="bg-purple-50 border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-purple-500 mt-0.5 shrink-0" />
            <div className="text-sm text-purple-800">
              <span className="font-semibold">
                {fr ? "Format TCF EO :" : "TCF EO format:"}
              </span>{" "}
              {fr
                ? "3 tâches en 12 minutes — Tâche 1: entretien dirige (A2), Tâche 2: interaction (B1), Tâche 3: opinion argumentee (B2-C1). L'examinateur pose les questions; vous repondez de maniere naturelle et structuree."
                : "3 tasks in 12 minutes — Task 1: guided interview (A2), Task 2: interaction (B1), Task 3: argued opinion (B2-C1). The examiner asks questions; you answer naturally and in a structured way."}
            </div>
          </div>
        </div>
      </section>

      {/* Level filter tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {levels.map((lvl) => {
              const count = EO_EXERCISES.filter((e) => e.level === lvl).length;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedLevel === lvl
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  {lvl}{" "}
                  <span
                    className={`ml-1 text-xs ${
                      selectedLevel === lvl ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exercise cards */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              {fr
                ? "Aucun exercice pour ce niveau."
                : "No exercises for this level."}
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((task) => (
                <ExerciseCard
                  key={task.id}
                  task={task}
                  fr={fr}
                  checks={checks}
                  onToggleCheck={toggleCheck}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tips section */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-6 flex items-center gap-2">
            <Lightbulb size={22} className="text-purple-500" />
            {fr
              ? "Conseils pour l'expression orale"
              : "Tips for oral expression"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {(fr
              ? [
                  {
                    title: "Structurez vos réponses",
                    desc: "Utilisez des connecteurs: premierement, ensuite, enfin, en revanche, de plus. L'examinateur évalue votre capacite a organiser vos idees.",
                  },
                  {
                    title: "Prenez votre temps",
                    desc: "Il est normal de prendre 2-3 secondes de reflexion avant de repondre. Un silence court est mieux qu'une réponse confuse.",
                  },
                  {
                    title: "Donnez des exemples concrets",
                    desc: "Au lieu de réponses generales, illustrez avec votre experience personnelle. 'Par exemple, quand je suis arrive au Québec...'",
                  },
                  {
                    title: "Soignez le vouvoiement",
                    desc: "En entretien TCF/TEF, utilisez 'vous' avec l'examinateur. Le tutoiement est penalise dans le registre formel.",
                  },
                  {
                    title: "Gerez le stress",
                    desc: "Respirez profondement avant de commencer. Si vous ne comprenez pas une question, demandez poliment de répéter.",
                  },
                  {
                    title: "Entrainez-vous a voix haute",
                    desc: "Pratiquez seul devant un miroir ou enregistrez-vous avec votre telephone. La fluidite vient avec la répétition.",
                  },
                ]
              : [
                  {
                    title: "Structure your answers",
                    desc: "Use connectors: first, then, finally, however, moreover. The examiner evaluates your ability to organize ideas.",
                  },
                  {
                    title: "Take your time",
                    desc: "It's normal to take 2-3 seconds to reflect before answering. A short pause is better than a confused answer.",
                  },
                  {
                    title: "Give concrete examples",
                    desc: "Instead of general answers, illustrate with personal experience. 'For example, when I arrived in Québec...'",
                  },
                  {
                    title: "Use formal register",
                    desc: "In TCF/TEF interviews, use 'vous' with the examiner. Informal 'tu' is penalized in formal register.",
                  },
                  {
                    title: "Manage stress",
                    desc: "Breathe deeply before starting. If you don't understand a question, politely ask to repeat.",
                  },
                  {
                    title: "Practice out loud",
                    desc: "Practice alone in front of a mirror or record yourself with your phone. Fluency comes with répétition.",
                  },
                ]
            ).map((tip, i) => (
              <div
                key={i}
                className="bg-purple-50 rounded-xl p-4 border border-purple-100"
              >
                <h3 className="text-sm font-bold text-purple-800 mb-1">
                  {tip.title}
                </h3>
                <p className="text-sm text-purple-700/80 leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA to Vocabulaire + Back */}
      <section className="py-12 bg-gradient-to-br from-[#085041] to-[#0a6350]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] mb-3">
            {fr
              ? "Continuez avec le vocabulaire d'établissement"
              : "Continue with settlement vocabulary"}
          </h2>
          <p className="text-white/70 mb-6 text-sm">
            {fr
              ? "Enrichissez votre vocabulaire pour mieux réussir l'expression orale et toutes les autres épreuves."
              : "Enrich your vocabulary to better succeed in oral expression and all other tests."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/francisation/vocabulaire"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-lg"
            >
              <BookText size={16} />
              {fr ? "Vocabulaire" : "Vocabulary"}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/francisation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={16} />
              {fr ? "Retour a Francisation" : "Back to Francisation"}
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
      <ExpressionOralePage />
    </Shell>
  );
}
