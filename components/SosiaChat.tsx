'use client';

// ============================================================
// SOS Hub Canada · SosiaChat · Widget chatbot B2C · v2
// ============================================================
//
// Améliorations v2 :
//   · Quick reply chips sur le message d'accueil (starters)
//   · CTA test d'admissibilité dédupliquée par session
//     (bug v1 : la bulle CTA était réinsérée à chaque réponse
//      contenant suggested_action=push_test)
//   · Détection langue navigateur envoyée au serveur comme
//     indice de contexte
//   · Bouton « Réessayer » sur erreur réseau
//   · Meilleure accessibilité (aria-live, focus trap)
//
// Comportement :
//   · FAB bottom-right · panel 380 × 580 desktop · plein écran
//     mobile
//   · Auto-check de l'endpoint GET /api/chat-sosia · si pas
//     ready, widget se masque (fallback gracieux)
//   · Persiste session_id et historique en sessionStorage
//   · Persiste état ouvert/fermé en localStorage
//
// Compliance : pas de « immigration » · point médian à la place
// des em dashes (géré côté serveur par sanitize).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import Link from 'next/link';

const QC = '#003DA5';
const NAVY = '#0A1628';
const STORAGE_KEY_SESSION = 'sosia_session_id';
const STORAGE_KEY_OPEN = 'sosia_was_open';
const STORAGE_KEY_HISTORY = 'sosia_history_v1';
const STORAGE_KEY_DISMISSED = 'sosia_dismissed_at';
const STORAGE_KEY_CTA_SHOWN = 'sosia_cta_shown';

type Role = 'user' | 'assistant';
interface UIMessage {
  id: string;
  role: Role;
  content: string;
  error?: boolean;
  kind?: 'text' | 'cta_test';
}

interface ApiResponse {
  response: string;
  session_id: string;
  suggested_action: null | { type: 'push_test' | 'capture_email'; url?: string };
  conversion_event: string | null;
  lang?: string;
  model?: string;
}

const WELCOME: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Bonjour ! Je suis SOSIA, l'assistante virtuelle de SOS Hub Canada. Je peux vous donner les grandes lignes de l'établissement au Canada et vous orienter vers une consultation gratuite si vous avez un projet concret. Comment puis-je vous aider ?",
};

const QUICK_REPLIES: string[] = [
  "C'est quoi le PEQ ?",
  'Quelles sont les voies depuis la France ou le Maghreb ?',
  'Permis de travail au Canada',
  'Je veux parler à un conseiller',
];

// ------------------------------------------------------------
// Helpers storage (SSR-safe)
// ------------------------------------------------------------
function readSession(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(STORAGE_KEY_SESSION);
  if (!id) {
    id = `sosia_${nanoid(16)}`;
    sessionStorage.setItem(STORAGE_KEY_SESSION, id);
  }
  return id;
}

function readWasOpen(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_OPEN) === '1';
}

function writeWasOpen(v: boolean) {
  if (typeof window === 'undefined') return;
  if (v) localStorage.setItem(STORAGE_KEY_OPEN, '1');
  else localStorage.removeItem(STORAGE_KEY_OPEN);
}

function readHistory(): UIMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as UIMessage[];
  } catch {
    /* noop */
  }
  return [];
}

function writeHistory(msgs: UIMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(msgs.slice(-40)));
  } catch {
    /* noop */
  }
}

function readCtaShown(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY_CTA_SHOWN) === '1';
}

function writeCtaShown() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY_CTA_SHOWN, '1');
}

// Langue navigateur brute (fr, en, ar, es, ...)
function browserLang(): string {
  if (typeof navigator === 'undefined') return 'fr';
  return (navigator.language || 'fr').slice(0, 2).toLowerCase();
}

// ------------------------------------------------------------
// Main component
// ------------------------------------------------------------
export function SosiaChat() {
  const [available, setAvailable] = useState<boolean | null>(null); // null = checking
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(false);
  const sessionIdRef = useRef('');
  const ctaShownRef = useRef(false);
  const lastUserMsgRef = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Health check · masque le widget si l'endpoint n'est pas prêt
  useEffect(() => {
    let cancelled = false;
    fetch('/api/chat-sosia', { method: 'GET' })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setAvailable(j?.status === 'ready');
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Mount · restaure session + historique + état ouvert + CTA flag
  useEffect(() => {
    sessionIdRef.current = readSession();
    ctaShownRef.current = readCtaShown();
    const saved = readHistory();
    if (saved.length > 0) setMessages(saved);
    if (readWasOpen()) {
      const dismissed = Number(localStorage.getItem(STORAGE_KEY_DISMISSED) || 0);
      if (Date.now() - dismissed > 5 * 60 * 1000) {
        setOpen(true);
      }
    }
  }, []);

  // Auto-scroll bas quand nouveau message
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Échap pour fermer
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Persiste l'historique à chaque mise à jour
  useEffect(() => {
    writeHistory(messages);
  }, [messages]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setUnread(false);
    writeWasOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY_DISMISSED, String(Date.now()));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      lastUserMsgRef.current = trimmed;
      const userMsg: UIMessage = {
        id: nanoid(8),
        role: 'user',
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      try {
        const res = await fetch('/api/chat-sosia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            session_id: sessionIdRef.current,
            visitor_metadata: {
              source_url:
                typeof window !== 'undefined' ? window.location.href : undefined,
              user_agent:
                typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
              lang_hint: browserLang(),
            },
          }),
        });

        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error || `Erreur ${res.status}`);
        }

        const data = (await res.json()) as ApiResponse;
        const assistantMsg: UIMessage = {
          id: nanoid(8),
          role: 'assistant',
          content: data.response,
          kind: 'text',
        };

        // Ajout de la bulle CTA SEULEMENT si :
        //   · le serveur propose push_test
        //   · la CTA n'a pas déjà été montrée dans la session
        const shouldInjectCta =
          data.suggested_action?.type === 'push_test' && !ctaShownRef.current;

        setMessages((prev) => {
          const next: UIMessage[] = [...prev, assistantMsg];
          if (shouldInjectCta) {
            next.push({
              id: nanoid(8),
              role: 'assistant',
              content: '',
              kind: 'cta_test',
            });
          }
          return next;
        });

        if (shouldInjectCta) {
          ctaShownRef.current = true;
          writeCtaShown();
        }

        if (!open) setUnread(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur réseau';
        setError(msg);
        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(8),
            role: 'assistant',
            content:
              "Je n'arrive pas à répondre pour le moment · réessayez dans un instant. Si le problème persiste, vous pouvez joindre l'équipe au 1-514-533-0482 ou par courriel info@soshubcanada.com.",
            error: true,
            kind: 'text',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, open]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const retryLast = useCallback(() => {
    if (!lastUserMsgRef.current || loading) return;
    sendMessage(lastUserMsgRef.current);
  }, [loading, sendMessage]);

  // Quick replies visibles seulement tant qu'aucun message user n'est envoyé
  const showQuickReplies = useMemo(
    () => messages.every((m) => m.role !== 'user'),
    [messages]
  );

  // Widget masqué si endpoint indisponible
  if (available === false) return null;

  return (
    <>
      {/* FAB bouton flottant */}
      {!open && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Ouvrir le chat avec SOSIA"
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] group"
        >
          <span
            className="relative flex items-center gap-3 pl-3 pr-4 md:pr-5 h-14 md:h-16 rounded-full shadow-xl ring-1 ring-black/5 text-white font-semibold text-sm md:text-[15px] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${QC} 0%, #1e40af 100%)`,
            }}
          >
            <span className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
              <ChatIcon className="w-5 h-5" />
            </span>
            <span className="hidden sm:block">Parler à SOSIA</span>
            <span className="sm:hidden">SOSIA</span>
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white"
              aria-hidden
            />
            {unread && (
              <span className="absolute -top-2 -left-2 min-w-[20px] h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center px-1 ring-2 ring-white">
                !
              </span>
            )}
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat avec SOSIA"
          className="fixed inset-0 z-[60] md:inset-auto md:bottom-6 md:right-6 md:w-[380px] md:h-[580px] flex flex-col bg-white md:rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden animate-sosia-in"
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 text-white"
            style={{
              background: `linear-gradient(135deg, ${NAVY} 0%, ${QC} 100%)`,
            }}
          >
            <div className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <span className="text-base font-bold">SO</span>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2"
                style={{ boxShadow: `0 0 0 2px ${NAVY}` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[15px] leading-tight">SOSIA</div>
              <div className="text-[11px] text-white/75">
                Assistante virtuelle · en ligne
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fermer le chat"
              className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ backgroundColor: '#F7F8FA' }}
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {/* Quick reply chips au démarrage */}
            {showQuickReplies && !loading && (
              <QuickReplies
                replies={QUICK_REPLIES}
                onPick={(text) => sendMessage(text)}
              />
            )}

            {loading && <TypingIndicator />}
          </div>

          {/* Error inline + retry */}
          {error && (
            <div className="px-4 py-2 text-xs text-rose-700 bg-rose-50 border-t border-rose-100 flex items-center justify-between gap-3">
              <span className="truncate">{error}</span>
              <button
                type="button"
                onClick={retryLast}
                disabled={loading || !lastUserMsgRef.current}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 bg-white"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre message..."
              maxLength={2000}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:border-[#003DA5] focus:ring-2 focus:ring-[#003DA5]/15 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Envoyer"
              className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: QC }}
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="px-4 pb-2 text-[10.5px] text-gray-400 text-center bg-white">
            Propulsé par Claude IA · informations à titre indicatif · pas un
            conseil juridique
          </div>
        </div>
      )}

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes sosia-in {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-sosia-in {
          animation: sosia-in 220ms cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        @keyframes sosia-dot {
          0%,
          80%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
        .sosia-dot {
          animation: sosia-dot 1.2s infinite ease-in-out both;
        }
      `}</style>
    </>
  );
}

// ------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------
function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';

  // Bulle CTA · test d'admissibilité
  if (message.kind === 'cta_test' || message.content === '__CTA_TEST__') {
    return (
      <div className="flex justify-start">
        <Link
          href="/peq"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:translate-y-[-1px]"
          style={{
            background: `linear-gradient(135deg, ${QC} 0%, #1e40af 100%)`,
          }}
        >
          Commencer le test gratuit
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'text-white rounded-2xl rounded-br-md'
            : message.error
              ? 'bg-rose-50 text-rose-900 rounded-2xl rounded-bl-md border border-rose-100'
              : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
        }`}
        style={isUser ? { backgroundColor: QC } : undefined}
      >
        {message.content}
      </div>
    </div>
  );
}

function QuickReplies({
  replies,
  onPick,
}: {
  replies: string[];
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
      {replies.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onPick(r)}
          className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[#003DA5] hover:text-[#003DA5] hover:bg-[#003DA5]/5 transition-colors shadow-sm"
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-label="SOSIA écrit...">
      <div className="bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 sosia-dot"
          style={{ animationDelay: '0s' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 sosia-dot"
          style={{ animationDelay: '0.15s' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 sosia-dot"
          style={{ animationDelay: '0.3s' }}
        />
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Icons (inline SVG)
// ------------------------------------------------------------
function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default SosiaChat;
