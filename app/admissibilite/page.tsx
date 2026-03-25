'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles,
  User, GraduationCap, Briefcase, Globe2, Languages, Send
} from 'lucide-react';

interface FormData {
  age: string;
  education: string;
  workExperience: string;
  canadianExperience: string;
  frenchLevel: string;
  englishLevel: string;
  jobOffer: string;
  familyInCanada: string;
  maritalStatus: string;
  spouseEducation: string;
  funds: string;
  destination: string;
  email: string;
  name: string;
  phone: string;
}

const initialForm: FormData = {
  age: '', education: '', workExperience: '', canadianExperience: '',
  frenchLevel: '', englishLevel: '', jobOffer: '', familyInCanada: '',
  maritalStatus: '', spouseEducation: '', funds: '', destination: '',
  email: '', name: '', phone: '',
};

interface ProgramResult {
  name: string;
  eligible: boolean;
  score: number;
  details: string;
  color: string;
}

const stepConfig = [
  { title: 'Informations personnelles', icon: User },
  { title: 'Formation et expérience', icon: GraduationCap },
  { title: 'Langues', icon: Languages },
  { title: 'Situation au Canada', icon: Globe2 },
  { title: 'Coordonnées', icon: Send },
];

export default function AdmissibilitePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [results, setResults] = useState<ProgramResult[] | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canNext = () => {
    switch (step) {
      case 0: return form.age && form.maritalStatus;
      case 1: return form.education && form.workExperience;
      case 2: return form.frenchLevel;
      case 3: return form.destination;
      case 4: return form.email && form.name;
      default: return true;
    }
  };

  const evaluate = (): ProgramResult[] => {
    const age = parseInt(form.age) || 0;
    const results: ProgramResult[] = [];

    // Entrée Express (FSW)
    const fswScore = (() => {
      let s = 0;
      if (age >= 20 && age <= 29) s += 25; else if (age >= 30 && age <= 35) s += 20; else if (age >= 36 && age <= 44) s += 10;
      if (form.education === 'master' || form.education === 'phd') s += 25;
      else if (form.education === 'bachelor') s += 20;
      else if (form.education === 'diploma3') s += 15;
      else if (form.education === 'diploma2') s += 10;
      if (form.workExperience === '6+') s += 15; else if (form.workExperience === '3-5') s += 12; else if (form.workExperience === '1-2') s += 8;
      if (form.englishLevel === 'clb9+') s += 20; else if (form.englishLevel === 'clb7-8') s += 15; else if (form.englishLevel === 'clb5-6') s += 5;
      if (form.frenchLevel === 'b2+') s += 10; else if (form.frenchLevel === 'b1') s += 5;
      if (form.jobOffer === 'yes') s += 10;
      return s;
    })();
    results.push({
      name: 'Entrée Express (FSW)',
      eligible: fswScore >= 40,
      score: Math.min(fswScore, 100),
      details: fswScore >= 40
        ? 'Vous pourriez être éligible au programme Travailleurs qualifiés fédéraux. Votre profil semble correspondre aux critères de base.'
        : 'Votre profil actuel ne semble pas répondre aux critères minimums. Contactez-nous pour explorer les options d\'amélioration.',
      color: 'blue',
    });

    // PEQ Québec
    const peqScore = (() => {
      let s = 0;
      if (form.destination === 'quebec') s += 30;
      if (form.canadianExperience === 'quebec_work' || form.canadianExperience === 'quebec_study') s += 30;
      if (form.frenchLevel === 'b2+') s += 25; else if (form.frenchLevel === 'b1') s += 10;
      if (form.education === 'bachelor' || form.education === 'master' || form.education === 'phd') s += 15;
      else if (form.education === 'diploma3' || form.education === 'diploma2') s += 10;
      return s;
    })();
    results.push({
      name: 'PEQ (Expérience québécoise)',
      eligible: peqScore >= 50 && form.destination === 'quebec',
      score: Math.min(peqScore, 100),
      details: peqScore >= 50 && form.destination === 'quebec'
        ? 'Le PEQ est une excellente option pour vous! Ce programme est rapide pour les diplômés et travailleurs au Québec avec un bon français.'
        : 'Le PEQ exige une expérience au Québec et un bon niveau de français (B2). Contactez-nous pour évaluer vos options québécoises.',
      color: 'emerald',
    });

    // PRTQ / Arrima
    const prtqScore = (() => {
      let s = 0;
      if (form.destination === 'quebec') s += 20;
      if (age >= 18 && age <= 35) s += 15; else if (age >= 36 && age <= 43) s += 10;
      if (form.frenchLevel === 'b2+') s += 20; else if (form.frenchLevel === 'b1') s += 10;
      if (form.education === 'master' || form.education === 'phd') s += 15;
      else if (form.education === 'bachelor') s += 12;
      if (form.workExperience === '6+') s += 10; else if (form.workExperience === '3-5') s += 8;
      if (form.jobOffer === 'yes') s += 10;
      return s;
    })();
    results.push({
      name: 'PRTQ (Arrima - Travailleurs qualifiés)',
      eligible: prtqScore >= 45 && form.destination === 'quebec',
      score: Math.min(prtqScore, 100),
      details: prtqScore >= 45 && form.destination === 'quebec'
        ? 'Vous pourriez être invité via le portail Arrima. Ce programme évalue votre profil selon plusieurs critères du Québec.'
        : 'Le PRTQ via Arrima nécessite un profil solide et le français. Contactez-nous pour optimiser votre déclaration d\'intérêt.',
      color: 'violet',
    });

    // Permis de travail
    const ptScore = (() => {
      let s = 0;
      if (form.jobOffer === 'yes') s += 40;
      if (form.workExperience === '6+') s += 15; else if (form.workExperience === '3-5') s += 12; else if (form.workExperience === '1-2') s += 8;
      if (form.frenchLevel === 'b2+') s += 15; else if (form.frenchLevel === 'b1') s += 10;
      if (form.education === 'master' || form.education === 'phd') s += 10;
      else if (form.education === 'bachelor') s += 8;
      return s;
    })();
    results.push({
      name: 'Permis de travail',
      eligible: ptScore >= 30,
      score: Math.min(ptScore, 100),
      details: ptScore >= 30
        ? 'Plusieurs options de permis de travail pourraient s\'offrir à vous (EIMT, mobilité francophone, PGWP).'
        : 'Un permis de travail nécessite généralement une offre d\'emploi ou un programme spécifique. Contactez-nous pour explorer vos options.',
      color: 'amber',
    });

    // Permis d'études
    const peScore = (() => {
      let s = 0;
      if (age >= 18 && age <= 35) s += 20; else if (age >= 36 && age <= 45) s += 10;
      if (form.funds === '20k+') s += 25; else if (form.funds === '10k-20k') s += 15;
      if (form.education === 'bachelor' || form.education === 'diploma3') s += 15;
      if (form.frenchLevel === 'b2+' || form.englishLevel === 'clb7-8' || form.englishLevel === 'clb9+') s += 15;
      return s;
    })();
    results.push({
      name: 'Permis d\'études',
      eligible: peScore >= 30,
      score: Math.min(peScore, 100),
      details: peScore >= 30
        ? 'Étudier au Canada est une excellente voie vers l\'immigration permanente, surtout au Québec (PEQ post-diplôme).'
        : 'Un permis d\'études nécessite une lettre d\'acceptation et des fonds suffisants. Contactez-nous pour en savoir plus.',
      color: 'cyan',
    });

    // Parrainage familial
    const famScore = form.familyInCanada === 'spouse' ? 80 : form.familyInCanada === 'parent' ? 60 : form.familyInCanada === 'other' ? 20 : 0;
    results.push({
      name: 'Parrainage familial',
      eligible: famScore >= 50,
      score: famScore,
      details: famScore >= 50
        ? 'Vous pourriez être éligible au parrainage familial. C\'est un excellent programme avec des délais relativement courts.'
        : 'Le parrainage nécessite un lien familial direct avec un citoyen ou résident permanent canadien.',
      color: 'rose',
    });

    return results.sort((a, b) => b.score - a.score);
  };

  const handleSubmit = async () => {
    const r = evaluate();
    setResults(r);
    setSubmitted(true);

    // Send lead data to CRM
    try {
      const eligible = r.filter(p => p.eligible).map(p => p.name);
      await fetch('https://soshubca.vercel.app/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'admissibility_test',
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Test d'admissibilité - ${eligible.length} programme(s) éligible(s)`,
          message: `Programmes éligibles: ${eligible.join(', ') || 'Aucun'}`,
          formData: {
            age: form.age,
            education: form.education,
            workExperience: form.workExperience,
            canadianExperience: form.canadianExperience,
            frenchLevel: form.frenchLevel,
            englishLevel: form.englishLevel,
            destination: form.destination,
            jobOffer: form.jobOffer,
            familyInCanada: form.familyInCanada,
            maritalStatus: form.maritalStatus,
            results: r.map(p => ({ name: p.name, eligible: p.eligible, score: p.score })),
          },
        }),
      });
    } catch {
      // Silently fail - don't block user experience
    }
  };

  if (submitted && results) {
    const eligible = results.filter(r => r.eligible);
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Results header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-3xl font-bold text-navy mb-2">Résultats de votre évaluation</h1>
            <p className="text-gray-500">
              {eligible.length > 0
                ? `${eligible.length} programme${eligible.length > 1 ? 's' : ''} potentiellement accessible${eligible.length > 1 ? 's' : ''} pour vous`
                : 'Contactez-nous pour explorer toutes vos options'}
            </p>
          </div>

          {/* Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700">
              <strong>Important:</strong> Cette évaluation est une estimation partielle basée sur les informations fournies.
              Elle ne constitue pas un avis juridique. Pour une analyse complète et personnalisée de votre dossier,
              nous vous recommandons une consultation avec notre équipe.
            </p>
          </div>

          {/* Results cards */}
          <div className="space-y-4 mb-10">
            {results.map((r, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl p-6 border ${r.eligible ? 'border-green-200 shadow-md' : 'border-gray-100'} transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {r.eligible ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
                    )}
                    <h3 className="font-bold text-navy">{r.name}</h3>
                  </div>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    r.eligible ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {r.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${r.eligible ? 'bg-green-400' : 'bg-gray-300'}`}
                    style={{ width: `${r.score}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{r.details}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Obtenez une analyse complète</h2>
            <p className="text-white/70 mb-6 max-w-lg mx-auto">
              Notre équipe peut examiner votre dossier en détail, identifier des programmes supplémentaires
              et vous proposer une stratégie d&apos;immigration optimale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-3 bg-gold text-white font-bold rounded-xl hover:bg-gold-dark transition-colors"
              >
                Consultation personnalisée
              </Link>
              <Link
                href="https://soshubca.vercel.app/inscription"
                target="_blank"
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                S&apos;inscrire en ligne
              </Link>
            </div>
            <p className="text-white/40 text-xs mt-4">Frais d&apos;ouverture de dossier: 250$ CAD</p>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => { setSubmitted(false); setResults(null); setStep(0); setForm(initialForm); }}
              className="text-gold font-medium hover:text-gold-dark transition-colors"
            >
              Refaire le test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Outil gratuit</span>
          <h1 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-3">
            Test d&apos;admissibilité
          </h1>
          <div className="divider-gold mx-auto mt-3 mb-4" />
          <p className="text-gray-500 max-w-xl mx-auto font-sans">
            Répondez à quelques questions pour découvrir les programmes auxquels vous pourriez être éligible.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {stepConfig.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i <= step ? 'bg-gold text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              {i < stepConfig.length - 1 && (
                <div className={`hidden sm:block w-12 md:w-20 h-0.5 mx-1 ${i < step ? 'bg-gold' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-navy flex items-center justify-center gap-2">
            {(() => { const Icon = stepConfig[step].icon; return <Icon className="w-5 h-5 text-gold" />; })()}
            {stepConfig[step].title}
          </h2>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {/* Step 0: Personal */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre âge</label>
                <input
                  type="number"
                  min="16"
                  max="80"
                  value={form.age}
                  onChange={e => update('age', e.target.value)}
                  placeholder="Ex: 30"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut matrimonial</label>
                <select value={form.maritalStatus} onChange={e => update('maritalStatus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="single">Célibataire</option>
                  <option value="married">Marié(e) / Conjoint(e) de fait</option>
                  <option value="divorced">Divorcé(e)</option>
                  <option value="widowed">Veuf/Veuve</option>
                </select>
              </div>
              {(form.maritalStatus === 'married') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d&apos;études du conjoint</label>
                  <select value={form.spouseEducation} onChange={e => update('spouseEducation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                    <option value="">Sélectionnez</option>
                    <option value="secondary">Secondaire</option>
                    <option value="diploma2">Diplôme 1-2 ans</option>
                    <option value="bachelor">Baccalauréat</option>
                    <option value="master">Maîtrise ou plus</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Education & Work */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plus haut niveau d&apos;études complété</label>
                <select value={form.education} onChange={e => update('education', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="secondary">Secondaire (DES)</option>
                  <option value="diploma2">Diplôme/Certificat (1-2 ans)</option>
                  <option value="diploma3">Diplôme/Certificat (3 ans+)</option>
                  <option value="bachelor">Baccalauréat (licence)</option>
                  <option value="master">Maîtrise (master)</option>
                  <option value="phd">Doctorat (PhD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Années d&apos;expérience de travail qualifié</label>
                <select value={form.workExperience} onChange={e => update('workExperience', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="0">Aucune</option>
                  <option value="1-2">1-2 ans</option>
                  <option value="3-5">3-5 ans</option>
                  <option value="6+">6 ans ou plus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fonds disponibles pour l&apos;installation</label>
                <select value={form.funds} onChange={e => update('funds', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="<10k">Moins de 10 000$ CAD</option>
                  <option value="10k-20k">10 000$ - 20 000$ CAD</option>
                  <option value="20k+">Plus de 20 000$ CAD</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Languages */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de français</label>
                <select value={form.frenchLevel} onChange={e => update('frenchLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="none">Aucun / Débutant</option>
                  <option value="a2">Élémentaire (A2)</option>
                  <option value="b1">Intermédiaire (B1)</option>
                  <option value="b2+">Avancé (B2 ou plus)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Le français B2 est requis pour la plupart des programmes québécois</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d&apos;anglais</label>
                <select value={form.englishLevel} onChange={e => update('englishLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="none">Aucun / Débutant</option>
                  <option value="clb4">CLB 4-5 (élémentaire)</option>
                  <option value="clb5-6">CLB 5-6 (intermédiaire)</option>
                  <option value="clb7-8">CLB 7-8 (avancé)</option>
                  <option value="clb9+">CLB 9+ (supérieur)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Basé sur IELTS ou CELPIP (CLB = Canadian Language Benchmark)</p>
              </div>
            </div>
          )}

          {/* Step 3: Canada situation */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination souhaitée</label>
                <select value={form.destination} onChange={e => update('destination', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="quebec">Québec (Montréal et région)</option>
                  <option value="ontario">Ontario</option>
                  <option value="bc">Colombie-Britannique</option>
                  <option value="prairies">Alberta / Saskatchewan / Manitoba</option>
                  <option value="atlantic">Provinces atlantiques</option>
                  <option value="anywhere">Partout au Canada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expérience canadienne</label>
                <select value={form.canadianExperience} onChange={e => update('canadianExperience', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="none">Aucune expérience au Canada</option>
                  <option value="quebec_study">Études au Québec</option>
                  <option value="quebec_work">Travail au Québec (12 mois+)</option>
                  <option value="canada_work">Travail ailleurs au Canada</option>
                  <option value="canada_study">Études ailleurs au Canada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avez-vous une offre d&apos;emploi au Canada?</label>
                <select value={form.jobOffer} onChange={e => update('jobOffer', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="yes">Oui</option>
                  <option value="no">Non</option>
                  <option value="searching">En recherche</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Famille au Canada</label>
                <select value={form.familyInCanada} onChange={e => update('familyInCanada', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white">
                  <option value="">Sélectionnez</option>
                  <option value="none">Aucune famille au Canada</option>
                  <option value="spouse">Conjoint(e) citoyen(ne) ou RP</option>
                  <option value="parent">Parent citoyen ou RP</option>
                  <option value="other">Autre membre de la famille</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Contact */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-2">
                <p className="text-sm text-gray-600">
                  Entrez vos coordonnées pour recevoir vos résultats et être contacté par notre équipe
                  pour une analyse approfondie gratuite.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Courriel *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone (optionnel)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="+1 (514) 555-1234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-500 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Précédent
            </button>

            {step < stepConfig.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Voir mes résultats <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
