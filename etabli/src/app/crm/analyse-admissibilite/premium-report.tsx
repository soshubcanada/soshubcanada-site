"use client";
import {
  Shield, CheckCircle2, XCircle, Star, TrendingUp, Award, Target,
  Lightbulb, FileText, Send, Download, Clock, DollarSign, ArrowRight,
  Globe2, GraduationCap, Languages, Briefcase, Heart, Users,
} from "lucide-react";
import type { EligibilityAnalysis, ProgramEligibility } from "@/lib/eligibility-engine";
import type { CrsBreakdown, MifiBreakdown, ImprovementAdvice } from "@/lib/crm-scoring";

// ═══════════════════════════════════════════════════════════
// SVG CHART COMPONENTS — Premium presentation
// ═══════════════════════════════════════════════════════════

// ── Radar Chart (Spider) ──
function RadarChart({ data, size = 220 }: { data: { label: string; value: number; max: number }[]; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;
  const levels = [0.25, 0.5, 0.75, 1];

  const getPoint = (i: number, ratio: number) => ({
    x: cx + r * ratio * Math.cos(angleStep * i - Math.PI / 2),
    y: cy + r * ratio * Math.sin(angleStep * i - Math.PI / 2),
  });

  const dataPoints = data.map((d, i) => getPoint(i, d.max > 0 ? d.value / d.max : 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="mx-auto">
      {/* Grid levels */}
      {levels.map(lv => {
        const pts = Array.from({ length: n }, (_, i) => getPoint(i, lv));
        return <polygon key={lv} points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#E2E8F0" strokeWidth="0.5" />;
      })}
      {/* Axes */}
      {data.map((_, i) => {
        const p = getPoint(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth="0.5" />;
      })}
      {/* Data polygon */}
      <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(" ")} fill="rgba(212,160,60,0.2)" stroke="#D4A03C" strokeWidth="2" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#D4A03C" stroke="#FFF" strokeWidth="1.5" />
      ))}
      {/* Labels */}
      {data.map((d, i) => {
        const p = getPoint(i, 1.2);
        const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle";
        return (
          <g key={`lbl-${i}`}>
            <text x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle" fontSize="8" fontWeight="600" fill="#1B2559">{d.label}</text>
            <text x={p.x} y={p.y + 10} textAnchor={anchor} dominantBaseline="middle" fontSize="7" fill="#D4A03C" fontWeight="700">
              {d.value}{d.max > 100 ? "" : "%"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut / Pie Chart ──
function DonutChart({ segments, size = 180, label, sublabel }: {
  segments: { value: number; color: string; label: string }[];
  size?: number; label: string; sublabel: string;
}) {
  const cx = size / 2, cy = size / 2, r = size * 0.35, stroke = size * 0.12;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        {/* Segments */}
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = circumference * pct;
          const gap = circumference - dash;
          const rotation = -90 + (offset / total) * 360;
          offset += seg.value;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rotation} ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          );
        })}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="900" fill="#1B2559">{label}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94A3B8">{sublabel}</text>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] text-gray-600">{seg.label} ({seg.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Horizontal Bar Chart ──
function HBarChart({ bars, maxValue }: { bars: { label: string; value: number; max: number; color: string }[]; maxValue?: number }) {
  const mx = maxValue || Math.max(...bars.map(b => b.max), 1);
  return (
    <div className="space-y-2.5">
      {bars.map((bar, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700">{bar.label}</span>
            <span className="font-bold" style={{ color: bar.color }}>{bar.value} <span className="text-gray-400 font-normal">/ {bar.max}</span></span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-1.5"
              style={{ width: `${Math.max((bar.value / mx) * 100, bar.value > 0 ? 3 : 0)}%`, backgroundColor: bar.color }}>
              {bar.value / mx > 0.15 && <span className="text-[9px] font-bold text-white">{Math.round((bar.value / bar.max) * 100)}%</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Score Gauge ──
function ScoreGauge({ score, max, label, threshold }: { score: number; max: number; label: string; threshold?: number }) {
  const pct = Math.min((score / max) * 100, 100);
  const angle = (pct / 100) * 180;
  const color = pct >= 70 ? "#059669" : pct >= 45 ? "#D4A03C" : "#DC2626";
  const r = 70;
  const cx = 90, cy = 85;

  // Arc path
  const startX = cx - r, startY = cy;
  const endAngle = Math.PI - (angle * Math.PI / 180);
  const endX = cx + r * Math.cos(endAngle);
  const endY = cy - r * Math.sin(endAngle);
  const largeArc = angle > 90 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 180 100" width="180" height="100">
        {/* Background arc */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#F1F5F9" strokeWidth="14" strokeLinecap="round" />
        {/* Value arc */}
        {score > 0 && (
          <path d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
            style={{ transition: "all 0.8s ease" }} />
        )}
        {/* Threshold marker */}
        {threshold && (() => {
          const tAngle = Math.PI - ((threshold / max) * 180 * Math.PI / 180);
          const tx = cx + (r + 12) * Math.cos(tAngle);
          const ty = cy - (r + 12) * Math.sin(tAngle);
          return <text x={tx} y={ty} textAnchor="middle" fontSize="7" fill="#94A3B8">{threshold}</text>;
        })()}
        {/* Score text */}
        <text x={cx} y={cy - 15} textAnchor="middle" fontSize="28" fontWeight="900" fill="#1B2559">{score}</text>
        <text x={cx} y={cy} textAnchor="middle" fontSize="9" fill="#94A3B8">/ {max}</text>
      </svg>
      <div className="text-xs font-semibold text-gray-700 -mt-1">{label}</div>
    </div>
  );
}

// ── Program Score Card ──
function ProgramScoreCard({ program, rank, isPremium }: { program: ProgramEligibility; rank: number; isPremium: boolean }) {
  const eligColors: Record<string, { bg: string; text: string; badge: string }> = {
    eligible: { bg: "bg-green-50 border-green-200", text: "text-green-700", badge: "bg-green-500" },
    likely_eligible: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", badge: "bg-blue-500" },
    possibly_eligible: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", badge: "bg-amber-500" },
    not_eligible: { bg: "bg-red-50 border-red-200", text: "text-red-700", badge: "bg-red-500" },
    ended: { bg: "bg-gray-50 border-gray-200", text: "text-gray-500", badge: "bg-gray-400" },
  };
  const eligLabels: Record<string, string> = {
    eligible: "ADMISSIBLE", likely_eligible: "PROBABLEMENT ADMISSIBLE",
    possibly_eligible: "POSSIBLEMENT ADMISSIBLE", not_eligible: "NON ADMISSIBLE", ended: "PROGRAMME TERMINÉ",
  };
  const c = eligColors[program.eligibility] || eligColors.not_eligible;
  const isGood = program.eligibility === "eligible" || program.eligibility === "likely_eligible";
  const blurred = !isPremium && rank > 3;

  return (
    <div className={`rounded-xl border-2 p-5 transition-all ${c.bg} ${blurred ? "filter blur-sm pointer-events-none select-none" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {rank <= 3 && <div className="w-7 h-7 rounded-full bg-[#D4A03C] flex items-center justify-center text-white text-xs font-black">{rank}</div>}
          <div>
            <h3 className="font-bold text-[#1B2559] text-sm leading-tight">{program.programNameFr}</h3>
            <div className="text-[10px] text-gray-400 mt-0.5">Délai : {program.estimatedProcessingTime}</div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black text-white ${c.badge}`}>
          {eligLabels[program.eligibility]}
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-gray-500">Score de compatibilité</span>
          <span className="font-bold text-[#1B2559]">{program.score}%</span>
        </div>
        <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${program.score}%`, backgroundColor: isGood ? "#059669" : program.score >= 50 ? "#D4A03C" : "#DC2626" }} />
        </div>
      </div>

      {/* Priority stars */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-[10px] text-gray-500 mr-1">Priorité :</span>
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={12} className={s <= program.priority ? "text-[#D4A03C] fill-[#D4A03C]" : "text-gray-300"} />
        ))}
      </div>

      {/* Strengths */}
      {isGood && program.keyStrengths.length > 0 && (
        <div className="space-y-1 mb-3">
          {program.keyStrengths.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] text-green-700">
              <CheckCircle2 size={12} className="shrink-0 mt-0.5" /> {s}
            </div>
          ))}
        </div>
      )}

      {/* Missing */}
      {program.missingRequirements.length > 0 && (
        <div className="space-y-1 mb-3">
          {program.missingRequirements.slice(0, 2).map((s, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-600">
              <XCircle size={12} className="shrink-0 mt-0.5" /> {s}
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {isPremium && program.recommendations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-1">
          {program.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] text-blue-700">
              <Lightbulb size={12} className="shrink-0 mt-0.5 text-[#D4A03C]" /> {r}
            </div>
          ))}
        </div>
      )}

      {/* SOS Hub CTA for work permit */}
      {(program.programNameFr.toLowerCase().includes("travail") || program.programNameFr.toLowerCase().includes("eimt")) && isGood && (
        <div className="mt-3 p-2.5 rounded-lg bg-[#1B2559]/5 border border-[#1B2559]/10">
          <p className="text-[11px] text-[#1B2559] font-medium">
            → <strong>SOS Hub Canada</strong> peut vous aider à déposer votre demande avec un employeur partenaire
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PREMIUM REPORT COMPONENT
// ═══════════════════════════════════════════════════════════

interface PremiumReportProps {
  analysis: EligibilityAnalysis;
  crsBreakdown?: CrsBreakdown | null;
  mifiBreakdown?: MifiBreakdown | null;
  crsAdvice?: ImprovementAdvice[];
  mifiAdvice?: ImprovementAdvice[];
  isPremium: boolean;
  onSendEmail?: () => void;
  onExportPDF?: () => void;
}

export default function PremiumReport({
  analysis, crsBreakdown, mifiBreakdown, crsAdvice, mifiAdvice, isPremium, onSendEmail, onExportPDF,
}: PremiumReportProps) {
  const eligible = analysis.programs.filter(p => p.eligibility === "eligible" || p.eligibility === "likely_eligible");
  const possible = analysis.programs.filter(p => p.eligibility === "possibly_eligible");
  const notElig = analysis.programs.filter(p => p.eligibility === "not_eligible" || p.eligibility === "ended");

  // Sort programs: eligible first, then by score desc
  const sortedPrograms = [...analysis.programs].sort((a, b) => {
    const order: Record<string, number> = { eligible: 0, likely_eligible: 1, possibly_eligible: 2, not_eligible: 3, ended: 4 };
    const diff = (order[a.eligibility] ?? 3) - (order[b.eligibility] ?? 3);
    return diff !== 0 ? diff : b.score - a.score;
  });

  // Move work permit to first if eligible
  const workPermitIdx = sortedPrograms.findIndex(p =>
    (p.eligibility === "eligible" || p.eligibility === "likely_eligible") &&
    (p.programNameFr.toLowerCase().includes("travail") || p.programNameFr.toLowerCase().includes("eimt"))
  );
  if (workPermitIdx > 0) {
    const [wp] = sortedPrograms.splice(workPermitIdx, 1);
    sortedPrograms.unshift(wp);
  }

  // Radar data from nested CRS breakdown
  const core = crsBreakdown?.coreHumanCapital;
  const add = crsBreakdown?.additional;
  const st = crsBreakdown?.skillTransferability;
  const radarData = [
    { label: "Éducation", value: core?.education || 0, max: 150 },
    { label: "Langues", value: (core?.firstLanguage || 0) + (core?.secondLanguage || 0), max: 160 },
    { label: "Expérience", value: core?.canadianExperience || 0, max: 80 },
    { label: "Âge", value: core?.age || 0, max: 110 },
    { label: "Adaptabilité", value: st?.subtotal || 0, max: 100 },
    { label: "Bonus", value: add?.subtotal || 0, max: 600 },
  ];

  // Donut segments for eligibility overview
  const donutSegments = [
    { value: eligible.length, color: "#059669", label: "Admissible" },
    { value: possible.length, color: "#D4A03C", label: "Possible" },
    { value: notElig.length, color: "#DC2626", label: "Non admissible" },
  ].filter(s => s.value > 0);

  // CRS breakdown bars from nested structure
  const crsBars = crsBreakdown ? [
    { label: "Âge", value: crsBreakdown.coreHumanCapital.age, max: 110, color: "#1B2559" },
    { label: "Éducation", value: crsBreakdown.coreHumanCapital.education, max: 150, color: "#2563EB" },
    { label: "1re langue", value: crsBreakdown.coreHumanCapital.firstLanguage, max: 136, color: "#059669" },
    { label: "2e langue", value: crsBreakdown.coreHumanCapital.secondLanguage, max: 24, color: "#0891B2" },
    { label: "Exp. canadienne", value: crsBreakdown.coreHumanCapital.canadianExperience, max: 80, color: "#D4A03C" },
    { label: "Conjoint", value: crsBreakdown.spouseFactors.subtotal, max: 40, color: "#EA580C" },
    { label: "Transférabilité", value: crsBreakdown.skillTransferability.subtotal, max: 100, color: "#7C3AED" },
    { label: "Offre d'emploi", value: crsBreakdown.additional.jobOffer, max: 200, color: "#DC2626" },
    { label: "PNP / Francophone", value: crsBreakdown.additional.provincialNomination + crsBreakdown.additional.frenchLanguageBonus, max: 625, color: "#059669" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4A03C]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={20} className="text-[#D4A03C]" />
            {isPremium && <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#D4A03C] text-white tracking-wider">RAPPORT PREMIUM</span>}
          </div>
          <h1 className="text-2xl font-black">Analyse d&apos;admissibilité</h1>
          <p className="text-white/60 text-sm mt-1">{analysis.clientName} — {new Date(analysis.analysisDate).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      {/* ═══ SCORE OVERVIEW ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
          <DonutChart
            segments={donutSegments}
            label={`${eligible.length}`}
            sublabel={`sur ${analysis.programs.length} programmes`}
          />
          <div className="text-xs font-semibold text-[#1B2559] mt-2">Programmes admissibles</div>
        </div>

        {/* CRS Gauge */}
        {crsBreakdown && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
            <ScoreGauge score={crsBreakdown.total} max={1200} label="Score CRS" threshold={520} />
            <div className="mt-2 text-center">
              <div className="text-[10px] text-gray-400">Seuil récent ~520 pts</div>
              <div className={`text-xs font-bold mt-1 ${crsBreakdown.total >= 520 ? "text-green-600" : crsBreakdown.total >= 450 ? "text-amber-600" : "text-red-600"}`}>
                {crsBreakdown.total >= 520 ? "Au-dessus du seuil ✓" : crsBreakdown.total >= 450 ? "Proche du seuil" : "Sous le seuil"}
              </div>
            </div>
          </div>
        )}

        {/* Radar */}
        {crsBreakdown && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
            <RadarChart data={radarData} />
            <div className="text-xs font-semibold text-[#1B2559] mt-1">Profil de compétences</div>
          </div>
        )}
      </div>

      {/* ═══ SUMMARY ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-[#1B2559] mb-3 flex items-center gap-2">
          <Target size={18} className="text-[#D4A03C]" />
          Résumé de l&apos;analyse
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">{analysis.overallSummary}</p>
        <div className="p-4 rounded-lg bg-[#D4A03C]/5 border border-[#D4A03C]/20">
          <div className="flex items-start gap-2">
            <Award size={18} className="text-[#D4A03C] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#D4A03C] uppercase tracking-wider mb-1">Recommandation principale</div>
              <p className="text-sm text-[#1B2559] font-medium">{analysis.topRecommendation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CRS BREAKDOWN (Premium) ═══ */}
      {isPremium && crsBreakdown && crsBars.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-[#1B2559] mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#D4A03C]" />
            Ventilation détaillée du score CRS — {crsBreakdown.total} / 1200
          </h2>
          <HBarChart bars={crsBars} />
        </div>
      )}

      {/* ═══ MIFI BREAKDOWN (Premium) ═══ */}
      {isPremium && mifiBreakdown && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-[#1B2559] mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#D4A03C]" />
            Score MIFI Québec — {mifiBreakdown.total}
          </h2>
          <HBarChart bars={[
            { label: "Formation", value: mifiBreakdown.formation.subtotal, max: 18, color: "#1B2559" },
            { label: "Expérience", value: mifiBreakdown.experience.subtotal, max: 10, color: "#2563EB" },
            { label: "Âge", value: mifiBreakdown.age, max: 6, color: "#059669" },
            { label: "Français", value: mifiBreakdown.langues.francais, max: 16, color: "#D4A03C" },
            { label: "Anglais", value: mifiBreakdown.langues.anglais, max: 6, color: "#0891B2" },
            { label: "Séjour/Études QC", value: mifiBreakdown.sejourEtudes, max: 10, color: "#7C3AED" },
            { label: "Offre emploi", value: mifiBreakdown.offreEmploi, max: 14, color: "#DC2626" },
            { label: "Enfants", value: mifiBreakdown.enfants, max: 8, color: "#6366F1" },
            { label: "Connexion QC", value: mifiBreakdown.connexionQuebec, max: 6, color: "#EA580C" },
          ]} />
        </div>
      )}

      {/* ═══ IMPROVEMENT ADVICE (Premium) ═══ */}
      {isPremium && crsAdvice && crsAdvice.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-[#1B2559] mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-[#D4A03C]" />
            Plan d&apos;amélioration personnalisé
          </h2>
          <div className="space-y-3">
            {crsAdvice.map((adv, i) => {
              const potentialGain = adv.maxPoints - adv.currentPoints;
              const impactColors: Record<string, string> = { 'faible': 'bg-gray-100 text-gray-600', 'moyen': 'bg-blue-100 text-blue-700', 'élevé': 'bg-amber-100 text-amber-700', 'très_élevé': 'bg-green-100 text-green-700' };
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="w-8 h-8 rounded-full bg-[#D4A03C] flex items-center justify-center text-white text-xs font-black shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[#1B2559]">{adv.category}</span>
                      {potentialGain > 0 && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700">+{potentialGain} pts potentiels</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${impactColors[adv.impact] || 'bg-gray-100 text-gray-600'}`}>
                        Impact : {adv.impact.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{adv.advice}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[9px] text-gray-400">Actuel : {adv.currentPoints}/{adv.maxPoints}</span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[120px]">
                        <div className="h-full bg-[#D4A03C] rounded-full" style={{ width: `${adv.maxPoints > 0 ? (adv.currentPoints / adv.maxPoints) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ PROGRAMS ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-[#1B2559] mb-4 flex items-center gap-2">
          <FileText size={18} className="text-[#D4A03C]" />
          Analyse par programme ({sortedPrograms.length})
        </h2>

        {/* Eligible programs */}
        {eligible.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} className="text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Programmes admissibles ({eligible.length})</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedPrograms
                .filter(p => p.eligibility === "eligible" || p.eligibility === "likely_eligible")
                .map((p, i) => <ProgramScoreCard key={p.programId} program={p} rank={i + 1} isPremium={isPremium} />)}
            </div>
          </div>
        )}

        {/* Possible programs */}
        {possible.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Possiblement admissibles ({possible.length})</span>
            </div>
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${!isPremium ? "relative" : ""}`}>
              {sortedPrograms
                .filter(p => p.eligibility === "possibly_eligible")
                .map((p, i) => <ProgramScoreCard key={p.programId} program={p} rank={eligible.length + i + 1} isPremium={isPremium} />)}
              {!isPremium && possible.length > 2 && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white flex items-end justify-center pb-8">
                  <div className="text-center">
                    <div className="text-sm font-bold text-[#1B2559]">Débloquez l&apos;analyse complète</div>
                    <div className="text-xs text-gray-500 mt-1">Rapport premium avec tous les programmes</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Not eligible (Premium only) */}
        {isPremium && notElig.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={14} className="text-red-500" />
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Non admissibles ({notElig.length})</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedPrograms
                .filter(p => p.eligibility === "not_eligible" || p.eligibility === "ended")
                .map((p, i) => <ProgramScoreCard key={p.programId} program={p} rank={0} isPremium={isPremium} />)}
            </div>
          </div>
        )}
      </div>

      {/* ═══ CTA (Non-premium) ═══ */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] rounded-2xl p-8 text-center text-white">
          <div className="inline-block px-4 py-1 rounded-full bg-[#D4A03C] text-white text-xs font-black mb-4 tracking-wider">OFFRE SPÉCIALE</div>
          <h2 className="text-xl font-black mb-2">Rapport complet + Consultation gratuite</h2>
          <p className="text-white/60 text-sm mb-4 max-w-md mx-auto">
            Analyse détaillée des {analysis.programs.length} programmes avec plan d&apos;amélioration personnalisé et consultation de 30 minutes
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-white/40 line-through text-lg">149,99 $</span>
            <span className="text-3xl font-black text-[#D4A03C]">49,99 $</span>
          </div>
          <a href={`/achat-rapport?plan=analyse-premium&name=${encodeURIComponent(analysis.clientName)}`}
            className="inline-block px-8 py-3 bg-[#D4A03C] text-white font-black rounded-xl text-sm hover:bg-[#C49035] transition-colors shadow-lg">
            Obtenir le rapport complet — 49,99 $
          </a>
          <div className="mt-4 text-white/30 text-[10px]">Paiement sécurisé par Square | Rapport livré en 24h</div>
        </div>
      )}

      {/* ═══ CONTACT FOOTER ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
        <p className="text-sm text-gray-700 mb-3">
          Besoin d&apos;aide pour déposer votre demande ?
        </p>
        <p className="text-lg font-black text-[#1B2559] mb-2">SOS Hub Canada</p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
          <a href="https://wa.me/14386302869" className="flex items-center gap-1 hover:text-green-600">WhatsApp : +1 (438) 630-2869</a>
          <a href="mailto:info@soshubcanada.com" className="flex items-center gap-1 hover:text-blue-600">info@soshubcanada.com</a>
          <span>3737 Crémazie Est #402, Montréal QC H1Z 2K4</span>
        </div>
      </div>

      {/* ═══ ACTION BUTTONS ═══ */}
      <div className="flex flex-wrap gap-3">
        <button onClick={onExportPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1B2559] text-white rounded-lg text-sm font-bold hover:bg-[#1B2559]/90 transition-colors">
          <Download size={16} /> Exporter PDF {isPremium && "Premium"}
        </button>
        <button onClick={onSendEmail}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A03C] text-white rounded-lg text-sm font-bold hover:bg-[#D4A03C]/90 transition-colors">
          <Send size={16} /> Envoyer au client
        </button>
      </div>
    </div>
  );
}
