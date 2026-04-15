'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ========================================================
// SOS Hub Canada - Page publique de signature de contrat
// Mobile-first, compatible iPad/phone/desktop
// ========================================================

// -- Inline SVG Logo --
const SOS_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="48" height="21"><path d="M10 10 H30 V18 H18 V102 H30 V110 H10 V10Z" fill="#1B2559"/><path d="M250 10 H270 V110 H250 V102 H262 V18 H250 V10Z" fill="#1B2559"/><text x="140" y="72" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="62" fill="#1B2559" letter-spacing="-1">SOS</text><text x="140" y="105" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="36" fill="#D4A03C" letter-spacing="8">HUB</text></svg>`;

interface ContractData {
  contract: {
    id: string;
    contractNumber: string;
    status: string;
    programId: string;
    programName?: string;
    serviceFee?: number;
    governmentFee?: number;
    createdAt?: string;
    signedAt?: string;
  };
  client: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
    email: string;
    passportNumber: string;
  } | null;
}

// -- HTML escaping to prevent XSS --
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// -- Contract HTML Generator (inline minimal version for client display) --
function buildContractDisplayHTML(data: ContractData): string {
  const c = data.contract;
  const cl = data.client;
  if (!cl) return '<p>Donn\u00e9es du client manquantes.</p>';

  const clientName = `${escapeHtml(cl.firstName)} ${escapeHtml(cl.lastName)}`;
  const clientAddr = [cl.address, cl.city, cl.province, cl.postalCode].filter(Boolean).map(escapeHtml).join(', ');
  const dateStr = c.createdAt
    ? new Date(c.createdAt).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11pt;line-height:1.6;color:#1a1a1a;max-width:800px;margin:0 auto;">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:3px solid #1B2559;padding-bottom:16px;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
    <div style="display:flex;align-items:center;gap:12px;">
      ${SOS_LOGO_SVG.replace(/width="48" height="48"/, 'width="44" height="44"')}
      <div>
        <div style="font-size:16pt;font-weight:700;color:#1B2559;">SOS Hub Canada Inc.</div>
        <div style="font-size:8pt;color:#555;">3737, boul. Cr\u00e9mazie Est, bureau 402, Montr\u00e9al (Qu\u00e9bec) H1Z 2K4<br>T\u00e9l. : 514-533-0482 &middot; WhatsApp : 438-630-2869 &middot; info@soshubcanada.com</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:8pt;color:#888;text-transform:uppercase;">Contrat</div>
      <div style="font-size:13pt;font-weight:700;color:#1B2559;">${c.contractNumber || 'CS-2026-XXXX'}</div>
      <div style="font-size:8pt;color:#555;">${dateStr}</div>
    </div>
  </div>

  <div style="text-align:center;margin:20px 0;">
    <div style="font-size:14pt;color:#1B2559;text-transform:uppercase;letter-spacing:1px;border-top:2px solid #D4A03C;border-bottom:2px solid #D4A03C;padding:10px 0;display:inline-block;">Contrat de service professionnel en immigration</div>
  </div>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 1 &mdash; Parties</h3>
  <div style="background:#f8f9fc;border:1px solid #e2e5f0;border-radius:6px;padding:12px;margin-bottom:10px;">
    <div style="font-weight:700;color:#1B2559;font-size:9pt;text-transform:uppercase;">Le Prestataire</div>
    <div style="font-size:10pt;"><strong>SOS Hub Canada Inc.</strong>, soci\u00e9t\u00e9 constitu\u00e9e selon les lois du Qu\u00e9bec<br>1275, av. des Canadiens-de-Montr\u00e9al, Montr\u00e9al (QC) H3B 2S2</div>
  </div>
  <div style="background:#f8f9fc;border:1px solid #e2e5f0;border-radius:6px;padding:12px;margin-bottom:10px;">
    <div style="font-weight:700;color:#1B2559;font-size:9pt;text-transform:uppercase;">Le Client</div>
    <div style="font-size:10pt;"><strong>${clientName}</strong><br>${clientAddr}<br>T\u00e9l. : ${escapeHtml(cl.phone)} | ${escapeHtml(cl.email)}<br>Passeport : ${escapeHtml(cl.passportNumber)}</div>
  </div>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 2 &mdash; Objet du contrat</h3>
  <p>Le Prestataire s'engage \u00e0 fournir des services de consultation en immigration pour le programme : <strong>${c.programName || c.programId || 'Programme d\'immigration'}</strong>.</p>
  <p>Services inclus : \u00c9valuation, pr\u00e9paration des formulaires, compilation des documents, soumission, suivi aupr\u00e8s d'IRCC/MIFI, communication r\u00e9guli\u00e8re.</p>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 3 &mdash; Frais d'ouverture de dossier</h3>
  <div style="background:#fffbf0;border:1px solid #D4A03C;border-radius:6px;padding:12px;margin:10px 0;">
    <div style="font-size:15pt;font-weight:700;color:#1B2559;">250,00 $ CAD</div>
    <div style="font-size:8pt;color:#666;">Payable \u00e0 la signature &mdash; NON REMBOURSABLE</div>
  </div>
  <p>Ces frais couvrent l'ouverture du dossier, l'\u00e9valuation initiale et les frais administratifs. Ils sont non remboursables en tout temps.</p>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 4 &mdash; Honoraires et modalit\u00e9s de paiement</h3>
  <p>Les honoraires professionnels et d\u00e9bours\u00e9s gouvernementaux seront d\u00e9taill\u00e9s dans une facture distincte. Les taxes applicables (TPS/TVQ) seront ajout\u00e9es.</p>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 5 &mdash; Obligations du Prestataire</h3>
  <ul style="margin-left:20px;"><li>Agir avec diligence et professionnalisme</li><li>Respecter les lois applicables</li><li>Maintenir la confidentialit\u00e9</li><li>Informer le Client r\u00e9guli\u00e8rement</li><li>Ne faire aucune fausse repr\u00e9sentation quant \u00e0 l'issue</li></ul>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 6 &mdash; Obligations du Client</h3>
  <ul style="margin-left:20px;"><li>Fournir des informations v\u00e9ridiques et compl\u00e8tes</li><li>Remettre les documents dans les d\u00e9lais</li><li>Informer de tout changement de situation</li><li>Collaborer activement</li><li>S'acquitter des paiements selon l'\u00e9ch\u00e9ancier</li></ul>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 7 &mdash; R\u00e9siliation</h3>
  <p>R\u00e9siliation possible \u00e0 tout moment par avis \u00e9crit. Les frais d'ouverture de 250 $ et les honoraires pour services rendus ne sont pas remboursables. Le Prestataire remettra copie des documents au Client.</p>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 8 &mdash; Limitation de responsabilit\u00e9</h3>
  <p>Le Prestataire ne garantit aucun r\u00e9sultat sp\u00e9cifique. Les d\u00e9cisions rel\u00e8vent des autorit\u00e9s gouvernementales. Le Prestataire n'est pas responsable des d\u00e9lais caus\u00e9s par les autorit\u00e9s.</p>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 9 &mdash; Confidentialit\u00e9</h3>
  <p>Protection des renseignements personnels conform\u00e9ment aux lois applicables. Aucune divulgation sans consentement ou obligation l\u00e9gale.</p>

  <h3 style="font-size:11pt;color:#1B2559;border-left:4px solid #D4A03C;padding-left:10px;margin:20px 0 10px;">Article 10 &mdash; Dispositions g\u00e9n\u00e9rales</h3>
  <p>Entente compl\u00e8te entre les parties. Loi applicable : lois du Qu\u00e9bec. Tribunaux comp\u00e9tents : district judiciaire de Montr\u00e9al.</p>
</div>`;
}

// ============ Signature Canvas Component ============

function SignatureCanvas({
  onSignatureChange,
}: {
  onSignatureChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getPoint = useCallback((e: React.TouchEvent | React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    const me = e as React.MouseEvent;
    return {
      x: (me.clientX - rect.left) * scaleX,
      y: (me.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPointRef.current = getPoint(e);
  }, [getPoint]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const point = getPoint(e);
    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = '#1B2559';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    lastPointRef.current = point;
  }, [getPoint]);

  const endDraw = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    if (canvasRef.current) {
      onSignatureChange(canvasRef.current.toDataURL('image/png'));
    }
  }, [onSignatureChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  }, [onSignatureChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Set high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: '#1B2559', marginBottom: 8, fontSize: '0.95rem' }}>
        Signature
      </label>
      <div style={{ position: 'relative', border: '2px solid #d1d5db', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 160, touchAction: 'none', cursor: 'crosshair', display: 'block' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div style={{ position: 'absolute', bottom: 40, left: 20, right: 20, borderBottom: '1px dashed #ccc' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 20, fontSize: '0.7rem', color: '#aaa' }}>
          Signez ci-dessus
        </div>
      </div>
      <button
        type="button"
        onClick={clearCanvas}
        style={{
          marginTop: 8,
          padding: '6px 16px',
          fontSize: '0.85rem',
          color: '#666',
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Effacer la signature
      </button>
    </div>
  );
}

// ============ Main Page Component ============

export default function SignerContractPage({ params }: { params: Promise<{ contractId: string }> }) {
  const [contractId, setContractId] = useState<string>('');
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySigned, setAlreadySigned] = useState(false);

  // Resolve params (Next.js 15 async params)
  useEffect(() => {
    params.then((p) => setContractId(p.contractId));
  }, [params]);

  // Fetch contract data
  useEffect(() => {
    if (!contractId) return;

    async function fetchContract() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/crm/contracts/sign?contractId=${encodeURIComponent(contractId)}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Contrat introuvable');
        }
        const data: ContractData = await res.json();
        setContractData(data);

        // Pre-fill client name
        if (data.client) {
          setClientName(`${data.client.firstName} ${data.client.lastName}`);
        }

        // Check if already signed
        if (data.contract.status === 'signe' || data.contract.signedAt) {
          setAlreadySigned(true);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du contrat');
      } finally {
        setLoading(false);
      }
    }

    fetchContract();
  }, [contractId]);

  const handleSubmit = async () => {
    if (!contractId || !clientName.trim() || !signatureData || !accepted) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/crm/contracts/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId,
          signedByClient: clientName.trim(),
          signatureData,
          accepted: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur lors de la signature');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = clientName.trim().length >= 2 && signatureData && accepted && !submitting;

  // ---- Success Screen ----
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', background: '#fff', borderRadius: 16, padding: '48px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ecfdf5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#1B2559', fontWeight: 700, marginBottom: 12 }}>
            Contrat sign&eacute; avec succ&egrave;s
          </h1>
          <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 8 }}>
            Merci, <strong>{clientName}</strong>. Votre contrat de service a &eacute;t&eacute; enregistr&eacute;.
          </p>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>
            Vous recevrez une confirmation par courriel. Vous pouvez fermer cette page.
          </p>
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <div dangerouslySetInnerHTML={{ __html: SOS_LOGO_SVG }} />
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 8 }}>SOS Hub Canada Inc.</p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Already Signed Screen ----
  if (alreadySigned) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', background: '#fff', borderRadius: 16, padding: '48px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eff6ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1B2559" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#1B2559', fontWeight: 700, marginBottom: 12 }}>
            Ce contrat a d&eacute;j&agrave; &eacute;t&eacute; sign&eacute;
          </h1>
          <p style={{ color: '#555', fontSize: '0.95rem' }}>
            Sign&eacute; le {contractData?.contract.signedAt ? new Date(contractData.contract.signedAt).toLocaleDateString('fr-CA') : ''}
          </p>
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <div dangerouslySetInnerHTML={{ __html: SOS_LOGO_SVG }} />
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 8 }}>SOS Hub Canada Inc.</p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Loading ----
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div dangerouslySetInnerHTML={{ __html: SOS_LOGO_SVG }} />
          <p style={{ marginTop: 16, color: '#1B2559', fontWeight: 600 }}>Chargement du contrat...</p>
          <div style={{ marginTop: 12, width: 40, height: 40, border: '3px solid #e5e7eb', borderTop: '3px solid #D4A03C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '12px auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (error && !contractData) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', background: '#fff', borderRadius: 16, padding: '48px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fef2f2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.3rem', color: '#1B2559', fontWeight: 700, marginBottom: 12 }}>Contrat introuvable</h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>{error}</p>
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <div dangerouslySetInnerHTML={{ __html: SOS_LOGO_SVG }} />
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 8 }}>SOS Hub Canada Inc.</p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Main Signing Form ----
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc' }}>
      {/* Header bar */}
      <div style={{ background: '#1B2559', color: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <div dangerouslySetInnerHTML={{ __html: SOS_LOGO_SVG.replace('width="48"', 'width="36"').replace('height="48"', 'height="36"') }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>SOS Hub Canada Inc.</div>
          <div style={{ fontSize: '0.75rem', color: '#D4A03C' }}>Signature de contrat de service</div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px 40px' }}>
        {/* Contract content */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          padding: '24px 20px',
          marginBottom: 24,
          overflow: 'auto',
          maxHeight: '60vh',
          border: '1px solid #e5e7eb',
        }}>
          {contractData && (
            <div dangerouslySetInnerHTML={{ __html: buildContractDisplayHTML(contractData) }} />
          )}
        </div>

        {/* Signing section */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          padding: '24px 20px',
          border: '1px solid #e5e7eb',
        }}>
          <h2 style={{ fontSize: '1.15rem', color: '#1B2559', fontWeight: 700, marginBottom: 20, borderBottom: '2px solid #D4A03C', paddingBottom: 10 }}>
            Signer le contrat
          </h2>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {/* Client name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#1B2559', marginBottom: 6, fontSize: '0.95rem' }}>
              Nom complet du signataire
            </label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Pr\u00e9nom et nom de famille"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '1rem',
                border: '2px solid #d1d5db',
                borderRadius: 8,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#D4A03C'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; }}
            />
          </div>

          {/* Signature canvas */}
          <div style={{ marginBottom: 20 }}>
            <SignatureCanvas onSignatureChange={setSignatureData} />
          </div>

          {/* Accept checkbox */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={e => setAccepted(e.target.checked)}
                style={{ marginTop: 3, width: 18, height: 18, accentColor: '#1B2559' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.5 }}>
                J&apos;ai lu et j&apos;accepte les termes et conditions du pr&eacute;sent contrat de service.
                Je comprends que les frais d&apos;ouverture de dossier de 250,00 $ CAD sont non remboursables.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#fff',
              background: canSubmit ? '#1B2559' : '#9ca3af',
              border: 'none',
              borderRadius: 10,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {submitting ? (
              <>
                <div style={{ width: 20, height: 20, border: '2px solid #fff4', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Signature en cours...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Signer le contrat
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: 12, fontSize: '0.78rem', color: '#999' }}>
            En signant, vous acceptez les conditions du contrat de service de SOS Hub Canada Inc.
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, color: '#aaa', fontSize: '0.75rem' }}>
          <p>SOS Hub Canada Inc. &middot; 3737, boul. Cr&eacute;mazie Est, bureau 402, Montr&eacute;al (Qu&eacute;bec) H1Z 2K4</p>
          <p>T&eacute;l. : 514-533-0482 &middot; WhatsApp : 438-630-2869 &middot; info@soshubcanada.com</p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
