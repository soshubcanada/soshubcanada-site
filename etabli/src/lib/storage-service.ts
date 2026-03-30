// ========================================================
// SOS Hub Canada - Service de stockage Supabase Storage
// Gère photos clients, logos employeurs, documents
// Fallback vers localStorage si Supabase non configuré
// ========================================================

import { supabase } from './supabase';
import { isSupabaseReady } from './supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// ========================================================
// Types
// ========================================================
export interface StoredFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  category?: string;
  expiry?: string;
  uploadedAt: string;
  status?: string;
}

// ========================================================
// Helpers
// ========================================================
function getPublicUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ========================================================
// UPLOAD — generic upload to any bucket
// ========================================================
async function uploadToStorage(
  bucket: string,
  folder: string,
  file: File,
): Promise<{ url: string; path: string } | null> {
  if (!isSupabaseReady()) return null;

  const db = supabase as any;
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${folder}/${generateId()}.${ext}`;

  const { error } = await db.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    console.error(`Storage upload error (${bucket}):`, error);
    return null;
  }

  return { url: getPublicUrl(bucket, path), path };
}

// ========================================================
// DELETE — generic delete from any bucket
// ========================================================
async function deleteFromStorage(bucket: string, path: string): Promise<boolean> {
  if (!isSupabaseReady()) return false;
  const db = supabase as any;
  const { error } = await db.storage.from(bucket).remove([path]);
  if (error) console.error(`Storage delete error (${bucket}):`, error);
  return !error;
}

// ========================================================
// CLIENT PHOTOS
// ========================================================
const PHOTOS_LS_KEY = 'soshub_client_photos';

function getLocalPhotos(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(PHOTOS_LS_KEY) || '{}'); } catch { return {}; }
}

export async function uploadClientPhoto(clientId: string, file: File): Promise<string | null> {
  // Try Supabase first
  const result = await uploadToStorage('client-photos', `clients/${clientId}`, file);
  if (result) {
    // Also save URL in localStorage as cache
    const photos = getLocalPhotos();
    photos[clientId] = result.url;
    localStorage.setItem(PHOTOS_LS_KEY, JSON.stringify(photos));
    return result.url;
  }

  // Fallback: base64 in localStorage
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const photos = getLocalPhotos();
      photos[clientId] = base64;
      try {
        localStorage.setItem(PHOTOS_LS_KEY, JSON.stringify(photos));
      } catch {
        // localStorage full — clear old photos and retry
        localStorage.removeItem(PHOTOS_LS_KEY);
        localStorage.setItem(PHOTOS_LS_KEY, JSON.stringify({ [clientId]: base64 }));
      }
      resolve(base64);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function getClientPhoto(clientId: string): string | null {
  const photos = getLocalPhotos();
  return photos[clientId] || null;
}

export function getAllClientPhotos(): Record<string, string> {
  return getLocalPhotos();
}

// ========================================================
// EMPLOYER LOGOS
// ========================================================
const LOGOS_LS_KEY = 'soshub_employer_logos';

function getLocalLogos(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(LOGOS_LS_KEY) || '{}'); } catch { return {}; }
}

export async function uploadEmployerLogo(employerId: string, file: File): Promise<string | null> {
  const result = await uploadToStorage('employer-logos', `employers/${employerId}`, file);
  if (result) {
    const logos = getLocalLogos();
    logos[employerId] = result.url;
    localStorage.setItem(LOGOS_LS_KEY, JSON.stringify(logos));
    return result.url;
  }

  // Fallback: base64
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const logos = getLocalLogos();
      logos[employerId] = base64;
      try { localStorage.setItem(LOGOS_LS_KEY, JSON.stringify(logos)); } catch { /* */ }
      resolve(base64);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function getEmployerLogo(employerId: string): string | null {
  return getLocalLogos()[employerId] || null;
}

export function getAllEmployerLogos(): Record<string, string> {
  return getLocalLogos();
}

// ========================================================
// CLIENT DOCUMENTS
// ========================================================
const DOCS_LS_KEY = 'soshub_client_docs';

function getLocalDocs(): Record<string, StoredFile[]> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(DOCS_LS_KEY) || '{}'); } catch { return {}; }
}

function saveLocalDocs(docs: Record<string, StoredFile[]>) {
  try { localStorage.setItem(DOCS_LS_KEY, JSON.stringify(docs)); } catch { /* full */ }
}

export async function uploadClientDocument(
  clientId: string,
  file: File,
  category: string,
  expiry?: string,
): Promise<StoredFile | null> {
  const id = generateId();
  const storedFile: StoredFile = {
    id,
    name: file.name,
    url: '',
    size: file.size,
    type: file.type,
    category,
    expiry: expiry || undefined,
    uploadedAt: new Date().toISOString(),
    status: 'en_attente',
  };

  // Try Supabase
  const result = await uploadToStorage('client-documents', `clients/${clientId}`, file);
  if (result) {
    storedFile.url = result.url;
  }

  // Save metadata in localStorage
  const docs = getLocalDocs();
  if (!docs[clientId]) docs[clientId] = [];
  docs[clientId].push(storedFile);
  saveLocalDocs(docs);

  return storedFile;
}

export function getClientDocuments(clientId: string): StoredFile[] {
  return getLocalDocs()[clientId] || [];
}

export async function deleteClientDocument(clientId: string, docId: string): Promise<boolean> {
  const docs = getLocalDocs();
  if (docs[clientId]) {
    docs[clientId] = docs[clientId].filter(d => d.id !== docId);
    saveLocalDocs(docs);
  }
  return true;
}

// ========================================================
// HR DOCUMENTS
// ========================================================
const HR_DOCS_LS_KEY = 'soshub_hr_employee_docs';

function getLocalHRDocs(): Record<string, StoredFile[]> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(HR_DOCS_LS_KEY) || '{}'); } catch { return {}; }
}

function saveLocalHRDocs(docs: Record<string, StoredFile[]>) {
  try { localStorage.setItem(HR_DOCS_LS_KEY, JSON.stringify(docs)); } catch { /* full */ }
}

export async function uploadHRDocument(
  employeeId: string,
  file: File,
  category: string,
): Promise<StoredFile | null> {
  const id = generateId();
  const storedFile: StoredFile = {
    id,
    name: file.name,
    url: '',
    size: file.size,
    type: file.type,
    category,
    uploadedAt: new Date().toISOString(),
  };

  const result = await uploadToStorage('hr-documents', `employees/${employeeId}`, file);
  if (result) {
    storedFile.url = result.url;
  }

  const docs = getLocalHRDocs();
  if (!docs[employeeId]) docs[employeeId] = [];
  docs[employeeId].push(storedFile);
  saveLocalHRDocs(docs);

  return storedFile;
}

export function getHRDocuments(employeeId: string): StoredFile[] {
  return getLocalHRDocs()[employeeId] || [];
}

export async function deleteHRDocument(employeeId: string, docId: string): Promise<boolean> {
  const docs = getLocalHRDocs();
  if (docs[employeeId]) {
    docs[employeeId] = docs[employeeId].filter(d => d.id !== docId);
    saveLocalHRDocs(docs);
  }
  return true;
}

// ========================================================
// STORAGE STATS
// ========================================================
export function getStorageStats(): { photosCount: number; logosCount: number; docsCount: number; hrDocsCount: number; estimatedSizeMB: number } {
  const photos = Object.keys(getLocalPhotos()).length;
  const logos = Object.keys(getLocalLogos()).length;
  const allDocs = getLocalDocs();
  const docsCount = Object.values(allDocs).reduce((sum, arr) => sum + arr.length, 0);
  const allHR = getLocalHRDocs();
  const hrDocsCount = Object.values(allHR).reduce((sum, arr) => sum + arr.length, 0);

  // Estimate localStorage usage
  let totalSize = 0;
  [PHOTOS_LS_KEY, LOGOS_LS_KEY, DOCS_LS_KEY, HR_DOCS_LS_KEY].forEach(key => {
    const val = localStorage.getItem(key);
    if (val) totalSize += val.length * 2; // UTF-16
  });

  return {
    photosCount: photos,
    logosCount: logos,
    docsCount,
    hrDocsCount,
    estimatedSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
  };
}
