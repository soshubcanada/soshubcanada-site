"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Mic,
  MicOff,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { findBestResponse } from "@/lib/chatbot-knowledge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface QuickAction {
  label: string;
  href: string;
}

interface FollowUp {
  label: string;
  query: string;
}

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  displayText?: string;
  quickActions?: QuickAction[];
  followUps?: FollowUp[];
  timestamp: Date;
  feedback?: "up" | "down" | null;
  copied?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BRAND = {
  primary: "#085041",
  accent: "#1D9E75",
  gold: "#D97706",
} as const;

const STORAGE_KEY = "etabli_chat_history";
const PROACTIVE_KEY = "etabli_chat_proactive_shown";
const TYPING_DELAY = 800;
const CHAR_SPEED = 12;
const PROACTIVE_DELAY = 6000; // show proactive bubble after 6s

/* ------------------------------------------------------------------ */
/*  Simple markdown renderer (bold)                                    */
/* ------------------------------------------------------------------ */

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChatWidget() {
  const { lang } = useLang();
  const pathname = usePathname();
  const fr = lang === "fr";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [hasOpened, setHasOpened] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [proactiveBubble, setProactiveBubble] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  /* ---- helpers --------------------------------------------------- */

  const uid = () => Math.random().toString(36).slice(2, 10);

  /* ---- page-aware context ---------------------------------------- */

  const getPageContext = useCallback((): string => {
    if (pathname?.includes("simulateur-arrima")) return "arrima";
    if (pathname?.includes("simulateur-crs")) return "crs";
    if (pathname?.includes("francisation")) return "francisation";
    if (pathname?.includes("emploi")) return "emploi";
    if (pathname?.includes("marketplace")) return "marketplace";
    if (pathname?.includes("tarif")) return "tarifs";
    if (pathname?.includes("guide")) return "guide";
    return "general";
  }, [pathname]);

  const quickActions: QuickAction[] = [
    { label: fr ? "Simulateur Arrima" : "Arrima Simulator", href: "/simulateur-arrima" },
    { label: fr ? "Cours de français" : "French Courses", href: "/francisation" },
    { label: fr ? "Guide d'établissement" : "Settlement Guide", href: "/guide-etablissement" },
    { label: fr ? "Trouver un emploi" : "Find a Job", href: "/emplois" },
  ];

  /* ---- follow-ups are now provided by the knowledge base --------- */

  const welcomeMessage = useCallback((): ChatMessage => {
    const ctx = getPageContext();
    let text: string;

    if (ctx === "arrima") {
      text = fr
        ? "Bonjour\u00a0! Je vois que vous explorez le simulateur Arrima. Besoin d'aide pour comprendre votre score\u00a0?"
        : "Hello! I see you're exploring the Arrima simulator. Need help understanding your score?";
    } else if (ctx === "francisation") {
      text = fr
        ? "Bonjour\u00a0! Vous êtes dans la section francisation. Je peux vous guider vers le bon exercice selon votre niveau."
        : "Hello! You're in the French courses section. I can guide you to the right exercise for your level.";
    } else if (ctx === "tarifs") {
      text = fr
        ? "Bonjour\u00a0! Vous consultez nos tarifs. Je peux vous aider à choisir le forfait idéal pour votre situation."
        : "Hello! You're viewing our pricing. I can help you pick the ideal plan for your situation.";
    } else {
      text = fr
        ? "Bonjour\u00a0! Je suis l\u2019assistant etabli. Comment puis-je vous aider\u00a0?"
        : "Hello! I\u2019m the etabli. assistant. How can I help you?";
    }

    return {
      id: uid(),
      role: "bot",
      text,
      displayText: text,
      quickActions,
      timestamp: new Date(),
    };
  }, [fr, getPageContext, quickActions]);

  /* ---- knowledge-base powered response ---------------------------- */

  const matchKeywords = (text: string): ChatMessage => {
    const result = findBestResponse(text, fr);
    return {
      id: uid(),
      role: "bot",
      text: result.text,
      quickActions: result.quickActions,
      followUps: result.followUps,
      timestamp: new Date(),
    };
  };

  /* ---- chat persistence ------------------------------------------ */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (parsed.length > 0) {
          setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp), displayText: m.text })));
          setHasOpened(true);
        }
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (messages.length > 0 && hasOpened) {
      try {
        const toSave = messages.slice(-20).map(({ id, role, text, quickActions, followUps, timestamp }) => ({
          id, role, text, quickActions, followUps, timestamp,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch { /* noop */ }
    }
  }, [messages, hasOpened]);

  /* ---- auto-scroll ----------------------------------------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ---- Escape key ------------------------------------------------ */

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  /* ---- cleanup --------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  /* ---- proactive bubble (show once per session after 6s) --------- */

  useEffect(() => {
    if (hasOpened) return;
    try {
      if (sessionStorage.getItem(PROACTIVE_KEY)) return;
    } catch { /* noop */ }

    const timer = setTimeout(() => {
      const ctx = getPageContext();
      let msg: string;
      if (ctx === "arrima" || ctx === "crs") {
        msg = fr ? "Besoin d'aide avec votre score?" : "Need help with your score?";
      } else if (ctx === "francisation") {
        msg = fr ? "Je peux vous aider à choisir un exercice!" : "I can help you pick an exercise!";
      } else {
        msg = fr ? "Besoin d'aide pour votre établissement?" : "Need help with your établissement?";
      }
      setProactiveBubble(msg);
      try { sessionStorage.setItem(PROACTIVE_KEY, "1"); } catch { /* noop */ }

      // Auto-dismiss after 8s
      setTimeout(() => setProactiveBubble(null), 8000);
    }, PROACTIVE_DELAY);

    return () => clearTimeout(timer);
  }, [hasOpened, fr, getPageContext]);

  /* ---- open handler ---------------------------------------------- */

  const handleOpen = useCallback(() => {
    setOpen(true);
    setProactiveBubble(null);
    if (!hasOpened) {
      setHasOpened(true);
      setMessages([welcomeMessage()]);
    }
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [hasOpened, welcomeMessage]);

  /* ---- typewriter effect ----------------------------------------- */

  const typewriterAppend = (botMsg: ChatMessage) => {
    const fullText = botMsg.text;
    let charIndex = 0;
    setMessages((prev) => [...prev, { ...botMsg, displayText: "" }]);

    typewriterRef.current = setInterval(() => {
      charIndex++;
      if (charIndex >= fullText.length) {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        typewriterRef.current = null;
        setMessages((prev) => prev.map((m) => (m.id === botMsg.id ? { ...m, displayText: fullText } : m)));
      } else {
        setMessages((prev) => prev.map((m) => m.id === botMsg.id ? { ...m, displayText: fullText.slice(0, charIndex) } : m));
      }
    }, CHAR_SPEED);
  };

  /* ---- send ------------------------------------------------------ */

  const handleSend = (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: uid(), role: "user", text: trimmed, displayText: trimmed, timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botReply = matchKeywords(trimmed);
      typewriterAppend(botReply);
    }, TYPING_DELAY);
  };

  /* ---- voice input (STT) ----------------------------------------- */

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = typeof window !== "undefined"
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-CA";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  /* ---- copy to clipboard ----------------------------------------- */

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, copied: true } : m));
      setTimeout(() => {
        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, copied: false } : m));
      }, 2000);
    });
  };

  /* ---- feedback -------------------------------------------------- */

  const handleFeedback = (msgId: string, type: "up" | "down") => {
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m));
  };

  /* ---- time formatter -------------------------------------------- */

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(fr ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit" });

  const showBadge = !hasOpened;
  const hasSpeechRecognition = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <>
      {/* -------- Proactive bubble --------------------------------- */}
      {proactiveBubble && !open && (
        <div
          className="fixed z-[9998] animate-slideUp cursor-pointer"
          style={{ bottom: 90, right: 24 }}
          onClick={handleOpen}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 max-w-[220px] relative">
            <p className="text-sm text-gray-700 font-medium">{proactiveBubble}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setProactiveBubble(null); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors"
            >
              <X size={10} />
            </button>
            {/* Triangle pointer */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45" />
          </div>
        </div>
      )}

      {/* -------- Floating toggle button --------------------------- */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label={fr ? "Ouvrir le chat" : "Open chat"}
          className="fixed z-[9999] flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer chat-fab-pulse"
          style={{ bottom: 24, right: 24, width: 56, height: 56, backgroundColor: BRAND.accent }}
        >
          <MessageCircle className="text-white" size={28} />
          {showBadge && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white text-xs font-bold badge-pop"
              style={{ width: 22, height: 22, backgroundColor: BRAND.gold }}
            >
              1
            </span>
          )}
        </button>
      )}

      {/* -------- Chat window -------------------------------------- */}
      {open && (
        <div className="fixed z-[9999] flex flex-col bg-white shadow-2xl chat-window sm:rounded-2xl sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[540px] bottom-0 right-0 w-full h-full sm:max-h-[min(540px,calc(100vh-48px))]">
          {/* --- Header ------------------------------------------- */}
          <div className="flex items-center justify-between px-4 py-3 sm:rounded-t-2xl shrink-0" style={{ backgroundColor: BRAND.primary }}>
            <div className="flex items-center gap-2 text-white">
              <Bot size={22} />
              <span className="font-semibold text-sm tracking-wide">etabli. Assistant</span>
              <Sparkles size={14} className="text-amber-300" />
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={fr ? "Fermer le chat" : "Close chat"}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* --- Messages area ------------------------------------ */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg) => {
              const isComplete = msg.displayText === msg.text || msg.displayText === undefined;
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end chat-msg-user" : "justify-start chat-msg-bot"}`}
                >
                  <div className={`max-w-[85%] flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {/* avatar */}
                    <div
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: msg.role === "bot" ? "#e6f5f0" : "#f3f4f6" }}
                    >
                      {msg.role === "bot" ? (
                        <Bot size={16} style={{ color: BRAND.accent }} />
                      ) : (
                        <User size={16} className="text-gray-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      {/* bubble */}
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          msg.role === "bot" ? "rounded-tl-sm text-gray-800" : "rounded-tr-sm text-white"
                        }`}
                        style={{ backgroundColor: msg.role === "bot" ? "#e6f5f0" : BRAND.accent }}
                      >
                        {renderMarkdown(msg.displayText || msg.text)}
                        {msg.role === "bot" && !isComplete && (
                          <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-text-bottom" />
                        )}
                      </div>

                      {/* Copy + Feedback buttons — only on bot messages once complete */}
                      {msg.role === "bot" && isComplete && (
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-1 rounded text-gray-300 hover:text-gray-500 transition-colors"
                            title={fr ? "Copier" : "Copy"}
                          >
                            {msg.copied ? <Check size={12} className="text-[#1D9E75]" /> : <Copy size={12} />}
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, "up")}
                            className={`p-1 rounded transition-colors ${msg.feedback === "up" ? "text-[#1D9E75]" : "text-gray-300 hover:text-gray-500"}`}
                            title={fr ? "Utile" : "Helpful"}
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, "down")}
                            className={`p-1 rounded transition-colors ${msg.feedback === "down" ? "text-red-400" : "text-gray-300 hover:text-gray-500"}`}
                            title={fr ? "Pas utile" : "Not helpful"}
                          >
                            <ThumbsDown size={12} />
                          </button>
                        </div>
                      )}

                      {/* quick actions */}
                      {msg.quickActions && msg.quickActions.length > 0 && isComplete && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {msg.quickActions.map((qa) => (
                            <a
                              key={qa.href}
                              href={qa.href}
                              className="inline-block rounded-full border text-xs font-medium px-3 py-1.5 transition-colors border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white"
                            >
                              {qa.label}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Follow-up suggestions */}
                      {msg.followUps && msg.followUps.length > 0 && isComplete && (
                        <div className="flex flex-col gap-1 mt-2">
                          {msg.followUps.map((fu, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(fu.query)}
                              disabled={isTyping}
                              className="text-left text-xs text-[#1D9E75] hover:text-[#085041] hover:bg-[#E1F5EE] px-3 py-1.5 rounded-lg transition-colors border border-[#1D9E75]/20 disabled:opacity-50"
                            >
                              {fu.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* timestamp */}
                      <p className="text-[10px] text-gray-400 mt-1 px-1">{fmtTime(msg.timestamp)}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start chat-msg-bot">
                <div className="flex gap-2">
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: "#e6f5f0" }}>
                    <Bot size={16} style={{ color: BRAND.accent }} />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: "#e6f5f0" }}>
                    <div className="typing-indicator flex gap-1">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* --- Input bar ----------------------------------------- */}
          <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-2 sm:rounded-b-2xl">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              {/* Voice input button */}
              {hasSpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={isListening ? (fr ? "Arrêter" : "Stop") : (fr ? "Parler" : "Speak")}
                  className={`flex items-center justify-center rounded-full w-9 h-9 transition-all btn-press ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse-ring"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? (fr ? "Parlez maintenant..." : "Speak now...")
                    : (fr ? "Posez votre question\u2026" : "Ask your question\u2026")
                }
                disabled={isTyping}
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label={fr ? "Envoyer" : "Send"}
                className="flex items-center justify-center rounded-full w-9 h-9 text-white transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-default btn-press"
                style={{ backgroundColor: BRAND.accent }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
