/**
 * WebSocket Server for Twilio ConversationRelay
 *
 * This runs as a SEPARATE process from Next.js because
 * Vercel serverless doesn't support persistent WebSocket connections.
 *
 * Run locally: npx tsx src/server/ws-server.ts
 * Production: Deploy to Railway/Fly.io
 */

import { WebSocketServer, WebSocket } from 'ws'
import { createServer, IncomingMessage } from 'http'
import { URL } from 'url'
import dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: '.env.local' })

// Import our modules
import { streamResponse, generateCallSummary } from '../lib/claude-receptionist'
import { callStore } from '../lib/call-store'
import type { VoiceSession, ConversationRelayMessage, CRSetupMessage, CRPromptMessage } from '../lib/types/voice'

const PORT = parseInt(process.env.WS_PORT || '8080', 10)

// Create HTTP server for health checks
const server = createServer((req, res) => {
  if (req.url === '/health') {
    const stats = callStore.getStats()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      activeCalls: stats.active,
      totalCalls: stats.completed,
      timestamp: new Date().toISOString(),
    }))
    return
  }

  // Internal API for the Next.js dashboard to fetch data
  if (req.url === '/internal/calls') {
    const calls = callStore.getAllCalls()
    const stats = callStore.getStats()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ calls, stats }))
    return
  }

  if (req.url === '/internal/leads') {
    const leads = callStore.getAllLeads()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ leads }))
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

// Create WebSocket server on /ws path
const wss = new WebSocketServer({ server, path: '/ws' })

console.log('='.repeat(60))
console.log('  SOS Hub Canada - Twilio ConversationRelay WebSocket Server')
console.log('='.repeat(60))

wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
  // Extract query params from the connection URL
  const url = new URL(request.url || '', `http://localhost:${PORT}`)
  const callSid = url.searchParams.get('callSid') || `ws-${Date.now()}`
  const callerPhone = url.searchParams.get('from') || 'unknown'
  const calledNumber = url.searchParams.get('to') || ''

  console.log(`\n[WS] New connection: ${callSid} from ${callerPhone}`)

  // Create session in call store
  const session = callStore.startSession(callSid, callerPhone, calledNumber)
  let currentAbortController: AbortController | null = null

  // Handle incoming messages from ConversationRelay
  ws.on('message', async (rawData) => {
    try {
      const message: ConversationRelayMessage = JSON.parse(rawData.toString())

      switch (message.type) {
        case 'setup': {
          const setupMsg = message as CRSetupMessage
          session.streamSid = setupMsg.streamSid || ''
          console.log(`[WS] Setup complete for ${callSid}`)
          // ConversationRelay handles the welcome greeting via the TwiML attribute
          break
        }

        case 'prompt': {
          const promptMsg = message as CRPromptMessage
          const userText = promptMsg.voicePrompt

          if (!userText || userText.trim().length === 0) break

          console.log(`[WS] Caller said: "${userText}"`)

          // Detect language from first message
          if (session.conversationHistory.length === 0) {
            session.language = detectLanguage(userText)
            console.log(`[WS] Detected language: ${session.language}`)
          }

          // Cancel any previous streaming
          if (currentAbortController) {
            currentAbortController.abort()
          }
          currentAbortController = new AbortController()

          // Stream Claude's response
          let fullResponse = ''
          let shouldTransfer = false
          let shouldEnd = false

          try {
            for await (const event of streamResponse(session, userText)) {
              // Check if aborted (caller interrupted)
              if (currentAbortController?.signal.aborted) {
                console.log('[WS] Stream aborted (caller interrupted)')
                break
              }

              switch (event.type) {
                case 'text':
                  if (event.text) {
                    fullResponse += event.text
                    // Send token to ConversationRelay for TTS
                    sendToWs(ws, {
                      type: 'text',
                      token: event.text,
                      last: false,
                    })
                  }
                  break

                case 'tool_call':
                  console.log(`[WS] Tool called: ${event.toolName}`, event.toolInput)
                  // Tool was already executed inside streamResponse
                  if (event.toolName === 'transfer_call') shouldTransfer = true
                  if (event.toolName === 'end_call') shouldEnd = true
                  break

                case 'done':
                  // Send final token marker
                  sendToWs(ws, { type: 'text', token: '', last: true })
                  break

                case 'error':
                  console.error(`[WS] Claude error: ${event.error}`)
                  sendToWs(ws, {
                    type: 'text',
                    token: "Je suis desole, j'ai rencontre un probleme technique. Pouvez-vous repeter?",
                    last: true,
                  })
                  break
              }
            }

            if (fullResponse) {
              console.log(`[WS] Sarah said: "${fullResponse.substring(0, 100)}..."`)
            }

            // Handle transfer
            if (shouldTransfer && session.transferTarget) {
              console.log(`[WS] Transferring to: ${session.transferTarget}`)
              // Tell ConversationRelay to end and provide handoff data
              sendToWs(ws, {
                type: 'end',
                handoffData: JSON.stringify({
                  action: 'transfer',
                  destination: session.transferTarget,
                  reason: 'AI transfer',
                }),
              })
            }

            // Handle end call
            if (shouldEnd) {
              console.log(`[WS] Ending call: ${callSid}`)
              // Let the final message play, then ConversationRelay will disconnect
            }
          } catch (streamError) {
            console.error('[WS] Stream error:', streamError)
            sendToWs(ws, {
              type: 'text',
              token: "Excusez-moi, un probleme technique est survenu. Puis-je vous aider autrement?",
              last: true,
            })
          }
          break
        }

        case 'interrupt': {
          console.log('[WS] Caller interrupted')
          // Abort current Claude stream
          if (currentAbortController) {
            currentAbortController.abort()
            currentAbortController = null
          }
          break
        }

        case 'dtmf': {
          console.log(`[WS] DTMF digit: ${(message as any).digit}`)
          // Could handle menu navigation via keypad
          break
        }

        case 'error':
        case 'close': {
          console.log(`[WS] ${message.type}: ${(message as any).description || 'Connection closed'}`)
          break
        }

        default:
          console.log(`[WS] Unknown message type:`, message)
      }
    } catch (error) {
      console.error('[WS] Message handling error:', error)
    }
  })

  // Handle WebSocket close
  ws.on('close', async (code, reason) => {
    console.log(`[WS] Connection closed: ${callSid} (code: ${code})`)

    // Cancel any pending streams
    if (currentAbortController) {
      currentAbortController.abort()
    }

    // Generate summary and archive the call
    if (session.conversationHistory.length > 0) {
      try {
        const summary = await generateCallSummary(session)
        session.summary = summary.summary
        session.nextSteps = summary.nextSteps
        session.sentiment = summary.sentiment
        console.log(`[WS] Call summary: ${summary.summary}`)
        if (session.capturedLead) {
          console.log(`[WS] Lead captured: ${session.capturedLead.name} - ${session.capturedLead.service}`)
        }
      } catch (error) {
        console.error('[WS] Summary generation error:', error)
      }
    }

    callStore.endSession(callSid)
    console.log(`[WS] Session archived: ${callSid}\n`)
  })

  ws.on('error', (error) => {
    console.error(`[WS] WebSocket error for ${callSid}:`, error)
  })
})

// ============================================
// HELPERS
// ============================================

function sendToWs(ws: WebSocket, message: Record<string, unknown>) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

function detectLanguage(text: string): 'fr' | 'en' | 'es' | 'ar' {
  const lower = text.toLowerCase()

  // Arabic detection (common Arabic words/characters)
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'
  if (lower.includes('مرحبا') || lower.includes('السلام')) return 'ar'

  // Spanish detection
  const spanishWords = ['hola', 'buenos', 'buenas', 'necesito', 'quiero', 'puedo', 'tengo', 'como', 'estoy', 'por favor']
  if (spanishWords.some(w => lower.includes(w))) return 'es'

  // English detection
  const englishWords = ['hello', 'hi ', 'good morning', 'good afternoon', 'i need', 'i want', 'i would', 'can you', 'do you', 'could you', 'please', 'thank you', 'looking for', 'information']
  if (englishWords.some(w => lower.includes(w))) return 'en'

  // Default to French
  return 'fr'
}

// ============================================
// START SERVER
// ============================================

server.listen(PORT, () => {
  console.log(`\n  WebSocket server:  ws://localhost:${PORT}/ws`)
  console.log(`  Health check:     http://localhost:${PORT}/health`)
  console.log(`  Internal calls:   http://localhost:${PORT}/internal/calls`)
  console.log(`  Internal leads:   http://localhost:${PORT}/internal/leads`)
  console.log(`\n  Waiting for Twilio ConversationRelay connections...\n`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down...')
  wss.close()
  server.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down...')
  wss.close()
  server.close()
  process.exit(0)
})
