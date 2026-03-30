// ========================================================
// SOS Hub Canada - API: Paiement Square pour factures
// Crée un lien de paiement Square (Payment Link) pour une facture
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, validateOrigin } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  // Origin check
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  }
  // Rate limit: max 10 per minute
  const rl = checkRateLimit(req, 10, 60000, 'square-invoice');
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

    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

    if (!accessToken || !locationId) {
      return NextResponse.json(
        { error: 'Square non configuré.' },
        { status: 503 }
      );
    }

    const squareBaseUrl = process.env.SQUARE_ENVIRONMENT === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    const amountCents = Math.round(amount * 100);
    const idempotencyKey = `inv-${invoiceNumber}-${Date.now()}`;

    // Create a Square Payment Link (Checkout API)
    const checkoutRes = await fetch(`${squareBaseUrl}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-12-18',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        quick_pay: {
          name: `Facture ${invoiceNumber}${clientName ? ` — ${clientName}` : ''}`,
          price_money: {
            amount: amountCents,
            currency: 'CAD',
          },
          location_id: locationId,
        },
        checkout_options: {
          redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://crm.soshub.ca'}/crm/facturation?payment=success&invoice=${encodeURIComponent(invoiceNumber)}&provider=square`,
          ask_for_shipping_address: false,
        },
        pre_populated_data: {
          buyer_email: clientEmail || undefined,
        },
        payment_note: description || `Paiement facture ${invoiceNumber} — SOS Hub Canada`,
      }),
    });

    const checkoutData = await checkoutRes.json();

    if (!checkoutRes.ok || checkoutData.errors) {
      const errorMsg = checkoutData.errors?.[0]?.detail || 'Erreur Square';
      if (process.env.NODE_ENV === 'development') {
        console.error('[SQUARE] Checkout error:', checkoutData.errors);
      }
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const link = checkoutData.payment_link;

    return NextResponse.json({
      success: true,
      paymentUrl: link.url,
      linkId: link.id,
      orderId: link.order_id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    if (process.env.NODE_ENV === 'development') {
      console.error('[SQUARE] Exception:', msg);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
