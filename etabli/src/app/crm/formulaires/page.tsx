"use client";

import { useState, useEffect, useCallback } from 'react';
import { crmFetch } from '@/lib/crm-fetch';
import { useCrm, getUserName } from '@/lib/crm-store';
import { ROLE_PERMISSIONS, FORM_STATUS_LABELS } from '@/lib/crm-types';
import type { Client, IrccFormDefinition, FormFieldDefinition } from '@/lib/crm-types';
import { IRCC_FORMS, autoFillFormFromClient, getFormById } from '@/lib/ircc-forms';
import { IMMIGRATION_PROGRAMS } from '@/lib/crm-programs';
import { useSearchParams } from 'next/navigation';
import {
  FileText, Search, Zap, Save, Printer, CheckCircle2,
  AlertCircle, ArrowLeft, Download, Wand2, RefreshCw, Shield, Clock, Loader2,
} from 'lucide-react';

// ========================================================
// Catégories de formulaires
// ========================================================
const CATEGORY_LABELS: Record<string, string> = {
  general: 'Formulaires généraux',
  residence_permanente: 'Résidence permanente',
  temporaire: 'Résidence temporaire',
  family: 'Parrainage familial',
  refugie: 'Réfugiés et asile',
  citoyennete: 'Citoyenneté',
  humanitaire: 'Humanitaire',
};

const CATEGORY_ORDER = [
  'general', 'residence_permanente', 'temporaire',
  'family', 'refugie', 'citoyennete', 'humanitaire'
];

// ========================================================
// Notification toast
// ========================================================
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-center gap-3 bg-[#1B2559] text-white px-5 py-3 rounded-xl shadow-2xl">
        <CheckCircle2 size={20} className="text-[#D4A03C] shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
      </div>
    </div>
  );
}

// ========================================================
// Page principale
// ========================================================
export default function FormulairesPage() {
  const { clients, cases, currentUser } = useCrm();
  const searchParams = useSearchParams();

  // Mode
  const [selectedForm, setSelectedForm] = useState<IrccFormDefinition | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'submitted'>('idle');

  // IRCC form check state
  const [irccCheckResult, setIrccCheckResult] = useState<{
    checkDate: string; totalForms: number; upToDate: number; updatesAvailable: number; checkFailed: number;
    irccPageAccessible: boolean; results: { formId: string; formCode: string; status: string; detectedVersion?: string; notes: string }[];
  } | null>(null);
  const [irccChecking, setIrccChecking] = useState(false);

  const runIrccCheck = async () => {
    setIrccChecking(true);
    try {
      const res = await crmFetch('/api/crm/ircc-check');
      if (res.ok) {
        const data = await res.json();
        setIrccCheckResult(data);
        localStorage.setItem('soshub_ircc_check', JSON.stringify(data));
        setToastMessage(data.updatesAvailable > 0 ? `${data.updatesAvailable} mise(s) a jour detectee(s)` : 'Tous les formulaires sont a jour');
      }
    } catch { setToastMessage('Erreur lors de la verification'); }
    setIrccChecking(false);
  };

  // Load last check from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('soshub_ircc_check');
      if (stored) setIrccCheckResult(JSON.parse(stored));
    } catch { /* */ }
  }, []);

  // Auto-fill handler
  const handleAutoFill = useCallback((form: IrccFormDefinition, client: Client) => {
    const filled = autoFillFormFromClient(form, client);
    const filledCount = Object.keys(filled).length;
    setFormValues(prev => ({ ...prev, ...filled }));
    setAutoFilledFields(new Set(Object.keys(filled)));
    setToastMessage(`${filledCount} champs remplis automatiquement`);
  }, []);

  // Detect ?case=CASEID on mount
  useEffect(() => {
    const caseId = searchParams.get('case');
    if (caseId && cases.length > 0 && clients.length > 0) {
      const targetCase = cases.find(c => c.id === caseId);
      if (targetCase) {
        const client = clients.find(c => c.id === targetCase.clientId);
        if (client) {
          setSelectedClient(client);
          // Find the first form from the case
          if (targetCase.forms.length > 0) {
            const formDef = getFormById(targetCase.forms[0].formId);
            if (formDef) {
              setSelectedForm(formDef);
              // Auto-trigger fill on next tick
              setTimeout(() => handleAutoFill(formDef, client), 100);
            }
          }
        }
      }
    }
  }, [searchParams, cases, clients, handleAutoFill]);

  // Compute progress
  const computeProgress = useCallback(() => {
    if (!selectedForm) return { filled: 0, required: 0, percent: 0 };
    const requiredFields = selectedForm.fields.filter(f => f.required && f.type !== 'section_header');
    const filledRequired = requiredFields.filter(f => formValues[f.id]?.trim());
    const percent = requiredFields.length > 0
      ? Math.round((filledRequired.length / requiredFields.length) * 100)
      : 0;
    return { filled: filledRequired.length, required: requiredFields.length, percent };
  }, [selectedForm, formValues]);

  const progress = computeProgress();

  // Field change handler
  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  // Group forms by category
  const groupedForms = CATEGORY_ORDER.reduce<Record<string, IrccFormDefinition[]>>((acc, cat) => {
    const forms = IRCC_FORMS.filter(f => f.category === cat);
    if (forms.length > 0) acc[cat] = forms;
    return acc;
  }, {});

  // Filter forms
  const filterForms = (forms: IrccFormDefinition[]) => {
    if (!searchQuery.trim()) return forms;
    const q = searchQuery.toLowerCase();
    return forms.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q)
    );
  };

  // ======================================================
  // MODE 2: Remplissage de formulaire
  // ======================================================
  if (selectedForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Left: Back + Form info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => {
                    setSelectedForm(null);
                    setFormValues({});
                    setAutoFilledFields(new Set());
                    setSaveStatus('idle');
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition shrink-0"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1B2559] bg-[#EAEDF5] px-2 py-0.5 rounded shrink-0">
                      {selectedForm.code}
                    </span>
                    <span className="text-xs text-gray-400">v{selectedForm.version}</span>
                  </div>
                  <h1 className="text-sm font-semibold text-gray-800 truncate">{selectedForm.name}</h1>
                </div>
              </div>

              {/* Center: Client selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">Client :</label>
                <select
                  value={selectedClient?.id ?? ''}
                  onChange={(e) => {
                    const client = clients.find(c => c.id === e.target.value) ?? null;
                    setSelectedClient(client);
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#D4A03C] focus:border-[#D4A03C] outline-none min-w-[200px]"
                >
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.lastName}, {c.firstName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right: Auto-fill button */}
              <button
                onClick={() => {
                  if (selectedClient && selectedForm) {
                    handleAutoFill(selectedForm, selectedClient);
                  } else {
                    setToastMessage('Veuillez sélectionner un client d\'abord');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4A03C] hover:bg-[#B8892F] text-white text-sm font-semibold rounded-lg transition shadow-sm shrink-0"
              >
                <Zap size={16} />
                Remplissage automatique
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Progression : <strong>{progress.filled}</strong> / {progress.required} champs obligatoires remplis
              </span>
              <span className="text-sm font-bold" style={{ color: progress.percent === 100 ? '#D4A03C' : '#1B2559' }}>
                {progress.percent}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress.percent}%`,
                  backgroundColor: progress.percent === 100 ? '#D4A03C' : '#1B2559',
                }}
              />
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Form header */}
            <div className="bg-[#1B2559] px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <FileText size={24} />
                <div>
                  <h2 className="text-lg font-bold">{selectedForm.code} - {selectedForm.name}</h2>
                  <p className="text-[#EAEDF5] text-sm mt-0.5">{selectedForm.description}</p>
                </div>
              </div>
            </div>

            {/* Fields grid */}
            <div className="p-6">
              <div className="grid grid-cols-6 gap-x-5 gap-y-4">
                {selectedForm.fields.map((field) => (
                  <FormField
                    key={field.id}
                    field={field}
                    value={formValues[field.id] ?? ''}
                    onChange={(val) => handleFieldChange(field.id, val)}
                    isAutoFilled={autoFilledFields.has(field.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="sticky bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-sm text-[#D4A03C]">
                  <CheckCircle2 size={16} /> Brouillon sauvegardé
                </span>
              )}
              {saveStatus === 'submitted' && (
                <span className="flex items-center gap-1 text-sm text-[#1B2559]">
                  <CheckCircle2 size={16} /> Soumis pour révision
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSaveStatus('saved');
                  setToastMessage('Brouillon sauvegardé avec succès');
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Save size={16} />
                Sauvegarder le brouillon
              </button>
              <button
                onClick={() => {
                  setSaveStatus('submitted');
                  setToastMessage('Formulaire soumis pour révision');
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1B2559] rounded-lg hover:bg-[#141B45] transition"
              >
                <CheckCircle2 size={16} />
                Soumettre pour révision
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Printer size={16} />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // MODE 1: Bibliothèque de formulaires
  // ======================================================
  const hasAnyResults = Object.entries(groupedForms).some(
    ([, forms]) => filterForms(forms).length > 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1B2559] flex items-center gap-2">
                <FileText size={28} />
                Bibliothèque de formulaires IRCC
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {IRCC_FORMS.length} formulaires disponibles &middot; Remplissage automatique depuis les données client
              </p>
              {/* IRCC Check Status */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={runIrccCheck}
                  disabled={irccChecking}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2559] text-white text-xs font-medium rounded-lg hover:bg-[#2a3a7c] disabled:opacity-50 transition-colors"
                >
                  {irccChecking ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  {irccChecking ? 'Verification...' : 'Verifier mises a jour IRCC'}
                </button>
                {irccCheckResult && (
                  <div className="flex items-center gap-2 text-xs">
                    {irccCheckResult.irccPageAccessible ? (
                      <Shield size={12} className="text-green-500" />
                    ) : (
                      <AlertCircle size={12} className="text-red-500" />
                    )}
                    <span className="text-gray-500">
                      Derniere verification: {new Date(irccCheckResult.checkDate).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {irccCheckResult.updatesAvailable > 0 ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">{irccCheckResult.updatesAvailable} MAJ disponible(s)</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">A jour</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4A03C] focus:border-[#D4A03C] outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {!hasAnyResults && (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Aucun formulaire trouvé pour &laquo; {searchQuery} &raquo;</p>
          </div>
        )}

        {CATEGORY_ORDER.map((category) => {
          const forms = groupedForms[category];
          if (!forms) return null;
          const filtered = filterForms(forms);
          if (filtered.length === 0) return null;

          return (
            <section key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <h2 className="text-sm font-bold text-[#1B2559] uppercase tracking-wider whitespace-nowrap">
                  {CATEGORY_LABELS[category] ?? category}
                </h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {filtered.length}
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((form) => (
                  <div
                    key={form.id}
                    className="group bg-white rounded-xl border border-gray-200 hover:border-[#D4A03C] hover:shadow-md transition-all p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-bold text-[#1B2559] bg-[#EAEDF5] px-2.5 py-1 rounded">
                        {form.code}
                      </span>
                      <span className="text-xs text-gray-400">
                        {form.fields.filter(f => f.type !== 'section_header').length} champs
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1.5 leading-snug">
                      {form.name}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">
                      {form.description}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedForm(form);
                        setFormValues({});
                        setAutoFilledFields(new Set());
                        setSaveStatus('idle');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[#1B2559] bg-[#F7F3E8] hover:bg-[#EAEDF5] rounded-lg transition group-hover:bg-[#EAEDF5]"
                    >
                      <Wand2 size={15} />
                      Ouvrir
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ========================================================
// Composant de champ de formulaire
// ========================================================
function FormField({
  field,
  value,
  onChange,
  isAutoFilled,
}: {
  field: FormFieldDefinition;
  value: string;
  onChange: (val: string) => void;
  isAutoFilled: boolean;
}) {
  // Column span
  const colSpan =
    field.width === 'full' || field.type === 'section_header'
      ? 'col-span-6'
      : field.width === 'third'
        ? 'col-span-6 sm:col-span-2'
        : 'col-span-6 sm:col-span-3';

  // Section header
  if (field.type === 'section_header') {
    return (
      <div className={`${colSpan} mt-6 first:mt-0`}>
        <div className="flex items-center gap-3 pb-2 border-b-2 border-[#1B2559]">
          <div className="w-1 h-6 bg-[#D4A03C] rounded-full" />
          <h3 className="text-sm font-bold text-[#1B2559] uppercase tracking-wide">
            {field.label}
          </h3>
        </div>
      </div>
    );
  }

  const baseInputClass =
    'w-full text-sm border rounded-lg px-3 py-2 bg-white outline-none transition ' +
    'focus:ring-2 focus:ring-[#D4A03C] focus:border-[#D4A03C] ' +
    (isAutoFilled
      ? 'border-l-4 border-l-[#D4A03C] border-t-gray-200 border-r-gray-200 border-b-gray-200'
      : 'border-gray-300');

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ''}
            rows={field.id.includes('narratif') || field.id.includes('motif') ? 6 : 3}
            className={baseInputClass + ' resize-y min-h-[80px]'}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          >
            <option value="">-- Sélectionner --</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="flex flex-wrap gap-4 pt-1">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-4 h-4 text-[#D4A03C] focus:ring-[#D4A03C] border-gray-300"
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => onChange(e.target.checked ? 'true' : '')}
              className="w-4 h-4 rounded text-[#D4A03C] focus:ring-[#D4A03C] border-gray-300"
            />
            <span className="text-sm text-gray-700">{field.helpText ?? 'Oui'}</span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ''}
            className={baseInputClass}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? 'courriel@exemple.com'}
            className={baseInputClass}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? '+1-XXX-XXX-XXXX'}
            className={baseInputClass}
          />
        );

      case 'country':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? 'Pays'}
            className={baseInputClass}
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ''}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className={colSpan}>
      <div className="mb-1 flex items-center gap-2">
        <label className="text-xs font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {isAutoFilled && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D4A03C] bg-[#F7F3E8] px-1.5 py-0.5 rounded">
            <Zap size={10} />
            Auto-rempli
          </span>
        )}
      </div>
      {renderInput()}
      {field.helpText && field.type !== 'checkbox' && (
        <p className="text-[11px] text-gray-400 mt-0.5">{field.helpText}</p>
      )}
    </div>
  );
}
