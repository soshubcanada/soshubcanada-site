// ========================================================
// API Route: Canaux de reservation (public)
// GET /api/crm/appointments/channels
//   ?slug=xxx  → retourne un canal specifique
//   (no param) → retourne tous les canaux actifs
// ========================================================
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Default channels (fallback if no Supabase or localStorage data)
const DEFAULT_CHANNELS = [
  {
    id: "ch-equipe",
    slug: "equipe-sos",
    name: "Equipe SOS Hub",
    title: "Consultation generale",
    email: "info@soshubcanada.com",
    ccEmails: [],
    bio: "Notre equipe d'experts en relocalisation et services d'etablissement",
    color: "#D4A03C",
    duration: 30,
    types: ["Consultation", "Suivi", "Juridique", "Administratif"],
    active: true,
  },
  {
    id: "ch-patrick",
    slug: "patrick-cadet",
    name: "Patrick Cadet",
    title: "Directeur general",
    email: "pcadet@soshubcanada.com",
    ccEmails: ["info@soshubcanada.com"],
    bio: "Plus de 10 ans d'experience en relocalisation et services aux nouveaux arrivants",
    color: "#1B2559",
    duration: 30,
    types: ["Consultation", "Suivi", "Juridique", "Administratif"],
    assignToUserId: "u1",
    active: true,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  // Try to load from Supabase if configured
  let channels = DEFAULT_CHANNELS;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey && !url.includes("VOTRE-PROJET")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const query = (supabase as any)
        .from("booking_channels")
        .select("*")
        .eq("active", true);

      if (slug) {
        query.eq("slug", slug);
      }

      const { data, error } = await query.order("created_at");

      if (!error && data && data.length > 0) {
        channels = data.map((ch: any) => ({
          id: ch.id,
          slug: ch.slug,
          name: ch.name,
          title: ch.title || "",
          email: ch.email,
          ccEmails: ch.cc_emails || [],
          bio: ch.bio || "",
          color: ch.color || "#D4A03C",
          duration: ch.duration || 30,
          types: ch.types || ["Consultation", "Suivi", "Juridique", "Administratif"],
          assignToUserId: ch.assign_to_user_id,
          active: ch.active,
        }));
      }
    } catch (err) {
      console.error("[CHANNELS] Supabase error, using defaults:", err);
    }
  }

  // Filter by slug if requested
  if (slug) {
    const channel = channels.find((c) => c.slug === slug && c.active);
    if (!channel) {
      return NextResponse.json({ error: "Canal introuvable" }, { status: 404 });
    }
    // Return public-safe data (no internal IDs or emails CC details)
    return NextResponse.json({
      channel: {
        slug: channel.slug,
        name: channel.name,
        title: channel.title,
        bio: channel.bio,
        color: channel.color,
        duration: channel.duration,
        types: channel.types,
      },
    });
  }

  // Return all active channels (public listing)
  return NextResponse.json({
    channels: channels
      .filter((c) => c.active)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        title: c.title,
        color: c.color,
        duration: c.duration,
      })),
  });
}
