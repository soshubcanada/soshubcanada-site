import { v4 as uuidv4 } from 'uuid'
import type { VoiceSession, CompletedCallData, CapturedLeadData } from './types/voice'
import type { Call, Lead } from './demo-data'
import { demoCalls, demoLeads } from './demo-data'

// ============================================
// IN-MEMORY CALL STORE
// Singleton - shared across the WebSocket server
// ============================================

class CallStore {
  private activeSessions: Map<string, VoiceSession> = new Map()
  private completedCalls: CompletedCallData[] = []
  private capturedLeads: CapturedLeadData[] = []

  // --- Active Sessions ---

  startSession(callSid: string, callerPhone: string, calledNumber: string): VoiceSession {
    const session: VoiceSession = {
      callSid,
      streamSid: '',
      callerPhone,
      calledNumber,
      startTime: new Date(),
      language: 'fr',
      conversationHistory: [],
      capturedLead: null,
      sentiment: 'neutral',
      transferTarget: null,
      callbackScheduled: false,
      summary: null,
      nextSteps: [],
      isActive: true,
    }
    this.activeSessions.set(callSid, session)
    console.log(`[CallStore] Session started: ${callSid} from ${callerPhone}`)
    return session
  }

  getSession(callSid: string): VoiceSession | undefined {
    return this.activeSessions.get(callSid)
  }

  updateSession(callSid: string, updates: Partial<VoiceSession>): void {
    const session = this.activeSessions.get(callSid)
    if (session) {
      Object.assign(session, updates)
    }
  }

  // --- End Session & Archive ---

  endSession(callSid: string, summary?: CompletedCallData): void {
    const session = this.activeSessions.get(callSid)
    if (!session) return

    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / 1000)

    const completedCall: CompletedCallData = summary || {
      callSid,
      callerPhone: session.callerPhone,
      startTime: session.startTime,
      endTime,
      duration,
      language: session.language,
      summary: session.summary || `Appel de ${session.callerPhone}`,
      nextSteps: session.nextSteps,
      sentiment: session.sentiment,
      transcript: session.conversationHistory
        .map(m => `${m.role === 'user' ? 'Appelant' : 'Sarah'}: ${m.content}`)
        .join('\n'),
      lead: session.capturedLead,
      transferredTo: session.transferTarget,
    }

    this.completedCalls.push(completedCall)

    // Save lead if captured
    if (session.capturedLead && session.capturedLead.name) {
      this.capturedLeads.push({
        name: session.capturedLead.name || 'Inconnu',
        phone: session.capturedLead.phone || session.callerPhone,
        email: session.capturedLead.email || '',
        service: session.capturedLead.service || 'Non specifie',
        budget: session.capturedLead.budget || '',
        urgency: session.capturedLead.urgency || 'medium',
        notes: session.capturedLead.notes || '',
        language: session.language,
      })
    }

    this.activeSessions.delete(callSid)
    console.log(`[CallStore] Session ended: ${callSid} (${duration}s)`)
  }

  // --- Getters for Dashboard ---

  getActiveCalls(): VoiceSession[] {
    return Array.from(this.activeSessions.values())
  }

  getCompletedCalls(): CompletedCallData[] {
    return [...this.completedCalls]
  }

  getCapturedLeads(): CapturedLeadData[] {
    return [...this.capturedLeads]
  }

  /** Convert completed calls to the dashboard Call format and merge with demo data */
  getAllCalls(): Call[] {
    const realCalls: Call[] = this.completedCalls.map((c, i) => ({
      id: `real-${c.callSid}`,
      callerName: c.lead?.name || 'Appelant',
      callerPhone: c.callerPhone,
      callerEmail: c.lead?.email || undefined,
      timestamp: c.startTime.toISOString(),
      duration: c.duration,
      status: 'completed' as const,
      sentiment: c.sentiment,
      language: c.language as 'fr' | 'en' | 'es' | 'ar',
      summary: c.summary,
      nextSteps: c.nextSteps,
      transcript: c.transcript,
      tags: [],
      routedTo: c.transferredTo || 'IA Sarah',
      isVIP: false,
      leadCaptured: !!c.lead,
      crmSynced: true,
    }))

    // Add active calls as "in-progress"
    const activeCalls: Call[] = Array.from(this.activeSessions.values()).map(s => ({
      id: `live-${s.callSid}`,
      callerName: s.capturedLead?.name || 'Appelant',
      callerPhone: s.callerPhone,
      callerEmail: s.capturedLead?.email || undefined,
      timestamp: s.startTime.toISOString(),
      duration: Math.round((Date.now() - s.startTime.getTime()) / 1000),
      status: 'in-progress' as const,
      sentiment: s.sentiment,
      language: s.language,
      summary: 'Appel en cours...',
      nextSteps: [],
      transcript: s.conversationHistory.map(m => `${m.role === 'user' ? 'Appelant' : 'Sarah'}: ${m.content}`).join('\n'),
      tags: [],
      routedTo: 'IA Sarah',
      isVIP: false,
      leadCaptured: !!s.capturedLead,
      crmSynced: false,
    }))

    return [...activeCalls, ...realCalls, ...demoCalls].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  /** Convert captured leads to the dashboard Lead format and merge with demo data */
  getAllLeads(): Lead[] {
    const realLeads: Lead[] = this.capturedLeads.map((l, i) => ({
      id: `real-lead-${i}`,
      name: l.name,
      phone: l.phone,
      email: l.email,
      source: 'Appel IA',
      status: 'new' as const,
      service: l.service,
      budget: l.budget || 'Non precise',
      createdAt: new Date().toISOString(),
      lastContact: new Date().toISOString(),
      notes: l.notes,
      score: l.urgency === 'urgent' ? 95 : l.urgency === 'high' ? 85 : l.urgency === 'medium' ? 70 : 55,
      assignedTo: 'Non assigne',
      callIds: [],
    }))

    return [...realLeads, ...demoLeads].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // --- Stats ---

  getStats() {
    const active = this.activeSessions.size
    const completed = this.completedCalls.length
    const leads = this.capturedLeads.length
    const transfers = this.completedCalls.filter(c => c.transferredTo).length
    return { active, completed, leads, transfers }
  }
}

// Singleton export
export const callStore = new CallStore()
