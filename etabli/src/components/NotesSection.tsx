"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Star, Pencil, Trash2, Check, X, Plus } from "lucide-react";

// ========================================================
// SOS Hub Canada - Composant generique Notes & Suivi
// Reutilisable pour clients, employeurs et dossiers
// ========================================================

export interface Note {
  id: string;
  entityId: string;
  text: string;
  category: string;
  pinned: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  dossierId?: string;
  // Legacy compat
  employerId?: string;
  clientId?: string;
}

export interface CategoryConfig {
  label: string;
  color: string;
  bg: string;
}

// --- Category configs par entite ---

export const CLIENT_NOTE_CATEGORIES: Record<string, CategoryConfig> = {
  general:     { label: 'Général',     color: 'text-gray-700',   bg: 'bg-gray-100' },
  établissement: { label: 'Établissement', color: 'text-blue-700',   bg: 'bg-blue-100' },
  juridique:   { label: 'Juridique',   color: 'text-purple-700', bg: 'bg-purple-100' },
  documents:   { label: 'Documents',   color: 'text-green-700',  bg: 'bg-green-100' },
  urgent:      { label: 'Urgent',      color: 'text-red-700',    bg: 'bg-red-100' },
  suivi:       { label: 'Suivi',       color: 'text-amber-700',  bg: 'bg-amber-100' },
};

export const EMPLOYER_NOTE_CATEGORIES: Record<string, CategoryConfig> = {
  general:   { label: 'Général',    color: 'text-gray-700',   bg: 'bg-gray-100' },
  juridique: { label: 'Juridique',  color: 'text-purple-700', bg: 'bg-purple-100' },
  financier: { label: 'Financier',  color: 'text-green-700',  bg: 'bg-green-100' },
  lmia:      { label: 'EIMT/LMIA', color: 'text-blue-700',   bg: 'bg-blue-100' },
  urgent:    { label: 'Urgent',     color: 'text-red-700',    bg: 'bg-red-100' },
  suivi:     { label: 'Suivi',      color: 'text-amber-700',  bg: 'bg-amber-100' },
};

export const DOSSIER_NOTE_CATEGORIES: Record<string, CategoryConfig> = {
  general:     { label: 'Général',     color: 'text-gray-700',   bg: 'bg-gray-100' },
  établissement: { label: 'Établissement', color: 'text-blue-700',   bg: 'bg-blue-100' },
  juridique:   { label: 'Juridique',   color: 'text-purple-700', bg: 'bg-purple-100' },
  urgent:      { label: 'Urgent',      color: 'text-red-700',    bg: 'bg-red-100' },
  suivi:       { label: 'Suivi',       color: 'text-amber-700',  bg: 'bg-amber-100' },
};

// --- Props ---

interface NotesSectionProps {
  entityId: string;
  entityType: 'employer' | 'client' | 'dossier';
  categories: Record<string, CategoryConfig>;
  storageKey: string;
  currentUser: { id: string; name: string } | null;
  emptyMessage?: string;
  dossierId?: string;
}

// --- Composant ---

export default function NotesSection({
  entityId,
  entityType,
  categories,
  storageKey,
  currentUser,
  emptyMessage = 'Aucune note',
  dossierId,
}: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newCategory, setNewCategory] = useState<string>(Object.keys(categories)[0] || 'general');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Load notes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const all: Note[] = JSON.parse(stored);
        // Backward compat: match on entityId OR legacy employerId/clientId
        setNotes(all.filter(n =>
          (n.entityId === entityId) ||
          (entityType === 'employer' && n.employerId === entityId) ||
          (entityType === 'client' && n.clientId === entityId)
        ));
      }
    } catch { /* */ }
  }, [entityId, storageKey, entityType]);

  // Save notes to localStorage (merge with other entities)
  const saveNotes = (updated: Note[]) => {
    const mine = updated.filter(n => n.entityId === entityId);
    setNotes(mine);
    try {
      const stored = localStorage.getItem(storageKey);
      const all: Note[] = stored ? JSON.parse(stored) : [];
      const others = all.filter(n =>
        n.entityId !== entityId &&
        !(entityType === 'employer' && n.employerId === entityId) &&
        !(entityType === 'client' && n.clientId === entityId)
      );
      localStorage.setItem(storageKey, JSON.stringify([...others, ...mine]));
    } catch { /* */ }
  };

  const addNote = () => {
    if (!newNote.trim() || !currentUser) return;
    const note: Note = {
      id: `note-${Date.now()}`,
      entityId,
      text: newNote.trim(),
      category: newCategory,
      pinned: false,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      ...(dossierId ? { dossierId } : {}),
      // Legacy compat fields
      ...(entityType === 'employer' ? { employerId: entityId } : {}),
      ...(entityType === 'client' ? { clientId: entityId } : {}),
    };
    saveNotes([...notes, note]);
    setNewNote('');
    setNewCategory(Object.keys(categories)[0] || 'general');
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
  };

  const togglePin = (id: string) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    saveNotes(notes.map(n => n.id === id ? { ...n, text: editText.trim(), updatedAt: new Date().toISOString() } : n));
    setEditingId(null);
    setEditText('');
  };

  const filtered = notes
    .filter(n => filterCat === 'all' || n.category === filterCat)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="mt-6">
      {/* Header + filtres */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
          <MessageSquare size={16} className="text-[#D4A03C]" />
          Notes & Suivi
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{notes.length}</span>
        </h4>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterCat('all')}
            className={`px-2 py-1 text-[10px] rounded font-medium ${filterCat === 'all' ? 'bg-[#1B2559] text-white' : 'bg-gray-100 text-gray-500'}`}>
            Toutes
          </button>
          {Object.entries(categories).map(([key, val]) => (
            <button key={key} onClick={() => setFilterCat(key)}
              className={`px-2 py-1 text-[10px] rounded font-medium ${filterCat === key ? 'bg-[#1B2559] text-white' : `${val.bg} ${val.color}`}`}>
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ajout de note */}
      <div className="bg-white border rounded-xl p-3 mb-3">
        <div className="flex gap-2 mb-2">
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
            className="text-xs border rounded-lg px-2 py-1.5 bg-gray-50">
            {Object.entries(categories).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400 self-center">par {currentUser?.name || 'Moi'}</span>
        </div>
        <div className="flex gap-2">
          <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
            placeholder="Ajouter une note de suivi..."
            className="flex-1 text-sm border rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[#D4A03C] focus:border-transparent"
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote(); }}
          />
          <button onClick={addNote} disabled={!newNote.trim()}
            className="self-end px-3 py-2 bg-[#D4A03C] text-white text-xs font-medium rounded-lg hover:bg-[#b8882f] disabled:opacity-40 transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Cmd+Entrée pour envoyer</p>
      </div>

      {/* Liste des notes */}
      {filtered.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-sm">
          <MessageSquare className="w-8 h-8 mx-auto mb-1 opacity-40" />
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.map(note => {
            const cat = categories[note.category] || categories[Object.keys(categories)[0]];
            return (
              <div key={note.id} className={`border rounded-lg p-3 ${note.pinned ? 'border-[#D4A03C] bg-[#FFFBF0]' : 'bg-white'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cat.bg} ${cat.color}`}>
                      {cat.label}
                    </span>
                    {note.pinned && <Star size={12} className="text-[#D4A03C] fill-[#D4A03C]" />}
                    <span className="text-[10px] text-gray-400">
                      {note.createdByName} — {new Date(note.createdAt).toLocaleDateString('fr-CA')} {new Date(note.createdAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {note.updatedAt && <span className="text-[10px] text-gray-300">(modifié)</span>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => togglePin(note.id)} className="p-1 hover:bg-gray-100 rounded" title={note.pinned ? 'Désépingler' : 'Épingler'}>
                      <Star size={12} className={note.pinned ? 'text-[#D4A03C] fill-[#D4A03C]' : 'text-gray-300'} />
                    </button>
                    <button onClick={() => { setEditingId(note.id); setEditText(note.text); }} className="p-1 hover:bg-gray-100 rounded" title="Modifier">
                      <Pencil size={12} className="text-gray-400" />
                    </button>
                    <button onClick={() => deleteNote(note.id)} className="p-1 hover:bg-red-50 rounded" title="Supprimer">
                      <Trash2 size={12} className="text-gray-300 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                {editingId === note.id ? (
                  <div className="mt-2 flex gap-2">
                    <textarea value={editText} onChange={e => setEditText(e.target.value)}
                      className="flex-1 text-sm border rounded-lg px-3 py-2 resize-none" rows={2} />
                    <div className="flex flex-col gap-1">
                      <button onClick={() => saveEdit(note.id)} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600">
                        <Check size={12} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-200 rounded hover:bg-gray-300">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{note.text}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
