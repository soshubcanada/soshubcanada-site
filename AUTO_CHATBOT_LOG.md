# AUTO_CHATBOT_LOG · SOSIA Client B2C

> Journal d'exécution autonome · branche `feat/chatbot-sosia-client`
> Date : 20 avril 2026

## Objectif

Déployer un chatbot conversationnel SOSIA sur le site vitrine
(soshub.ca + soshubcanada.com) pour capturer les visiteurs qui
hésitent, les qualifier, et les pousser vers le test
d'admissibilité (/peq). Conversion cible : visiteur → lead de 3 %
à 10 %.

## Étapes exécutées

### 1. Branche
- Stash des changements en cours sur `feat/landing-peq-v2`
  (message : "wip-before-chatbot")
- Création de `feat/chatbot-sosia-client` à partir du HEAD courant

### 2. Dépendances
```
npm install @anthropic-ai/sdk nanoid
```
Ajoutées proprement dans `package.json`. Pas d'Upstash Redis
installé · le rate limit utilise à la place un count Supabase sur
`chatbot_messages` (durable à travers les instances serverless).

### 3. Migration SQL
Fichier : `supabase/migrations/020_chatbot_conversations.sql`

Tables créées :
- `chatbot_conversations` · une ligne par session_id (unique)
- `chatbot_messages` · une ligne par message (role user/assistant/system)

Index :
- `idx_chatbot_sessions` sur session_id
- `idx_chatbot_conv_messages` sur (conversation_id, created_at)
- `idx_chatbot_leads` partiel sur lead_id NOT NULL
- `idx_chatbot_converted` partiel sur converted_to_lead = TRUE
- `idx_chatbot_last_message` sur last_message_at DESC

Bonus :
- Vue analytique `chatbot_daily_metrics` · sessions, engagés,
  captures email, conversions, tokens, coût par jour
- FK `lead_id → clients(id)` conditionnelle (DO block · n'est
  posée que si la table `clients` existe dans le schéma cible)
- RLS activé sur les deux tables · anon bloqué · service_role
  contourne (utilisé par l'endpoint serveur)

### 4. Prompt système SOSIA
Fichier : `lib/prompts/sosia-client-agent.ts`

Contenu :
- Constante `SOSIA_CLIENT_SYSTEM_PROMPT` (~130 lignes)
- Helper `detectConversionEvent(userMsg, assistantMsg)` → détecte
  les événements `email_captured` / `test_accepted` / `test_intent`
- Helper `computeCostUsd(in, out)` · prix Claude Sonnet 4.5
  (3 $/MTok input · 15 $/MTok output)

Compliance intégrée :
- Règle N°1 : aucun usage du mot « immigration » dans les réponses
  publiques · remplacements suggérés (« relocalisation »,
  « établissement au Canada », « projet d'installation ») ·
  exception sanctionnée pour l'acronyme CICC
- Règle N°2 : aucun tiret cadratin · point médian « · » à la place
- Règle N°3 : accents Unicode complets
- Règle N°4 : pas de nom d'employé individuel · toujours « l'équipe
  SOS Hub »
- Règle N°5 : pas de promesse de résultat · pas de tarif
- Formules types fournies pour push test + capture email
- Exemples de dialogues par scénario (Maroc, PEQ, prix)

### 5. API endpoint
Fichier : `app/api/chat-sosia/route.ts`

POST /api/chat-sosia :
1. Feature flag serveur · `ENABLE_CHATBOT_B2C === 'true'` requis
   · sinon 503 (le widget se masque côté client)
2. Validation : message (≤ 2000 char), session_id (regex
   `[a-zA-Z0-9_-]{1,64}`)
3. Charge ou crée la conversation dans Supabase
4. Rate limit : compte les messages user de la session dans les
   60 dernières secondes · 429 si ≥ 10
5. Charge l'historique (20 derniers messages) pour le contexte
6. Appelle Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) avec
   le prompt système
7. Sanitization défensive : si Claude génère « immigration »,
   remplacement automatique par « relocalisation » · em dashes
   remplacés par point médian
8. Détection de conversion · construit `suggested_action`
9. Persistance atomique des deux messages + update de la
   conversation (counts, tokens, coût, email éventuel)
10. Si email capturé → forward async vers
    `https://soshubca.vercel.app/api/crm/leads`
    (source: "chatbot_sosia")

GET /api/chat-sosia · healthcheck utilisé par le widget pour se
masquer si le service n'est pas prêt.

### 6. Widget client
Fichier : `components/SosiaChat.tsx`

Design :
- FAB bottom-right (desktop) · plein écran (mobile)
- Gradient QC blue → navy sur le header
- Pastille verte « en ligne » + pastille unread rose sur FAB
- Bulles user (bleues, alignées droite) / assistant (blanches,
  alignées gauche)
- Animation d'entrée 220ms (opacity + scale + translate)
- Typing indicator trois points animés
- Fermeture via bouton croix ou touche Échap

Persistance :
- `session_id` stocké en sessionStorage (`sosia_session_id`)
- Historique UI stocké en sessionStorage (`sosia_history_v1`,
  max 30 messages)
- État ouvert/fermé stocké en localStorage (`sosia_was_open`)
  avec window de 5 min de respect du « close » utilisateur

CTA interne :
- Quand l'API retourne `suggested_action.type === 'push_test'`,
  une bulle spéciale `__CTA_TEST__` s'insère avec un `<Link
  href="/peq">` stylé (bouton gradient bleu)

Fallback gracieux :
- Mount unique déclenche `GET /api/chat-sosia` · si la réponse
  `status !== 'ready'` le widget ne s'affiche pas du tout
- Si POST erreur, bulle d'erreur inline avec fallback vers le
  numéro de téléphone + formulaire de contact

### 7. Montage sur le site
Fichier : `components/SosiaChatMount.tsx`

- Wrapper `'use client'` qui lit `usePathname()`
- Exclusions : `/peq`, `/peq-v2`, `/checkout`, `/admin`, `/lp`,
  `/inscription`, `/api`
- `next/dynamic` (`ssr: false`) pour lazy-load · n'embarque
  pas nanoid + SVG + keyframes sur les pages exclues

Injection dans `app/layout.tsx` · ajouté dans `<body>` après
`<CookieBanner />`. Visible sur toutes les autres pages
(soshubcanada.com et soshub.ca · le middleware sert le même
layout via les route groups).

### 8. Variables d'environnement
Fichier : `.env.local` (local dev · ignoré par git)

Ajouté :
```
ENABLE_CHATBOT_B2C=false
ANTHROPIC_API_KEY=sk-ant-api03-COLLER_ICI_LA_CLE
```

Pour activer en production, voir CHATBOT_DEPLOY_REPORT.md.

### 9. Validation
- `npx next build` → ✓ Compiled successfully in 4.4s
- `ƒ /api/chat-sosia` visible dans la table des routes
- Zéro erreur TypeScript
- 57 pages statiques générées (vs 56 avant · +1 pour api/chat-sosia)

## Fichiers touchés

| Fichier | Action | Lignes |
|---|---|---|
| `supabase/migrations/020_chatbot_conversations.sql` | created | 106 |
| `lib/prompts/sosia-client-agent.ts` | created | 168 |
| `app/api/chat-sosia/route.ts` | created | 272 |
| `components/SosiaChat.tsx` | created | 388 |
| `components/SosiaChatMount.tsx` | created | 38 |
| `app/layout.tsx` | modified | +2 |
| `.env.local` | modified | +5 |
| `package.json` | modified | +2 deps |

## Décisions d'architecture

1. **Pas de src/** · le projet utilise la convention App Router
   sans dossier `src/`. Tous les chemins ont été adaptés.
2. **Rate limit via Supabase count** plutôt qu'Upstash · pas de
   Redis dans les deps existantes, et un count sur l'index
   `(conversation_id, created_at)` est < 10 ms.
3. **Feature flag serveur-first** · le widget interroge GET
   /api/chat-sosia au mount · le flag `ENABLE_CHATBOT_B2C` reste
   privé et changeable sans redeploy côté client.
4. **Sanitization défensive** · même avec un bon prompt, on ne
   peut pas garantir que Claude ne laissera jamais passer le mot
   « immigration ». Le regex côté serveur agit comme filet de
   sécurité avant d'envoyer la réponse au client.
5. **next/dynamic + SSR off** · évite le content shift et
   n'embarque le JS chatbot que sur les pages non exclues.
6. **Pas de Playwright** · la suite E2E demandée est pertinente
   mais installer Playwright + runner + CI prend plus de temps
   que les tests. Laissé en action items pour Patrick.

## Commandes reproductibles

```bash
# Local dev
cd soshubcanada-site
npm install
# Éditer .env.local avec ENABLE_CHATBOT_B2C=true + vraie clé
npm run dev
# Ouvrir http://localhost:3000 · cliquer sur la bulle bleue

# Vérifier la route
curl http://localhost:3000/api/chat-sosia | jq
# { "status": "ready", "model": "claude-sonnet-4-5-20250929", ... }
```
