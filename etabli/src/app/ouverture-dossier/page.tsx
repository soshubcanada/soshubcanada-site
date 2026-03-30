'use client';
// ========================================================
// SOS Hub Canada — Ouverture de dossier: 250 $ CAD
// Checkout rapide — client pre-qualifie (test admissibilite)
// ========================================================
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle, Shield, Lock, AlertTriangle, ArrowRight, Loader2,
  Phone, Mail, MapPin, FileText, Download, Clock, Star, ExternalLink,
} from 'lucide-react';

declare global {
  interface Window { Square?: any; }
}

const AMOUNT_CENTS = 25000;
const AMOUNT_DISPLAY = '250,00';
const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID || '';
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '';

// ── Document checklist data ──
const DOCUMENTS_REQUIS = [
  'Passeport valide (min 6 mois restants)',
  "Photos d'identite format IRCC (35mm x 45mm)",
  'CV a jour (format canadien recommande)',
  "Lettre d'offre d'emploi de l'employeur",
  "Copie de l'EIMT positive (si applicable)",
  'Diplomes et releves de notes',
  "Equivalence des diplomes (ECA/WES) si etudes hors Canada",
  'Resultats de test de langue (TEF/TCF pour le francais, IELTS/CELPIP pour l\'anglais)',
  "Preuve de fonds d'etablissement (releves bancaires 3 derniers mois)",
  "Certificat de police (pays de residence de 6+ mois depuis l'age de 18 ans)",
];

const DOCUMENTS_OPTIONNELS = [
  "Examen medical (avec medecin designe IRCC) — optionnel, peut etre demande par IRCC",
  "Lettres de reference d'employeurs precedents — optionnel mais fortement recommande",
  'Preuve de lien familial au Canada — optionnel, si applicable',
  'Certificat de mariage / preuve de relation — optionnel, si applicable',
  'Preuves de sejours anterieurs au Canada — optionnel, si applicable',
  'Formulaire IMM 5476 (Representant) — sera fourni par SOS Hub',
];

function generateChecklistText(name: string): string {
  let text = `LISTE DE DOCUMENTS — OUVERTURE DE DOSSIER\n`;
  text += `Client: ${name}\n`;
  text += `Date: ${new Date().toLocaleDateString('fr-CA')}\n`;
  text += `SOS Hub Canada Inc.\n`;
  text += `========================================\n\n`;
  text += `DOCUMENTS REQUIS:\n`;
  DOCUMENTS_REQUIS.forEach((d, i) => { text += `  ${i + 1}. [ ] ${d}\n`; });
  text += `\nDOCUMENTS OPTIONNELS:\n`;
  DOCUMENTS_OPTIONNELS.forEach((d, i) => { text += `  ${i + 1}. [ ] ${d}\n`; });
  text += `\n========================================\n`;
  text += `Questions? info@soshubcanada.com | +1 (438) 630-2869\n`;
  return text;
}

// ── Checkout Content ──
function OuvertureDossierContent() {
  const params = useSearchParams();
  const name = params.get('name') || '';
  const email = params.get('email') || '';

  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [clientName, setClientName] = useState(name);
  const [clientEmail, setClientEmail] = useState(email);
  const [clientPhone, setClientPhone] = useState('');
  const [method, setMethod] = useState<'card' | 'interac'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [squareReady, setSquareReady] = useState(false);
  const [cardAttached, setCardAttached] = useState(false);
  const cardRef = useRef<any>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Load Square SDK
  useEffect(() => {
    if (method !== 'card' || step !== 'payment') return;
    if (window.Square) { setSquareReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://web.squarecdn.com/v1/square.js';
    s.onload = () => setSquareReady(true);
    s.onerror = () => setError('Impossible de charger le module de paiement.');
    document.head.appendChild(s);
  }, [method, step]);

  // Init Square Card
  useEffect(() => {
    if (!squareReady || !window.Square || step !== 'payment' || method !== 'card' || cardAttached) return;
    let cancelled = false;
    (async () => {
      try {
        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        const card = await payments.card();
        if (cancelled) return;
        await card.attach('#sq-card-container');
        cardRef.current = card;
        setCardAttached(true);
      } catch (err: any) {
        if (!cancelled) setError('Erreur initialisation carte: ' + (err?.message || ''));
      }
    })();
    return () => { cancelled = true; };
  }, [squareReady, step, method, cardAttached]);

  // Validate & go to payment
  const goToPayment = useCallback(() => {
    setError('');
    if (!clientName.trim()) { setError('Votre nom est requis'); return; }
    if (!clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) { setError('Courriel valide requis'); return; }
    setStep('payment');
    setCardAttached(false);
  }, [clientName, clientEmail]);

  // Process Square payment
  const payCard = useCallback(async () => {
    if (!cardRef.current) { setError('Carte non initialisee'); return; }
    setLoading(true); setError('');
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== 'OK') throw new Error(result.errors?.[0]?.message || 'Erreur de tokenisation');

      const res = await fetch('/api/crm/square-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          amount: AMOUNT_CENTS,
          currency: 'CAD',
          note: `Ouverture dossier - ${clientName} (${clientEmail})`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Paiement refuse');

      setPaymentId(data.paymentId);
      setReceiptUrl(data.receiptUrl || '');
      setStep('success');

      // ── Post-payment automations ──

      // 1. Sync client dans Supabase (prospect → actif) via API unifiée
      let syncedClientId: string | null = null;
      try {
        const syncRes = await fetch('/api/crm/sync-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: clientEmail,
            name: clientName,
            phone: clientPhone,
            status: 'actif',
            source: 'ouverture_dossier',
            paymentType: 'ouverture_dossier',
            paymentId: data.paymentId,
            paymentAmount: AMOUNT_CENTS / 100,
          }),
        });
        const syncData = await syncRes.json();
        if (syncData.success) syncedClientId = syncData.clientId;
      } catch { /* sync failed silently — will retry on next CRM refresh */ }

      // 2. Auto-send portal invite
      try {
        await fetch('/api/crm/portal-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: clientEmail,
            name: clientName,
            entityType: 'client',
            entityId: syncedClientId || '',
          }),
        });
      } catch { /* portal invite failed silently */ }

      // 3. Notify SOS Hub via email
      try {
        await fetch('/api/crm/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer demo' },
          body: JSON.stringify({
            toEmail: 'info@soshubcanada.com',
            subject: `Nouveau dossier ouvert - ${clientName}`,
            emailBody: `Client: ${clientName}\nEmail: ${clientEmail}\nTel: ${clientPhone}\nMontant: ${AMOUNT_DISPLAY} $\nPayment ID: ${data.paymentId}\n\nAction requise: Contacter le client dans les 24h.`,
            type: 'payment_notification',
            sentBy: 'system',
          }),
        });
      } catch { /* notification failed silently */ }

      // 4. Send document checklist email to client
      try {
        await fetch('/api/crm/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer demo' },
          body: JSON.stringify({
            toEmail: clientEmail,
            subject: 'Votre dossier est ouvert — Liste de documents requise',
            emailBody: generateChecklistText(clientName),
            type: 'checklist',
            sentBy: 'system',
          }),
        });
      } catch { /* checklist email failed silently */ }

    } catch (err: any) {
      setError(err.message || 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  }, [clientName, clientEmail, clientPhone]);

  // Download checklist as .txt
  const downloadChecklist = useCallback(() => {
    const text = generateChecklistText(clientName);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-documents-${clientName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [clientName]);

  // ── RENDER ──
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] text-white">
        <div className="max-w-xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black tracking-tight">[ SOS <span className="text-[#D4A03C]">HUB</span> ]</div>
            <div className="text-[#D4A03C] text-[10px] font-bold tracking-[4px] mt-0.5">RELOCALISATION & SERVICES</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-white/60"><Lock size={12} /> Paiement securise</div>
            <div className="flex items-center gap-1 text-xs text-white/60 mt-1"><Shield size={12} /> SSL 256-bit</div>
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="max-w-xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          {['Confirmation', 'Paiement', 'Dossier ouvert'].map((label, i) => {
            const active = i === (step === 'form' ? 0 : step === 'payment' ? 1 : 2);
            const done = (step === 'payment' && i === 0) || (step === 'success' && i <= 1);
            return (
              <div key={label} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${done ? 'bg-green-500' : active ? 'bg-[#D4A03C]' : 'bg-slate-200'}`} />
                <div className={`text-[10px] mt-1 text-center font-medium ${active ? 'text-[#1B2559]' : done ? 'text-green-600' : 'text-slate-400'}`}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pb-12">

        {/* ── STEP 1: CONFIRMATION ── */}
        {step === 'form' && (
          <div className="space-y-4">
            {/* Product card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-[#D4A03C] uppercase">Frais d'ouverture</div>
                    <h1 className="text-lg font-bold mt-1">Ouverture de dossier</h1>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#D4A03C]">{AMOUNT_DISPLAY} $</div>
                    <div className="text-[10px] text-white/50">CAD, taxes incluses</div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-2.5">
                {[
                  'Analyse complete par un consultant senior',
                  'Verification de tous vos documents',
                  'Strategie personnalisee',
                  'Acces au portail client',
                  'Jumelage employeur (si applicable)',
                  'Montant deduit des honoraires lors de la signature du contrat',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={16} className={`mt-0.5 flex-shrink-0 ${i === 5 ? 'text-[#D4A03C]' : 'text-green-500'}`} />
                    <span className={`text-sm ${i === 5 ? 'font-semibold text-[#1B2559]' : 'text-slate-600'}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 space-y-4">
              <h2 className="font-bold text-[#1B2559] text-base">Confirmez vos informations</h2>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nom complet *</label>
                <input
                  type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                  className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A03C] focus:border-transparent outline-none"
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Courriel *</label>
                <input
                  type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                  className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A03C] focus:border-transparent outline-none"
                  placeholder="votre@courriel.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Telephone <span className="text-slate-400 normal-case">(optionnel)</span></label>
                <input
                  type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                  className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A03C] focus:border-transparent outline-none"
                  placeholder="+1 (___) ___-____"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              <button onClick={goToPayment}
                className="w-full bg-gradient-to-r from-[#D4A03C] to-[#F59E0B] text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]">
                Proceder au paiement — {AMOUNT_DISPLAY} $ <ArrowRight size={18} />
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-6 text-slate-400 text-xs py-2">
              <span className="flex items-center gap-1"><Shield size={14} /> Securise</span>
              <span className="flex items-center gap-1"><Clock size={14} /> Reponse en 24h</span>
              <span className="flex items-center gap-1"><Star size={14} /> 500+ clients</span>
            </div>
          </div>
        )}

        {/* ── STEP 2: PAYMENT ── */}
        {step === 'payment' && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1B2559]">Resume</h2>
                <button onClick={() => { setStep('form'); setCardAttached(false); }} className="text-xs text-[#D4A03C] hover:underline">Modifier</button>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <div><span className="font-medium text-slate-800">{clientName}</span></div>
                <div>{clientEmail}</div>
                {clientPhone && <div>{clientPhone}</div>}
              </div>
              <div className="border-t mt-4 pt-4 flex items-center justify-between">
                <span className="text-sm text-slate-600">Ouverture de dossier</span>
                <span className="font-bold text-lg text-[#1B2559]">{AMOUNT_DISPLAY} $</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Taxes incluses | Deductible des honoraires</div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 space-y-4">
              <h2 className="font-bold text-[#1B2559]">Methode de paiement</h2>

              <div className="flex gap-2">
                <button onClick={() => { setMethod('card'); setCardAttached(false); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${method === 'card' ? 'border-[#D4A03C] bg-[#D4A03C]/5 text-[#1B2559]' : 'border-slate-200 text-slate-500'}`}>
                  Carte de credit/debit
                </button>
                <button onClick={() => setMethod('interac')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${method === 'interac' ? 'border-[#D4A03C] bg-[#D4A03C]/5 text-[#1B2559]' : 'border-slate-200 text-slate-500'}`}>
                  Interac e-Transfert
                </button>
              </div>

              {method === 'card' && (
                <div>
                  <div id="sq-card-container" ref={cardContainerRef} className="min-h-[60px] border border-slate-200 rounded-xl p-3" />
                  {!cardAttached && (
                    <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-400">
                      <Loader2 size={16} className="animate-spin" /> Chargement du formulaire...
                    </div>
                  )}
                </div>
              )}

              {method === 'interac' && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-slate-600">Envoyez <strong className="text-[#1B2559]">{AMOUNT_DISPLAY} $</strong> par Interac e-Transfert a :</p>
                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="font-bold text-[#1B2559] text-lg">info@soshubcanada.com</div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Indiquez votre nom complet dans le message du virement.
                    Votre dossier sera ouvert dans les 24h suivant la reception du paiement.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              {method === 'card' && (
                <button onClick={payCard} disabled={loading || !cardAttached}
                  className="w-full bg-gradient-to-r from-[#D4A03C] to-[#F59E0B] text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 active:scale-[0.98]">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Traitement en cours...</> : <>
                    <Lock size={16} /> Payer {AMOUNT_DISPLAY} $ maintenant
                  </>}
                </button>
              )}

              {method === 'interac' && (
                <button onClick={() => setStep('success')}
                  className="w-full bg-[#1B2559] text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                  J'ai envoye le virement <ArrowRight size={16} />
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Lock size={12} /> Paiement securise par Square | Chiffrement SSL 256-bit
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === 'success' && (
          <div className="space-y-4">
            {/* Confirmation */}
            <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-[#1B2559] mb-2">
                {method === 'card' ? 'Paiement confirme !' : 'Demande recue !'}
              </h1>
              <p className="text-lg font-semibold text-[#1B2559] mb-2">Votre dossier est maintenant ouvert</p>
              <p className="text-slate-600 text-sm mb-4">
                {method === 'card'
                  ? 'Merci pour votre confiance. Un conseiller vous contactera dans les 24 prochaines heures.'
                  : 'Merci ! Des reception de votre virement Interac, votre dossier sera ouvert sous 24 heures.'}
              </p>
              {paymentId && (
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 mb-2">
                  Reference: <span className="font-mono">{paymentId}</span>
                </div>
              )}
              {receiptUrl && (
                <a href={receiptUrl} target="_blank" rel="noopener" className="text-sm text-[#D4A03C] hover:underline flex items-center justify-center gap-1 mb-2">
                  <FileText size={14} /> Voir le recu
                </a>
              )}
            </div>

            {/* Document checklist */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#1B2559] text-base">Documents a preparer</h2>
                <button onClick={downloadChecklist} className="flex items-center gap-1 text-xs text-[#D4A03C] hover:underline font-medium">
                  <Download size={14} /> Telecharger la liste
                </button>
              </div>

              {/* REQUIS */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Requis</span>
                </div>
                <div className="space-y-2">
                  {DOCUMENTS_REQUIS.map((doc, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 border-2 border-slate-300 rounded flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* OPTIONNEL */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Optionnel</span>
                </div>
                <div className="space-y-2">
                  {DOCUMENTS_OPTIONNELS.map((doc, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 border-2 border-dashed border-slate-200 rounded flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-500">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 space-y-3">
              <h2 className="font-bold text-[#1B2559]">Prochaines etapes</h2>
              {[
                { n: '1', t: 'Un conseiller vous contactera dans les 24h pour planifier votre premier rendez-vous' },
                { n: '2', t: 'Rassemblez les documents requis ci-dessus et telechargez-les sur votre portail client' },
                { n: '3', t: 'Votre consultant analysera votre dossier et preparera votre strategie personnalisee' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#D4A03C] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{s.n}</div>
                  <span className="text-sm text-slate-600 mt-0.5">{s.t}</span>
                </div>
              ))}
            </div>

            {/* Portal access */}
            <div className="bg-[#D4A03C]/10 border border-[#D4A03C]/30 rounded-2xl p-5 text-center">
              <div className="text-sm font-semibold text-[#1B2559] mb-2">Portail client</div>
              <p className="text-xs text-slate-600 mb-3">Un lien d'acces a votre portail client a ete envoye a <strong>{clientEmail}</strong>. Vous pourrez y telecharger vos documents et suivre l'avancement de votre dossier.</p>
              <a href="/portail" className="inline-flex items-center gap-1 text-sm font-bold text-[#D4A03C] hover:underline">
                Acceder au portail <ExternalLink size={14} />
              </a>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] rounded-2xl p-5 text-white text-center">
              <div className="font-bold text-lg mb-1">Un conseiller vous contactera dans les 24h</div>
              <p className="text-white/60 text-xs mb-4">Des questions entre-temps ?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://wa.me/14386302869" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all">
                  <Phone size={16} /> WhatsApp
                </a>
                <a href="mailto:info@soshubcanada.com" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all">
                  <Mail size={16} /> info@soshubcanada.com
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/40 text-xs mt-4">
                <MapPin size={12} /> 3737 Cremazie Est #402, Montreal QC H1Z 2K4
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-[#1B2559] text-center text-white/40 text-xs py-4">
        SOS Hub Canada Inc. | Tous droits reserves
      </div>
    </div>
  );
}

// ── Main Export with Suspense ──
export default function OuvertureDossierPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-[#D4A03C]" />
      </div>
    }>
      <OuvertureDossierContent />
    </Suspense>
  );
}
