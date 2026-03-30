// ========================================================
// SOS Hub Canada - API: Tasks for prospect follow-up
// GET: list tasks (filtered by status, client, assigned_to)
// POST: create a new task
// PUT: update task status / reassign
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { authenticateRequest, requireCrmRole, checkRateLimit, validateOrigin } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

// GET: List tasks (authenticated CRM users only)
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req, 30, 60000, 'tasks');
  if (!rl.allowed) return rl.error!;
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;
  const roleCheck = await requireCrmRole(auth.userId!, ['superadmin', 'coordinatrice', 'receptionniste', 'conseiller']);
  if (!roleCheck.authorized) return roleCheck.error!;

  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const db = createServiceClient() as any;
    const status = req.nextUrl.searchParams.get('status');
    const clientId = req.nextUrl.searchParams.get('client_id');
    const assignedTo = req.nextUrl.searchParams.get('assigned_to');

    let query = db.from('tasks').select('*').order('due_date', { ascending: true });
    if (status) query = query.eq('status', status);
    if (clientId) query = query.eq('client_id', clientId);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);

    const { data, error } = await query.limit(200);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new task (authenticated)
export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl2 = checkRateLimit(req, 20, 60000, 'tasks-write');
  if (!rl2.allowed) return rl2.error!;
  const auth2 = await authenticateRequest(req);
  if (!auth2.authenticated) return auth2.error!;
  const role2 = await requireCrmRole(auth2.userId!, ['superadmin', 'coordinatrice', 'receptionniste', 'conseiller']);
  if (!role2.authorized) return role2.error!;
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const { clientId, title, description, priority, dueDate, assignedTo } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    }

    const db = createServiceClient() as any;
    const { data, error } = await db.from('tasks').insert({
      client_id: clientId || null,
      title,
      description: description || '',
      priority: priority || 'medium',
      due_date: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      assigned_to: assignedTo || null,
      status: 'pending',
    }).select('id').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update task (status, assignedTo, notes)
export async function PUT(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl3 = checkRateLimit(req, 20, 60000, 'tasks-write');
  if (!rl3.allowed) return rl3.error!;
  const auth3 = await authenticateRequest(req);
  if (!auth3.authenticated) return auth3.error!;
  const role3 = await requireCrmRole(auth3.userId!, ['superadmin', 'coordinatrice', 'receptionniste', 'conseiller']);
  if (!role3.authorized) return role3.error!;
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const { taskId, status, assignedTo, description, priority, dueDate } = await req.json();
    if (!taskId) {
      return NextResponse.json({ error: 'taskId requis' }, { status: 400 });
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const db = createServiceClient() as any;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) {
      updates.status = status;
      if (status === 'completed') updates.completed_at = new Date().toISOString();
    }
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;
    if (description !== undefined) updates.description = description;
    if (priority) updates.priority = priority;
    if (dueDate) updates.due_date = dueDate;

    const { error } = await db.from('tasks').update(updates).eq('id', taskId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
