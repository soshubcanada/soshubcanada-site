// ========================================================
// SOS Hub Canada — Cron Job: Maintenance base de donnees
// Vercel Cron: execute toutes les heures
// Tasks:
//   1. Marquer leads stales (>7j sans contact)
//   2. Relances automatiques (clients avec prochaine_relance depassee)
//   3. Verifier expirations de statut immigration
//   4. Nettoyage sessions expirees
// ========================================================
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel Cron auth — verify the request comes from Vercel
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  // Fail closed: if no secret configured, block access
  if (!cronSecret) return process.env.NODE_ENV === "development";
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = { timestamp: new Date().toISOString() };

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey || url.includes("VOTRE-PROJET")) {
      return NextResponse.json({ message: "Supabase not configured, skipping cron", ...results });
    }

    // Dynamic import to avoid build issues
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // -------------------------------------------------------
    // 1. Marquer leads stales (>7 jours sans contact, encore "new")
    // -------------------------------------------------------
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: staleLeads, error: staleErr } = await supabase
      .from("leads")
      .update({ status: "stale" })
      .eq("status", "new")
      .lt("created_at", sevenDaysAgo)
      .select("id");

    results.staleLeads = staleErr ? { error: staleErr.message } : { updated: staleLeads?.length ?? 0 };

    // -------------------------------------------------------
    // 2. Clients avec relance depassee → creer notification
    // -------------------------------------------------------
    const today = new Date().toISOString().split("T")[0];
    const { data: relanceClients, error: relErr } = await supabase
      .from("clients")
      .select("id, first_name, last_name, assigned_to, prochaine_relance")
      .lte("prochaine_relance", today)
      .neq("status", "archive")
      .neq("status", "annule");

    results.relancesOverdue = relErr ? { error: relErr.message } : { count: relanceClients?.length ?? 0 };

    // -------------------------------------------------------
    // 3. Verifier expirations de statut immigration (<30 jours)
    // -------------------------------------------------------
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { data: expiringClients, error: expErr } = await supabase
      .from("clients")
      .select("id, first_name, last_name, date_expiration_statut")
      .lte("date_expiration_statut", thirtyDaysFromNow)
      .gte("date_expiration_statut", today)
      .neq("status", "archive");

    results.expiringStatuses = expErr ? { error: expErr.message } : { count: expiringClients?.length ?? 0 };

    // -------------------------------------------------------
    // 4. Stats snapshot (pour rapports)
    // -------------------------------------------------------
    const [{ count: totalClients }, { count: totalCases }, { count: totalLeads }] = await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("cases").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }),
    ]);

    results.stats = { totalClients, totalCases, totalLeads };
    results.status = "success";

    return NextResponse.json(results);
  } catch (err) {
    console.error("[CRON] Error:", err);
    results.status = "error";
    results.error = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(results, { status: 500 });
  }
}
