// ========================================================
// SOS Hub Canada - API: Paiement Stripe pour factures
// Crée un Payment Link Stripe pour une facture
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, validateOrigin } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  // Origin check
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  }
  // Rate limit: max 10 per minute
  const rl = checkRateLimit(req, 10, 60000, 'stripe-invoice');
  if (!rl.allowed) return rl.error!;

  try {
    const { invoiceNumber, amount, clientName, clientEmail, description } = await req.json();

    // Validation
    if (!amount || amount <= 0 || amount >= 100000) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }
    if (!invoiceNumber) {
      return NextResponse.json({ error: 'Numéro de facture requis' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans les variables d\'environnement.' },
        { status: 503 }
      );
    }

    const stripeBaseUrl = 'https://api.stripe.com/v1';
    const headers = {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // 1. Create a Stripe Checkout Session (payment link)
    const amountCents = Math.round(amount * 100);
    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://crm.soshub.ca'}/crm/facturation?payment=success&invoice=${encodeURIComponent(invoiceNumber)}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://crm.soshub.ca'}/crm/facturation?payment=cancelled&invoice=${encodeURIComponent(invoiceNumber)}`;

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('payment_method_types[0]', 'card');
    params.append('payment_method_types[1]', 'link');
    params.append('line_items[0][price_data][currency]', 'cad');
    params.append('line_items[0][price_data][unit_amount]', String(amountCents));
    params.append('line_items[0][price_data][product_data][name]', `Facture ${invoiceNumber}`);
    params.append('line_items[0][price_data][product_data][description]', description || `Paiement facture ${invoiceNumber} — SOS Hub Canada`);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    params.append('metadata[invoice_number]', invoiceNumber);
    params.append('metadata[client_name]', clientName || '');
    if (clientEmail) {
      params.append('customer_email', clientEmail);
    }
    // Quebec requirements
    params.append('payment_intent_data[description]', `${invoiceNumber} — SOS Hub Canada Inc.`);
    params.append('payment_intent_data[metadata][invoice_number]', invoiceNumber);

    const sessionRes = await fetch(`${stripeBaseUrl}/checkout/sessions`, {
      method: 'POST',
      headers,
      body: params.toString(),
    });

    const sessionData = await sessionRes.json();

    if (!sessionRes.ok || sessionData.error) {
      const errorMsg = sessionData.error?.message || 'Erreur Stripe';
      if (process.env.NODE_ENV === 'development') {
        console.error('[STRIPE] Session error:', sessionData.error);
      }
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
      paymentUrl: sessionData.url,
      expiresAt: sessionData.expires_at,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    if (process.env.NODE_ENV === 'development') {
      console.error('[STRIPE] Exception:', msg);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
