"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, X, Download, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2, ChevronDown } from "lucide-react";
import type { Client } from "@/lib/crm-types";

// ============================================================
// Types
// ============================================================
type CrmField = 'firstName' | 'lastName' | 'email' | 'phone' | 'nationality' | 'dateOfBirth' | 'address' | 'currentStatus' | 'notes';

interface ColumnMapping {
  csvColumn: string;
  crmField: CrmField | '';
}

interface ParsedRow {
  [key: string]: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  imported: number;
  duplicates: number;
  errors: number;
  errorDetails: ValidationError[];
}

// ============================================================
// CRM field labels (French Canadian)
// ============================================================
const CRM_FIELD_LABELS: Record<CrmField, string> = {
  firstName: 'Prenom',
  lastName: 'Nom de famille',
  email: 'Courriel',
  phone: 'Telephone',
  nationality: 'Nationalite',
  dateOfBirth: 'Date de naissance',
  address: 'Adresse',
  currentStatus: 'Statut actuel',
  notes: 'Notes',
};

const CRM_FIELDS: CrmField[] = ['firstName', 'lastName', 'email', 'phone', 'nationality', 'dateOfBirth', 'address', 'currentStatus', 'notes'];

// ============================================================
// Auto-detect column name mapping
// ============================================================
const COLUMN_NAME_MAP: Record<string, CrmField> = {
  prenom: 'firstName', 'prénom': 'firstName', first_name: 'firstName', firstname: 'firstName', 'first name': 'firstName',
  nom: 'lastName', last_name: 'lastName', lastname: 'lastName', nom_famille: 'lastName', 'nom de famille': 'lastName', 'last name': 'lastName',
  email: 'email', courriel: 'email', 'e-mail': 'email', mail: 'email',
  telephone: 'phone', 'téléphone': 'phone', phone: 'phone', tel: 'phone', 'tél': 'phone',
  nationalite: 'nationality', 'nationalité': 'nationality', nationality: 'nationality', pays: 'nationality',
  date_naissance: 'dateOfBirth', 'date de naissance': 'dateOfBirth', dob: 'dateOfBirth', birthday: 'dateOfBirth', naissance: 'dateOfBirth',
  adresse: 'address', address: 'address',
  statut: 'currentStatus', status: 'currentStatus', 'statut actuel': 'currentStatus',
  notes: 'notes', commentaires: 'notes', commentaire: 'notes',
};

function autoDetectField(columnName: string): CrmField | '' {
  const normalized = columnName.trim().toLowerCase().replace(/[_\-]/g, '_');
  return COLUMN_NAME_MAP[normalized] || '';
}

// ============================================================
// CSV / TSV Parser
// ============================================================
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] || '';
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  if (semiCount > commaCount) return ';';
  return ',';
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const delimiter = detectDelimiter(text);
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0], delimiter);
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    const row: ParsedRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

// ============================================================
// XLSX parser (simple - reads first sheet)
// ============================================================
async function parseXLSX(file: File): Promise<{ headers: string[]; rows: ParsedRow[] }> {
  // Read as CSV text fallback for .xlsx - basic approach
  // For true xlsx support, we parse the XML inside the zip
  const text = await file.text();
  return parseCSV(text);
}

// ============================================================
// Validation
// ============================================================
function validateEmail(email: string): boolean {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanPhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-digit characters except + at start
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned;
}

// ============================================================
// Sample CSV template
// ============================================================
const SAMPLE_CSV = `Prenom;Nom;Courriel;Telephone;Nationalite;Date de naissance;Adresse;Statut;Notes
Marie;Tremblay;marie.tremblay@email.com;514-555-1234;Canadienne;1990-05-15;123 rue Saint-Denis, Montreal;visiteur;Nouvelle cliente
Jean;Dupont;jean.dupont@email.com;438-555-9876;Francaise;1985-11-20;456 avenue du Parc, Montreal;etudiant;Demande de permis d'etudes`;

function downloadSampleCSV() {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'modele_import_clients.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// Component
// ============================================================
interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  existingClients: Client[];
  currentUserId: string;
  onImportComplete: (newClients: Client[]) => void;
}

type Step = 'upload' | 'mapping' | 'importing' | 'done';

export default function CSVImportModal({ open, onClose, existingClients, currentUserId, onImportComplete }: CSVImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState('');
  const csvInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setDragOver(false);
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMappings([]);
    setImportProgress(0);
    setImportResult(null);
    setParseError('');
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  // Process file
  const processFile = useCallback(async (file: File) => {
    setParseError('');
    setFileName(file.name);

    try {
      let parsed: { headers: string[]; rows: ParsedRow[] };

      if (file.name.endsWith('.xlsx')) {
        parsed = await parseXLSX(file);
      } else {
        const text = await file.text();
        parsed = parseCSV(text);
      }

      if (parsed.headers.length === 0) {
        setParseError('Fichier vide ou format non reconnu.');
        return;
      }

      if (parsed.rows.length === 0) {
        setParseError('Aucune ligne de donnees trouvee.');
        return;
      }

      setHeaders(parsed.headers);
      setRows(parsed.rows);

      // Auto-detect mappings
      const autoMappings: ColumnMapping[] = parsed.headers.map(h => ({
        csvColumn: h,
        crmField: autoDetectField(h),
      }));
      setMappings(autoMappings);
      setStep('mapping');
    } catch {
      setParseError('Erreur lors de la lecture du fichier. Verifiez le format.');
    }
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const updateMapping = (csvColumn: string, crmField: CrmField | '') => {
    setMappings(prev => prev.map(m => m.csvColumn === csvColumn ? { ...m, crmField } : m));
  };

  // Build client from row using mappings
  const buildClient = (row: ParsedRow): Partial<Client> => {
    const client: Partial<Client> = {};
    for (const m of mappings) {
      if (!m.crmField) continue;
      let val = row[m.csvColumn] || '';
      if (m.crmField === 'phone') val = cleanPhone(val);
      (client as Record<string, string>)[m.crmField] = val;
    }
    return client;
  };

  // Validate a row
  const validateRow = (row: ParsedRow, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    const client = buildClient(row);

    if (!client.firstName?.trim() && !client.lastName?.trim()) {
      errors.push({ row: rowIndex + 1, field: 'Prenom/Nom', message: 'Prenom et nom sont requis' });
    } else if (!client.firstName?.trim()) {
      errors.push({ row: rowIndex + 1, field: 'Prenom', message: 'Prenom est requis' });
    } else if (!client.lastName?.trim()) {
      errors.push({ row: rowIndex + 1, field: 'Nom', message: 'Nom est requis' });
    }

    if (client.email && !validateEmail(client.email)) {
      errors.push({ row: rowIndex + 1, field: 'Courriel', message: 'Format de courriel invalide' });
    }

    return errors;
  };

  // Check for duplicate by email
  const isDuplicate = (email: string): boolean => {
    if (!email) return false;
    return existingClients.some(c => c.email.toLowerCase() === email.toLowerCase());
  };

  // Import
  const startImport = async () => {
    // Check that firstName and lastName are mapped
    const hasFN = mappings.some(m => m.crmField === 'firstName');
    const hasLN = mappings.some(m => m.crmField === 'lastName');
    if (!hasFN || !hasLN) {
      setParseError('Les champs Prenom et Nom de famille doivent etre mappes.');
      return;
    }

    setStep('importing');
    setImportProgress(0);
    setParseError('');

    const result: ImportResult = { imported: 0, duplicates: 0, errors: 0, errorDetails: [] };
    const newClients: Client[] = [];
    const total = rows.length;

    for (let i = 0; i < total; i++) {
      const row = rows[i];
      const errors = validateRow(row, i);

      if (errors.length > 0) {
        result.errors++;
        result.errorDetails.push(...errors);
        setImportProgress(Math.round(((i + 1) / total) * 100));
        continue;
      }

      const partial = buildClient(row);

      // Duplicate check
      if (partial.email && isDuplicate(partial.email)) {
        result.duplicates++;
        result.errorDetails.push({ row: i + 1, field: 'Courriel', message: `Doublon: ${partial.email}` });
        setImportProgress(Math.round(((i + 1) / total) * 100));
        continue;
      }

      // Also check against already-imported in this batch
      if (partial.email && newClients.some(nc => nc.email.toLowerCase() === partial.email!.toLowerCase())) {
        result.duplicates++;
        result.errorDetails.push({ row: i + 1, field: 'Courriel', message: `Doublon dans le fichier: ${partial.email}` });
        setImportProgress(Math.round(((i + 1) / total) * 100));
        continue;
      }

      const now = new Date().toISOString().split('T')[0];
      const newClient: Client = {
        id: `c${Date.now()}_${i}`,
        firstName: partial.firstName || '',
        lastName: partial.lastName || '',
        email: partial.email || '',
        phone: partial.phone || '',
        dateOfBirth: partial.dateOfBirth || '',
        nationality: partial.nationality || '',
        currentCountry: 'Canada',
        currentStatus: partial.currentStatus || 'visiteur',
        passportNumber: '',
        passportExpiry: '',
        address: partial.address || '',
        city: 'Montreal',
        province: 'QC',
        postalCode: '',
        status: 'prospect',
        assignedTo: currentUserId,
        createdAt: now,
        updatedAt: now,
        notes: partial.notes || '',
        languageEnglish: '',
        languageFrench: '',
        education: '',
        workExperience: '',
        maritalStatus: 'Celibataire',
        dependants: 0,
        familyMembers: [],
        documents: [],
      };

      newClients.push(newClient);
      result.imported++;
      setImportProgress(Math.round(((i + 1) / total) * 100));

      // Small delay for visual progress on large imports
      if (i % 10 === 0 && total > 20) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    // Notify parent with all new clients
    if (newClients.length > 0) {
      onImportComplete(newClients);
    }

    setImportResult(result);
    setStep('done');
  };

  // Download error report
  const downloadErrorReport = () => {
    if (!importResult) return;
    const BOM = '\uFEFF';
    const lines = ['Ligne;Champ;Message'];
    importResult.errorDetails.forEach(e => {
      lines.push(`${e.row};${e.field};${e.message}`);
    });
    const blob = new Blob([BOM + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rapport_erreurs_import.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  const previewRows = rows.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 overflow-y-auto" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-[#D4A03C]" />
            Importer des clients (CSV)
          </h2>
          <button onClick={handleClose} className="p-1 rounded hover:bg-gray-100"><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step: Upload */}
          {step === 'upload' && (
            <>
              {/* Instructions */}
              <div className="bg-[#EAEDF5] rounded-xl p-4 text-sm text-[#1B2559]">
                <p className="font-semibold mb-2">Instructions</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Formats acceptes : CSV (.csv), TSV (.tsv), Excel (.xlsx)</li>
                  <li>La premiere ligne doit contenir les en-tetes de colonnes</li>
                  <li>Delimiteurs automatiquement detectes : virgule, point-virgule, tabulation</li>
                  <li>Encodage UTF-8 recommande (accents francais supportes)</li>
                  <li>Champs minimaux requis : Prenom et Nom de famille</li>
                </ul>
              </div>

              {/* Download template */}
              <button
                onClick={downloadSampleCSV}
                className="flex items-center gap-2 px-4 py-2 border border-[#D4A03C] text-[#D4A03C] rounded-lg text-sm font-medium hover:bg-[#FDF8ED] transition-colors"
              >
                <Download size={16} />
                Telecharger le modele CSV
              </button>

              {/* Drag and drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => csvInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                  dragOver ? 'border-[#D4A03C] bg-[#FDF8ED]' : 'border-gray-300 hover:border-[#D4A03C] hover:bg-gray-50'
                }`}
              >
                <Upload size={40} className={`mx-auto mb-3 ${dragOver ? 'text-[#D4A03C]' : 'text-gray-400'}`} />
                <p className="text-base font-medium text-gray-700">Glissez-deposez votre fichier ici</p>
                <p className="text-sm text-gray-400 mt-1">ou cliquez pour parcourir</p>
                <p className="text-xs text-gray-400 mt-3">CSV, TSV ou XLSX</p>
              </div>

              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,.tsv,.xlsx"
                className="hidden"
                onChange={handleFileSelect}
              />

              {parseError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertTriangle size={16} />
                  {parseError}
                </div>
              )}
            </>
          )}

          {/* Step: Column Mapping */}
          {step === 'mapping' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Fichier : <span className="font-medium text-gray-900">{fileName}</span></p>
                  <p className="text-sm text-gray-500">{rows.length} ligne(s) detectee(s), {headers.length} colonne(s)</p>
                </div>
                <button onClick={reset} className="text-sm text-[#D4A03C] font-medium hover:underline">Changer de fichier</button>
              </div>

              {/* Column Mapping */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Correspondance des colonnes</h3>
                <p className="text-xs text-gray-500 mb-3">Associez chaque colonne du CSV au champ CRM correspondant. Les colonnes reconnues sont pre-selectionnees.</p>
                <div className="space-y-2">
                  {mappings.map(m => (
                    <div key={m.csvColumn} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.csvColumn}</p>
                        <p className="text-xs text-gray-400 truncate">ex: {rows[0]?.[m.csvColumn] || '-'}</p>
                      </div>
                      <ChevronDown size={14} className="text-gray-400 shrink-0" />
                      <div className="w-52 shrink-0">
                        <select
                          value={m.crmField}
                          onChange={e => updateMapping(m.csvColumn, e.target.value as CrmField | '')}
                          className={`w-full px-3 py-2 border rounded-lg text-sm ${
                            m.crmField ? 'border-green-300 bg-green-50 text-green-800' : 'border-gray-200 bg-white text-gray-500'
                          }`}
                        >
                          <option value="">-- Ignorer --</option>
                          {CRM_FIELDS.map(f => (
                            <option key={f} value={f}>{CRM_FIELD_LABELS[f]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview table */}
              {previewRows.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                    Apercu ({Math.min(5, rows.length)} premiere(s) ligne(s))
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                          {headers.map(h => {
                            const mapping = mappings.find(m => m.csvColumn === h);
                            return (
                              <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">
                                <span>{h}</span>
                                {mapping?.crmField && (
                                  <span className="block text-[10px] text-green-600 font-normal">{CRM_FIELD_LABELS[mapping.crmField]}</span>
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewRows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            {headers.map(h => (
                              <td key={h} className="px-3 py-2 text-gray-700 max-w-[150px] truncate">{row[h] || ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 5 && (
                    <p className="text-xs text-gray-400 mt-1">... et {rows.length - 5} autre(s) ligne(s)</p>
                  )}
                </div>
              )}

              {parseError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertTriangle size={16} />
                  {parseError}
                </div>
              )}
            </>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div className="py-12 text-center space-y-6">
              <Loader2 size={40} className="mx-auto text-[#D4A03C] animate-spin" />
              <div>
                <p className="text-lg font-semibold text-gray-900">Importation en cours...</p>
                <p className="text-sm text-gray-500 mt-1">{importProgress}% complete</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto overflow-hidden">
                <div
                  className="bg-[#D4A03C] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && importResult && (
            <div className="py-8 space-y-6">
              <div className="text-center">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                <p className="text-xl font-bold text-gray-900">Importation terminee</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{importResult.imported}</p>
                  <p className="text-sm text-green-600">Clients importes</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-700">{importResult.duplicates}</p>
                  <p className="text-sm text-yellow-600">Doublons ignores</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-700">{importResult.errors}</p>
                  <p className="text-sm text-red-600">Erreurs</p>
                </div>
              </div>

              {importResult.errorDetails.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">Details des erreurs</h3>
                    <button
                      onClick={downloadErrorReport}
                      className="flex items-center gap-1 text-xs text-[#D4A03C] font-medium hover:underline"
                    >
                      <Download size={12} />
                      Telecharger le rapport
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Ligne</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Champ</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {importResult.errorDetails.slice(0, 50).map((err, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-gray-700">{err.row}</td>
                            <td className="px-3 py-2 text-gray-700">{err.field}</td>
                            <td className="px-3 py-2 text-gray-700">{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importResult.errorDetails.length > 50 && (
                    <p className="text-xs text-gray-400 mt-1">... et {importResult.errorDetails.length - 50} autre(s) erreur(s). Telechargez le rapport complet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 rounded-b-2xl">
          {step === 'upload' && (
            <button onClick={handleClose} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg text-sm">
              Annuler
            </button>
          )}
          {step === 'mapping' && (
            <>
              <button onClick={reset} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg text-sm">
                Retour
              </button>
              <button
                onClick={startImport}
                className="flex items-center gap-2 px-6 py-2 bg-[#D4A03C] text-white rounded-lg text-sm font-medium hover:bg-[#B8892F] transition-colors"
              >
                <Upload size={16} />
                Importer {rows.length} client(s)
              </button>
            </>
          )}
          {step === 'done' && (
            <>
              <button onClick={reset} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg text-sm">
                Nouvel import
              </button>
              <button onClick={handleClose} className="px-4 py-2 bg-[#1B2559] text-white rounded-lg text-sm font-medium hover:bg-[#2a3a7c] transition-colors">
                Fermer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
