// ========================================================
// SOS Hub Canada - Service de gestion documentaire
// Upload/download via Supabase Storage + fallback demo
// ========================================================

import { crmFetch } from '@/lib/crm-fetch';
import { supabase, isSupabaseReady } from './supabase';
import type { ClientDocument, DocumentCategory, DocumentStatus, EmployerDocumentCategory } from './crm-types';
import type { EmployerDocument } from './crm-types';

const BUCKET = 'documents';

// --- Upload via API route (garde la service key côté serveur) ---
export async function uploadClientDocument(
  clientId: string,
  file: File,
  metadata: {
    category: DocumentCategory;
    caseId?: string;
    expiryDate?: string;
    notes?: string;
    uploadedBy?: string;
  }
): Promise<ClientDocument | null> {
  if (!isSupabaseReady()) {
    // Mode demo: retourne un document simulé
    return {
      id: `demo-${Date.now()}`,
      name: file.name.replace(/\.[^.]+$/, ''),
      type: file.type,
      fileName: file.name,
      category: metadata.category,
      status: 'televerse',
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: metadata.uploadedBy,
      expiryDate: metadata.expiryDate,
      notes: metadata.notes,
      caseId: metadata.caseId,
      version: 1,
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', 'client');
  formData.append('entityId', clientId);
  formData.append('category', metadata.category);
  if (metadata.caseId) formData.append('caseId', metadata.caseId);
  if (metadata.expiryDate) formData.append('expiryDate', metadata.expiryDate);
  if (metadata.notes) formData.append('notes', metadata.notes);
  if (metadata.uploadedBy) formData.append('uploadedBy', metadata.uploadedBy);

  const res = await crmFetch('/api/crm/documents', { method: 'POST', body: formData });
  if (!res.ok) return null;
  return res.json();
}

export async function uploadEmployerDocument(
  employerId: string,
  file: File,
  metadata: {
    category: EmployerDocumentCategory;
    lmiaId?: string;
    expiryDate?: string;
    notes?: string;
    uploadedBy?: string;
  }
): Promise<EmployerDocument | null> {
  if (!isSupabaseReady()) {
    return {
      id: `demo-${Date.now()}`,
      name: file.name.replace(/\.[^.]+$/, ''),
      category: metadata.category,
      status: 'televerse',
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: metadata.uploadedBy,
      version: 1,
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', 'employer');
  formData.append('entityId', employerId);
  formData.append('category', metadata.category);
  if (metadata.lmiaId) formData.append('lmiaId', metadata.lmiaId);
  if (metadata.expiryDate) formData.append('expiryDate', metadata.expiryDate);
  if (metadata.notes) formData.append('notes', metadata.notes);
  if (metadata.uploadedBy) formData.append('uploadedBy', metadata.uploadedBy);

  const res = await crmFetch('/api/crm/documents', { method: 'POST', body: formData });
  if (!res.ok) return null;
  return res.json();
}

// --- URL signée pour téléchargement ---
export async function getDocumentUrl(filePath: string): Promise<string> {
  if (!isSupabaseReady() || !filePath) return '#';
  const db = supabase as any;
  const { data, error } = await db.storage.from(BUCKET).createSignedUrl(filePath, 3600);
  if (error || !data?.signedUrl) return '#';
  return data.signedUrl;
}

// --- Suppression ---
export async function deleteDocument(documentId: string, entityType: 'client' | 'employer'): Promise<boolean> {
  if (!isSupabaseReady()) return true; // demo: toujours ok
  const res = await crmFetch('/api/crm/documents', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, entityType }),
  });
  return res.ok;
}

// --- Mise à jour du statut ---
export async function updateDocumentStatus(
  documentId: string,
  status: DocumentStatus,
  entityType: 'client' | 'employer',
  reviewerId?: string
): Promise<boolean> {
  if (!isSupabaseReady()) return true;
  const db = supabase as any;
  const table = entityType === 'client' ? 'client_documents' : 'employer_documents';
  const update: Record<string, unknown> = { status };
  if (status === 'verifie' && reviewerId) {
    update.verified_at = new Date().toISOString();
    update.verified_by = reviewerId;
  }
  const { error } = await db.from(table).update(update).eq('id', documentId);
  return !error;
}
