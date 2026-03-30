import { NextResponse } from 'next/server'
import { validateTwilioRequest, parseTwilioBody } from '@/lib/twilio-auth'

/**
 * POST /api/twilio/incoming
 *
 * Twilio webhook for incoming phone calls.
 * Returns TwiML that connects the call to our ConversationRelay WebSocket server.
 */
export async function POST(request: Request) {
  try {
    const params = await parseTwilioBody(request)

    // Validate Twilio signature in production
    if (process.env.NODE_ENV === 'production') {
      const signature = request.headers.get('x-twilio-signature') || ''
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/incoming`
      if (!validateTwilioRequest(signature, url, params)) {
        return new NextResponse('Unauthorized', { status: 403 })
      }
    }

    const callSid = params.CallSid || 'unknown'
    const from = params.From || 'unknown'
    const to = params.To || 'unknown'

    console.log(`[Incoming Call] SID: ${callSid} | From: ${from} | To: ${to}`)

    // WebSocket URL for ConversationRelay
    const wsUrl = process.env.WEBSOCKET_SERVER_URL || 'ws://localhost:8080'
    // Convert ws:// to wss:// if needed for production
    const wsEndpoint = `${wsUrl}/ws?callSid=${callSid}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`

    // Build TwiML response with ConversationRelay
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="${wsEndpoint}"
      voice="Google.fr-CA-Wavenet-A"
      language="fr-CA"
      transcriptionProvider="google"
      speechModel="telephony"
      welcomeGreeting="SOS Hub Canada, bonjour! Je suis Sarah, votre assistante virtuelle. Comment puis-je vous aider aujourd'hui?"
      interruptible="true"
      dtmfDetection="true"
      profanityFilter="true"
    />
  </Connect>
</Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('[Incoming Call Error]', error)

    // Fallback TwiML - simple message if something goes wrong
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Google.fr-CA-Wavenet-A">
    Merci d'appeler SOS Hub Canada. Notre systeme rencontre un probleme technique.
    Veuillez rappeler dans quelques minutes ou nous envoyer un courriel a info@soshubcanada.com.
    Merci et a bientot.
  </Say>
</Response>`

    return new NextResponse(fallbackTwiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
