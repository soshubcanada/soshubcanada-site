"use client";
import { useState } from "react";
import {
  X, Bell, AlertTriangle, FileText, FolderOpen, Info,
  CheckCircle, XCircle, Clock,
} from "lucide-react";
import type { Notification, NotificationCategory } from "@/lib/notifications";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const CATEGORY_ICONS: Record<NotificationCategory, typeof Bell> = {
  alerte: AlertTriangle,
  document: FileText,
  dossier: FolderOpen,
  systeme: Info,
  rdv: Clock,
};

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-600',
  warning: 'bg-amber-100 text-amber-600',
  error: 'bg-red-100 text-red-600',
  success: 'bg-green-100 text-green-600',
};

type FilterTab = 'toutes' | 'alerte' | 'document' | 'dossier';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'alerte', label: 'Alertes' },
  { key: 'document', label: 'Documents' },
  { key: 'dossier', label: 'Dossiers' },
];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Il y a ${diffD}j`;
  return new Date(dateStr).toLocaleDateString('fr-CA');
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('toutes');

  const filtered = activeTab === 'toutes'
    ? notifications
    : notifications.filter(n => n.category === activeTab);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: '#1B2559' }}>
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-white" />
            <div>
              <h2 className="text-base font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-white/60">{unreadCount} non lue(s)</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-medium px-3 py-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Tout marquer lu
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-2 border-b border-gray-200 flex gap-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              style={activeTab === tab.key ? { backgroundColor: '#D4A03C' } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle size={40} className="mb-3 text-gray-300" />
              <p className="text-sm font-medium">Aucune notification</p>
              <p className="text-xs mt-1">Tout est en ordre</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(notif => {
                const Icon = CATEGORY_ICONS[notif.category] || Bell;
                const colorClass = TYPE_COLORS[notif.type] || TYPE_COLORS.info;
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && onMarkRead(notif.id)}
                    className={`px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        {notif.type === 'error' ? <XCircle size={16} /> :
                         notif.type === 'warning' ? <AlertTriangle size={16} /> :
                         notif.type === 'success' ? <CheckCircle size={16} /> :
                         <Icon size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 truncate">{notif.title}</span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#D4A03C' }} />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
