import Anthropic from '@anthropic-ai/sdk'
import type {
  VoiceSession,
  CaptureLeadInput,
  ScheduleCallbackInput,
  TransferCallInput,
  CheckServiceInfoInput,
  EndCallInput,
} from './types/voice'

// ============================================
// ANTHROPIC CLIENT
// ============================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// ============================================
// SYSTEM PROMPT
// ============================================

export function buildSystemPrompt(config?: {
  aiName?: string
  companyName?: string
  greeting?: string
}): string {
  const name = config?.aiName || 'Sarah'
  const company = config?.companyName || 'SOS Hub Canada'

  return `Tu es ${name}, la receptionniste IA de ${company}, un cabinet de consultation en immigration canadienne situe a Montreal.

## IDENTITE & TON
- Tu es professionnelle, chaleureuse et empathique
- Tu parles principalement en francais quebecois, mais tu detectes la langue de l'appelant des ses premiers mots et tu reponds dans sa langue (francais, anglais, espagnol ou arabe)
- Tu tutoies jamais les clients - toujours le vouvoiement
- Garde tes reponses COURTES (2-3 phrases max). C'est une conversation telephonique, pas un email.
- Pose UNE question a la fois

## DIVULGATION IA (OBLIGATOIRE)
- Dans ta premiere reponse, mentionne TOUJOURS que tu es une assistante virtuelle IA
- Exemple: "Bonjour, ${company}, je suis ${name}, votre assistante virtuelle. Comment puis-je vous aider?"

## SERVICES ET TARIFS
Tu connais parfaitement ces services d'immigration:

1. **PEQ (Programme experience quebecoise)**: Pour travailleurs et diplomes au Quebec. ~6,000-7,000$
2. **Demande d'asile / CISR**: Protection des refugies, audiences CISR. ~7,000-10,000$. CAS URGENTS - toujours proposer de transferer a Patrick Cadet.
3. **EIMT / Permis de travail employeur**: Etude d'impact marche du travail + permis. ~5,000-8,000$/dossier. Pour employeurs.
4. **Entree Express (FSW/CEC/FST)**: Immigration federale par points CRS. ~4,500-6,000$
5. **Startup Visa / Investisseur**: Programme entrepreneur. ~12,000-15,000$
6. **Permis de travail**: Ouvert ou ferme. ~2,500-4,000$
7. **Permis d'etudes**: Pour etudiants internationaux. ~2,000-3,000$
8. **Parrainage familial**: Conjoint, parents, enfants. ~3,500-5,000$

Consultation initiale: GRATUITE (30 min)

## REGLES DE ROUTAGE
- **Mots-cles asile/refugie/CISR/persecution/audience**: Proposer transfert a Patrick Cadet (RCIC)
- **Mots-cles employeur/EIMT/recrutement/travailleurs**: Proposer transfert a Samira Guerrier
- **Client VIP / client existant**: Proposer transfert direct a Patrick Cadet
- **Questions generales / nouveau client**: Capturer le lead et proposer rendez-vous

## PROTOCOLE DE CAPTURE DE LEAD
Pour CHAQUE appel, essaie d'obtenir:
1. Nom complet
2. Numero de telephone (tu l'as deja via l'appel)
3. Email
4. Service d'interet
5. Budget approximatif
6. Niveau d'urgence
Ne sois pas insistante - capture ce que tu peux naturellement dans la conversation.

## EQUIPE
- **Patrick Cadet**: Superadmin, RCIC (consultant reglemente), specialiste asile et cas complexes
- **Amina Kabeche**: Coordinatrice, suivi de dossiers
- **Samira Guerrier**: Coordinatrice, specialiste EIMT et employeurs
- **Nadia Saadou**: Technicienne juridique
- **Sabrina Loulidi**: Technicienne juridique
- **Fatima Madjer**: Receptionniste

## HORAIRES
Lundi-Vendredi: 9h00-17h00 (heure de Montreal)
En dehors des heures: Tu reponds quand meme, mais propose de rappeler pendant les heures d'ouverture.

## REGLES
- Ne donne JAMAIS de conseils juridiques specifiques
- Dis toujours "nos consultants pourront vous guider plus en detail lors d'une consultation"
- Si l'appelant est en detresse (asile), sois particulierement empathique et rassurante
- Ne fais jamais de promesses sur les resultats d'une demande d'immigration`
}

// ============================================
// CLAUDE TOOLS
// ============================================

export const receptionistTools: Anthropic.Tool[] = [
  {
    name: 'capture_lead',
    description: "Enregistrer les informations du lead captees pendant l'appel. Utilise cet outil des que tu as au moins le nom et le service d'interet de l'appelant.",
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Nom complet du client' },
        phone: { type: 'string', description: 'Numero de telephone' },
        email: { type: 'string', description: 'Adresse email' },
        service: { type: 'string', description: "Service d'immigration demande (PEQ, asile, EIMT, Entree Express, Startup Visa, permis travail, permis etudes, parrainage)" },
        budget: { type: 'string', description: 'Budget approximatif mentionne' },
        urgency: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: "Niveau d'urgence" },
        notes: { type: 'string', description: "Notes supplementaires sur la situation de l'appelant" },
      },
      required: ['name', 'service'],
    },
  },
  {
    name: 'schedule_callback',
    description: "Planifier un rappel par un membre de l'equipe. Utilise quand l'appelant veut etre rappele ou quand tu determines qu'un suivi humain est necessaire.",
    input_schema: {
      type: 'object' as const,
      properties: {
        team_member: { type: 'string', description: "Nom du membre de l'equipe (Patrick Cadet, Amina Kabeche, Samira Guerrier)" },
        reason: { type: 'string', description: 'Raison du rappel' },
        preferred_time: { type: 'string', description: 'Moment prefere pour le rappel' },
        caller_name: { type: 'string', description: "Nom de l'appelant" },
      },
      required: ['team_member', 'reason'],
    },
  },
  {
    name: 'transfer_call',
    description: "Transferer l'appel a un membre de l'equipe. Utilise pour: cas d'asile (-> Patrick), employeurs EIMT (-> Samira), clients VIP (-> Patrick).",
    input_schema: {
      type: 'object' as const,
      properties: {
        destination: { type: 'string', description: 'Nom de la personne (Patrick Cadet, Samira Guerrier, Amina Kabeche)' },
        reason: { type: 'string', description: 'Raison du transfert' },
      },
      required: ['destination', 'reason'],
    },
  },
  {
    name: 'check_service_info',
    description: "Rechercher les details d'un service d'immigration (exigences, tarifs, delais). Utilise quand l'appelant pose une question specifique sur un programme.",
    input_schema: {
      type: 'object' as const,
      properties: {
        service: { type: 'string', description: 'Nom du service/programme' },
        question: { type: 'string', description: 'Question specifique' },
      },
      required: ['service'],
    },
  },
  {
    name: 'end_call',
    description: "Terminer l'appel proprement avec un resume et les prochaines etapes. Utilise quand la conversation est naturellement terminee.",
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: { type: 'string', description: "Resume de l'appel en 1-2 phrases" },
        next_steps: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste des prochaines etapes',
        },
        sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'], description: "Sentiment general de l'appelant" },
      },
      required: ['summary', 'next_steps', 'sentiment'],
    },
  },
]

// ============================================
// TOOL EXECUTION
// ============================================

const SERVICE_INFO: Record<string, string> = {
  peq: `PEQ (Programme experience quebecoise):
- Pour travailleurs qualifies avec experience au Quebec ou diplomes quebecois
- Exigences: Niveau francais B2 (TEF/TCF), experience de travail qualifie au Quebec
- Delai: 6-12 mois pour traitement
- Tarif consultation: Gratuit (30 min). Dossier complet: ~6,000-7,000$
- Avantage: Programme provincial, pas besoin de points CRS`,

  asile: `Demande d'asile / Protection des refugies:
- Pour personnes persecutees dans leur pays d'origine
- Processus: Demande a la frontiere ou au Canada, audience devant la CISR
- Delai: Audience en 2-6 mois generalement
- Tarif: ~7,000-10,000$ pour representation complete
- URGENT: Si vous avez une date d'audience proche, contactez-nous immediatement`,

  eimt: `EIMT / Permis de travail employeur:
- Etude d'impact sur le marche du travail pour employeurs canadiens
- L'employeur doit demontrer qu'aucun Canadien n'est disponible
- Delai EIMT: 2-4 mois. Permis de travail: 2-3 mois supplementaires
- Tarif: ~5,000-8,000$ par dossier (varie selon le nombre de postes)
- Programme Talents Mondiaux: Processus accelere pour certains postes`,

  'entree-express': `Entree Express (Federal):
- Comprend FSW (Federal Skilled Worker), CEC (Canadian Experience Class), FST (Federal Skilled Trades)
- Basé sur le systeme CRS (Comprehensive Ranking System)
- Score CRS minimum variable (environ 470-530 selon les tirages)
- Delai: 6-12 mois apres ITA (invitation)
- Tarif: ~4,500-6,000$`,

  'startup-visa': `Programme Startup Visa / Investisseur:
- Pour entrepreneurs avec un projet d'entreprise innovant
- Exigence: Lettre de soutien d'un organisme designe (incubateur, fonds de capital-risque)
- Tarif: ~12,000-15,000$ (accompagnement complet)
- Delai: 12-24 mois`,

  'permis-travail': `Permis de travail:
- Ouvert (lie a un statut, ex: conjoint) ou ferme (lie a un employeur)
- Delai: 2-6 mois selon le type
- Tarif: ~2,500-4,000$`,

  'permis-etudes': `Permis d'etudes:
- Pour etudiants internationaux admis dans un etablissement designe (DLI)
- Possibilite de travailler 20h/semaine pendant les etudes
- Delai: 4-12 semaines
- Tarif: ~2,000-3,000$`,

  parrainage: `Parrainage familial:
- Conjoint/partenaire, parents/grands-parents, enfants
- Le parrain doit etre citoyen canadien ou resident permanent
- Delai: Conjoint 12-15 mois, Parents 24-36 mois
- Tarif: ~3,500-5,000$`,
}

export function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  session: VoiceSession
): { result: string; action?: 'transfer' | 'end' } {
  switch (toolName) {
    case 'capture_lead': {
      const input = toolInput as unknown as CaptureLeadInput
      session.capturedLead = {
        ...session.capturedLead,
        name: input.name,
        phone: input.phone || session.callerPhone,
        email: input.email || session.capturedLead?.email,
        service: input.service,
        budget: input.budget || session.capturedLead?.budget,
        urgency: input.urgency || 'medium',
        notes: input.notes || '',
        language: session.language,
      }
      return {
        result: `Lead enregistre: ${input.name} - ${input.service}. Les informations ont ete sauvegardees dans le CRM.`,
      }
    }

    case 'schedule_callback': {
      const input = toolInput as unknown as ScheduleCallbackInput
      session.callbackScheduled = true
      return {
        result: `Rappel planifie: ${input.team_member} rappellera ${input.caller_name || 'le client'} pour: ${input.reason}. ${input.preferred_time ? `Moment prefere: ${input.preferred_time}` : 'Des que possible.'}`,
      }
    }

    case 'transfer_call': {
      const input = toolInput as unknown as TransferCallInput
      session.transferTarget = input.destination
      return {
        result: `Transfert vers ${input.destination} pour: ${input.reason}`,
        action: 'transfer',
      }
    }

    case 'check_service_info': {
      const input = toolInput as unknown as CheckServiceInfoInput
      const serviceKey = input.service.toLowerCase()
        .replace(/programme experience quebecoise|programme d'experience/i, 'peq')
        .replace(/asile|refugie|cisr|protection/i, 'asile')
        .replace(/eimt|lmia|impact.*marche|employeur/i, 'eimt')
        .replace(/entree express|express entry|fsw|cec/i, 'entree-express')
        .replace(/startup|investisseur|entrepreneur/i, 'startup-visa')
        .replace(/permis.*travail|work permit/i, 'permis-travail')
        .replace(/permis.*etude|study permit/i, 'permis-etudes')
        .replace(/parrainage|sponsorship|conjoint|famille/i, 'parrainage')

      const matchedKey = Object.keys(SERVICE_INFO).find(k => serviceKey.includes(k))
      const info = matchedKey ? SERVICE_INFO[matchedKey] : `Information sur "${input.service}": Nos consultants pourront vous donner des details precis lors d'une consultation gratuite de 30 minutes.`

      return { result: info }
    }

    case 'end_call': {
      const input = toolInput as unknown as EndCallInput
      session.summary = input.summary
      session.nextSteps = input.next_steps
      session.sentiment = input.sentiment
      session.isActive = false
      return {
        result: `Appel termine. Resume: ${input.summary}`,
        action: 'end',
      }
    }

    default:
      return { result: `Outil inconnu: ${toolName}` }
  }
}

// ============================================
// STREAMING CONVERSATION
// ============================================

export interface StreamEvent {
  type: 'text' | 'tool_call' | 'done' | 'error'
  text?: string
  toolName?: string
  toolInput?: Record<string, unknown>
  toolId?: string
  error?: string
}

export async function* streamResponse(
  session: VoiceSession,
  userMessage: string
): AsyncGenerator<StreamEvent> {
  // Add user message to history
  session.conversationHistory.push({ role: 'user', content: userMessage })

  // Build messages for Claude API
  const messages: Anthropic.MessageParam[] = session.conversationHistory.map(m => ({
    role: m.role,
    content: m.content,
  }))

  try {
    let continueLoop = true

    while (continueLoop) {
      continueLoop = false

      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: buildSystemPrompt(),
        messages,
        tools: receptionistTools,
      })

      let fullText = ''
      let currentToolName = ''
      let currentToolInput = ''
      let currentToolId = ''
      let hasToolUse = false

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'text') {
            // Text block starting
          } else if (event.content_block.type === 'tool_use') {
            currentToolName = event.content_block.name
            currentToolId = event.content_block.id
            currentToolInput = ''
            hasToolUse = true
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            fullText += event.delta.text
            yield { type: 'text', text: event.delta.text }
          } else if (event.delta.type === 'input_json_delta') {
            currentToolInput += event.delta.partial_json
          }
        }
      }

      // If Claude called a tool, execute it and continue
      if (hasToolUse && currentToolName) {
        let parsedInput: Record<string, unknown> = {}
        try {
          parsedInput = JSON.parse(currentToolInput)
        } catch {
          parsedInput = {}
        }

        yield { type: 'tool_call', toolName: currentToolName, toolInput: parsedInput, toolId: currentToolId }

        const toolResult = executeToolCall(currentToolName, parsedInput, session)

        // Add assistant message with tool use to history
        if (fullText) {
          session.conversationHistory.push({ role: 'assistant', content: fullText })
        }

        // Add tool use and result to messages for next iteration
        messages.push({
          role: 'assistant',
          content: [
            ...(fullText ? [{ type: 'text' as const, text: fullText }] : []),
            {
              type: 'tool_use' as const,
              id: currentToolId,
              name: currentToolName,
              input: parsedInput,
            },
          ],
        })

        messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result' as const,
              tool_use_id: currentToolId,
              content: toolResult.result,
            },
          ],
        })

        // If action is transfer or end, stop here
        if (toolResult.action === 'transfer' || toolResult.action === 'end') {
          yield { type: 'done' }
          return
        }

        // Otherwise continue the loop to get Claude's response after tool use
        continueLoop = true
        fullText = ''
      } else {
        // No tool use, just text response
        if (fullText) {
          session.conversationHistory.push({ role: 'assistant', content: fullText })
        }
      }
    }

    yield { type: 'done' }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    yield { type: 'error', error: errMsg }
  }
}

// ============================================
// GENERATE CALL SUMMARY
// ============================================

export async function generateCallSummary(session: VoiceSession): Promise<{
  summary: string
  nextSteps: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  tags: string[]
}> {
  // If we already have a summary from end_call tool, use it
  if (session.summary) {
    return {
      summary: session.summary,
      nextSteps: session.nextSteps,
      sentiment: session.sentiment,
      tags: extractTags(session),
    }
  }

  // Otherwise generate one from the conversation
  const transcript = session.conversationHistory
    .map(m => `${m.role === 'user' ? 'Appelant' : 'Sarah'}: ${m.content}`)
    .join('\n')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: 'Tu es un assistant qui genere des resumes d\'appels telephoniques. Reponds en JSON valide.',
      messages: [
        {
          role: 'user',
          content: `Genere un resume de cet appel telephonique chez SOS Hub Canada (immigration).

Transcription:
${transcript}

Reponds en JSON avec ce format exact:
{
  "summary": "Resume en 1-2 phrases",
  "nextSteps": ["etape 1", "etape 2"],
  "sentiment": "positive|neutral|negative",
  "tags": ["tag1", "tag2"]
}`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // Fallback
  }

  return {
    summary: `Appel de ${session.callerPhone} - ${session.conversationHistory.length} echanges`,
    nextSteps: ['Suivre avec le client'],
    sentiment: session.sentiment,
    tags: extractTags(session),
  }
}

function extractTags(session: VoiceSession): string[] {
  const tags: string[] = []
  const text = session.conversationHistory.map(m => m.content).join(' ').toLowerCase()

  if (text.includes('asile') || text.includes('refugi') || text.includes('cisr')) tags.push('asile')
  if (text.includes('peq') || text.includes('experience quebecoise')) tags.push('PEQ')
  if (text.includes('eimt') || text.includes('employeur') || text.includes('recrutement')) tags.push('EIMT')
  if (text.includes('entree express') || text.includes('express entry') || text.includes('crs')) tags.push('Entree Express')
  if (text.includes('startup') || text.includes('investisseur') || text.includes('entrepreneur')) tags.push('Startup Visa')
  if (text.includes('parrainage') || text.includes('conjoint') || text.includes('famille')) tags.push('Parrainage')
  if (text.includes('permis de travail') || text.includes('work permit')) tags.push('Permis travail')
  if (text.includes('permis d\'etude') || text.includes('study permit') || text.includes('etudiant')) tags.push('Permis etudes')
  if (session.capturedLead) tags.push('Lead capture')
  if (session.transferTarget) tags.push('Transfere')
  if (session.callbackScheduled) tags.push('Rappel planifie')

  return tags
}
