'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles,
  User, GraduationCap, Briefcase, Globe2, Languages, Send,
  MessageCircle, Phone, Mail, Clock, TrendingDown, AlertTriangle,
  CalendarClock, ShieldAlert, Flame, Zap
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
      // CRM send failed - don't block results display
      console.warn('CRM lead submission failed');
    }
  };

  if (submitted && results) {
    const eligible = results.filter(r => r.eligible);
    const age = parseInt(form.age) || 0;
    const whatsappMsg = encodeURIComponent(`Bonjour SOS Hub Canada! Je viens de compléter le test d'admissibilité. Mon nom est ${form.name}, j'ai ${age} ans. J'ai ${eligible.length} programme(s) éligible(s): ${eligible.map(p => p.name).join(', ') || 'à discuter'}. J'aimerais obtenir mon plan d'action personnalisé.`);
    const whatsappUrl = `https://wa.me/14386302869?text=${whatsappMsg}`;

    // Dynamic urgency alerts based on profile
    const urgencyAlerts: { icon: React.ElementType; title: string; text: string; color: string }[] = [];

    if (age >= 30) {
      const pointsLost = age >= 35 ? '10 à 15' : '5 à 8';
      urgencyAlerts.push({
        icon: TrendingDown,
        title: `Facteur âge — Vous perdez des points chaque année`,
        text: `À ${age} ans, chaque année qui passe vous fait perdre ${pointsLost} points CRS pour l'Entrée Express. Après 45 ans, la plupart des programmes fédéraux deviennent inaccessibles. Agissez maintenant pour maximiser votre score.`,
        color: age >= 35 ? 'red' : 'amber',
      });
    }

    urgencyAlerts.push({
      icon: ShieldAlert,
      title: 'Quotas IRCC en baisse — Fenêtres qui se ferment',
      text: 'Le Canada réduit actuellement ses quotas de résidents temporaires et resserre les critères d\'admissibilité. Les niveaux d\'immigration 2025-2027 prévoient des réductions significatives. Les dossiers soumis maintenant ont plus de chances d\'être traités avant les nouveaux resserrements.',
      color: 'amber',
    });

    if (eligible.some(p => p.name.includes('études'))) {
      urgencyAlerts.push({
        icon: CalendarClock,
        title: 'Rentrée d\'automne 2026 — Délais stricts',
        text: 'Les admissions pour la rentrée d\'automne 2026 ferment bientôt. Les universités canadiennes exigent les dossiers 4 à 6 mois à l\'avance. Commencez votre demande maintenant pour ne pas manquer la prochaine rentrée.',
        color: 'blue',
      });
    }

    if (eligible.some(p => p.name.includes('PEQ') || p.name.includes('PRTQ'))) {
      urgencyAlerts.push({
        icon: AlertTriangle,
        title: 'Réforme du PEQ et Arrima — Nouvelles exigences',
        text: 'Le Québec a resserré les critères du PEQ et du PRTQ. Les exigences de français et d\'expérience sont en constante évolution. Soumettez votre dossier pendant que votre profil correspond aux critères actuels.',
        color: 'amber',
      });
    }

    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-4xl mx-auto px-6">

          {/* ===== MASSIVE WHATSAPP CTA — HERO ===== */}
          <div className="relative bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-3xl p-8 md:p-10 mb-8 text-white shadow-2xl shadow-[#25D366]/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-8 -translate-x-8" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white/80">Expert disponible maintenant</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
                ✅ Votre dossier est reçu, {form.name}!
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
                Cliquez ci-dessous pour obtenir votre <strong>plan d&apos;action personnalisé</strong> et votre statut via WhatsApp avec notre expert en immigration.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#128C7E] font-bold rounded-2xl hover:bg-white/90 transition-all text-lg md:text-xl shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                <MessageCircle className="w-7 h-7" />
                Obtenir mon plan d&apos;action sur WhatsApp
              </a>
              <p className="text-sm text-white/60 mt-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Réponse moyenne : moins de 2 heures
              </p>
            </div>
          </div>

          {/* ===== URGENCY ALERTS — FOMO ===== */}
          <div className="space-y-3 mb-8">
            {urgencyAlerts.map((alert, i) => {
              const AlertIcon = alert.icon;
              const bgColor = alert.color === 'red' ? 'bg-red-50 border-red-200' : alert.color === 'blue' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200';
              const iconColor = alert.color === 'red' ? 'text-red-500 bg-red-100' : alert.color === 'blue' ? 'text-blue-500 bg-blue-100' : 'text-amber-500 bg-amber-100';
              const titleColor = alert.color === 'red' ? 'text-red-800' : alert.color === 'blue' ? 'text-blue-800' : 'text-amber-800';
              const textColor = alert.color === 'red' ? 'text-red-700' : alert.color === 'blue' ? 'text-blue-700' : 'text-amber-700';
              return (
                <div key={i} className={`${bgColor} border rounded-xl p-4 flex items-start gap-3`}>
                  <div className={`w-9 h-9 rounded-lg ${iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                    <AlertIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${titleColor} mb-1 flex items-center gap-2`}>
                      <Flame className="w-4 h-4" /> {alert.title}
                    </h4>
                    <p className={`text-sm ${textColor}`}>{alert.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy mb-2">Résultats de votre évaluation</h1>
            <p className="text-gray-500 font-sans">
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
          <div className="space-y-4 mb-8">
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

          {/* ===== SECOND WHATSAPP CTA — After results ===== */}
          <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-6 md:p-8 mb-8 text-white text-center">
            <Zap className="w-10 h-10 text-gold mx-auto mb-3" />
            <h3 className="text-xl md:text-2xl font-bold mb-2">Ne laissez pas votre dossier dormir</h3>
            <p className="text-white/70 mb-6 max-w-lg mx-auto font-sans">
              {age >= 30
                ? `À ${age} ans, chaque mois compte. Nos experts peuvent optimiser votre profil et soumettre votre dossier rapidement.`
                : 'Nos experts peuvent analyser votre dossier en détail et vous proposer la stratégie la plus rapide vers le Canada.'
              }
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#20bd5a] transition-all text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              <MessageCircle className="w-6 h-6" /> Parler à un expert maintenant
            </a>
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-white/50">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-400" /> Consultation gratuite</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gold" /> Réponse en moins de 2h</span>
              <span className="flex items-center gap-1"><ShieldAlert className="w-4 h-4 text-gold" /> 100% confidentiel</span>
            </div>
          </div>

          {/* Contact options */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#25D366]/30 transition-all"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <div>
                <p className="font-semibold text-sm text-navy">WhatsApp</p>
                <p className="text-gray-400 text-xs">+1 (438) 630-2869</p>
              </div>
            </a>
            <a
              href="tel:+15145330482"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <Phone className="w-5 h-5 text-gold" />
              <div>
                <p className="font-semibold text-sm text-navy">Téléphone</p>
                <p className="text-gray-400 text-xs">+1 (514) 533-0482</p>
              </div>
            </a>
            <a
              href="mailto:info@soshubcanada.com"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <Mail className="w-5 h-5 text-gold" />
              <div>
                <p className="font-semibold text-sm text-navy">Courriel</p>
                <p className="text-gray-400 text-xs">info@soshubcanada.com</p>
              </div>
            </a>
          </div>

          <div className="text-center mt-6">
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
