// ========================================================
// SOS Hub Canada - API: Paiement Square
// Traite les paiements via Square Payments API
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, validateOrigin } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  // Origin check — payments must come from our site
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  }
  // Rate limit: max 5 payments per minute per IP
  const rl = checkRateLimit(req, 5, 60000, 'payment');
  if (!rl.allowed) return rl.error!;

  try {
    const { sourceId, amount, currency, note } = await req.json();

    // Input validation
    if (!sourceId || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'sourceId et amount requis' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0 || amount >= 100000) {
      return NextResponse.json({ error: 'Montant invalide (doit être > 0 et < 100000)' }, { status: 400 });
    }

    // Validate sourceId format (alphanumeric with dashes/underscores, reasonable length)
    if (typeof sourceId !== 'string' || sourceId.length < 10 || sourceId.length > 300 || !/^[a-zA-Z0-9_\-:.]+$/.test(sourceId)) {
      return NextResponse.json({ error: 'Format de sourceId invalide' }, { status: 400 });
    }

    // Enforce CAD currency only
    if (currency && currency !== 'CAD') {
      return NextResponse.json({ error: 'Seule la devise CAD est acceptée' }, { status: 400 });
    }

    // Basic origin/referer check
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const allowedOrigins = [process.env.NEXT_PUBLIC_BASE_URL, 'http://localhost:3000', 'https://localhost:3000'].filter(Boolean);
    if (allowedOrigins.length > 0 && !allowedOrigins.some(ao => origin.startsWith(ao!))) {
      return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 });
    }

    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

    if (!accessToken || !locationId) {
      return NextResponse.json(
        { error: 'Square non configuré. Ajoutez SQUARE_ACCESS_TOKEN et NEXT_PUBLIC_SQUARE_LOCATION_ID.' },
        { status: 503 }
      );
    }

    // Square Payments API
    // Sandbox: https://connect.squareupsandbox.com
    // Production: https://connect.squareup.com
    const squareBaseUrl = process.env.SQUARE_ENVIRONMENT === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    const paymentRes = await fetch(`${squareBaseUrl}/v2/payments`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-12-18',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: idempotencyKey,
        amount_money: {
          amount: Math.round(amount), // in cents
          currency: currency || 'CAD',
        },
        location_id: locationId,
        note: note || 'Frais d\'ouverture de dossier - SOS Hub Canada',
        autocomplete: true,
      }),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok || paymentData.errors) {
      const errorMsg = paymentData.errors?.[0]?.detail || 'Erreur de paiement Square';
      if (process.env.NODE_ENV === 'development') {
        console.error('[SQUARE] Payment error:', paymentData.errors);
      }
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const payment = paymentData.payment;

    // Return only safe, non-sensitive fields
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
      receiptUrl: payment.receipt_url,
      amount: payment.amount_money.amount / 100,
      currency: payment.amount_money.currency,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    if (process.env.NODE_ENV === 'development') {
      console.error('[SQUARE] Exception:', msg);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
