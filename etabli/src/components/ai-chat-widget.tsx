"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Bonjour ! 👋 Je suis l'assistant virtuel de SOS Hub Canada. Comment puis-je vous aider avec votre projet d'établissement au Canada ?",
  timestamp: Date.now(),
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.filter(m => m !== WELCOME_MESSAGE).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/crm/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, mode: "client" }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "Désolé, une erreur est survenue.";

      const botMsg: ChatMessage = { role: "assistant", content: reply, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);

      if (!isOpen) setUnread(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Désolé, je ne suis pas disponible pour le moment. Veuillez réessayer plus tard ou contactez-nous directement.",
        timestamp: Date.now(),
      }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    if (!isOpen) setUnread(0);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  };

  // Format markdown-like content
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- /g, '\n• ')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "min(580px, calc(100vh - 120px))" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: "#1B2559" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#D4A03C" }}>
                <Bot size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm">Assistant SOS Hub</div>
                <div className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                  En ligne • Propulsé par IA
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                <Minimize2 size={16} />
              </button>
              <button onClick={toggleOpen} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant" ? "bg-[#1B2559]" : "bg-[#D4A03C]"
                }`}>
                  {msg.role === "assistant" ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
                </div>
                <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                  <div className={`inline-block px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#1B2559] text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm"
                  }`}
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                  <div className="text-[10px] text-gray-400 mt-0.5 px-1">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1B2559] flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-gray-50 border-t flex gap-2 overflow-x-auto">
              {[
                "Programmes d'établissement",
                "Permis de travail",
                "Résidence permanente",
                "Prendre RDV",
              ].map(q => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-[#1B2559] transition whitespace-nowrap flex-shrink-0">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre question..."
                rows={1}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A03C] focus:border-transparent max-h-20"
                style={{ minHeight: "38px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl text-white transition-all disabled:opacity-40"
                style={{ background: input.trim() ? "#D4A03C" : "#ccc" }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="text-[10px] text-gray-400 text-center mt-1.5">
              SOS Hub Canada • Cet assistant ne remplace pas un avis juridique
            </div>
          </div>
        </div>
      )}

      {/* Minimized bar */}
      {isOpen && isMinimized && (
        <div className="fixed bottom-20 right-4 z-50 bg-[#1B2559] text-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:shadow-xl transition"
          onClick={() => setIsMinimized(false)}>
          <Bot size={16} className="text-[#D4A03C]" />
          <span className="text-sm font-medium">Assistant SOS Hub</span>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl group"
        style={{ background: isOpen ? "#1B2559" : "#D4A03C" }}
        title="Assistant virtuel"
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <>
            <MessageCircle size={24} className="text-white" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {unread}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
