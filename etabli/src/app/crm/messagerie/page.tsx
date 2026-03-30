"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCrm, DEMO_USERS } from "@/lib/crm-store";
import type { CrmUser } from "@/lib/crm-types";
import {
  MessageSquare, Send, Search, Clock,
  Phone, Video, Paperclip, Smile, ChevronLeft, Hash,
  Pin, Star, MoreVertical, CheckCheck, Settings,
  User, X, Plus, AtSign, Bold, Italic, Link2,
  Reply, Pencil, Trash2, Copy, UserPlus, Shield,
  ChevronDown, Filter, Image, FileText, Mic,
  ThumbsUp, Heart, PartyPopper, AlertCircle,
  Users, Globe, Lock, Archive, Bell, BellOff,
  ExternalLink, CircleDot,
} from "lucide-react";

// ============================================================
// Types
// ============================================================

type AvailabilityStatus = "disponible" | "occupe" | "pause" | "absent" | "hors_ligne";

interface Reaction {
  emoji: string;
  userIds: string[];
}

interface Attachment {
  id: string;
  name: string;
  type: "image" | "file" | "link";
  url?: string;
  size?: string;
}

interface ChatMessage {
  id: string;
  fromId: string;
  toId: string;
  channel: string;
  content: string;
  timestamp: string;
  read: boolean;
  pinned?: boolean;
  starred?: boolean;
  replyTo?: string;
  replyPreview?: string;
  editedAt?: string;
  reactions?: Reaction[];
  attachments?: Attachment[];
  deleted?: boolean;
}

interface Channel {
  id: string;
  name: string;
  icon: "hash" | "alert" | "users" | "lock" | "globe";
  description: string;
  isPrivate?: boolean;
  members?: string[];
  createdBy?: string;
}

interface ExternalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isExternal: true;
  active: boolean;
}

// ============================================================
// Constants
// ============================================================

const STORAGE_KEY = "soshub_chat_messages";
const STATUS_KEY = "soshub_user_status";
const CHANNELS_KEY = "soshub_chat_channels";
const EXTERNAL_USERS_KEY = "soshub_external_users";

const DEFAULT_CHANNELS: Channel[] = [
  { id: "general", name: "Général", icon: "hash", description: "Discussion générale de l'équipe" },
  { id: "urgent", name: "Urgent", icon: "alert", description: "Communications urgentes seulement" },
  { id: "dossiers", name: "Dossiers", icon: "hash", description: "Discussion sur les dossiers clients" },
  { id: "annonces", name: "Annonces", icon: "lock", description: "Annonces officielles de la direction", isPrivate: true },
  { id: "general-tech", name: "Technique", icon: "hash", description: "Support technique et questions IT" },
];

const STATUS_CONFIG: Record<AvailabilityStatus, { label: string; color: string; dot: string; bg: string }> = {
  disponible: { label: "Disponible", color: "text-green-600", dot: "bg-green-500", bg: "bg-green-50" },
  occupe: { label: "Occupé", color: "text-red-600", dot: "bg-red-500", bg: "bg-red-50" },
  pause: { label: "En pause", color: "text-amber-600", dot: "bg-amber-500", bg: "bg-amber-50" },
  absent: { label: "Absent", color: "text-gray-600", dot: "bg-gray-400", bg: "bg-gray-50" },
  hors_ligne: { label: "Hors ligne", color: "text-gray-400", dot: "bg-gray-300", bg: "bg-gray-50" },
};

const QUICK_REACTIONS = ["👍", "❤️", "🎉", "👀", "🙏", "😂"];

const NAVY = "#1B2559";
const GOLD = "#D4A03C";

// ============================================================
// Helpers
// ============================================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  return new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
}

function dmKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

// ============================================================
// Sub-components
// ============================================================

function Avatar({ userId, size = "md", showStatus = false, status, allUsers }: {
  userId: string; size?: "xs" | "sm" | "md" | "lg"; showStatus?: boolean;
  status?: AvailabilityStatus; allUsers: (CrmUser | ExternalUser)[];
}) {
  const user = allUsers.find(u => u.id === userId);
  const name = user?.name || "?";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isExternal = user && "isExternal" in user;
  const dims = { xs: "w-6 h-6 text-[9px]", sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" };
  const dotDims = { xs: "w-2 h-2", sm: "w-2 h-2", md: "w-3 h-3", lg: "w-3.5 h-3.5" };
  const colors = [
    "bg-[#1B2559]", "bg-emerald-600", "bg-violet-600", "bg-rose-600",
    "bg-cyan-600", "bg-orange-600", "bg-indigo-600", "bg-teal-600",
  ];
  const colorIdx = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

  return (
    <div className="relative shrink-0">
      <div className={`${dims[size]} rounded-full ${colors[colorIdx]} text-white flex items-center justify-center font-bold`}>
        {initials}
      </div>
      {isExternal && (
        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
          <Globe className="w-2 h-2 text-white" />
        </div>
      )}
      {showStatus && status && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${dotDims[size]} rounded-full border-2 border-white ${STATUS_CONFIG[status].dot}`} />
      )}
    </div>
  );
}

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{formatDate(date)}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function MessageriePage() {
  const { currentUser } = useCrm();

  // ── State ──────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AvailabilityStatus>>({});
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [externalUsers, setExternalUsers] = useState<ExternalUser[]>([]);

  const [activeChannel, setActiveChannel] = useState("general");
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatMessage[] | null>(null);

  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [showNewDM, setShowNewDM] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null); // message id
  const [showChannelCreate, setShowChannelCreate] = useState(false);
  const [showUserInvite, setShowUserInvite] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [contextMenu, setContextMenu] = useState<{ msgId: string; x: number; y: number } | null>(null);
  const [pinnedOpen, setPinnedOpen] = useState(false);

  // New channel form
  const [newChName, setNewChName] = useState("");
  const [newChDesc, setNewChDesc] = useState("");
  const [newChPrivate, setNewChPrivate] = useState(false);

  // Invite form
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Externe");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // All users (CRM + external)
  const allUsers = useMemo<(CrmUser | ExternalUser)[]>(() => [
    ...DEMO_USERS.filter(u => u.active),
    ...externalUsers.filter(u => u.active),
  ], [externalUsers]);

  // ── Persistence ────────────────────────────────────────
  useEffect(() => {
    try {
      const s1 = localStorage.getItem(STORAGE_KEY); if (s1) setMessages(JSON.parse(s1));
      const s2 = localStorage.getItem(STATUS_KEY); if (s2) setStatuses(JSON.parse(s2));
      const s3 = localStorage.getItem(CHANNELS_KEY); if (s3) setChannels(JSON.parse(s3));
      const s4 = localStorage.getItem(EXTERNAL_USERS_KEY); if (s4) setExternalUsers(JSON.parse(s4));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { if (messages.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-500))); }, [messages]);
  useEffect(() => { if (Object.keys(statuses).length) localStorage.setItem(STATUS_KEY, JSON.stringify(statuses)); }, [statuses]);
  useEffect(() => { localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels)); }, [channels]);
  useEffect(() => { if (externalUsers.length) localStorage.setItem(EXTERNAL_USERS_KEY, JSON.stringify(externalUsers)); }, [externalUsers]);

  // Auto-set status
  useEffect(() => {
    if (currentUser && !statuses[currentUser.id]) {
      setStatuses(prev => ({ ...prev, [currentUser.id]: "disponible" }));
    }
  }, [currentUser, statuses]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChannel, activeDM]);

  // Close context menu on click elsewhere
  useEffect(() => {
    const close = () => { setContextMenu(null); setShowEmojiPicker(null); };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ── Derived ────────────────────────────────────────────
  const myStatus = currentUser ? (statuses[currentUser.id] || "hors_ligne") : "hors_ligne";

  const currentMessages = useMemo(() => {
    const key = activeDM ? dmKey(currentUser?.id || "", activeDM) : activeChannel;
    return messages.filter(m => m.channel === key && !m.deleted);
  }, [messages, activeChannel, activeDM, currentUser]);

  const pinnedMessages = useMemo(() => currentMessages.filter(m => m.pinned), [currentMessages]);

  const otherUsers = allUsers.filter(u => u.id !== currentUser?.id);

  const dmConversations = useMemo(() => {
    if (!currentUser) return [];
    return otherUsers.filter(u =>
      messages.some(m => m.channel === dmKey(currentUser.id, u.id) && !m.deleted)
    );
  }, [otherUsers, messages, currentUser]);

  const getUserName = (id: string) => allUsers.find(u => u.id === id)?.name || "Inconnu";

  // Unread counts
  const unreadForChannel = (chId: string) =>
    messages.filter(m => m.channel === chId && m.fromId !== currentUser?.id && !m.read && !m.deleted).length;
  const unreadForDM = (userId: string) =>
    messages.filter(m => m.channel === dmKey(currentUser?.id || "", userId) && m.fromId !== currentUser?.id && !m.read && !m.deleted).length;
  const totalUnread = channels.reduce((n, ch) => n + unreadForChannel(ch.id), 0)
    + otherUsers.reduce((n, u) => n + unreadForDM(u.id), 0);

  // Mark as read
  useEffect(() => {
    if (!currentUser) return;
    const key = activeDM ? dmKey(currentUser.id, activeDM) : activeChannel;
    setMessages(prev => prev.map(m =>
      m.channel === key && m.fromId !== currentUser.id && !m.read ? { ...m, read: true } : m
    ));
  }, [activeChannel, activeDM, currentUser]);

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(messages.filter(m =>
      !m.deleted && (m.content.toLowerCase().includes(q) || getUserName(m.fromId).toLowerCase().includes(q))
    ).slice(-30));
  }, [searchQuery, messages]);

  // ── Actions ────────────────────────────────────────────

  const setMyStatus = (s: AvailabilityStatus) => {
    if (!currentUser) return;
    setStatuses(prev => ({ ...prev, [currentUser.id]: s }));
    setShowStatusPicker(false);
  };

  const [sendError, setSendError] = useState<string | null>(null);
  const MAX_MESSAGE_LENGTH = 5000;

  const sendMessage = useCallback(() => {
    if (!currentUser) return;
    const trimmed = draft.trim();
    // Input validation
    if (!trimmed) {
      setSendError("Le message ne peut pas etre vide.");
      return;
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setSendError(`Le message ne peut pas depasser ${MAX_MESSAGE_LENGTH} caracteres.`);
      return;
    }
    setSendError(null);
    try {
      const msg: ChatMessage = {
        id: generateId(),
        fromId: currentUser.id,
        toId: activeDM || activeChannel,
        channel: activeDM ? dmKey(currentUser.id, activeDM) : activeChannel,
        content: trimmed,
        timestamp: new Date().toISOString(),
        read: false,
        replyTo: replyingTo?.id,
        replyPreview: replyingTo ? `${getUserName(replyingTo.fromId)}: ${replyingTo.content.slice(0, 80)}` : undefined,
      };
      setMessages(prev => [...prev, msg]);
      setDraft("");
      setReplyingTo(null);
      inputRef.current?.focus();
    } catch {
      setSendError("Erreur lors de l'envoi du message. Veuillez reessayer.");
    }
  }, [draft, currentUser, activeDM, activeChannel, replyingTo]);

  const toggleReaction = (msgId: string, emoji: string) => {
    if (!currentUser) return;
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const reactions = [...(m.reactions || [])];
      const existing = reactions.find(r => r.emoji === emoji);
      if (existing) {
        if (existing.userIds.includes(currentUser.id)) {
          existing.userIds = existing.userIds.filter(id => id !== currentUser.id);
          if (existing.userIds.length === 0) return { ...m, reactions: reactions.filter(r => r.emoji !== emoji) };
        } else {
          existing.userIds.push(currentUser.id);
        }
      } else {
        reactions.push({ emoji, userIds: [currentUser.id] });
      }
      return { ...m, reactions };
    }));
    setShowEmojiPicker(null);
  };

  const togglePin = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, pinned: !m.pinned } : m));
  };

  const toggleStar = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, starred: !m.starred } : m));
  };

  const deleteMessage = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted: true, content: "Message supprimé" } : m));
    setContextMenu(null);
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingMsg(msg.id);
    setEditDraft(msg.content);
    setContextMenu(null);
  };

  const saveEdit = (msgId: string) => {
    if (!editDraft.trim()) return;
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, content: editDraft.trim(), editedAt: new Date().toISOString() } : m
    ));
    setEditingMsg(null);
    setEditDraft("");
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setContextMenu(null);
  };

  const [channelError, setChannelError] = useState<string | null>(null);

  const createChannel = () => {
    const name = newChName.trim();
    if (!name) { setChannelError("Le nom du canal est requis."); return; }
    if (name.length < 2 || name.length > 50) { setChannelError("Le nom doit contenir entre 2 et 50 caracteres."); return; }
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    // Check for duplicate channel names
    if (channels.some(c => c.id === slug || c.name.toLowerCase() === name.toLowerCase())) {
      setChannelError("Un canal avec ce nom existe deja.");
      return;
    }
    setChannelError(null);
    const ch: Channel = {
      id: slug || generateId(),
      name,
      icon: newChPrivate ? "lock" : "hash",
      description: newChDesc.trim() || `Canal ${name}`,
      isPrivate: newChPrivate,
      createdBy: currentUser?.id,
    };
    setChannels(prev => [...prev, ch]);
    setNewChName(""); setNewChDesc(""); setNewChPrivate(false);
    setShowChannelCreate(false);
    selectChannel(ch.id);
  };

  const [inviteError, setInviteError] = useState<string | null>(null);

  const inviteUser = () => {
    const trimmedName = inviteName.trim();
    const trimmedEmail = inviteEmail.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail) {
      setInviteError("Le nom et le courriel sont requis.");
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setInviteError("Le nom doit contenir entre 2 et 100 caracteres.");
      return;
    }
    // Email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setInviteError("Veuillez entrer une adresse courriel valide.");
      return;
    }
    // Check for duplicate email
    if (externalUsers.some(u => u.email.toLowerCase() === trimmedEmail && u.active) ||
        DEMO_USERS.some(u => u.email?.toLowerCase() === trimmedEmail)) {
      setInviteError("Un utilisateur avec ce courriel existe deja.");
      return;
    }
    setInviteError(null);
    const ext: ExternalUser = {
      id: `ext-${generateId()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: inviteRole,
      isExternal: true,
      active: true,
    };
    setExternalUsers(prev => [...prev, ext]);
    setInviteName(""); setInviteEmail(""); setInviteRole("Externe");
    setShowUserInvite(false);
    // Auto-set online
    setStatuses(prev => ({ ...prev, [ext.id]: "disponible" }));
  };

  const removeUser = (userId: string) => {
    setExternalUsers(prev => prev.map(u => u.id === userId ? { ...u, active: false } : u));
  };

  const selectChannel = (id: string) => {
    setActiveChannel(id); setActiveDM(null); setShowMobileList(false);
    setReplyingTo(null); setPinnedOpen(false);
  };

  const selectDM = (userId: string) => {
    setActiveDM(userId); setShowMobileList(false);
    setReplyingTo(null); setPinnedOpen(false);
  };

  // ── Active conversation info ───────────────────────────
  const activeTitle = activeDM ? getUserName(activeDM) : channels.find(c => c.id === activeChannel)?.name || "";
  const activeDesc = activeDM
    ? STATUS_CONFIG[statuses[activeDM] || "hors_ligne"]?.label
    : channels.find(c => c.id === activeChannel)?.description || "";
  const activeIcon = channels.find(c => c.id === activeChannel)?.icon;

  // ── Gate ────────────────────────────────────────────────
  if (!currentUser) return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-gray-400">Connectez-vous pour accéder à la messagerie</p>
    </div>
  );

  // ── Date grouping helper ───────────────────────────────
  const messagesWithDates: (ChatMessage | { type: "date"; date: string })[] = [];
  let lastDate = "";
  for (const msg of currentMessages) {
    const d = new Date(msg.timestamp).toDateString();
    if (d !== lastDate) { messagesWithDates.push({ type: "date", date: msg.timestamp }); lastDate = d; }
    messagesWithDates.push(msg);
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">

      {/* ══════════════════════════════════════════════════════
          LEFT SIDEBAR
          ══════════════════════════════════════════════════════ */}
      <div className={`w-64 shrink-0 bg-[#0F1635] text-white flex-col ${showMobileList ? "flex" : "hidden md:flex"}`}>

        {/* Workspace header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold tracking-tight">SOS Hub Canada</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowChannelCreate(true)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" title="Créer un canal">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setShowUserInvite(true)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" title="Inviter un utilisateur">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* My status */}
          <div className="relative">
            <button onClick={() => setShowStatusPicker(!showStatusPicker)}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Avatar userId={currentUser.id} size="sm" showStatus status={myStatus} allUsers={allUsers} />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-[10px] text-white/50">{STATUS_CONFIG[myStatus].label}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </button>
            {showStatusPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1B2559] rounded-lg shadow-xl border border-white/10 z-30 py-1">
                {(Object.keys(STATUS_CONFIG) as AvailabilityStatus[]).filter(s => s !== "hors_ligne").map(s => (
                  <button key={s} onClick={() => setMyStatus(s)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 ${myStatus === s ? "bg-white/5" : ""}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher messages..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/20 outline-none" />
          </div>
        </div>

        {/* Search results */}
        {searchResults && (
          <div className="px-3 pb-2">
            <div className="bg-white/5 rounded-lg p-2 max-h-40 overflow-y-auto">
              <p className="text-[10px] text-white/40 mb-1">{searchResults.length} résultat(s)</p>
              {searchResults.map(m => (
                <button key={m.id} onClick={() => {
                  if (m.channel.includes(":")) { const parts = m.channel.split(":"); selectDM(parts[0] === currentUser.id ? parts[1] : parts[0]); }
                  else selectChannel(m.channel);
                  setSearchQuery("");
                }} className="w-full text-left p-1.5 rounded hover:bg-white/10 text-xs">
                  <span className="text-white/60">{getUserName(m.fromId)}:</span>{" "}
                  <span className="text-white/90">{m.content.slice(0, 60)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {/* Channels */}
          <div className="px-2 pt-2">
            <div className="flex items-center justify-between px-2 mb-1">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Canaux</p>
              <button onClick={() => setShowChannelCreate(true)} className="text-white/30 hover:text-white/60"><Plus className="w-3 h-3" /></button>
            </div>
            {channels.map(ch => {
              const unread = unreadForChannel(ch.id);
              const isActive = !activeDM && activeChannel === ch.id;
              return (
                <button key={ch.id} onClick={() => selectChannel(ch.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors mb-px ${
                    isActive ? "bg-white/15 text-white font-medium" : "text-white/60 hover:bg-white/5 hover:text-white/80"
                  }`}>
                  {ch.isPrivate ? <Lock className="w-3.5 h-3.5 shrink-0" /> : <Hash className="w-3.5 h-3.5 shrink-0" />}
                  <span className="flex-1 text-left truncate">{ch.name}</span>
                  {unread > 0 && (
                    <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{unread}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Direct Messages */}
          <div className="px-2 pt-4">
            <div className="flex items-center justify-between px-2 mb-1">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Messages directs</p>
              <button onClick={() => setShowNewDM(!showNewDM)} className="text-white/30 hover:text-white/60"><Plus className="w-3 h-3" /></button>
            </div>

            {showNewDM && (
              <div className="mb-2 mx-1 p-2 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] text-white/40 mb-1.5">Nouvelle conversation</p>
                {otherUsers.filter(u => !dmConversations.some(d => d.id === u.id)).map(u => (
                  <button key={u.id} onClick={() => { selectDM(u.id); setShowNewDM(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded text-sm text-white/70 hover:bg-white/10 transition-colors">
                    <Avatar userId={u.id} size="xs" showStatus status={statuses[u.id] || "hors_ligne"} allUsers={allUsers} />
                    <span className="truncate">{u.name}</span>
                    {"isExternal" in u && <Globe className="w-3 h-3 text-blue-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {/* DM list — conversations with messages first, then others */}
            {[...dmConversations, ...otherUsers.filter(u => !dmConversations.some(d => d.id === u.id))].map(u => {
              const unread = unreadForDM(u.id);
              const isActive = activeDM === u.id;
              const lastMsg = messages.filter(m => m.channel === dmKey(currentUser.id, u.id) && !m.deleted).slice(-1)[0];
              const userStatus = statuses[u.id] || "hors_ligne";
              return (
                <button key={u.id} onClick={() => selectDM(u.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors mb-px ${
                    isActive ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/80"
                  }`}>
                  <Avatar userId={u.id} size="sm" showStatus status={userStatus} allUsers={allUsers} />
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1">
                      <p className={`text-sm truncate ${unread > 0 ? "font-bold text-white" : "font-medium"}`}>{u.name}</p>
                      {"isExternal" in u && <Globe className="w-3 h-3 text-blue-400 shrink-0" />}
                    </div>
                    {lastMsg && (
                      <p className="text-[11px] truncate text-white/30">
                        {lastMsg.fromId === currentUser.id ? "Vous: " : ""}{lastMsg.content}
                      </p>
                    )}
                  </div>
                  {unread > 0 && (
                    <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{unread}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Team presence footer */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />{Object.values(statuses).filter(s => s === "disponible").length}</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />{Object.values(statuses).filter(s => s === "occupe").length}</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" />{Object.values(statuses).filter(s => s === "pause").length}</span>
            <span className="flex-1" />
            <button onClick={() => setShowMembersPanel(!showMembersPanel)} className="text-white/30 hover:text-white/60">
              <Users className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN CHAT AREA
          ══════════════════════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col min-w-0 bg-gray-50 ${showMobileList ? "hidden md:flex" : "flex"}`}>

        {/* Chat Header */}
        <div className="px-4 py-2.5 border-b border-gray-200 bg-white flex items-center gap-3">
          <button onClick={() => setShowMobileList(true)} className="md:hidden text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {activeDM ? (
            <Avatar userId={activeDM} size="md" showStatus status={statuses[activeDM] || "hors_ligne"} allUsers={allUsers} />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
              {activeIcon === "lock" ? <Lock className="w-4 h-4 text-gray-500" /> : <Hash className="w-4 h-4 text-gray-500" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{activeDM ? "" : "#"}{activeTitle}</p>
            <p className="text-xs text-gray-500 truncate">{activeDesc}</p>
          </div>
          <div className="flex items-center gap-0.5">
            {pinnedMessages.length > 0 && (
              <button onClick={() => setPinnedOpen(!pinnedOpen)}
                className={`p-2 rounded-lg transition-colors ${pinnedOpen ? "bg-amber-50 text-amber-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                title={`${pinnedMessages.length} message(s) épinglé(s)`}>
                <Pin className="w-4 h-4" />
              </button>
            )}
            {activeDM && (
              <>
                <button className="p-2 rounded-lg text-gray-400 hover:text-[#1B2559] hover:bg-gray-100 transition-colors" title="Appel audio"><Phone className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg text-gray-400 hover:text-[#1B2559] hover:bg-gray-100 transition-colors" title="Appel vidéo"><Video className="w-4 h-4" /></button>
              </>
            )}
            <button onClick={() => setShowMembersPanel(!showMembersPanel)}
              className={`p-2 rounded-lg transition-colors ${showMembersPanel ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pinned messages bar */}
        {pinnedOpen && pinnedMessages.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 max-h-32 overflow-y-auto">
            <p className="text-[10px] font-semibold text-amber-700 uppercase mb-1">Messages épinglés</p>
            {pinnedMessages.map(m => (
              <div key={m.id} className="flex items-start gap-2 py-1 text-xs">
                <Pin className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                <span className="font-medium text-amber-800">{getUserName(m.fromId)}:</span>
                <span className="text-amber-700 truncate">{m.content}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {currentMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <MessageSquare className="w-8 h-8 opacity-30" />
                </div>
                <p className="text-sm font-medium">Aucun message</p>
                <p className="text-xs mt-1 text-gray-400">
                  {activeDM ? `Commencez une conversation avec ${getUserName(activeDM)}` : `Soyez le premier à écrire dans #${activeTitle}`}
                </p>
              </div>
            )}
            {messagesWithDates.map((item, i) => {
              if ("type" in item) return <DateSeparator key={`d-${i}`} date={item.date} />;
              const msg = item;
              const isMe = msg.fromId === currentUser.id;
              const prevMsg = i > 0 && !("type" in messagesWithDates[i - 1]) ? messagesWithDates[i - 1] as ChatMessage : null;
              const showAvatar = !prevMsg || prevMsg.fromId !== msg.fromId ||
                (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 300000);

              return (
                <div key={msg.id}
                  className={`group relative px-2 py-0.5 rounded-lg hover:bg-white/80 transition-colors ${showAvatar ? "mt-3" : "mt-0"}`}
                  onContextMenu={e => { e.preventDefault(); setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY }); }}>
                  <div className="flex gap-2.5">
                    {showAvatar ? (
                      <Avatar userId={msg.fromId} size="sm" allUsers={allUsers} />
                    ) : <div className="w-7 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-bold text-gray-900">{isMe ? "Vous" : getUserName(msg.fromId)}</span>
                          {allUsers.find(u => u.id === msg.fromId && "isExternal" in u) && (
                            <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">EXTERNE</span>
                          )}
                          <span className="text-[11px] text-gray-400">{formatTime(msg.timestamp)}</span>
                          {msg.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                        </div>
                      )}

                      {/* Reply preview */}
                      {msg.replyPreview && (
                        <div className="flex items-center gap-1.5 mb-1 pl-3 border-l-2 border-gray-300">
                          <Reply className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-[11px] text-gray-500 truncate">{msg.replyPreview}</span>
                        </div>
                      )}

                      {/* Message content */}
                      {editingMsg === msg.id ? (
                        <div className="flex gap-2">
                          <input value={editDraft} onChange={e => setEditDraft(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveEdit(msg.id); if (e.key === "Escape") setEditingMsg(null); }}
                            className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none"
                            autoFocus />
                          <button onClick={() => saveEdit(msg.id)} className="text-xs text-blue-600 font-medium">Sauver</button>
                          <button onClick={() => setEditingMsg(null)} className="text-xs text-gray-400">Annuler</button>
                        </div>
                      ) : (
                        <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                      {msg.editedAt && <span className="text-[10px] text-gray-400">(modifié)</span>}

                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.reactions.map(r => (
                            <button key={r.emoji} onClick={() => toggleReaction(msg.id, r.emoji)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                                r.userIds.includes(currentUser.id)
                                  ? "bg-blue-50 border-blue-200 text-blue-700"
                                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                              }`}>
                              <span>{r.emoji}</span>
                              <span className="font-medium">{r.userIds.length}</span>
                            </button>
                          ))}
                          <button onClick={e => { e.stopPropagation(); setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id); }}
                            className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover action bar */}
                  <div className="absolute -top-3 right-2 hidden group-hover:flex items-center gap-0.5 bg-white rounded-lg shadow-md border border-gray-200 px-1 py-0.5">
                    {QUICK_REACTIONS.slice(0, 3).map(emoji => (
                      <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                        className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-sm">{emoji}</button>
                    ))}
                    <div className="w-px h-4 bg-gray-200 mx-0.5" />
                    <button onClick={() => setReplyingTo(msg)} className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400" title="Répondre">
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => togglePin(msg.id)} className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400" title="Épingler">
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY }); }}
                      className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Emoji picker dropdown */}
                  {showEmojiPicker === msg.id && (
                    <div className="absolute top-full right-2 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-30 flex gap-1"
                      onClick={e => e.stopPropagation()}>
                      {QUICK_REACTIONS.map(emoji => (
                        <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                          className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-lg">{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Members Panel (right sidebar) */}
          {showMembersPanel && (
            <div className="w-56 border-l border-gray-200 bg-white overflow-y-auto shrink-0">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700">Membres ({allUsers.length})</p>
                  <button onClick={() => setShowUserInvite(true)} className="text-gray-400 hover:text-gray-600">
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {allUsers.map(u => {
                const st = statuses[u.id] || "hors_ligne";
                const isExt = "isExternal" in u;
                return (
                  <div key={u.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 group">
                    <Avatar userId={u.id} size="sm" showStatus status={st} allUsers={allUsers} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium text-gray-800 truncate">{u.name}</p>
                        {isExt && <Globe className="w-3 h-3 text-blue-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-gray-400">{u.role || (u as CrmUser).role}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[st].dot}`} />
                    {isExt && (
                      <button onClick={() => removeUser(u.id)} className="hidden group-hover:block text-gray-300 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply bar */}
        {replyingTo && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center gap-2">
            <Reply className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-blue-700">{getUserName(replyingTo.fromId)}</span>
              <p className="text-xs text-blue-600 truncate">{replyingTo.content}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-blue-400 hover:text-blue-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#D4A03C] focus-within:ring-1 focus-within:ring-[#D4A03C]/30 transition-colors">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={activeDM ? `Message à ${getUserName(activeDM)}...` : `Message dans #${activeTitle}...`}
              rows={1}
              className="w-full px-4 py-2.5 text-sm resize-none outline-none bg-transparent"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50/50">
              <div className="flex items-center gap-0.5">
                <button className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Fichier"><Paperclip className="w-4 h-4" /></button>
                <button className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Image"><Image className="w-4 h-4" /></button>
                <button className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Mention"><AtSign className="w-4 h-4" /></button>
                <button className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Emoji"><Smile className="w-4 h-4" /></button>
              </div>
              <button onClick={sendMessage} disabled={!draft.trim()}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  draft.trim()
                    ? "bg-[#1B2559] text-white hover:bg-[#243070] shadow-sm"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          {sendError && (
            <div className="mt-1 px-1 flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {sendError}
              <button onClick={() => setSendError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
            </div>
          )}
          {draft.length > MAX_MESSAGE_LENGTH * 0.9 && (
            <div className={`mt-1 px-1 text-[10px] ${draft.length > MAX_MESSAGE_LENGTH ? 'text-red-500 font-medium' : 'text-amber-500'}`}>
              {draft.length}/{MAX_MESSAGE_LENGTH} caracteres
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-1 px-1">
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px]">Entree</kbd> envoyer &middot; <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px]">Shift+Entree</kbd> nouvelle ligne
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MODALS
          ══════════════════════════════════════════════════════ */}

      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 min-w-[180px]"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 300) }}
          onClick={e => e.stopPropagation()}>
          {(() => {
            const msg = messages.find(m => m.id === contextMenu.msgId);
            if (!msg) return null;
            const isMe = msg.fromId === currentUser.id;
            return (
              <>
                <button onClick={() => { setReplyingTo(msg); setContextMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Reply className="w-4 h-4 text-gray-400" /> Répondre</button>
                <button onClick={() => copyMessage(msg.content)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Copy className="w-4 h-4 text-gray-400" /> Copier</button>
                <button onClick={() => { togglePin(msg.id); setContextMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Pin className="w-4 h-4 text-gray-400" /> {msg.pinned ? "Désépingler" : "Épingler"}</button>
                <button onClick={() => { toggleStar(msg.id); setContextMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Star className="w-4 h-4 text-gray-400" /> {msg.starred ? "Retirer étoile" : "Ajouter étoile"}</button>
                {isMe && <>
                  <div className="my-1 h-px bg-gray-100" />
                  <button onClick={() => startEdit(msg)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Pencil className="w-4 h-4 text-gray-400" /> Modifier</button>
                  <button onClick={() => deleteMessage(msg.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /> Supprimer</button>
                </>}
              </>
            );
          })()}
        </div>
      )}

      {/* Create Channel Modal */}
      {showChannelCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowChannelCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Creer un canal</h3>
            {channelError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {channelError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nom du canal</label>
                <input value={newChName} onChange={e => setNewChName(e.target.value)} placeholder="ex: marketing"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <input value={newChDesc} onChange={e => setNewChDesc(e.target.value)} placeholder="De quoi parle ce canal?"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]/30 outline-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newChPrivate} onChange={e => setNewChPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1B2559] focus:ring-[#D4A03C]" />
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-700">Canal privé</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowChannelCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
              <button onClick={createChannel} disabled={!newChName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1B2559] rounded-lg hover:bg-[#243070] disabled:opacity-40">Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showUserInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowUserInvite(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-[#D4A03C]" />
              <h3 className="text-lg font-bold text-gray-900">Inviter un utilisateur</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Ajoutez des collaborateurs externes, partenaires, consultants ou membres d&apos;autres departements.</p>
            {inviteError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {inviteError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nom complet</label>
                <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Jean Dupont"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Courriel</label>
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="jean@exemple.com" type="email"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Rôle / Organisation</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]/30 outline-none bg-white">
                  <option>Externe</option>
                  <option>Consultant RCIC</option>
                  <option>Avocat</option>
                  <option>Partenaire</option>
                  <option>Comptable</option>
                  <option>Traducteur</option>
                  <option>Employeur</option>
                  <option>Autre</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowUserInvite(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
              <button onClick={inviteUser} disabled={!inviteName.trim() || !inviteEmail.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1B2559] rounded-lg hover:bg-[#243070] disabled:opacity-40">
                <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Inviter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
