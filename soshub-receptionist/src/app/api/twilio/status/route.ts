import { NextResponse } from 'next/server'
import { parseTwilioBody } from '@/lib/twilio-auth'

/**
 * POST /api/twilio/status
 *
 * Twilio status callback webhook.
 * Receives call status updates: initiated, ringing, in-progress, completed, busy, failed, no-answer
 */
export async function POST(request: Request) {
  try {
    const params = await parseTwilioBody(request)

    const callSid = params.CallSid || 'unknown'
    const callStatus = params.CallStatus || 'unknown'
    const callDuration = params.CallDuration || '0'
    const from = params.From || 'unknown'

    console.log(`[Call Status] SID: ${callSid} | Status: ${callStatus} | Duration: ${callDuration}s | From: ${from}`)

    // Log notable status changes
    switch (callStatus) {
      case 'completed':
        console.log(`[Call Completed] ${callSid} - Duration: ${callDuration}s`)
        break
      case 'failed':
        console.warn(`[Call Failed] ${callSid} from ${from}`)
        break
      case 'busy':
      case 'no-answer':
        console.log(`[Call ${callStatus}] ${callSid} from ${from}`)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Status Callback Error]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
