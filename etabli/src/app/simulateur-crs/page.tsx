"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── CRS SCORING FUNCTIONS ───

// Age points: single vs married
const agePointsSingle = (a: number) => {
  if (a >= 18 && a <= 35) return 110;
  if (a === 36) return 99; if (a === 37) return 88; if (a === 38) return 77;
  if (a === 39) return 66; if (a === 40) return 55; if (a === 41) return 44;
  if (a === 42) return 33; if (a === 43) return 22; if (a === 44) return 11;
  return 0;
};
const agePointsMarried = (a: number) => {
  if (a >= 18 && a <= 35) return 100;
  if (a === 36) return 90; if (a === 37) return 80; if (a === 38) return 70;
  if (a === 39) return 60; if (a === 40) return 50; if (a === 41) return 40;
  if (a === 42) return 30; if (a === 43) return 20; if (a === 44) return 10;
  return 0;
};

// Education points
const eduPointsSingle = (e: string) => ({ none: 0, highschool: 30, oneyear: 90, twoyear: 98, threeyear: 120, master: 135, phd: 150 }[e] || 0);
const eduPointsMarried = (e: string) => ({ none: 0, highschool: 28, oneyear: 84, twoyear: 91, threeyear: 112, master: 126, phd: 140 }[e] || 0);

// First official language (French) - per ability (4 abilities)
const firstLangPtsSingle = (clb: number) => {
  if (clb <= 3) return 0; if (clb <= 5) return 6; if (clb === 6) return 8;
  if (clb === 7) return 16; if (clb === 8) return 22; if (clb === 9) return 29;
  return 32; // CLB 10+
};
const firstLangPtsMarried = (clb: number) => {
  if (clb <= 3) return 0; if (clb <= 5) return 6; if (clb === 6) return 8;
  if (clb === 7) return 16; if (clb === 8) return 22; if (clb === 9) return 29;
  return 32; // CLB 10+
};

// Second official language (English) - per ability
const secondLangPts = (clb: number) => {
  if (clb <= 4) return 0; if (clb <= 6) return 1; if (clb <= 8) return 3;
  return 6; // CLB 9+
};

// Canadian work experience
const canWorkPtsSingle = (y: number) => {
  if (y === 0) return 0; if (y === 1) return 40; if (y === 2) return 53;
  if (y === 3) return 64; if (y === 4) return 72; return 80;
};
const canWorkPtsMarried = (y: number) => {
  if (y === 0) return 0; if (y === 1) return 35; if (y === 2) return 46;
  if (y === 3) return 56; if (y === 4) return 63; return 70;
};

// Spouse factors
const spouseEduPts = (e: string) => ({ none: 0, highschool: 2, oneyear: 6, twoyear: 7, threeyear: 8, master: 10, phd: 10 }[e] || 0);
const spouseLangPts = (clb: number) => {
  if (clb <= 4) return 0; if (clb <= 6) return 1; if (clb <= 8) return 3; return 5;
};
const spouseCanWorkPts = (y: number) => {
  if (y === 0) return 0; if (y === 1) return 5; if (y === 2) return 7;
  if (y === 3) return 8; if (y === 4) return 9; return 10;
};

// Skill transferability factors
const calcSkillTransfer = (
  edu: string, firstLangAvg: number, canWork: number, foreignWork: number, certQual: boolean
) => {
  let total = 0;

  // Education level mapping for transferability
  const eduLevel = ({ none: 0, highschool: 0, oneyear: 1, twoyear: 1, threeyear: 2, master: 2, phd: 2 }[edu] || 0);
  const hasPostSec = eduLevel >= 1;
  const hasBachPlus = eduLevel >= 2;

  // A) Education + Language (max 50)
  if (hasPostSec && firstLangAvg >= 7) {
    let pts = 0;
    if (hasBachPlus && firstLangAvg >= 9) pts = 50;
    else if (hasBachPlus && firstLangAvg >= 7) pts = 25;
    else if (hasPostSec && firstLangAvg >= 9) pts = 25;
    else pts = 13;
    total += pts;
  }

  // B) Education + Canadian experience (max 50)
  if (hasPostSec && canWork >= 1) {
    let pts = 0;
    if (hasBachPlus && canWork >= 2) pts = 50;
    else if (hasBachPlus && canWork >= 1) pts = 25;
    else if (hasPostSec && canWork >= 2) pts = 25;
    else pts = 13;
    total += pts;
  }

  // C) Foreign work + Canadian work (max 50)
  if (foreignWork >= 1 && canWork >= 1) {
    let pts = 0;
    if (foreignWork >= 3 && canWork >= 2) pts = 50;
    else if (foreignWork >= 3 && canWork >= 1) pts = 25;
    else if (foreignWork >= 1 && canWork >= 2) pts = 25;
    else pts = 13;
    total += pts;
  }

  // D) Foreign work + Language (max 50)
  if (foreignWork >= 1 && firstLangAvg >= 7) {
    let pts = 0;
    if (foreignWork >= 3 && firstLangAvg >= 9) pts = 50;
    else if (foreignWork >= 3 && firstLangAvg >= 7) pts = 25;
    else if (foreignWork >= 1 && firstLangAvg >= 9) pts = 25;
    else pts = 13;
    total += pts;
  }

  // E) Certificate of qualification + Language (max 50)
  if (certQual && firstLangAvg >= 5) {
    if (firstLangAvg >= 7) total += 50;
    else total += 25;
  }

  return Math.min(100, total);
};

// ─── UI COMPONENTS ───

function Slider({ label, value, onChange, min = 0, max = 12, pts, suffix = "" }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; pts: number; suffix?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-700 font-medium">{label}</span>
        <span>
          <strong className="text-[#085041]">{value}{suffix}</strong>{" "}
          <span className="text-[#1D9E75] text-xs">({pts} pts)</span>
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-[#1D9E75]" />
    </div>
  );
}

function Select({ label, value, onChange, options, pts }: {
  label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; pts: number;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-[#1D9E75] text-xs">{pts} pts</span>
      </div>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none">
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, value, onChange, pts }: {
  label: string; value: boolean; onChange: (v: boolean) => void; pts: string;
}) {
  return (
    <div onClick={() => onChange(!value)}
      className={`flex justify-between items-center mb-2.5 p-3 rounded-xl border cursor-pointer transition-all ${value ? "bg-[#E1F5EE] border-[#1D9E75]/30" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}>
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#1D9E75]">{pts} pts</span>
        <div className={`w-10 h-[22px] rounded-full relative transition-colors ${value ? "bg-[#1D9E75]" : "bg-gray-300"}`}>
          <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-all shadow-sm ${value ? "left-5" : "left-0.5"}`} />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold" style={{ color }}>{value} pts</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full transition-all duration-300" style={{ background: color, width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }} />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───

function CRSSimulatorPage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  // Personal
  const [age, setAge] = useState(30);
  const [hasSpouse, setHasSpouse] = useState(false);
  const married = hasSpouse;

  // Education
  const [edu, setEdu] = useState("threeyear");

  // First official language (French) - 4 abilities
  const [frListening, setFrListening] = useState(8);
  const [frReading, setFrReading] = useState(8);
  const [frWriting, setFrWriting] = useState(7);
  const [frSpeaking, setFrSpeaking] = useState(7);

  // Second official language (English) - 4 abilities
  const [enListening, setEnListening] = useState(7);
  const [enReading, setEnReading] = useState(7);
  const [enWriting, setEnWriting] = useState(6);
  const [enSpeaking, setEnSpeaking] = useState(6);

  // Work experience
  const [canWork, setCanWork] = useState(1);
  const [foreignWork, setForeignWork] = useState(3);
  const [certQual, setCertQual] = useState(false);

  // Spouse factors
  const [spouseEdu, setSpouseEdu] = useState("threeyear");
  const [spouseLang, setSpouseLang] = useState(7);
  const [spouseCanWork, setSpouseCanWork] = useState(0);

  // Additional factors
  const [provNomination, setProvNomination] = useState(false);
  const [jobOfferTeer, setJobOfferTeer] = useState("none");
  const [canEducation, setCanEducation] = useState("none");
  const [frenchBonus, setFrenchBonus] = useState("none");
  const [siblingInCanada, setSiblingInCanada] = useState(false);

  // ─── SCORE CALCULATIONS ───

  // Core / Human Capital
  const s_age = married ? agePointsMarried(age) : agePointsSingle(age);
  const s_edu = married ? eduPointsMarried(edu) : eduPointsSingle(edu);

  const s_frListen = married ? firstLangPtsMarried(frListening) : firstLangPtsSingle(frListening);
  const s_frRead = married ? firstLangPtsMarried(frReading) : firstLangPtsSingle(frReading);
  const s_frWrite = married ? firstLangPtsMarried(frWriting) : firstLangPtsSingle(frWriting);
  const s_frSpeak = married ? firstLangPtsMarried(frSpeaking) : firstLangPtsSingle(frSpeaking);
  const s_firstLang = s_frListen + s_frRead + s_frWrite + s_frSpeak;

  const s_enListen = secondLangPts(enListening);
  const s_enRead = secondLangPts(enReading);
  const s_enWrite = secondLangPts(enWriting);
  const s_enSpeak = secondLangPts(enSpeaking);
  const s_secondLang = s_enListen + s_enRead + s_enWrite + s_enSpeak;

  const s_canWork = married ? canWorkPtsMarried(canWork) : canWorkPtsSingle(canWork);

  const coreTotal = s_age + s_edu + s_firstLang + s_secondLang + s_canWork;
  const coreMax = married ? 460 : 500;

  // Spouse factors
  const s_spEdu = married ? spouseEduPts(spouseEdu) : 0;
  const s_spLang = married ? spouseLangPts(spouseLang) * 4 : 0;
  const s_spWork = married ? spouseCanWorkPts(spouseCanWork) : 0;
  const spouseTotal = s_spEdu + s_spLang + s_spWork;

  // Skill transferability
  const firstLangAvg = Math.floor((frListening + frReading + frWriting + frSpeaking) / 4);
  const skillTransfer = calcSkillTransfer(edu, firstLangAvg, canWork, foreignWork, certQual);

  // Additional points
  const s_pn = provNomination ? 600 : 0;
  const s_job = jobOfferTeer === "teer0" ? 200 : jobOfferTeer === "other" ? 50 : 0;
  const s_canEdu = canEducation === "short" ? 15 : canEducation === "long" ? 30 : 0;
  const s_frBonus = frenchBonus === "french_only" ? 25 : frenchBonus === "french_english" ? 50 : 0;
  const s_sibling = siblingInCanada ? 15 : 0;
  const additionalTotal = s_pn + s_job + s_canEdu + s_frBonus + s_sibling;

  const total = Math.min(1200, coreTotal + spouseTotal + skillTransfer + additionalTotal);

  const competitive = total >= 470;
  const possible = total >= 400;

  // ─── OPTIONS ───

  const EDU_OPTS = fr
    ? [{ v: "none", l: "Aucun diplôme" }, { v: "highschool", l: "Secondaire (DES)" }, { v: "oneyear", l: "Post-secondaire 1 an" }, { v: "twoyear", l: "Post-secondaire 2 ans" }, { v: "threeyear", l: "Baccalaureat / 3 ans+" }, { v: "master", l: "Maîtrise" }, { v: "phd", l: "Doctorat" }]
    : [{ v: "none", l: "No diploma" }, { v: "highschool", l: "High school" }, { v: "oneyear", l: "1-year post-secondary" }, { v: "twoyear", l: "2-year post-secondary" }, { v: "threeyear", l: "Bachelor's / 3+ years" }, { v: "master", l: "Master's degree" }, { v: "phd", l: "Doctorate (PhD)" }];

  const JOB_OPTS = fr
    ? [{ v: "none", l: "Aucune offre" }, { v: "teer0", l: "Offre TEER 0 (cadre superieur)" }, { v: "other", l: "Offre TEER 1/2/3 (autre)" }]
    : [{ v: "none", l: "No job offer" }, { v: "teer0", l: "TEER 0 offer (senior manager)" }, { v: "other", l: "TEER 1/2/3 offer (other)" }];

  const CAN_EDU_OPTS = fr
    ? [{ v: "none", l: "Aucune étude au Canada" }, { v: "short", l: "Diplôme 1-2 ans" }, { v: "long", l: "Diplôme 3 ans+ / Maîtrise / Doctorat" }]
    : [{ v: "none", l: "No Canadian éducation" }, { v: "short", l: "1-2 year diploma" }, { v: "long", l: "3+ year degree / Master's / PhD" }];

  const FR_BONUS_OPTS = fr
    ? [{ v: "none", l: "Non applicable" }, { v: "french_only", l: "NCLC 7+ (4 compétences)" }, { v: "french_english", l: "NCLC 7+ ET anglais CLB 5+" }]
    : [{ v: "none", l: "Not applicable" }, { v: "french_only", l: "NCLC 7+ (all 4 abilities)" }, { v: "french_english", l: "NCLC 7+ AND English CLB 5+" }];

  // ─── RECOMMENDATIONS ───
  const recommendations = [
    firstLangAvg < 9 && { t: fr ? "Ameliore ton français a NCLC 9+" : "Improve French to NCLC 9+", g: `+${(firstLangPtsSingle(9) - firstLangPtsSingle(firstLangAvg)) * 4} pts`, d: fr ? "Chaque palier CLB a un impact majeur sur le score de base et la transférabilite." : "Each CLB level has major impact on core score and skill transferability." },
    s_secondLang < 24 && { t: fr ? "Ameliore ton anglais a CLB 9+" : "Improve English to CLB 9+", g: `+${24 - s_secondLang} pts`, d: fr ? "L'anglais comme langue seconde peut ajouter jusqu'a 24 points." : "English as second language can add up to 24 points." },
    !provNomination && { t: fr ? "Obtiens une nomination provinciale (PN)" : "Get a Provincial Nomination (PN)", g: "+600 pts", d: fr ? "C'est le levier le plus puissant du CRS. La PN garantit pratiquement une invitation." : "The most powerful CRS lever. A PN virtually guarantees an invitation." },
    jobOfferTeer === "none" && { t: fr ? "Obtiens une offre d'emploi appuyee par EIMT" : "Get an LMIA-supported job offer", g: fr ? "+50 a +200 pts" : "+50 to +200 pts", d: fr ? "Une offre TEER 0 vaut 200 pts, les autres TEER valent 50 pts." : "A TEER 0 offer is worth 200 pts, other TEER levels worth 50 pts." },
    frenchBonus === "none" && firstLangAvg >= 7 && { t: fr ? "Valorise ton bonus francophone" : "Claim your French bonus", g: fr ? "+25 a +50 pts" : "+25 to +50 pts", d: fr ? "Avec NCLC 7+ aux 4 compétences, tu peux obtenir 25-50 pts bonus." : "With NCLC 7+ in all 4 abilities, you can get 25-50 bonus pts." },
    canEducation === "none" && { t: fr ? "Un diplôme canadien = bonus" : "A Canadian diploma = bonus", g: fr ? "+15 a +30 pts" : "+15 to +30 pts", d: fr ? "Un diplôme d'un établissement canadien donne 15-30 points supplémentaires." : "A diploma from a Canadian institution gives 15-30 extra points." },
    canWork === 0 && { t: fr ? "Acquiers de l'experience canadienne" : "Gain Canadian work experience", g: fr ? "+35 a +80 pts" : "+35 to +80 pts", d: fr ? "L'experience canadienne augmenté le score de base et la transférabilite." : "Canadian experience boosts both core score and skill transferability." },
    !siblingInCanada && { t: fr ? "As-tu un frere/soeur au Canada?" : "Do you have a sibling in Canada?", g: "+15 pts", d: fr ? "Un frere ou une soeur citoyen/RP au Canada donne 15 points." : "A sibling who is a citizen/PR in Canada gives 15 points." },
  ].filter(Boolean) as { t: string; g: string; d: string }[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🍁</span>
            <span className="text-sm font-semibold text-[#DC2626] bg-red-50 px-3 py-1 rounded-lg">Express Entry / CRS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {fr ? "Simulateur CRS (Entrée Express)" : "CRS Simulator (Express Entry)"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {fr ? "Système de classement global — programme federal d'immigration" : "Comprehensive Ranking System — federal immigration program"}
          </p>
        </div>
      </div>

      {/* Live Score Banner */}
      <div className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
        <div>
          <div className="text-xs opacity-70 mb-1">{fr ? "Score CRS estimé" : "Estimated CRS score"}</div>
          <div className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-heading)] leading-none">{total}</div>
          <div className="text-xs opacity-60 mt-1">{fr ? "sur 1200" : "out of 1200"}</div>
          <div className="text-sm opacity-90 mt-2">
            {competitive ? (fr ? "🍁 Competitif — Zone d'invitation!" : "🍁 Competitive — Invitation zone!") :
              possible ? (fr ? "📊 Ameliorable — Proche de la zone" : "📊 Improvable — Close to the zone") :
                (fr ? "⚡ A renforcer — Voyez les recommandations" : "⚡ Needs work — See recommendations")}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-xs">
            <span>🍁</span>
            <span>{fr ? "Tirages recents: 470-560 pts" : "Recent draws: 470-560 pts"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[220px] w-full md:w-auto">
          <div className="flex justify-between text-xs"><span className="opacity-70">{fr ? "Seuils recents" : "Recent cutoffs"}</span><strong>470-560</strong></div>
          <div className="h-2 rounded-full bg-white/20 relative">
            <div className="h-2 rounded-full transition-all duration-400" style={{ background: competitive ? "#4ADE80" : possible ? "#FBBF24" : "#FCA5A5", width: `${Math.min(100, (total / 800) * 100)}%` }} />
            <div className="absolute top-[-2px] h-[12px] w-[2px] bg-white/60 rounded" style={{ left: `${(470 / 800) * 100}%` }} />
            <div className="absolute top-[-2px] h-[12px] w-[2px] bg-white/60 rounded" style={{ left: `${(560 / 800) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] opacity-50"><span>0</span><span>400</span><span>800+</span></div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { l: fr ? "Capital humain" : "Core / Human capital", v: coreTotal, max: coreMax, c: "#1D9E75" },
          { l: fr ? "Conjoint(e)" : "Spouse factors", v: spouseTotal, max: 40, c: "#8B5CF6" },
          { l: fr ? "Transférabilite" : "Skill transferability", v: skillTransfer, max: 100, c: "#D97706" },
          { l: fr ? "Points additionnels" : "Additional points", v: additionalTotal, max: 600, c: "#DC2626" },
        ].map((cat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-xs text-gray-400">{cat.l}</div>
            <div className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: cat.c }}>{cat.v}</div>
            <div className="text-[10px] text-gray-300">max {cat.max}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr,360px] gap-5">
        {/* LEFT — Inputs */}
        <div className="space-y-4">

          {/* Personal Info */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4 font-[family-name:var(--font-heading)] text-base">
              👤 {fr ? "Informations personnelles" : "Personal information"}
            </h3>
            <Slider label={fr ? "Age" : "Age"} value={age} onChange={setAge} min={18} max={55} pts={s_age} suffix={fr ? " ans" : " yrs"} />
            <div className="flex justify-between items-center mb-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
              onClick={() => setHasSpouse(!hasSpouse)}>
              <span className="text-sm text-gray-700 font-medium">{fr ? "Epoux(se) ou conjoint(e) de fait" : "Spouse or common-law partner"}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{married ? (fr ? "Oui" : "Yes") : (fr ? "Non" : "No")}</span>
                <div className={`w-10 h-[22px] rounded-full relative transition-colors ${married ? "bg-[#1D9E75]" : "bg-gray-300"}`}>
                  <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-all shadow-sm ${married ? "left-5" : "left-0.5"}`} />
                </div>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 ml-1">
              {fr ? "Le statut matrimonial affecte la repartition des points de base." : "Marital status affects how core points are distributed."}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4 font-[family-name:var(--font-heading)] text-base">
              🎓 {fr ? "Education" : "Education"} <span className="text-[#1D9E75] font-medium text-sm">({s_edu} pts)</span>
            </h3>
            <Select label={fr ? "Niveau de scolarité" : "Education level"} value={edu} onChange={setEdu} options={EDU_OPTS} pts={s_edu} />
          </div>

          {/* First Official Language (French) */}
          <div className="bg-white rounded-2xl p-5 border border-[#1D9E75]/20">
            <h3 className="text-sm font-bold text-gray-900 mb-1 font-[family-name:var(--font-heading)] text-base">
              🇫🇷 {fr ? "Première langue officielle — Français" : "First official language — French"} <span className="text-[#1D9E75] font-medium text-sm">({s_firstLang} pts)</span>
            </h3>
            <p className="text-[10px] text-gray-400 mb-4">{fr ? "Niveaux de compétence linguistique canadiens (NCLC) — TEF/TCF" : "Canadian Language Benchmarks (CLB) — TEF/TCF"}</p>
            <Slider label={fr ? "Compréhension orale" : "Listening"} value={frListening} onChange={setFrListening} min={0} max={12} pts={s_frListen} suffix=" CLB" />
            <Slider label={fr ? "Compréhension écrite" : "Reading"} value={frReading} onChange={setFrReading} min={0} max={12} pts={s_frRead} suffix=" CLB" />
            <Slider label={fr ? "Expression écrite" : "Writing"} value={frWriting} onChange={setFrWriting} min={0} max={12} pts={s_frWrite} suffix=" CLB" />
            <Slider label={fr ? "Expression orale" : "Speaking"} value={frSpeaking} onChange={setFrSpeaking} min={0} max={12} pts={s_frSpeak} suffix=" CLB" />
          </div>

          {/* Second Official Language (English) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-1 font-[family-name:var(--font-heading)] text-base">
              🇬🇧 {fr ? "Deuxieme langue officielle — Anglais" : "Second official language — English"} <span className="text-[#1D9E75] font-medium text-sm">({s_secondLang} pts)</span>
            </h3>
            <p className="text-[10px] text-gray-400 mb-4">{fr ? "Niveaux de compétence linguistique canadiens (NCLC) — IELTS/CELPIP" : "Canadian Language Benchmarks (CLB) — IELTS/CELPIP"}</p>
            <Slider label={fr ? "Compréhension orale" : "Listening"} value={enListening} onChange={setEnListening} min={0} max={12} pts={s_enListen} suffix=" CLB" />
            <Slider label={fr ? "Compréhension écrite" : "Reading"} value={enReading} onChange={setEnReading} min={0} max={12} pts={s_enRead} suffix=" CLB" />
            <Slider label={fr ? "Expression écrite" : "Writing"} value={enWriting} onChange={setEnWriting} min={0} max={12} pts={s_enWrite} suffix=" CLB" />
            <Slider label={fr ? "Expression orale" : "Speaking"} value={enSpeaking} onChange={setEnSpeaking} min={0} max={12} pts={s_enSpeak} suffix=" CLB" />
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl p-5 border border-[#D97706]/20">
            <h3 className="text-sm font-bold text-gray-900 mb-4 font-[family-name:var(--font-heading)] text-base">
              💼 {fr ? "Experience de travail" : "Work experience"} <span className="text-[#D97706] font-medium text-sm">({s_canWork} pts)</span>
            </h3>
            <Slider label={fr ? "Experience canadienne" : "Canadian work experience"} value={canWork} onChange={setCanWork} min={0} max={5} pts={s_canWork} suffix={fr ? " ans" : " yrs"} />
            <Slider label={fr ? "Experience a l'étranger" : "Foreign work experience"} value={foreignWork} onChange={setForeignWork} min={0} max={5} pts={0} suffix={fr ? " ans" : " yrs"} />
            <div className="text-[10px] text-gray-400 -mt-2 mb-3 ml-1">
              {fr ? "L'experience étrangère n'a pas de points directs mais affecte la transférabilite." : "Foreign experience has no direct points but affects skill transferability."}
            </div>
            <Toggle label={fr ? "Certificat de qualification (metier réglementé)" : "Certificate of qualification (regulated trade)"} value={certQual} onChange={setCertQual} pts={certQual ? "+50" : "+0"} />
          </div>

          {/* Spouse Factors */}
          {married && (
            <div className="bg-white rounded-2xl p-5 border border-[#8B5CF6]/20">
              <h3 className="text-sm font-bold text-gray-900 mb-4 font-[family-name:var(--font-heading)] text-base">
                💑 {fr ? "Facteurs du conjoint" : "Spouse factors"} <span className="text-[#8B5CF6] font-medium text-sm">({spouseTotal} pts)</span>
              </h3>
              <Select label={fr ? "Scolarite du conjoint" : "Spouse éducation"} value={spouseEdu} onChange={setSpouseEdu} options={EDU_OPTS} pts={s_spEdu} />
              <Slider label={fr ? "Langue officielle du conjoint (CLB)" : "Spouse official language (CLB)"} value={spouseLang} onChange={setSpouseLang} min={0} max={12} pts={s_spLang} suffix=" CLB" />
              <Slider label={fr ? "Experience canadienne du conjoint" : "Spouse Canadian work experience"} value={spouseCanWork} onChange={setSpouseCanWork} min={0} max={5} pts={s_spWork} suffix={fr ? " ans" : " yrs"} />
            </div>
          )}

          {/* Additional Factors */}
          <div className="bg-white rounded-2xl p-5 border border-[#DC2626]/20">
            <h3 className="text-sm font-bold text-gray-900 mb-4 font-[family-name:var(--font-heading)] text-base">
              🍁 {fr ? "Points additionnels" : "Additional points"} <span className="text-[#DC2626] font-medium text-sm">({additionalTotal} pts)</span>
            </h3>
            <Toggle label={fr ? "Nomination provinciale (PN)" : "Provincial Nomination (PN)"} value={provNomination} onChange={setProvNomination} pts={s_pn > 0 ? "+600" : "+0"} />
            <Select label={fr ? "Offre d'emploi valide (appuyee par EIMT)" : "Valid job offer (LMIA-supported)"} value={jobOfferTeer} onChange={setJobOfferTeer} options={JOB_OPTS} pts={s_job} />
            <Select label={fr ? "Études canadiennes" : "Canadian éducation"} value={canEducation} onChange={setCanEducation} options={CAN_EDU_OPTS} pts={s_canEdu} />
            <Select label={fr ? "Bonus francophone" : "French language bonus"} value={frenchBonus} onChange={setFrenchBonus} options={FR_BONUS_OPTS} pts={s_frBonus} />
            <Toggle label={fr ? "Frere ou soeur au Canada (citoyen/RP)" : "Sibling in Canada (citizen/PR)"} value={siblingInCanada} onChange={setSiblingInCanada} pts={s_sibling > 0 ? "+15" : "+0"} />
          </div>
        </div>

        {/* RIGHT — Analysis */}
        <div className="space-y-4">
          {/* Score Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 sticky top-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4 font-[family-name:var(--font-heading)] text-base">
              📊 {fr ? "Ventilation du score" : "Score breakdown"}
            </h3>

            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{fr ? "Capital humain" : "Core / Human Capital"} ({coreMax})</div>
            <ScoreBar label={fr ? "Age" : "Age"} value={s_age} max={married ? 100 : 110} color="#1D9E75" />
            <ScoreBar label={fr ? "Education" : "Education"} value={s_edu} max={married ? 140 : 150} color="#1D9E75" />
            <ScoreBar label={fr ? "1re langue (FR)" : "1st language (FR)"} value={s_firstLang} max={128} color="#1D9E75" />
            <ScoreBar label={fr ? "2e langue (EN)" : "2nd language (EN)"} value={s_secondLang} max={24} color="#1D9E75" />
            <ScoreBar label={fr ? "Exp. canadienne" : "Canadian exp."} value={s_canWork} max={married ? 70 : 80} color="#1D9E75" />

            {married && (
              <>
                <div className="border-t border-gray-100 my-3" />
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{fr ? "Conjoint(e)" : "Spouse"} (40)</div>
                <ScoreBar label={fr ? "Education conjoint" : "Spouse éducation"} value={s_spEdu} max={10} color="#8B5CF6" />
                <ScoreBar label={fr ? "Langue conjoint" : "Spouse language"} value={s_spLang} max={20} color="#8B5CF6" />
                <ScoreBar label={fr ? "Exp. can. conjoint" : "Spouse can. exp."} value={s_spWork} max={10} color="#8B5CF6" />
              </>
            )}

            <div className="border-t border-gray-100 my-3" />
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{fr ? "Transférabilite" : "Skill Transferability"} (100)</div>
            <ScoreBar label={fr ? "Transférabilite" : "Transferability"} value={skillTransfer} max={100} color="#D97706" />

            <div className="border-t border-gray-100 my-3" />
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{fr ? "Additionnels" : "Additional"} (600)</div>
            {s_pn > 0 && <ScoreBar label={fr ? "Nomination prov." : "Prov. nomination"} value={s_pn} max={600} color="#DC2626" />}
            <ScoreBar label={fr ? "Offre d'emploi" : "Job offer"} value={s_job} max={200} color="#DC2626" />
            <ScoreBar label={fr ? "Études can." : "Can. éducation"} value={s_canEdu} max={30} color="#DC2626" />
            <ScoreBar label={fr ? "Bonus français" : "French bonus"} value={s_frBonus} max={50} color="#DC2626" />
            <ScoreBar label={fr ? "Fratrie au Canada" : "Sibling in CA"} value={s_sibling} max={15} color="#DC2626" />

            <div className="border-t border-gray-100 my-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">TOTAL</span>
              <span className="text-2xl font-bold text-[#DC2626] font-[family-name:var(--font-heading)]">{total} <span className="text-sm font-normal text-gray-400">/ 1200</span></span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#F0FAF5] rounded-2xl p-5 border border-[#1D9E75]/20">
            <h3 className="text-sm font-bold text-[#085041] mb-3 font-[family-name:var(--font-heading)] text-base">
              🎯 {fr ? "Recommandations" : "Recommendations"}
            </h3>
            {recommendations.slice(0, 5).map((r, i) => (
              <div key={i} className="bg-white rounded-xl p-3 mb-2 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-900">{r.t}</span>
                  <span className="text-xs font-bold text-[#1D9E75] bg-[#E1F5EE] px-2 py-0.5 rounded-md whitespace-nowrap ml-2">{r.g}</span>
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">{r.d}</div>
              </div>
            ))}
            {competitive && (
              <div className="bg-white rounded-xl p-3 border border-[#1D9E75]">
                <div className="text-sm font-semibold text-[#1D9E75]">✅ {fr ? "Ton profil est competitif!" : "Your profile is competitive!"}</div>
                <div className="text-xs text-gray-500 mt-1">{fr ? "Score dans la zone d'invitation recente (470-560). Soumets ton profil dans le bassin Express Entry." : "Score in the recent invitation zone (470-560). Submit your profile to the Express Entry pool."}</div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-[#085041] to-[#1D9E75] rounded-2xl p-5 text-white">
            <h3 className="font-bold mb-2 font-[family-name:var(--font-heading)] text-lg">{fr ? "Rapport complet + plan d'action" : "Full report + action plan"}</h3>
            <p className="text-sm text-white/80 mb-3">{fr ? "Obtiens un rapport detaille avec eligibilite aux programmes federaux et provinciaux, documents requis et plan d'action personnalise." : "Get a detailed report with federal and provincial program eligibility, required documents, and personalized action plan."}</p>
            <div className="flex flex-col gap-2">
              <Link href="/tarifs" className="px-4 py-2.5 bg-white text-[#085041] font-semibold rounded-xl text-sm hover:bg-white/90 inline-flex items-center justify-center gap-1">
                {fr ? "49.99$ — Rapport unique" : "$49.99 — One-time report"}
              </Link>
              <Link href="/tarifs" className="px-4 py-2.5 bg-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/30 border border-white/30 inline-flex items-center justify-center gap-1">
                {fr ? "Inclus dans Standard" : "Included in Standard"}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* CRS vs Arrima */}
          <div className="bg-red-50 rounded-2xl p-5 border border-[#DC2626]/15">
            <h3 className="text-sm font-bold text-[#DC2626] mb-2 font-[family-name:var(--font-heading)] text-base">🍁 vs ⚜️ {fr ? "CRS federal vs Arrima Québec" : "Federal CRS vs Québec Arrima"}</h3>
            <p className="text-xs text-gray-700 leading-relaxed mb-3">
              {fr
                ? "Le CRS est le système de classement d'Entrée Express (federal). Il est completement separe d'Arrima (Québec). Tu peux être dans les deux bassins en meme temps."
                : "CRS is the Express Entry ranking system (federal). It's completely separate from Arrima (Québec). You can be in both pools simultaneously."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-400">CRS ({fr ? "federal" : "federal"})</div>
                <div className="text-xl font-bold text-[#DC2626]">{total}</div>
                <div className="text-[10px] text-gray-400">{fr ? "sur 1200" : "of 1200"}</div>
              </div>
              <Link href="/simulateur-arrima" className="bg-white rounded-lg p-3 text-center hover:bg-gray-50 transition-colors">
                <div className="text-[10px] text-gray-400">Arrima (QC)</div>
                <div className="text-xl font-bold text-gray-400">&mdash;</div>
                <div className="text-[10px] text-[#003DA5]">{fr ? "Simuler mon Arrima" : "Simulate my Arrima"} &rarr;</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          ⚠️ {fr ? "Estimation non officielle basee sur les critères publies par IRCC. Le score reel peut varier selon la verification des documents." : "Unofficial estimate based on criteria published by IRCC. Actual score may vary based on document verification."}
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return <Shell><CRSSimulatorPage /></Shell>;
}
