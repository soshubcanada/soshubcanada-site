'use client';
// ========================================================
// SOS Hub Canada — Checkout rapide: Rapport Premium 49,99$
// Page minimaliste pour conversion maximale
// ========================================================
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Shield, Clock, FileText, Phone, Mail, MapPin, Star, Lock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

declare global {
  interface Window { Square?: any; }
}

const AMOUNT_CENTS = 4999;
const AMOUNT_DISPLAY = '49,99';
const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID || '';
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '';

// ── Quick Checkout Content ──
function CheckoutContent() {
  const params = useSearchParams();
  const name = params.get('name') || '';
  const email = params.get('email') || '';
  const plan = params.get('plan') || 'analyse-premium';

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
          note: `Rapport Premium Immigration - ${clientName} (${clientEmail})`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Paiement refuse');

      setPaymentId(data.paymentId);
      setReceiptUrl(data.receiptUrl || '');
      setStep('success');

      // Sync client dans Supabase (prospect → actif) via API unifiée
      try {
        const syncRes = await fetch('/api/crm/sync-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: clientEmail,
            name: clientName,
            phone: clientPhone,
            status: 'actif',
            source: 'achat_rapport',
            paymentType: 'rapport_premium',
            paymentId: data.paymentId,
            paymentAmount: AMOUNT_CENTS / 100,
          }),
        });
        const syncData = await syncRes.json();
        // Auto-send portal invite
        if (syncData.clientId) {
          try {
            await fetch('/api/crm/portal-invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: clientEmail,
                name: clientName,
                entityType: 'client',
                entityId: syncData.clientId,
              }),
            });
          } catch { /* portal invite failed silently */ }
        }
      } catch { /* sync failed silently */ }

      // Notify SOS Hub via email
      try {
        await fetch('/api/crm/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer demo' },
          body: JSON.stringify({
            toEmail: 'info@soshubcanada.com',
            subject: `Nouveau achat rapport premium - ${clientName}`,
            emailBody: `Client: ${clientName}\nEmail: ${clientEmail}\nTel: ${clientPhone}\nMontant: ${AMOUNT_DISPLAY} $\nPayment ID: ${data.paymentId}`,
            type: 'payment_notification',
            sentBy: 'system',
          }),
        });
      } catch {}
    } catch (err: any) {
      setError(err.message || 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  }, [clientName, clientEmail, clientPhone]);

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
          {['Informations', 'Paiement', 'Confirmation'].map((label, i) => {
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
        {/* ── STEP 1: INFO ── */}
        {step === 'form' && (
          <div className="space-y-4">
            {/* Product card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-[#D4A03C] uppercase">Rapport Premium</div>
                    <h1 className="text-lg font-bold mt-1">Analyse d'admissibilite complete</h1>
                  </div>
                  <div className="text-right">
                    <div className="text-sm line-through text-white/40">149,99 $</div>
                    <div className="text-3xl font-black text-[#D4A03C]">{AMOUNT_DISPLAY} $</div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-2">
                {[
                  'Analyse detaillee de 12 programmes federaux et provinciaux',
                  'Score CRS et MIFI avec plan d\'amelioration personnalise',
                  'Jumelage avec employeurs partenaires (EIMT approuvee)',
                  'Liste de documents requis pour votre programme',
                  'Consultation gratuite de 30 min avec un expert',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={16} className={`mt-0.5 flex-shrink-0 ${i === 4 ? 'text-[#D4A03C]' : 'text-green-500'}`} />
                    <span className={`text-sm ${i === 4 ? 'font-bold text-[#1B2559]' : 'text-slate-600'}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 space-y-4">
              <h2 className="font-bold text-[#1B2559] text-base">Vos informations</h2>
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
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Telephone</label>
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
                Continuer vers le paiement <ArrowRight size={18} />
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-6 text-slate-400 text-xs py-2">
              <span className="flex items-center gap-1"><Shield size={14} /> Securise</span>
              <span className="flex items-center gap-1"><Clock size={14} /> Rapport en 24h</span>
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
                <span className="text-sm text-slate-600">Rapport Premium Immigration</span>
                <span className="font-bold text-lg text-[#1B2559]">{AMOUNT_DISPLAY} $</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>Taxes incluses</span>
                <span className="line-through">149,99 $</span>
              </div>
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
                    <div className="font-bold text-[#1B2559] text-lg">paiement@soshubcanada.com</div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Indiquez votre nom complet dans le message du virement.
                    Votre rapport sera envoye dans les 24h suivant la reception du paiement.
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
            <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-[#1B2559] mb-2">
                {method === 'card' ? 'Paiement confirme !' : 'Demande recue !'}
              </h1>
              <p className="text-slate-600 text-sm mb-4">
                {method === 'card'
                  ? 'Merci pour votre achat. Votre rapport premium sera envoye a votre courriel dans les prochaines 24 heures.'
                  : 'Merci ! Des reception de votre virement Interac, nous preparerons votre rapport premium sous 24 heures.'}
              </p>
              {paymentId && (
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 mb-4">
                  Reference: <span className="font-mono">{paymentId}</span>
                </div>
              )}
              {receiptUrl && (
                <a href={receiptUrl} target="_blank" rel="noopener" className="text-sm text-[#D4A03C] hover:underline flex items-center justify-center gap-1 mb-4">
                  <FileText size={14} /> Voir le recu
                </a>
              )}
            </div>

            {/* What's next */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 space-y-3">
              <h2 className="font-bold text-[#1B2559]">Prochaines etapes</h2>
              {[
                { n: '1', t: 'Vous recevrez votre rapport detaille par courriel sous 24h' },
                { n: '2', t: 'Un expert vous contactera pour planifier votre consultation gratuite de 30 min' },
                { n: '3', t: 'Ensemble, nous etablirons votre plan d\'immigration personnalise' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#D4A03C] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{s.n}</div>
                  <span className="text-sm text-slate-600 mt-0.5">{s.t}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] rounded-2xl p-5 text-white text-center">
              <div className="font-bold text-lg mb-3">Des questions ?</div>
              <div className="space-y-2 text-sm">
                <a href="https://wa.me/14386302869" className="flex items-center justify-center gap-2 text-[#D4A03C] hover:underline">
                  <Phone size={14} /> +1 (438) 630-2869 (WhatsApp)
                </a>
                <a href="mailto:info@soshubcanada.com" className="flex items-center justify-center gap-2 text-white/70 hover:underline">
                  <Mail size={14} /> info@soshubcanada.com
                </a>
                <div className="flex items-center justify-center gap-2 text-white/50 text-xs">
                  <MapPin size={12} /> 3737 Cremazie Est #402, Montreal QC H1Z 2K4
                </div>
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

// ── Main Export ──
export default function AchatRapportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-[#D4A03C]" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
