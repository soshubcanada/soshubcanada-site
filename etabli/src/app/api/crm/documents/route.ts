// ========================================================
// SOS Hub Canada - API Route: Upload / Delete documents
// Utilise la service role key côté serveur uniquement
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { authenticateRequest, checkRateLimit, validateOrigin } from '@/lib/api-auth';

const BUCKET = 'documents';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl = checkRateLimit(req, 30, 60000);
  if (!rl.allowed) return rl.error!;
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;
    const category = formData.get('category') as string;
    const caseId = formData.get('caseId') as string | null;
    const lmiaId = formData.get('lmiaId') as string | null;
    const expiryDate = formData.get('expiryDate') as string | null;
    const notes = formData.get('notes') as string | null;
    const uploadedBy = formData.get('uploadedBy') as string | null;

    if (!file || !entityType || !entityId) {
      return NextResponse.json({ error: 'Fichier, type et ID requis' }, { status: 400 });
    }

    const mimeBase = file.type.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.includes(mimeBase)) {
      return NextResponse.json({ error: `Type de fichier non autorise (${mimeBase}). PDF, JPG, PNG, WebP seulement.` }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10 MB)' }, { status: 400 });
    }

    const db = createServiceClient() as any;

    // Ensure bucket exists
    await db.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    }).catch(() => { /* bucket already exists */ });

    // Upload file
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${entityType}s/${entityId}/${Date.now()}_${sanitized}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(storagePath, Buffer.from(arrayBuffer), { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: `Erreur upload: ${uploadError.message}` }, { status: 500 });
    }

    // Insert DB record
    const table = entityType === 'client' ? 'client_documents' : 'employer_documents';
    const fkField = entityType === 'client' ? 'client_id' : 'employer_id';
    const record: Record<string, unknown> = {
      [fkField]: entityId,
      name: file.name.replace(/\.[^.]+$/, ''),
      file_name: file.name,
      type: file.type,
      category: category || 'autre',
      status: 'televerse',
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: uploadedBy || null,
      expiry_date: expiryDate || null,
      notes: notes || null,
      version: 1,
    };
    if (caseId) record.case_id = caseId;
    if (lmiaId) record.lmia_id = lmiaId;

    const { data, error: dbError } = await db.from(table).insert(record).select().single();
    if (dbError) {
      // Rollback storage
      await db.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: `Erreur BD: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      type: data.type,
      fileName: data.file_name,
      category: data.category,
      status: data.status,
      filePath: data.file_path,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      uploadedAt: data.uploaded_at,
      uploadedBy: data.uploaded_by,
      expiryDate: data.expiry_date,
      version: data.version,
      notes: data.notes,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const rlDel = checkRateLimit(req);
  if (!rlDel.allowed) return rlDel.error!;
  const authDel = await authenticateRequest(req);
  if (!authDel.authenticated) return authDel.error!;
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const { documentId, entityType } = await req.json();
    if (!documentId || !entityType) {
      return NextResponse.json({ error: 'documentId et entityType requis' }, { status: 400 });
    }

    const db = createServiceClient() as any;
    const table = entityType === 'client' ? 'client_documents' : 'employer_documents';

    // Get file path first
    const { data: doc } = await db.from(table).select('file_path').eq('id', documentId).single();
    if (doc?.file_path) {
      await db.storage.from(BUCKET).remove([doc.file_path]);
    }

    const { error } = await db.from(table).delete().eq('id', documentId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
