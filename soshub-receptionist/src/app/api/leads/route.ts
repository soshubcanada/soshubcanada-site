import { NextResponse } from 'next/server'
import { callStore } from '@/lib/call-store'

/**
 * GET /api/leads
 *
 * Returns all leads (demo + real) for the dashboard.
 */
export async function GET() {
  try {
    const leads = callStore.getAllLeads()

    return NextResponse.json({
      leads,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API /leads Error]', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export const revalidate = 5
