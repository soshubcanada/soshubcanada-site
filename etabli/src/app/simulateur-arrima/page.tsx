"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── SCORING FUNCTIONS ───
const agePoints = (a: number) => {
  if (a >= 18 && a <= 35) return 16;
  if (a === 36) return 14; if (a === 37) return 12; if (a === 38) return 10;
  if (a === 39) return 8; if (a === 40) return 6; if (a === 41) return 4;
  if (a === 42) return 2; return 0;
};
const eduPoints = (e: string) => ({ none: 0, secondary: 2, dep: 6, dec: 10, bachelor: 14, master: 18, phd: 26 }[e] || 0);
const frOralPts = (n: number) => { if (n >= 10) return 16; if (n >= 7) return 14; if (n >= 5) return 8; if (n >= 4) return 4; return 0; };
const frWrittenPts = (n: number) => { if (n >= 10) return 6; if (n >= 7) return 5; if (n >= 5) return 3; if (n >= 4) return 1; return 0; };
const enPts = (l: number) => [0, 2, 4, 6][l] || 0;
const workOutPts = (y: number) => { if (y >= 4) return 8; if (y >= 3) return 6; if (y >= 2) return 4; if (y >= 1) return 2; return 0; };
const workInQCPts = (y: number) => { if (y >= 3) return 80; if (y >= 2) return 60; if (y >= 1) return 40; return 0; };
const vjoPts = (v: string) => { if (v === "outside") return 380; if (v === "mtl") return 200; return 0; };
const profPts = (p: string) => (p === "priority" || p === "regulated") ? 50 : 0;
const spouseAgePts = (a: number) => { if (a >= 18 && a <= 35) return 3; if (a >= 36 && a <= 39) return 2; if (a >= 40 && a <= 42) return 1; return 0; };
const spouseEduPts = (e: string) => ({ none: 0, secondary: 1, dep: 2, dec: 3, bachelor: 4, master: 5, phd: 8 }[e] || 0);
const spouseFrPts = (n: number) => { if (n >= 7) return 6; if (n >= 5) return 4; if (n >= 4) return 2; return 0; };

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
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full" />
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

function ArrimaSimulatorPage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [age, setAge] = useState(30);
  const [edu, setEdu] = useState("bachelor");
  const [eduQC, setEduQC] = useState(false);
  const [frOral, setFrOral] = useState(7);
  const [frWritten, setFrWritten] = useState(7);
  const [enLevel, setEnLevel] = useState(0);
  const [workOutQC, setWorkOutQC] = useState(3);
  const [workInQC, setWorkInQC] = useState(0);
  const [studyQC, setStudyQC] = useState(false);
  const [vjo, setVjo] = useState("none");
  const [profession, setProfession] = useState("other");
  const [regionQC, setRegionQC] = useState(false);
  const [familyQC, setFamilyQC] = useState(false);
  const [hasSpouse, setHasSpouse] = useState(false);
  const [spouseAge, setSpouseAge] = useState(28);
  const [spouseFr, setSpouseFr] = useState(5);
  const [spouseEdu, setSpouseEdu] = useState("bachelor");

  const s_age = agePoints(age);
  const s_edu = eduPoints(edu);
  const s_eduQC = eduQC ? 30 : 0;
  const s_frO = frOralPts(frOral);
  const s_frW = frWrittenPts(frWritten);
  const s_en = enPts(enLevel);
  const s_workOut = workOutPts(workOutQC);
  const s_workIn = workInQCPts(workInQC);
  const s_study = studyQC ? 20 : 0;
  const s_vjo = vjoPts(vjo);
  const s_prof = profPts(profession);
  const s_region = regionQC ? 50 : 0;
  const s_family = familyQC ? 10 : 0;
  const s_spAge = hasSpouse ? spouseAgePts(spouseAge) : 0;
  const s_spEdu = hasSpouse ? spouseEduPts(spouseEdu) : 0;
  const s_spFr = hasSpouse ? spouseFrPts(spouseFr) : 0;

  const catCapital = s_age + s_edu + s_frO + s_frW + s_en + s_workOut;
  const catQC = s_eduQC + s_workIn + s_study + s_region + s_family;
  const catMarche = s_vjo + s_prof;
  const catSpouse = s_spAge + s_spEdu + s_spFr;
  const total = catCapital + catQC + catMarche + catSpouse;

  const competitive = total >= 590;
  const possible = total >= 500;

  const EDU_OPTS = fr
    ? [{ v: "none", l: "Aucun diplôme" }, { v: "secondary", l: "Secondaire (DES)" }, { v: "dep", l: "DEP (diplôme études prof.)" }, { v: "dec", l: "DEC (collegial/cegep)" }, { v: "bachelor", l: "Baccalaureat (universitaire)" }, { v: "master", l: "Maîtrise" }, { v: "phd", l: "Doctorat" }]
    : [{ v: "none", l: "No diploma" }, { v: "secondary", l: "High school" }, { v: "dep", l: "DEP (vocational)" }, { v: "dec", l: "DEC (college/CEGEP)" }, { v: "bachelor", l: "Bachelor's degree" }, { v: "master", l: "Master's degree" }, { v: "phd", l: "Doctorate (PhD)" }];

  const VJO_OPTS = fr
    ? [{ v: "none", l: "Aucune offre" }, { v: "mtl", l: "OEV — Montreal / Laval" }, { v: "outside", l: "OEV — Hors Montreal (regions)" }]
    : [{ v: "none", l: "No job offer" }, { v: "mtl", l: "VJO — Montreal / Laval" }, { v: "outside", l: "VJO — Outside Montreal (regions)" }];

  const PROF_OPTS = fr
    ? [{ v: "other", l: "Autre profession" }, { v: "priority", l: "Secteur prioritaire (sante, TI, genie, éducation)" }, { v: "regulated", l: "Profession reglementee reconnue au QC" }]
    : [{ v: "other", l: "Other profession" }, { v: "priority", l: "Priority sector (health, IT, engineering, éducation)" }, { v: "regulated", l: "Regulated profession recognized in QC" }];

  const recommendations = [
    frOral < 7 && { t: fr ? "Ameliore ton français oral a NCLC 7+" : "Improve French oral to NCLC 7+", g: `+${frOralPts(7) - s_frO} pts`, d: fr ? "Le français est LE facteur déterminant au Québec. Le module TCF/TEF d'etabli. peut t'aider." : "French is THE determining factor in Québec. etabli.'s TCF/TEF module can help." },
    frWritten < 7 && { t: fr ? "Ameliore ton français ecrit a NCLC 7+" : "Improve French written to NCLC 7+", g: `+${frWrittenPts(7) - s_frW} pts`, d: fr ? "Les 4 épreuves (CO, CE, EO, EE) comptent pour Arrima." : "All 4 tests (LC, RC, OS, WE) count for Arrima." },
    vjo === "none" && { t: fr ? "Obtiens une offre d'emploi validee (OEV)" : "Get a Validated Job Offer (VJO)", g: fr ? "+200 a +380 pts" : "+200 to +380 pts", d: fr ? "C'est le levier le plus puissant. Hors Montreal = 380 pts." : "The most powerful lever. Outside Montreal = 380 pts." },
    vjo === "mtl" && !regionQC && { t: fr ? "Considere un établissement hors Montreal" : "Consider settling outside Montreal", g: "+50 pts", d: fr ? "Les regions du Québec offrent +50 pts et des seuils d'invitation plus bas." : "Québec regions offer +50 pts and lower invitation thresholds." },
    !eduQC && { t: fr ? "Un diplôme québécois = bonus majeur" : "A Québec diploma = major bonus", g: "+30 pts", d: fr ? "Meme un DEP ou un DEC court compte." : "Even a short DEP or DEC counts." },
    workInQC === 0 && { t: fr ? "Acquiers de l'experience de travail au Québec" : "Gain work experience in Québec", g: fr ? "+40 a +80 pts" : "+40 to +80 pts", d: fr ? "Un permis de travail temporaire te permet d'accumuler de l'experience quebecoise." : "A temporary work permit lets you accumulate Québec experience." },
    profession === "other" && { t: fr ? "Verifie si ta profession est prioritaire" : "Check if your profession is in priority list", g: "+50 pts", d: fr ? "Sante, TI, genie, éducation, construction = secteurs prioritaires au QC." : "Health, IT, engineering, éducation, construction = priority sectors in QC." },
  ].filter(Boolean) as { t: string; g: string; d: string }[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⚜️</span>
            <span className="text-sm font-semibold text-[#003DA5] bg-[#E8F0FE] px-3 py-1 rounded-lg">Arrima / PSTQ</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {fr ? "Simulateur Arrima" : "Arrima Simulator"}
          </h1>
        </div>
      </div>

      {/* Live Score Banner */}
      <div className="bg-gradient-to-r from-[#003DA5] to-[#0055B8] rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
        <div>
          <div className="text-xs opacity-70 mb-1">{fr ? "Score Arrima estimé" : "Estimated Arrima score"}</div>
          <div className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-heading)] leading-none">{total}</div>
          <div className="text-sm opacity-85 mt-2">
            {competitive ? (fr ? "⚜️ Competitif — Zone d'invitation!" : "⚜️ Competitive — Invitation zone!") :
              possible ? (fr ? "📊 Ameliorable — Proche de la zone" : "📊 Improvable — Close to the zone") :
                (fr ? "⚡ A renforcer — Voyez les recommandations" : "⚡ Needs work — See recommendations")}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-xs">
            <span>⏱️</span>
            <span>{fr ? "Résultat valide 30 jours" : "Result valid 30 days"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[200px] w-full md:w-auto">
          <div className="flex justify-between text-xs"><span className="opacity-70">{fr ? "Seuil recent" : "Recent cutoff"}</span><strong>590-620</strong></div>
          <div className="h-2 rounded-full bg-white/20 relative">
            <div className="h-2 rounded-full transition-all duration-400" style={{ background: competitive ? "#4ADE80" : possible ? "#FBBF24" : "#F87171", width: `${Math.min(100, (total / 800) * 100)}%` }} />
            <div className="absolute top-[-2px] h-[12px] w-[2px] bg-white/60 rounded" style={{ left: "73.75%" }} />
            <div className="absolute top-[-2px] h-[12px] w-[2px] bg-white/60 rounded" style={{ left: "77.5%" }} />
          </div>
          <div className="flex justify-between text-[10px] opacity-50"><span>0</span><span>400</span><span>800</span></div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { l: fr ? "Capital humain" : "Human capital", v: catCapital, max: 72, c: "#1D9E75" },
          { l: fr ? "Experience QC" : "QC experience", v: catQC, max: 190, c: "#003DA5" },
          { l: fr ? "Marche du travail" : "Labour market", v: catMarche, max: 430, c: "#D97706" },
          { l: fr ? "Conjoint(e)" : "Spouse", v: catSpouse, max: 17, c: "#8B5CF6" },
        ].map((cat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-xs text-gray-400">{cat.l}</div>
            <div className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: cat.c }}>{cat.v}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* LEFT — Inputs */}
        <div className="space-y-4">
          {/* Capital humain */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4">👤 {fr ? "Capital humain" : "Human capital"} <span className="text-[#1D9E75] font-medium">({catCapital} pts)</span></h3>
            <Slider label={fr ? "Age" : "Age"} value={age} onChange={setAge} min={18} max={55} pts={s_age} suffix={fr ? " ans" : " yrs"} />
            <Select label={fr ? "Niveau de scolarité" : "Education level"} value={edu} onChange={setEdu} options={EDU_OPTS} pts={s_edu} />
            <Slider label={fr ? "Français oral (NCLC)" : "French oral (NCLC)"} value={frOral} onChange={setFrOral} min={0} max={12} pts={s_frO} />
            <Slider label={fr ? "Français ecrit (NCLC)" : "French written (NCLC)"} value={frWritten} onChange={setFrWritten} min={0} max={12} pts={s_frW} />
            <Select label={fr ? "Anglais" : "English"} value={String(enLevel)} onChange={v => setEnLevel(Number(v))}
              options={fr ? [{ v: "0", l: "Aucun" }, { v: "1", l: "De base" }, { v: "2", l: "Intermédiaire" }, { v: "3", l: "Avance" }] : [{ v: "0", l: "None" }, { v: "1", l: "Basic" }, { v: "2", l: "Intermediate" }, { v: "3", l: "Advanced" }]} pts={s_en} />
            <Slider label={fr ? "Experience travail hors QC" : "Work experience outside QC"} value={workOutQC} onChange={setWorkOutQC} min={0} max={10} pts={s_workOut} suffix={fr ? " ans" : " yrs"} />
          </div>

          {/* Connexion Québec */}
          <div className="bg-white rounded-2xl p-5 border border-[#003DA5]/20">
            <h3 className="text-sm font-bold text-gray-900 mb-4">⚜️ {fr ? "Connexion Québec" : "Québec connection"} <span className="text-[#003DA5] font-medium">({catQC} pts)</span></h3>
            <Toggle label={fr ? "Diplôme obtenu au Québec" : "Diploma obtained in Québec"} value={eduQC} onChange={setEduQC} pts={s_eduQC > 0 ? "+" + s_eduQC : "+0"} />
            <Slider label={fr ? "Experience travail au QC" : "Work experience in QC"} value={workInQC} onChange={setWorkInQC} min={0} max={5} pts={s_workIn} suffix={fr ? " ans" : " yrs"} />
            <Toggle label={fr ? "Études au Québec (min. 900h)" : "Studies in Québec (min. 900h)"} value={studyQC} onChange={setStudyQC} pts={s_study > 0 ? "+" + s_study : "+0"} />
            <Toggle label={fr ? "Établissement hors Montreal/Laval" : "Settlement outside Montreal/Laval"} value={regionQC} onChange={setRegionQC} pts={s_region > 0 ? "+" + s_region : "+0"} />
            <Toggle label={fr ? "Liens familiaux au Québec" : "Family ties in Québec"} value={familyQC} onChange={setFamilyQC} pts={s_family > 0 ? "+" + s_family : "+0"} />
          </div>

          {/* Marche du travail */}
          <div className="bg-white rounded-2xl p-5 border border-[#D97706]/20">
            <h3 className="text-sm font-bold text-gray-900 mb-4">💼 {fr ? "Marche du travail" : "Labour market"} <span className="text-[#D97706] font-medium">({catMarche} pts)</span></h3>
            <Select label={fr ? "Offre d'emploi validee (OEV/VJO)" : "Validated Job Offer (VJO)"} value={vjo} onChange={setVjo} options={VJO_OPTS} pts={s_vjo} />
            <Select label={fr ? "Type de profession" : "Profession type"} value={profession} onChange={setProfession} options={PROF_OPTS} pts={s_prof} />
          </div>

          {/* Conjoint */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">💑 {fr ? "Conjoint(e)" : "Spouse"} <span className="text-purple-500 font-medium">({catSpouse} pts)</span></h3>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setHasSpouse(!hasSpouse)}>
                <span className="text-xs text-gray-400">{fr ? "Inclure" : "Include"}</span>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${hasSpouse ? "bg-purple-500" : "bg-gray-300"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${hasSpouse ? "left-[18px]" : "left-0.5"}`} />
                </div>
              </div>
            </div>
            {hasSpouse && (
              <>
                <Slider label={fr ? "Age du conjoint" : "Spouse age"} value={spouseAge} onChange={setSpouseAge} min={18} max={55} pts={s_spAge} suffix={fr ? " ans" : " yrs"} />
                <Slider label={fr ? "Français oral conjoint (NCLC)" : "Spouse French oral (NCLC)"} value={spouseFr} onChange={setSpouseFr} min={0} max={12} pts={s_spFr} />
                <Select label={fr ? "Scolarite du conjoint" : "Spouse éducation"} value={spouseEdu} onChange={setSpouseEdu} options={EDU_OPTS} pts={s_spEdu} />
              </>
            )}
          </div>
        </div>

        {/* RIGHT — Analysis */}
        <div className="space-y-4">
          {/* Score Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4">📊 {fr ? "Ventilation du score" : "Score breakdown"}</h3>
            <ScoreBar label={fr ? "Age" : "Age"} value={s_age} max={16} color="#1D9E75" />
            <ScoreBar label={fr ? "Scolarite" : "Education"} value={s_edu} max={26} color="#1D9E75" />
            <ScoreBar label={fr ? "Français oral" : "French oral"} value={s_frO} max={16} color="#1D9E75" />
            <ScoreBar label={fr ? "Français ecrit" : "French written"} value={s_frW} max={6} color="#1D9E75" />
            <ScoreBar label={fr ? "Anglais" : "English"} value={s_en} max={6} color="#1D9E75" />
            <ScoreBar label={fr ? "Exp. hors QC" : "Exp. outside QC"} value={s_workOut} max={8} color="#1D9E75" />
            <div className="border-t border-gray-100 my-2" />
            <ScoreBar label={fr ? "Diplôme QC" : "QC diploma"} value={s_eduQC} max={30} color="#003DA5" />
            <ScoreBar label={fr ? "Exp. travail QC" : "Work exp. QC"} value={s_workIn} max={80} color="#003DA5" />
            <ScoreBar label={fr ? "Études QC" : "Studies QC"} value={s_study} max={20} color="#003DA5" />
            <ScoreBar label={fr ? "Regions hors MTL" : "Regions outside MTL"} value={s_region} max={50} color="#003DA5" />
            <ScoreBar label={fr ? "Famille QC" : "Family QC"} value={s_family} max={10} color="#003DA5" />
            <div className="border-t border-gray-100 my-2" />
            <ScoreBar label="OEV / VJO" value={s_vjo} max={380} color="#D97706" />
            <ScoreBar label="Profession" value={s_prof} max={50} color="#D97706" />
            {hasSpouse && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <ScoreBar label={fr ? "Conjoint(e)" : "Spouse"} value={catSpouse} max={17} color="#8B5CF6" />
              </>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-[#F0FAF5] rounded-2xl p-5 border border-[#1D9E75]/20">
            <h3 className="text-sm font-bold text-[#085041] mb-3">🎯 {fr ? "Recommandations" : "Recommendations"}</h3>
            {recommendations.slice(0, 5).map((r, i) => (
              <div key={i} className="bg-white rounded-xl p-3 mb-2 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-900">{r.t}</span>
                  <span className="text-xs font-bold text-[#1D9E75] bg-[#E1F5EE] px-2 py-0.5 rounded-md">{r.g}</span>
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">{r.d}</div>
              </div>
            ))}
            {competitive && (
              <div className="bg-white rounded-xl p-3 border border-[#1D9E75]">
                <div className="text-sm font-semibold text-[#1D9E75]">✅ {fr ? "Ton profil est competitif!" : "Your profile is competitive!"}</div>
                <div className="text-xs text-gray-500 mt-1">{fr ? "Score dans la zone d'invitation recente (590-620). Soumets ta déclaration d'intérêt sur Arrima et consulte un pro pour valider ton dossier." : "Score in the recent invitation zone (590-620). Submit your expression of interest on Arrima and consult a pro to validate your file."}</div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] rounded-2xl p-5 text-white">
            <h3 className="font-bold mb-2">{fr ? "Rapport complet + plan d'action" : "Full report + action plan"}</h3>
            <p className="text-sm text-white/80 mb-3">{fr ? "Obtiens un rapport detaille avec eligibilite aux 10 programmes, documents requis et plan d'action personnalise." : "Get a detailed report with 10-program eligibility, required documents, and personalized action plan."}</p>
            <div className="flex gap-3">
              <Link href="/tarifs" className="px-4 py-2 bg-white text-[#D97706] font-semibold rounded-xl text-sm hover:bg-white/90 inline-flex items-center gap-1">
                {fr ? "49.99$ — Rapport unique" : "$49.99 — One-time report"}
              </Link>
              <Link href="/tarifs" className="px-4 py-2 bg-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/30 border border-white/30 inline-flex items-center gap-1">
                {fr ? "Inclus dans Standard" : "Included in Standard"}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Arrima vs CRS */}
          <div className="bg-[#E8F0FE] rounded-2xl p-5 border border-[#003DA5]/15">
            <h3 className="text-sm font-bold text-[#003DA5] mb-2">⚜️ vs 🍁 {fr ? "Arrima vs CRS federal" : "Arrima vs Federal CRS"}</h3>
            <p className="text-xs text-gray-700 leading-relaxed mb-3">
              {fr
                ? "Arrima est le système de pointage du Québec (PSTQ). Il est completement separe du CRS federal (Express Entry). Tu peux être dans les deux bassins en meme temps."
                : "Arrima is Québec's scoring system (PSTQ). It's completely separate from the federal CRS (Express Entry). You can be in both pools simultaneously."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-400">Arrima (QC)</div>
                <div className="text-xl font-bold text-[#003DA5]">{total}</div>
                <div className="text-[10px] text-[#003DA5]">{fr ? "sur ~800" : "of ~800"}</div>
              </div>
              <Link href="/simulateur-crs" className="bg-white rounded-lg p-3 text-center hover:bg-gray-50 transition-colors">
                <div className="text-[10px] text-gray-400">CRS ({fr ? "federal" : "federal"})</div>
                <div className="text-xl font-bold text-gray-400">&mdash;</div>
                <div className="text-[10px] text-[#1D9E75]">{fr ? "Simuler mon CRS" : "Simulate my CRS"} &rarr;</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          ⚠️ {fr ? "Estimation non officielle basee sur les critères publies par le MIFI. Resultats valides 30 jours seulement." : "Unofficial estimate based on criteria published by MIFI. Results valid for 30 days only."}
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return <Shell><ArrimaSimulatorPage /></Shell>;
}
