# CHATBOT_DEPLOY_REPORT · SOSIA Client B2C

> Livraison · branche `feat/chatbot-sosia-client`
> Date : 20 avril 2026

## TL;DR

Le chatbot SOSIA est livré et buildé. Il est **désactivé par défaut**
(feature flag `ENABLE_CHATBOT_B2C=false`). Pour l'activer en prod,
**4 actions côté Vercel** sont nécessaires · temps estimé : 10 min.

## Architecture

```
Visiteur · soshub.ca ou soshubcanada.com
    │
    ▼
FAB bottom-right (components/SosiaChat.tsx)
    │  healthcheck GET /api/chat-sosia
    │  → si 'disabled' : widget masqué
    │  → si 'ready' : affichage
    ▼
POST /api/chat-sosia { message, session_id, metadata }
    │
    ├── Rate limit · 10/min via count Supabase
    ├── Load history · chatbot_messages (20 derniers)
    ├── Call Claude Sonnet 4.5
    ├── Sanitization compliance · purge 'immigration'
    ├── Detect conversion event
    ├── Persist user + assistant messages · Supabase
    └── Forward email capture → CRM /api/crm/leads (async)
    │
    ▼
Retour : { response, session_id, suggested_action }
    │
    ▼
Widget insère la réponse + bulle CTA si test_accepted
```

## Actions requises (Patrick · 10 min)

### 1. Créer la clé API Anthropic

- https://console.anthropic.com → **Settings** → **API keys**
- Créer une clé nommée **"soshubcanada-site-prod"**
- Copier la clé (format `sk-ant-api03-...`)

### 2. Appliquer la migration Supabase

- Ouvrir le projet Supabase `zjpynbezdnwzereoythn`
- **SQL Editor** → New query
- Coller le contenu de `supabase/migrations/020_chatbot_conversations.sql`
- Run · vérifier "Success. No rows returned"
- Vérifier dans **Table Editor** : `chatbot_conversations` et
  `chatbot_messages` visibles

### 3. Récupérer la Service Role Key Supabase (si pas déjà en env)

- Supabase → Settings → API → **service_role** (secret)
- Copier (format JWT très long)
- À ajouter comme `SUPABASE_SERVICE_ROLE_KEY` dans Vercel

### 4. Ajouter les variables sur Vercel

Dans le projet Vercel `soshubcanada-site` · Settings → Environment
Variables · **Production** scope :

| Nom | Valeur |
|---|---|
| `ENABLE_CHATBOT_B2C` | `true` |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` (étape 1) |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT service_role (étape 3) |

### 5. Redéployer

Deux options :

**Option A · via UI Vercel**
- Deployments → ... → **Redeploy**

**Option B · via CLI (depuis ce dossier)**
```bash
vercel --prod --yes
```

### 6. Vérifier en prod

1. Ouvrir https://soshub.ca → une bulle bleue "Parler à SOSIA"
   apparaît en bas à droite
2. Cliquer → panel s'ouvre · message d'accueil visible
3. Taper "Bonjour, je suis marocain et j'aimerais m'établir à
   Montréal" → réponse en 2 à 5 s
4. Ouvrir Supabase → Table Editor → `chatbot_conversations` ·
   une nouvelle ligne avec `session_id`, `message_count=2`,
   `source_url=https://soshub.ca/`
5. Ouvrir `chatbot_messages` · deux lignes (user + assistant)
6. Tester sur `/peq` · vérifier que la bulle **n'apparaît pas**
   (exclusion de page)

## Monitoring

### Supabase · requêtes utiles

**Conversations aujourd'hui**
```sql
SELECT * FROM chatbot_daily_metrics
ORDER BY day DESC LIMIT 7;
```

**Dernières conversations engagées (≥ 2 messages)**
```sql
SELECT session_id, source_url, visitor_email, message_count,
       conversion_event, total_cost_usd, last_message_at
FROM chatbot_conversations
WHERE message_count >= 2
ORDER BY last_message_at DESC
LIMIT 20;
```

**Leads convertis via le chatbot**
```sql
SELECT session_id, visitor_email, conversion_event, created_at
FROM chatbot_conversations
WHERE converted_to_lead = TRUE
ORDER BY converted_at DESC;
```

**Coût IA consommé ce mois**
```sql
SELECT
  DATE_TRUNC('month', created_at) AS month,
  SUM(total_cost_usd) AS cost_usd,
  SUM(total_tokens)   AS tokens,
  COUNT(*)            AS sessions
FROM chatbot_conversations
GROUP BY month
ORDER BY month DESC;
```

### Vercel · logs

```bash
vercel logs --follow | grep '\[sosia\]'
```

Messages à surveiller :
- `[sosia] anthropic error:` → clé expirée ou quota dépassé
- `[sosia] supabase read/write error:` → RLS ou schéma incorrect
- `[sosia] crm forward error:` → endpoint CRM down (non bloquant)

## Fallbacks gracieux testés

| Scénario | Comportement |
|---|---|
| `ANTHROPIC_API_KEY` absent | GET /api/chat-sosia → `status: disabled` · widget ne s'affiche pas |
| `ENABLE_CHATBOT_B2C=false` | Idem · widget masqué |
| Anthropic API timeout | POST → 502 · bulle d'erreur avec fallback tél 514-533-0482 |
| Supabase down | Réponse IA fournie quand même · pas de log (best-effort) |
| Rate limit dépassé | 429 · bulle d'erreur "Trop de messages" |
| Claude génère « immigration » | Sanitization automatique → « relocalisation » |

## Coût estimé

Avec Sonnet 4.5 (3 $ / 15 $ par MTok) · conversation type 6 tours :
- Input moyen : ~2 000 tokens (historique cumulé)
- Output moyen : ~200 tokens
- Coût par conversation : ≈ 0,009 $ USD (0,0012 cents)

Projection 1 000 conversations / mois · ≈ 9 $ USD / mois.

## Follow-ups recommandés

### Court terme (cette semaine)
- [ ] Tests E2E Playwright (non installé actuellement)
  - `tests/e2e/sosia-chat.spec.ts` · ouvrir, envoyer, vérifier
    réponse
  - `tests/e2e/sosia-capture.spec.ts` · capture email → row
    Supabase
- [ ] Ajouter un bouton "Réinitialiser" discret dans le header
  du panel (utile quand la session devient longue et confuse)

### Moyen terme (ce mois)
- [ ] Dashboard admin `/admin/chatbot` · liste des conversations,
  replay, export CSV, métriques quotidiennes
- [ ] Tracking GA4 événements : `sosia_open`, `sosia_message`,
  `sosia_test_accepted`, `sosia_email_captured`
- [ ] A/B test sur le wording du message d'accueil
- [ ] Liaison serrée avec le CRM · injecter les conversations
  SOSIA dans le dossier client quand on retrouve le même email

### Long terme
- [ ] Chatbot SOSIA **B2B internal** pour l'équipe (déjà
  planifié par Patrick) · séparé de celui-ci
- [ ] Multi-tour avec tool use (`get_peq_eligibility`,
  `book_consultation`, `send_guide_pdf`)
- [ ] Voice-to-text sur mobile

## Checklist de vérification finale

- [x] Branche `feat/chatbot-sosia-client` créée
- [x] `@anthropic-ai/sdk` + `nanoid` installés
- [x] Migration SQL créée (tables + index + RLS + vue)
- [x] Prompt système conforme (pas de « immigration »,
      pas de em dash, pas de noms d'équipe)
- [x] API /api/chat-sosia · POST + GET healthcheck
- [x] Rate limit 10/min via Supabase count
- [x] Widget SosiaChat · mobile responsive, animations,
      typing indicator, CTA test, fallback error
- [x] Wrapper SosiaChatMount · exclusions /peq /admin /lp...
- [x] Intégration app/layout.tsx (racine · visible sur tous les
      route groups non exclus)
- [x] Feature flag off par défaut
- [x] Fallback gracieux si Anthropic down
- [x] Build Next.js passe sans erreur
- [x] .env.local documenté
- [ ] **Variables Vercel ajoutées (action Patrick)**
- [ ] **Migration SQL appliquée en prod (action Patrick)**
- [ ] **Redeploy déclenché (action Patrick)**
- [ ] **Smoke test sur soshub.ca (action Patrick)**

---

Contact si blocage :
- Anthropic API : https://console.anthropic.com/support
- Supabase : https://supabase.com/support
- Vercel : https://vercel.com/help
