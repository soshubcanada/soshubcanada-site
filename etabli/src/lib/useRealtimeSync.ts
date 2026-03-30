// ========================================================
// SOS Hub Canada — Supabase Realtime + Polling Sync Hook
// Lien direct avec la base de données clients via Realtime
// Polling fallback toutes les 3 minutes
// ========================================================
"use client";
import { useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseReady } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type RefreshCallback = () => Promise<void>;

interface RealtimeSyncOptions {
  /** Tables to subscribe to (e.g. ['clients', 'cases', 'appointments', 'contracts']) */
  tables: string[];
  /** Called when any subscribed table changes — reload data */
  onRefresh: RefreshCallback;
  /** Polling interval in ms (default: 180000 = 3 min) */
  pollingInterval?: number;
  /** Whether sync is enabled (e.g. only when logged in) */
  enabled?: boolean;
}

/**
 * Hook: Supabase Realtime subscriptions + polling fallback
 *
 * Best practice architecture:
 * 1. Supabase Realtime (instant) — direct WebSocket link to DB
 * 2. Polling fallback (every 3 min) — safety net if Realtime drops
 * 3. Manual refresh — exposed via returned `refresh` function
 */
export function useRealtimeSync({
  tables,
  onRefresh,
  pollingInterval = 180_000,
  enabled = true,
}: RealtimeSyncOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshingRef = useRef(false);
  const lastRefreshRef = useRef<number>(0);

  // Debounced refresh — prevents flooding when multiple changes arrive
  const debouncedRefresh = useCallback(async () => {
    const now = Date.now();
    // Skip if we refreshed less than 2 seconds ago
    if (now - lastRefreshRef.current < 2000) return;
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    lastRefreshRef.current = now;
    try {
      await onRefresh();
    } catch (err) {
      console.error("[RealtimeSync] Refresh error:", err);
    } finally {
      refreshingRef.current = false;
    }
  }, [onRefresh]);

  // Manual refresh (no debounce)
  const forceRefresh = useCallback(async () => {
    refreshingRef.current = true;
    lastRefreshRef.current = Date.now();
    try {
      await onRefresh();
    } catch (err) {
      console.error("[RealtimeSync] Force refresh error:", err);
    } finally {
      refreshingRef.current = false;
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    // -------------------------------------------------------
    // 1. Supabase Realtime — direct link to DB
    // -------------------------------------------------------
    if (isSupabaseReady()) {
      const channelName = `crm-sync-${tables.join("-")}`;
      const channel = supabase.channel(channelName);

      for (const table of tables) {
        channel.on(
          "postgres_changes" as any,
          { event: "*", schema: "public", table },
          () => {
            console.log(`[RealtimeSync] Change detected on "${table}"`);
            debouncedRefresh();
          }
        );
      }

      channel.subscribe((status: string) => {
        console.log(`[RealtimeSync] Channel status: ${status}`);
        if (status === "SUBSCRIBED") {
          console.log(`[RealtimeSync] Realtime active for: ${tables.join(", ")}`);
        }
      });

      channelRef.current = channel;
    }

    // -------------------------------------------------------
    // 2. Polling fallback — every 3 minutes
    // -------------------------------------------------------
    pollingRef.current = setInterval(() => {
      console.log("[RealtimeSync] Polling refresh...");
      debouncedRefresh();
    }, pollingInterval);

    // -------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [enabled, tables, debouncedRefresh, pollingInterval]);

  return { refresh: forceRefresh };
}
