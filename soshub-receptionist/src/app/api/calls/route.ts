import { NextResponse } from 'next/server'
import { callStore } from '@/lib/call-store'

/**
 * GET /api/calls
 *
 * Returns all calls (demo + real) for the dashboard.
 * Includes active (in-progress) and completed calls.
 */
export async function GET() {
  try {
    const calls = callStore.getAllCalls()
    const stats = callStore.getStats()

    return NextResponse.json({
      calls,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API /calls Error]', error)
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 })
  }
}

// Revalidate every 5 seconds for near-real-time updates
export const revalidate = 5
