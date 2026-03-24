'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp, AlertCircle, ArrowRight, CheckCircle2, Info,
  User, GraduationCap, Languages, Briefcase, Award
} from 'lucide-react';

export default function CalculateurCRSPage() {
  const [age, setAge] = useState(30);
  const [education, setEducation] = useState('bachelor');
  const [firstLangLevel, setFirstLangLevel] = useState('clb9');
  const [secondLangLevel, setSecondLangLevel] = useState('clb5');
  const [canadianExp, setCanadianExp] = useState('0');
  const [foreignExp, setForeignExp] = useState('3');
  const [married, setMarried] = useState(false);
  const [spouseEducation, setSpouseEducation] = useState('bachelor');
  const [spouseLang, setSpouseLang] = useState('clb7');
  const [spouseCanadianExp, setSpouseCanadianExp] = useState('0');
  const [jobOffer, setJobOffer] = useState(false);
  const [provincialNom, setProvincialNom] = useState(false);
  const [frenchBonus, setFrenchBonus] = useState(false);
  const [canadianSibling, setCanadianSibling] = useState(false);

  const score = useMemo(() => {
    let total = 0;

    // === SECTION A: Core/Human Capital (max 500 with spouse, 600 without) ===

    // Age (max 110 single / 100 married)
    const ageMax = married ? 100 : 110;
    if (age <= 17) total += 0;
    else if (age === 18) total += married ? 90 : 99;
    else if (age === 19) total += married ? 95 : 105;
    else if (age >= 20 && age <= 29) total += ageMax;
    else if (age === 30) total += married ? 95 : 105;
    else if (age === 31) total += married ? 90 : 99;
    else if (age === 32) total += married ? 85 : 94;
    else if (age === 33) total += married ? 80 : 88;
    else if (age === 34) total += married ? 75 : 83;
    else if (age === 35) total += married ? 70 : 77;
    else if (age === 36) total += married ? 65 : 72;
    else if (age === 37) total += married ? 60 : 66;
    else if (age === 38) total += married ? 55 : 61;
    else if (age === 39) total += married ? 50 : 55;
    else if (age === 40) total += married ? 45 : 50;
    else if (age === 41) total += married ? 35 : 39;
    else if (age === 42) total += married ? 25 : 28;
    else if (age === 43) total += married ? 15 : 17;
    else if (age === 44) total += married ? 5 : 6;
    else total += 0;

    // Education (max 150 single / 140 married)
    const eduScores: Record<string, [number, number]> = {
      'secondary': [30, 28],
      'oneyear': [90, 84],
      'twoyear': [98, 91],
      'bachelor': [120, 112],
      'twodegree': [128, 119],
      'master': [135, 126],
      'phd': [150, 140],
    };
    const [eduSingle, eduMarried] = eduScores[education] || [0, 0];
    total += married ? eduMarried : eduSingle;

    // First official language (max 136 single / 128 married per ability)
    const langScores: Record<string, number> = {
      'clb4': married ? 6 : 6,
      'clb5': married ? 6 : 6,
      'clb6': married ? 8 : 9,
      'clb7': married ? 16 : 17,
      'clb8': married ? 22 : 23,
      'clb9': married ? 29 : 31,
      'clb10': married ? 32 : 34,
    };
    total += (langScores[firstLangLevel] || 0) * 4; // 4 abilities

    // Second official language
    const lang2Scores: Record<string, number> = {
      'none': 0,
      'clb4': 0,
      'clb5': married ? 1 : 1,
      'clb6': married ? 1 : 1,
      'clb7': married ? 3 : 3,
      'clb8': married ? 3 : 3,
      'clb9': married ? 6 : 6,
    };
    total += (lang2Scores[secondLangLevel] || 0) * 4;

    // Canadian work experience
    const canExpScores: Record<string, [number, number]> = {
      '0': [0, 0],
      '1': [40, 35],
      '2': [53, 46],
      '3': [64, 56],
      '4': [72, 63],
      '5': [80, 70],
    };
    const [ceSingle, ceMarried] = canExpScores[canadianExp] || [0, 0];
    total += married ? ceMarried : ceSingle;

    // === SECTION B: Spouse factors (max 40) ===
    if (married) {
      const spEduScores: Record<string, number> = {
        'secondary': 2, 'oneyear': 6, 'twoyear': 7,
        'bachelor': 8, 'twodegree': 9, 'master': 10, 'phd': 10,
      };
      total += spEduScores[spouseEducation] || 0;

      const spLangScores: Record<string, number> = {
        'none': 0, 'clb4': 0, 'clb5': 1, 'clb6': 1,
        'clb7': 3, 'clb8': 3, 'clb9': 5,
      };
      total += (spLangScores[spouseLang] || 0) * 4;

      const spCanExpScores: Record<string, number> = {
        '0': 0, '1': 5, '2': 7, '3': 8, '4': 9, '5': 10,
      };
      total += spCanExpScores[spouseCanadianExp] || 0;
    }

    // === SECTION C: Skill Transferability (max 100) ===
    // Simplified: education + language combo
    const hasHighEdu = ['bachelor', 'twodegree', 'master', 'phd'].includes(education);
    const hasHighLang = ['clb9', 'clb10'].includes(firstLangLevel);
    const hasGoodLang = ['clb7', 'clb8', 'clb9', 'clb10'].includes(firstLangLevel);
    const hasCanExp = parseInt(canadianExp) >= 1;
    const hasForeignExp = parseInt(foreignExp) >= 3;

    if (hasHighEdu && hasGoodLang) total += 25;
    else if (hasHighEdu && hasHighLang) total += 50;
    if (hasHighEdu && hasCanExp) total += 25;
    if (hasForeignExp && hasGoodLang) total += 25;
    if (hasForeignExp && hasCanExp) total += 25;

    // === SECTION D: Additional points (max 600) ===
    if (provincialNom) total += 600;
    if (jobOffer) total += 50;
    if (frenchBonus) total += 50;
    if (canadianSibling) total += 15;

    return Math.min(total, 1500);
  }, [age, education, firstLangLevel, secondLangLevel, canadianExp, foreignExp,
      married, spouseEducation, spouseLang, spouseCanadianExp, jobOffer, provincialNom, frenchBonus, canadianSibling]);

  const getScoreColor = () => {
    if (score >= 500) return 'text-green-600';
    if (score >= 450) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getScoreMessage = () => {
    if (score >= 500) return { text: 'Excellent! Votre score est compétitif pour un tirage récent.', type: 'success' };
    if (score >= 450) return { text: 'Bon score. Vous approchez du seuil des tirages récents (généralement 450-530).', type: 'warning' };
    if (score >= 400) return { text: 'Score moyen. Des facteurs supplémentaires pourraient améliorer votre profil.', type: 'warning' };
    return { text: 'Score à améliorer. Contactez-nous pour une stratégie d\'optimisation.', type: 'low' };
  };

  const msg = getScoreMessage();

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Outil gratuit</span>
          <h1 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-3">
            Calculateur CRS partiel
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Estimez votre score du Système de classement global (CRS) pour Entrée Express.
            Ce calcul est une approximation — contactez-nous pour un calcul exact.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-navy flex items-center gap-2 mb-5">
                <User className="w-5 h-5 text-gold" /> Informations personnelles
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Âge</span>
                    <span className="text-gold font-bold">{age} ans</span>
                  </label>
                  <input type="range" min="17" max="50" value={age} onChange={e => setAge(parseInt(e.target.value))}
                    className="w-full" />
                  <div className="flex justify-between text-xs text-gray-400"><span>17</span><span>50+</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={married} onChange={e => setMarried(e.target.checked)}
                    className="w-5 h-5 rounded text-gold focus:ring-gold" id="married" />
                  <label htmlFor="married" className="text-sm text-gray-700">Marié(e) ou conjoint(e) de fait</label>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-navy flex items-center gap-2 mb-5">
                <GraduationCap className="w-5 h-5 text-gold" /> Formation
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plus haut niveau d&apos;études</label>
                  <select value={education} onChange={e => setEducation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                    <option value="secondary">Secondaire</option>
                    <option value="oneyear">Diplôme 1 an</option>
                    <option value="twoyear">Diplôme 2 ans</option>
                    <option value="bachelor">Baccalauréat (3-4 ans)</option>
                    <option value="twodegree">Deux diplômes ou plus</option>
                    <option value="master">Maîtrise</option>
                    <option value="phd">Doctorat</option>
                  </select>
                </div>
                {married && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Études du conjoint</label>
                    <select value={spouseEducation} onChange={e => setSpouseEducation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                      <option value="secondary">Secondaire</option>
                      <option value="oneyear">Diplôme 1 an</option>
                      <option value="twoyear">Diplôme 2 ans</option>
                      <option value="bachelor">Baccalauréat</option>
                      <option value="twodegree">Deux diplômes+</option>
                      <option value="master">Maîtrise</option>
                      <option value="phd">Doctorat</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-navy flex items-center gap-2 mb-5">
                <Languages className="w-5 h-5 text-gold" /> Compétences linguistiques
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Première langue officielle (meilleure)</label>
                  <select value={firstLangLevel} onChange={e => setFirstLangLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                    <option value="clb4">CLB 4-5 (IELTS 4-5 / TEF 145-225)</option>
                    <option value="clb5">CLB 5 (IELTS 5 / TEF 226-270)</option>
                    <option value="clb6">CLB 6 (IELTS 5.5 / TEF 271-309)</option>
                    <option value="clb7">CLB 7 (IELTS 6 / TEF 310-348)</option>
                    <option value="clb8">CLB 8 (IELTS 6.5 / TEF 349-370)</option>
                    <option value="clb9">CLB 9 (IELTS 7 / TEF 371-392)</option>
                    <option value="clb10">CLB 10+ (IELTS 8+ / TEF 393+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deuxième langue officielle</label>
                  <select value={secondLangLevel} onChange={e => setSecondLangLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                    <option value="none">Aucun / Non testé</option>
                    <option value="clb4">CLB 4</option>
                    <option value="clb5">CLB 5</option>
                    <option value="clb6">CLB 6</option>
                    <option value="clb7">CLB 7</option>
                    <option value="clb8">CLB 8</option>
                    <option value="clb9">CLB 9+</option>
                  </select>
                </div>
                {married && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Langue du conjoint</label>
                    <select value={spouseLang} onChange={e => setSpouseLang(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                      <option value="none">Aucun</option>
                      <option value="clb4">CLB 4</option>
                      <option value="clb5">CLB 5</option>
                      <option value="clb6">CLB 6</option>
                      <option value="clb7">CLB 7</option>
                      <option value="clb8">CLB 8</option>
                      <option value="clb9">CLB 9+</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-navy flex items-center gap-2 mb-5">
                <Briefcase className="w-5 h-5 text-gold" /> Expérience professionnelle
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expérience de travail au Canada (NOC 0, A, B)</label>
                  <select value={canadianExp} onChange={e => setCanadianExp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                    <option value="0">Aucune</option>
                    <option value="1">1 an</option>
                    <option value="2">2 ans</option>
                    <option value="3">3 ans</option>
                    <option value="4">4 ans</option>
                    <option value="5">5 ans ou plus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expérience à l&apos;étranger (NOC 0, A, B)</label>
                  <select value={foreignExp} onChange={e => setForeignExp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                    <option value="0">Aucune</option>
                    <option value="1">1-2 ans</option>
                    <option value="3">3 ans ou plus</option>
                  </select>
                </div>
                {married && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expérience canadienne du conjoint</label>
                    <select value={spouseCanadianExp} onChange={e => setSpouseCanadianExp(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                      <option value="0">Aucune</option>
                      <option value="1">1 an</option>
                      <option value="2">2 ans</option>
                      <option value="3">3 ans</option>
                      <option value="4">4 ans</option>
                      <option value="5">5 ans ou plus</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Additional */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-navy flex items-center gap-2 mb-5">
                <Award className="w-5 h-5 text-gold" /> Points supplémentaires
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'pnp', label: 'Nomination provinciale (PNP)', value: provincialNom, set: setProvincialNom, pts: '600 pts' },
                  { id: 'job', label: 'Offre d\'emploi valide (EIMT approuvée)', value: jobOffer, set: setJobOffer, pts: '50-200 pts' },
                  { id: 'french', label: 'Compétences en français (NCLC 7+ dans les 4 compétences)', value: frenchBonus, set: setFrenchBonus, pts: '25-50 pts' },
                  { id: 'sibling', label: 'Frère/soeur citoyen ou RP au Canada', value: canadianSibling, set: setCanadianSibling, pts: '15 pts' },
                ].map(item => (
                  <label key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={item.value} onChange={e => item.set(e.target.checked)}
                        className="w-5 h-5 rounded text-gold focus:ring-gold" />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-xs text-gold font-medium">{item.pts}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Score panel (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Score card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Votre score CRS estimé</h3>
                <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>{score}</div>
                <div className="text-sm text-gray-400 mb-4">sur 1500 points</div>

                {/* Visual bar */}
                <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      score >= 500 ? 'bg-green-400' : score >= 450 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min((score / 800) * 100, 100)}%` }}
                  />
                </div>

                {/* Thresholds */}
                <div className="flex justify-between text-xs text-gray-400 mb-6">
                  <span>0</span>
                  <span className="text-yellow-500">~450</span>
                  <span className="text-green-500">~500</span>
                  <span>800+</span>
                </div>

                <div className={`p-3 rounded-xl text-sm ${
                  msg.type === 'success' ? 'bg-green-50 text-green-700' :
                  msg.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-600'
                }`}>
                  {msg.text}
                </div>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-600">
                    <p className="font-semibold mb-1">Calcul partiel</p>
                    <p>Ce calculateur fournit une estimation. Le score CRS officiel tient compte de facteurs additionnels. Contactez-nous pour un calcul précis.</p>
                  </div>
                </div>
              </div>

              {/* Recent draws */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-navy text-sm mb-4">Tirages récents (indicatif)</h3>
                <div className="space-y-2">
                  {[
                    { date: 'Mars 2026', score: 485, count: '4,750' },
                    { date: 'Fév 2026', score: 490, count: '5,000' },
                    { date: 'Jan 2026', score: 510, count: '4,500' },
                    { date: 'Déc 2025', score: 475, count: '5,500' },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{d.date}</span>
                      <div className="text-right">
                        <span className="font-semibold text-navy">{d.score}</span>
                        <span className="text-gray-400 text-xs ml-2">({d.count} ITA)</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-300 mt-2">*Données à titre indicatif. Consultez IRCC pour les résultats officiels.</p>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-6 text-white text-center">
                <TrendingUp className="w-8 h-8 text-gold mx-auto mb-3" />
                <h3 className="font-bold mb-2">Optimisez votre score</h3>
                <p className="text-white/60 text-sm mb-4">
                  Nos experts peuvent identifier les facteurs pour augmenter votre CRS de 50 à 100+ points.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-colors w-full justify-center"
                >
                  Consultation gratuite <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-700">
            <p className="font-semibold mb-1">Avertissement</p>
            <p>Ce calculateur est un outil d&apos;estimation partielle et ne remplace pas le calcul officiel d&apos;IRCC.
            Les résultats ne constituent pas un avis juridique ou une garantie d&apos;invitation.
            Pour une évaluation complète et précise, contactez notre équipe pour une consultation personnalisée.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
