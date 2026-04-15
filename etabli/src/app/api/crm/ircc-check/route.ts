// ========================================================
// SOS Hub Canada - Verification automatique des formulaires IRCC
// Scrape les pages IRCC pour detecter les mises a jour
// Endpoint: GET /api/crm/ircc-check
// ========================================================
import { NextRequest, NextResponse } from 'next/server';
import { IRCC_FORMS } from '@/lib/ircc-forms';
import { authenticateRequest, checkRateLimit } from '@/lib/api-auth';

// IRCC official form pages to check
const IRCC_FORM_URLS: Record<string, string> = {
  'imm0008': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/request-application-package-federal-skilled-workers.html',
  'imm5669': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5669-schedule-background-declaration.html',
  'imm5645': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5645-family-information.html',
  'imm5476': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/use-representative.html',
  'imm1295': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/application-work-permit-outside-canada.html',
  'imm1294': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/application-study-permit.html',
  'imm5257': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/application-visitor-visa-temporary-resident-visa.html',
  'imm1344': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-3999-sponsorship-eligible-relatives.html',
};

// Known form version page (IRCC forms page)
const IRCC_FORMS_INDEX = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html';

interface FormCheckResult {
  formId: string;
  formCode: string;
  formName: string;
  currentVersion: string;
  status: 'up_to_date' | 'update_available' | 'check_failed' | 'new_form';
  detectedVersion?: string;
  lastModified?: string;
  notes: string;
}

interface CheckReport {
  checkDate: string;
  totalForms: number;
  checked: number;
  upToDate: number;
  updatesAvailable: number;
  checkFailed: number;
  results: FormCheckResult[];
  irccPageAccessible: boolean;
  nextCheckScheduled: string;
}

// Storage key for last check results
const STORAGE_KEY = 'soshub_ircc_form_check';

export async function GET(req: NextRequest) {
  // Rate limit: 5 requests/min (expensive external calls)
  const rl = checkRateLimit(req, 5, 60000, 'ircc-check');
  if (!rl.allowed) return rl.error!;

  // Authentification : soit via le cron runner interne de Vercel
  // (header `x-vercel-cron` non spoofable), soit via une session
  // staff authentifiee (cas du bouton "Verifier maintenant" dans le CRM).
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  if (!isVercelCron) {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) return auth.error!;
  }

  const results: FormCheckResult[] = [];
  let irccAccessible = false;

  // 1. Check if IRCC main forms page is accessible
  try {
    const indexResp = await fetch(IRCC_FORMS_INDEX, {
      headers: { 'User-Agent': 'SOS-Hub-Canada-FormChecker/1.0 (Immigration CRM; contact: info@soshubcanada.com)' },
      signal: AbortSignal.timeout(10000),
    });
    irccAccessible = indexResp.ok;

    if (irccAccessible) {
      const html = await indexResp.text();

      // Extract last modified date from page
      const lastModMatch = html.match(/Date modified[:\s]*<time[^>]*>([^<]+)<\/time>/i)
        || html.match(/dateModified["\s:]+["']?(\d{4}-\d{2}-\d{2})/i);
      const pageLastModified = lastModMatch?.[1] || null;

      // Check each known form for version indicators
      for (const form of IRCC_FORMS) {
        const checkUrl = IRCC_FORM_URLS[form.id];

        if (checkUrl) {
          try {
            const resp = await fetch(checkUrl, {
              headers: { 'User-Agent': 'SOS-Hub-Canada-FormChecker/1.0' },
              signal: AbortSignal.timeout(8000),
            });

            if (resp.ok) {
              const pageHtml = await resp.text();

              // Try to detect version from page content
              const versionMatch = pageHtml.match(/(?:version|ver\.?|v)\s*[:=]?\s*(\d{4}[-/]\d{2}(?:[-/]\d{2})?)/i)
                || pageHtml.match(/\((\d{2}-\d{4})\)/)
                || pageHtml.match(/last\s*(?:updated|modified|revised)[:\s]*(\d{4}[-/]\d{2}[-/]\d{2})/i);

              const dateModMatch = pageHtml.match(/Date modified[:\s]*<time[^>]*>([^<]+)<\/time>/i);
              const detectedDate = dateModMatch?.[1] || versionMatch?.[1] || null;

              // Check Last-Modified header
              const lastModHeader = resp.headers.get('last-modified');

              const isNewer = detectedDate && detectedDate > form.version;

              results.push({
                formId: form.id,
                formCode: form.code,
                formName: form.name,
                currentVersion: form.version,
                status: isNewer ? 'update_available' : 'up_to_date',
                detectedVersion: detectedDate || undefined,
                lastModified: lastModHeader || dateModMatch?.[1] || undefined,
                notes: isNewer
                  ? `Nouvelle version detectee: ${detectedDate} (actuelle: ${form.version})`
                  : `Page verifiee — aucun changement detecte`,
              });
            } else {
              results.push({
                formId: form.id,
                formCode: form.code,
                formName: form.name,
                currentVersion: form.version,
                status: 'check_failed',
                notes: `Page inaccessible (HTTP ${resp.status})`,
              });
            }
          } catch {
            results.push({
              formId: form.id,
              formCode: form.code,
              formName: form.name,
              currentVersion: form.version,
              status: 'check_failed',
              notes: 'Timeout ou erreur reseau',
            });
          }
        } else {
          // No direct URL mapped, check against index page date
          results.push({
            formId: form.id,
            formCode: form.code,
            formName: form.name,
            currentVersion: form.version,
            status: pageLastModified && pageLastModified > form.version ? 'update_available' : 'up_to_date',
            detectedVersion: pageLastModified || undefined,
            notes: checkUrl ? '' : `Pas d'URL directe — verification via page index (${pageLastModified || 'N/A'})`,
          });
        }
      }
    }
  } catch {
    // IRCC site unreachable
    irccAccessible = false;
    for (const form of IRCC_FORMS) {
      results.push({
        formId: form.id,
        formCode: form.code,
        formName: form.name,
        currentVersion: form.version,
        status: 'check_failed',
        notes: 'Site IRCC inaccessible',
      });
    }
  }

  const upToDate = results.filter(r => r.status === 'up_to_date').length;
  const updatesAvailable = results.filter(r => r.status === 'update_available').length;
  const checkFailed = results.filter(r => r.status === 'check_failed').length;

  // Schedule next check for tomorrow 6 AM ET
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);

  const report: CheckReport = {
    checkDate: new Date().toISOString(),
    totalForms: IRCC_FORMS.length,
    checked: results.length,
    upToDate,
    updatesAvailable,
    checkFailed,
    results,
    irccPageAccessible: irccAccessible,
    nextCheckScheduled: tomorrow.toISOString(),
  };

  return NextResponse.json(report);
}
