// ========================================================
// SOS Hub Canada - API Route: Signature de contrat (public)
// Pas d'authentification requise - le contractId sert de token
// Rate limited a 5 requetes/min par IP
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { checkRateLimit, validateOrigin } from '@/lib/api-auth';
import { DEMO_CONTRACTS } from '@/lib/crm-pricing-2026';

/* eslint-disable @typescript-eslint/no-explicit-any */

// --- GET: Recuperer les donnees du contrat pour affichage ---
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req, 10, 60000);
  if (!rl.allowed) return rl.error!;

  const { searchParams } = new URL(req.url);
  const contractId = searchParams.get('contractId');

  if (!contractId) {
    return NextResponse.json({ error: 'contractId requis' }, { status: 400 });
  }

  // Mode demo
  if (!isSupabaseReady()) {
    const demo = DEMO_CONTRACTS.find(c => c.id === contractId);
    if (!demo) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 });
    }
    // Le contrat est un document legal entre les parties signataires : le client
    // accede a sa propre donnee via un lien unique (contractId sert de token).
    return NextResponse.json({
      contract: {
        ...demo,
        contractNumber: `CS-2026-${contractId.replace(/\D/g, '').slice(0, 4).padStart(4, '0')}`,
        programId: demo.pricingTierId?.replace('price-', '') || 'ee-fsw',
        programName: 'Programme de services professionnels',
      },
      client: {
        firstName: demo.signedByClient?.split(' ')[0] || 'Jean',
        lastName: demo.signedByClient?.split(' ').slice(1).join(' ') || 'Dupont',
        address: '123, rue Exemple',
        city: 'Montr\u00e9al',
        province: 'Qu\u00e9bec',
        postalCode: 'H3B 2S2',
        phone: '514-000-0000',
        email: 'client@exemple.com',
        passportNumber: 'XXXXXXXXX',
      },
    });
  }

  try {
    const db = createServiceClient() as any;

    // Fetch contract
    const { data: contract, error: contractError } = await db
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 });
    }

    // Fetch client fields needed to display the contract to its own signing party
    const { data: client } = await db
      .from('clients')
      .select('first_name, last_name, address, city, province, postal_code, phone, email, passport_number')
      .eq('id', contract.client_id)
      .single();

    return NextResponse.json({
      contract: {
        id: contract.id,
        contractNumber: contract.contract_number,
        status: contract.status,
        programId: contract.program_id,
        programName: contract.program_name,
        serviceFee: contract.service_fee,
        governmentFee: contract.government_fee,
        createdAt: contract.created_at,
        signedAt: contract.signed_at,
      },
      client: client ? {
        firstName: client.first_name || '',
        lastName: client.last_name || '',
        address: client.address || '',
        city: client.city || '',
        province: client.province || '',
        postalCode: client.postal_code || '',
        phone: client.phone || '',
        email: client.email || '',
        passportNumber: client.passport_number || '',
      } : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

// --- POST: Soumettre la signature du client ---
export async function POST(req: NextRequest) {
  // Origin check
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  // Rate limit strict: 5 req/min par IP
  const rl = checkRateLimit(req, 5, 60000, 'contract-sign');
  if (!rl.allowed) return rl.error!;

  try {
    const body = await req.json();
    const { contractId, signedByClient, signatureData, accepted } = body;

    if (!contractId || !signedByClient || !signatureData || !accepted) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis: contractId, signedByClient, signatureData, accepted' },
        { status: 400 }
      );
    }

    if (typeof signedByClient !== 'string' || signedByClient.trim().length < 2) {
      return NextResponse.json({ error: 'Nom du signataire invalide' }, { status: 400 });
    }

    if (typeof signatureData !== 'string' || !signatureData.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Donn\u00e9es de signature invalides' }, { status: 400 });
    }

    // Get client IP
    const signatureIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    const signedAt = new Date().toISOString();

    // Mode demo
    if (!isSupabaseReady()) {
      return NextResponse.json({
        success: true,
        contractId,
        signedAt,
        signedByClient: signedByClient.trim(),
        message: 'Contrat sign\u00e9 avec succ\u00e8s (mode d\u00e9mo)',
      });
    }

    const db = createServiceClient() as any;

    // Verify contract exists and has correct status
    const { data: contract, error: fetchError } = await db
      .from('contracts')
      .select('id, status')
      .eq('id', contractId)
      .single();

    if (fetchError || !contract) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 });
    }

    if (contract.status !== 'envoye') {
      return NextResponse.json(
        { error: 'Ce contrat ne peut pas \u00eatre sign\u00e9. Statut actuel: ' + contract.status },
        { status: 400 }
      );
    }

    // Update contract with signature
    const { data: updated, error: updateError } = await db
      .from('contracts')
      .update({
        status: 'signe',
        signed_at: signedAt,
        signed_by_client: signedByClient.trim(),
        signature_ip: signatureIP,
        signature_data: signatureData,
        updated_at: signedAt,
      })
      .eq('id', contractId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      contractId: updated.id,
      signedAt: updated.signed_at,
      signedByClient: updated.signed_by_client,
      message: 'Contrat sign\u00e9 avec succ\u00e8s',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
