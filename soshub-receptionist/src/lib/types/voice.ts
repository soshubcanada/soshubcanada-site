import type { Call, Lead } from '../demo-data'

// ============================================
// TWILIO CONVERSATIONRELAY MESSAGE TYPES
// ============================================

/** Sent by ConversationRelay when WebSocket connection opens */
export interface CRSetupMessage {
  type: 'setup'
  callSid: string
  streamSid: string
  from: string
  to: string
  accountSid: string
  customParameters?: Record<string, string>
}

/** Sent when caller speaks - contains transcribed text */
export interface CRPromptMessage {
  type: 'prompt'
  voicePrompt: string
  lang?: string
  last: boolean
}

/** Sent when caller interrupts the AI mid-speech */
export interface CRInterruptMessage {
  type: 'interrupt'
  utteranceUntilInterrupt: string
  durationUntilInterruptMs: number
}

/** DTMF keypad press */
export interface CRDtmfMessage {
  type: 'dtmf'
  digit: string
}

/** Call ended or error */
export interface CREndMessage {
  type: 'error' | 'close'
  description?: string
  errorCode?: string
}

export type ConversationRelayMessage =
  | CRSetupMessage
  | CRPromptMessage
  | CRInterruptMessage
  | CRDtmfMessage
  | CREndMessage

// ============================================
// OUTGOING MESSAGES TO CONVERSATIONRELAY
// ============================================

/** Send text tokens for TTS - stream token by token */
export interface CRTextResponse {
  type: 'text'
  token: string
  last: boolean
}

/** End the ConversationRelay session */
export interface CREndSession {
  type: 'end'
  handoffData?: string // JSON string for transfer info
}

export type ConversationRelayResponse = CRTextResponse | CREndSession

// ============================================
// VOICE SESSION
// ============================================

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface VoiceSession {
  callSid: string
  streamSid: string
  callerPhone: string
  calledNumber: string
  startTime: Date
  language: 'fr' | 'en' | 'es' | 'ar'
  conversationHistory: ConversationMessage[]
  capturedLead: Partial<CapturedLeadData> | null
  sentiment: 'positive' | 'neutral' | 'negative'
  transferTarget: string | null
  callbackScheduled: boolean
  summary: string | null
  nextSteps: string[]
  isActive: boolean
}

// ============================================
// CLAUDE TOOL INPUT TYPES
// ============================================

export interface CapturedLeadData {
  name: string
  phone: string
  email: string
  service: string
  budget: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  notes: string
  language: string
}

export interface CaptureLeadInput {
  name: string
  phone?: string
  email?: string
  service: string
  budget?: string
  urgency?: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
}

export interface ScheduleCallbackInput {
  team_member: string
  reason: string
  preferred_time?: string
  caller_name?: string
}

export interface TransferCallInput {
  destination: string
  reason: string
}

export interface CheckServiceInfoInput {
  service: string
  question?: string
}

export interface EndCallInput {
  summary: string
  next_steps: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
}

// ============================================
// CALL STORE TYPES
// ============================================

export interface CompletedCallData {
  callSid: string
  callerPhone: string
  startTime: Date
  endTime: Date
  duration: number // seconds
  language: string
  summary: string
  nextSteps: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  transcript: string
  lead: Partial<CapturedLeadData> | null
  transferredTo: string | null
}

export type { Call, Lead }
