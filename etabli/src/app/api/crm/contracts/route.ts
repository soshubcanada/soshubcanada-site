// ========================================================
// SOS Hub Canada - API Route: Contrats de service (CRUD)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { authenticateRequest, checkRateLimit, validateOrigin } from '@/lib/api-auth';
import { DEMO_CONTRACTS } from '@/lib/crm-pricing-2026';
import type { ServiceContract } from '@/lib/crm-pricing-2026';
import { generateContractNumber } from '@/lib/contract-template';

/* eslint-disable @typescript-eslint/no-explicit-any */

// --- GET: Lister les contrats ---
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rl.error!;
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;

  // Mode demo
  if (!isSupabaseReady()) {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const caseId = searchParams.get('caseId');
    let results: ServiceContract[] = [...DEMO_CONTRACTS];
    if (clientId) results = results.filter(c => c.clientId === clientId);
    if (caseId) results = results.filter(c => c.caseId === caseId);
    return NextResponse.json({ contracts: results, total: results.length });
  }

  try {
    const db = createServiceClient() as any;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const caseId = searchParams.get('caseId');
    const status = searchParams.get('status');

    let query = db.from('contracts').select('*').order('created_at', { ascending: false });
    if (clientId) query = query.eq('client_id', clientId);
    if (caseId) query = query.eq('case_id', caseId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contracts: data || [], total: (data || []).length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

// --- POST: Creer un contrat ---
export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl = checkRateLimit(req, 15, 60000);
  if (!rl.allowed) return rl.error!;
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;

  try {
    const body = await req.json();
    const {
      clientId,
      caseId,
      pricingTierId,
      programId,
      programName,
      serviceFee,
      governmentFee,
      governmentFeePayeur,
      addOns,
      paymentOption,
      notes,
      clientData,
    } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId requis' }, { status: 400 });
    }

    const contractNumber = generateContractNumber();
    const now = new Date().toISOString();

    const contractRecord: Record<string, any> = {
      contract_number: contractNumber,
      client_id: clientId,
      case_id: caseId || null,
      pricing_tier_id: pricingTierId || null,
      program_id: programId || null,
      program_name: programName || null,
      status: 'brouillon',
      service_fee: serviceFee || 0,
      government_fee: governmentFee || 0,
      government_fee_payeur: governmentFeePayeur || 'client',
      add_ons: addOns || [],
      payment_option: paymentOption || '',
      notes: notes || '',
      client_data: clientData || null,
      created_at: now,
      created_by: auth.userId || 'unknown',
    };

    // Mode demo
    if (!isSupabaseReady()) {
      return NextResponse.json({
        id: `contract-${Date.now()}`,
        contractNumber,
        ...contractRecord,
        status: 'brouillon',
      });
    }

    const db = createServiceClient() as any;
    const { data, error } = await db.from('contracts').insert(contractRecord).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

// --- PUT: Mettre a jour un contrat ---
export async function PUT(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl = checkRateLimit(req, 20, 60000);
  if (!rl.allowed) return rl.error!;
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;

  try {
    const body = await req.json();
    const { contractId, ...updates } = body;

    if (!contractId) {
      return NextResponse.json({ error: 'contractId requis' }, { status: 400 });
    }

    // Mode demo
    if (!isSupabaseReady()) {
      return NextResponse.json({ id: contractId, ...updates, updated_at: new Date().toISOString() });
    }

    const db = createServiceClient() as any;

    // Map camelCase to snake_case for common fields
    const record: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) record.status = updates.status;
    if (updates.signedAt !== undefined) record.signed_at = updates.signedAt;
    if (updates.signedByClient !== undefined) record.signed_by_client = updates.signedByClient;
    if (updates.signatureIP !== undefined) record.signature_ip = updates.signatureIP;
    if (updates.signatureData !== undefined) record.signature_data = updates.signatureData;
    if (updates.notes !== undefined) record.notes = updates.notes;
    if (updates.serviceFee !== undefined) record.service_fee = updates.serviceFee;
    if (updates.governmentFee !== undefined) record.government_fee = updates.governmentFee;
    if (updates.paymentOption !== undefined) record.payment_option = updates.paymentOption;
    if (updates.addOns !== undefined) record.add_ons = updates.addOns;

    const { data, error } = await db
      .from('contracts')
      .update(record)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
