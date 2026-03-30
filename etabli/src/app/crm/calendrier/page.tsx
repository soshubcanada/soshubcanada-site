"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useCrm, getUserName, DEMO_USERS } from "@/lib/crm-store";
import {
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_TYPE_COLORS,
  ROLE_PERMISSIONS,
} from "@/lib/crm-types";
import type { Appointment, AppointmentType } from "@/lib/crm-types";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Check,
  XCircle,
  Bell,
  Filter,
  CalendarDays,
  ClipboardList,
  Settings2,
  Send,
  RefreshCw,
  Ban,
  Mail,
  Link2,
  Copy,
  Trash2,
  Edit3,
  Globe,
  Eye,
  EyeOff,
  Palette,
} from "lucide-react";

// ============================================================
// Types
// ============================================================
interface AvailabilitySlot {
  start: string;
  end: string;
}

interface AvailabilityException {
  date: string;
  type: "blocked" | "reduced";
  hours?: AvailabilitySlot[];
  reason?: string;
}

interface EmployeeAvailability {
  weeklyTemplate: {
    [day: string]: AvailabilitySlot[];
  };
  exceptions: AvailabilityException[];
}

interface BookingRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  type: "consultation" | "suivi" | "juridique" | "administratif";
  preferredDate: string;
  preferredTime: string;
  duration: number;
  status: "pending" | "confirmed" | "refused" | "cancelled";
  assignedTo?: string;
  confirmedDate?: string;
  confirmedTime?: string;
  refusalReason?: string;
  notes?: string;
  createdAt: string;
}

// ============================================================
// Booking Channels (Calendly-like)
// Chaque canal = un lien de reservation unique
// Peut etre un employe, un service, un departement, ou un courriel generique
// ============================================================
interface BookingChannel {
  id: string;
  slug: string;             // URL slug: /rdv/{slug}
  name: string;             // "Patrick Cadet", "Service juridique", "Info general"
  title: string;            // "Directeur general", "Consultation generale"
  email: string;            // Courriel de notification (ex: info@soshubcanada.com)
  ccEmails: string[];       // Courriels supplementaires en copie
  bio: string;              // Description affichee sur la page de reservation
  color: string;            // Couleur du canal (#1B2559, #D4A03C, etc.)
  duration: number;         // Duree par defaut en minutes (30, 45, 60)
  types: string[];          // Types de RDV disponibles
  assignToUserId?: string;  // Si lie a un employe CRM (pour le calendrier)
  active: boolean;          // Canal actif ou non
  createdAt: string;
}

interface CalendarData {
  availability: {
    [employeeId: string]: EmployeeAvailability;
  };
  bookingRequests: BookingRequest[];
  bookingChannels?: BookingChannel[];
}

// ============================================================
// Constants
// ============================================================
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const JOURS_KEYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
const HOURS = Array.from({ length: 21 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

const DURATIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 h" },
  { value: 90, label: "1 h 30" },
  { value: 120, label: "2 h" },
];

const BOOKING_TYPE_LABELS: Record<BookingRequest["type"], string> = {
  consultation: "Consultation",
  suivi: "Suivi",
  juridique: "Juridique",
  administratif: "Administratif",
};

const BOOKING_TYPE_COLORS: Record<BookingRequest["type"], string> = {
  consultation: "#3B82F6",
  suivi: "#10B981",
  juridique: "#8B5CF6",
  administratif: "#6B7280",
};

const BOOKING_STATUS_LABELS: Record<BookingRequest["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  refused: "Refusé",
  cancelled: "Annulé",
};

const BOOKING_STATUS_COLORS: Record<BookingRequest["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  refused: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const STORAGE_KEY = "soshub_calendar_data";

// ============================================================
// Helpers
// ============================================================
function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function getDayKey(date: Date): string {
  const idx = (date.getDay() + 6) % 7; // 0=Mon
  return JOURS_KEYS[idx] ?? "";
}

function buildDefaultAvailability(): EmployeeAvailability {
  const template: { [day: string]: AvailabilitySlot[] } = {};
  for (const day of JOURS_KEYS) {
    template[day] = [
      { start: "09:00", end: "12:00" },
      { start: "13:00", end: "17:00" },
    ];
  }
  return { weeklyTemplate: template, exceptions: [] };
}

const DEFAULT_CHANNELS: BookingChannel[] = [
  {
    id: "ch-equipe",
    slug: "equipe-sos",
    name: "Equipe SOS Hub",
    title: "Consultation generale",
    email: "info@soshubcanada.com",
    ccEmails: [],
    bio: "Notre equipe d'experts en relocalisation et services d'etablissement",
    color: "#D4A03C",
    duration: 30,
    types: ["Consultation", "Suivi", "Juridique", "Administratif"],
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ch-patrick",
    slug: "patrick-cadet",
    name: "Patrick Cadet",
    title: "Directeur general",
    email: "pcadet@soshubcanada.com",
    ccEmails: ["info@soshubcanada.com"],
    bio: "Plus de 10 ans d'experience en relocalisation et services aux nouveaux arrivants",
    color: "#1B2559",
    duration: 30,
    types: ["Consultation", "Suivi", "Juridique", "Administratif"],
    assignToUserId: "u1",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

function loadCalendarData(): CalendarData {
  if (typeof window === "undefined") return { availability: {}, bookingRequests: [], bookingChannels: DEFAULT_CHANNELS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CalendarData;
      // Ensure channels exist (migration from old format)
      if (!parsed.bookingChannels || parsed.bookingChannels.length === 0) {
        parsed.bookingChannels = DEFAULT_CHANNELS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.error("Erreur lors du chargement des donnees calendrier:", e);
  }
  // Init default
  const data: CalendarData = { availability: {}, bookingRequests: [], bookingChannels: DEFAULT_CHANNELS };
  for (const u of DEMO_USERS) {
    data.availability[u.id] = buildDefaultAvailability();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function saveCalendarData(data: CalendarData) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function isSlotAvailable(
  employeeId: string,
  date: Date,
  time: string,
  data: CalendarData,
): boolean {
  const avail = data.availability[employeeId];
  if (!avail) return false;
  const dateStr = formatDate(date);
  const dayKey = getDayKey(date);
  const mins = timeToMinutes(time);

  // Check exceptions
  const exception = avail.exceptions.find((e) => e.date === dateStr);
  if (exception) {
    if (exception.type === "blocked") return false;
    if (exception.type === "reduced" && exception.hours) {
      return exception.hours.some(
        (h) => mins >= timeToMinutes(h.start) && mins < timeToMinutes(h.end),
      );
    }
  }

  // Check weekly template
  const slots = avail.weeklyTemplate[dayKey];
  if (!slots || slots.length === 0) return false;
  return slots.some(
    (s) => mins >= timeToMinutes(s.start) && mins < timeToMinutes(s.end),
  );
}

function isSlotBooked(
  employeeId: string,
  date: Date,
  time: string,
  appointments: Appointment[],
): boolean {
  const dateStr = formatDate(date);
  const mins = timeToMinutes(time);
  return appointments.some((a) => {
    if (a.userId !== employeeId || a.date !== dateStr) return false;
    if (a.status === "annule") return false;
    const aStart = timeToMinutes(a.time);
    const aEnd = aStart + a.duration;
    return mins >= aStart && mins < aEnd;
  });
}

// ============================================================
// Tab 1: Calendrier (Calendar View)
// ============================================================
function CalendarTab({
  appointments,
  setAppointments,
  clients,
  cases,
  currentUser,
  perms,
  calendarData,
}: {
  appointments: Appointment[];
  setAppointments: (a: Appointment[]) => void;
  clients: { id: string; firstName: string; lastName: string }[];
  cases: { id: string; clientId: string; title: string }[];
  currentUser: { id: string; role: string; name: string };
  perms: { canScheduleAppointments: boolean; canViewAllClients: boolean };
  calendarData: CalendarData;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [editingAppt, setEditingAppt] = useState(false);

  const canViewAll =
    currentUser.role === "superadmin" || currentUser.role === "coordinatrice";

  const emptyAppt = useCallback(
    (): Partial<Appointment> => ({
      id: `a${Date.now()}`,
      clientId: "",
      caseId: "",
      userId: currentUser.id,
      title: "",
      date: formatDate(new Date()),
      time: "09:00",
      duration: 60,
      type: "consultation_initiale" as AppointmentType,
      status: "planifie",
      notes: "",
    }),
    [currentUser.id],
  );

  const [formData, setFormData] = useState<Partial<Appointment>>(emptyAppt());

  const weekDates = getWeekDates(weekOffset);
  const moisAnnee = weekDates[0].toLocaleDateString("fr-CA", {
    month: "long",
    year: "numeric",
  });

  const getClientName = (id: string) => {
    const c = clients.find((cl) => cl.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "Inconnu";
  };

  const filteredAppointments = useMemo(() => {
    let list = appointments;
    if (!canViewAll) {
      list = list.filter((a) => a.userId === currentUser.id);
    } else if (filterEmployee !== "all") {
      list = list.filter((a) => a.userId === filterEmployee);
    }
    return list;
  }, [appointments, canViewAll, currentUser.id, filterEmployee]);

  const apptForDaySlot = (date: Date, slotTime: string) => {
    const dateStr = formatDate(date);
    const slotMins = timeToMinutes(slotTime);
    return filteredAppointments.filter((a) => {
      if (a.date !== dateStr) return false;
      const aStart = timeToMinutes(a.time);
      const aEnd = aStart + a.duration;
      return slotMins >= aStart && slotMins < aEnd;
    });
  };

  const isFirstSlotOfAppt = (date: Date, slotTime: string, appt: Appointment) => {
    const dateStr = formatDate(date);
    if (appt.date !== dateStr) return false;
    return appt.time === slotTime;
  };

  const openNew = (date?: Date, time?: string) => {
    const newAppt = emptyAppt();
    if (date) newAppt.date = formatDate(date);
    if (time) newAppt.time = time;
    setFormData(newAppt);
    setEditingAppt(false);
    setShowModal(true);
  };

  const openEdit = (appt: Appointment) => {
    setFormData({ ...appt });
    setEditingAppt(true);
    setShowModal(true);
    setSelectedAppt(null);
  };

  const [formError, setFormError] = useState("");

  const saveAppt = () => {
    setFormError("");
    if (!formData.clientId) {
      setFormError("Veuillez selectionner un client.");
      return;
    }
    if (!formData.title?.trim()) {
      setFormError("Le titre est obligatoire.");
      return;
    }
    if (!formData.date) {
      setFormError("La date est obligatoire.");
      return;
    }
    if (!formData.time || !/^\d{2}:\d{2}$/.test(formData.time)) {
      setFormError("L'heure est invalide (format HH:MM attendu).");
      return;
    }
    const timeMins = timeToMinutes(formData.time);
    if (timeMins < 0 || timeMins > 1439) {
      setFormError("L'heure doit etre entre 00:00 et 23:59.");
      return;
    }
    const exists = appointments.find((a) => a.id === formData.id);
    if (exists) {
      setAppointments(
        appointments.map((a) =>
          a.id === formData.id ? ({ ...a, ...formData } as Appointment) : a,
        ),
      );
    } else {
      setAppointments([...appointments, formData as Appointment]);
    }
    setShowModal(false);
  };

  const updateStatus = (appt: Appointment, status: Appointment["status"]) => {
    setAppointments(
      appointments.map((a) => (a.id === appt.id ? { ...a, status } : a)),
    );
    setSelectedAppt({ ...appt, status });
  };

  const clientCases = (clientId: string) =>
    cases.filter((c) => c.clientId === clientId);

  const typeColorMap: Record<string, string> = {
    consultation_initiale: "#3B82F6",
    suivi: "#10B981",
    revision_formulaires: "#D4A03C",
    preparation_entrevue: "#8B5CF6",
    signature: "#6366F1",
    autre: "#6B7280",
  };

  return (
    <div className="space-y-4">
      {/* Week nav + filters */}
      <div className="flex items-center justify-between bg-white rounded-xl border p-4">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "#1B2559" }} />
        </button>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span
            className="text-lg font-semibold capitalize"
            style={{ color: "#1B2559" }}
          >
            {moisAnnee}
          </span>
          <span className="text-sm text-gray-500">
            {weekDates[0].toLocaleDateString("fr-CA")} -{" "}
            {weekDates[4].toLocaleDateString("fr-CA")}
          </span>
          <button
            onClick={() => setWeekOffset(0)}
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ backgroundColor: "#EAEDF5", color: "#1B2559" }}
          >
            Aujourd&apos;hui
          </button>
          {canViewAll && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="text-sm border rounded-lg px-2 py-1"
              >
                <option value="all">Tous les employés</option>
                {DEMO_USERS.filter((u) => u.active).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5" style={{ color: "#1B2559" }} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border overflow-auto">
        <div className="grid grid-cols-[72px_repeat(5,1fr)] border-b min-w-[800px]">
          <div className="p-2 text-xs text-gray-400 font-medium border-r">
            Heure
          </div>
          {weekDates.map((d, i) => {
            const isToday = formatDate(d) === formatDate(new Date());
            return (
              <div
                key={i}
                className={`p-2 text-center border-r last:border-r-0 ${isToday ? "font-bold" : ""}`}
                style={
                  isToday
                    ? { backgroundColor: "#EAEDF5", color: "#1B2559" }
                    : {}
                }
              >
                <div className="text-xs text-gray-500">{JOURS[i]}</div>
                <div className="text-lg">{d.getDate()}</div>
              </div>
            );
          })}
        </div>

        <div className="min-w-[800px]">
          {HOURS.map((slot) => (
            <div
              key={slot}
              className="grid grid-cols-[72px_repeat(5,1fr)] border-b last:border-b-0"
              style={{ minHeight: "36px" }}
            >
              <div className="p-1 text-[11px] text-gray-400 border-r flex items-start justify-end pr-2 pt-1">
                {slot}
              </div>
              {weekDates.map((d, di) => {
                const dayAppts = apptForDaySlot(d, slot);
                const uniqueStartAppts = dayAppts.filter((a) =>
                  isFirstSlotOfAppt(d, slot, a),
                );
                const hasAppt = dayAppts.length > 0;
                return (
                  <div
                    key={di}
                    className={`border-r last:border-r-0 px-0.5 relative cursor-pointer hover:bg-gray-50 ${!hasAppt ? "group" : ""}`}
                    style={{ minHeight: "36px" }}
                    onClick={() => {
                      if (!hasAppt && perms.canScheduleAppointments) {
                        openNew(d, slot);
                      }
                    }}
                  >
                    {!hasAppt && perms.canScheduleAppointments && (
                      <div className="absolute inset-0 hidden group-hover:flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    )}
                    {uniqueStartAppts.map((appt) => {
                      const spans = Math.ceil(appt.duration / 30);
                      const color =
                        typeColorMap[appt.type] || "#6B7280";
                      return (
                        <button
                          key={appt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppt(appt);
                          }}
                          className="w-full text-left rounded-md p-1 mb-0.5 text-[11px] border-l-[3px] cursor-pointer hover:shadow-sm transition-shadow"
                          style={{
                            borderLeftColor: color,
                            backgroundColor: `${color}15`,
                            height: `${spans * 36 - 4}px`,
                            position: "relative",
                            zIndex: 2,
                          }}
                        >
                          <div
                            className="font-semibold truncate"
                            style={{ color }}
                          >
                            {appt.time} -{" "}
                            {minutesToTime(
                              timeToMinutes(appt.time) + appt.duration,
                            )}
                          </div>
                          <div className="truncate text-gray-700">
                            {getClientName(appt.clientId)}
                          </div>
                          <div className="truncate text-gray-500">
                            {getUserName(appt.userId)}
                          </div>
                          <span
                            className="inline-block mt-0.5 px-1 py-0 rounded text-[9px] font-medium text-white"
                            style={{ backgroundColor: color }}
                          >
                            {APPOINTMENT_TYPE_LABELS[appt.type]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Empty state for week with no appointments */}
      {filteredAppointments.filter(a => {
        const dateStr = a.date;
        return weekDates.some(d => formatDate(d) === dateStr);
      }).length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-white rounded-xl border">
          <Calendar className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm font-medium">Aucun rendez-vous cette semaine</p>
          <p className="text-gray-400 text-xs mt-1">Cliquez sur une case horaire pour planifier un rendez-vous.</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-2">
        {Object.entries(typeColorMap).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            {APPOINTMENT_TYPE_LABELS[key as AppointmentType]}
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div
              className="flex items-center justify-between p-5 border-b rounded-t-2xl"
              style={{ backgroundColor: "#EAEDF5" }}
            >
              <h2 className="text-lg font-bold" style={{ color: "#1B2559" }}>
                Détail du rendez-vous
              </h2>
              <button
                onClick={() => setSelectedAppt(null)}
                className="p-1 hover:bg-white/50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <div className="text-sm text-gray-500">Titre</div>
                <div className="font-semibold">{selectedAppt.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Client</div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    {getClientName(selectedAppt.clientId)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Conseiller</div>
                  <div>{getUserName(selectedAppt.userId)}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div>{selectedAppt.date}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Heure</div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {selectedAppt.time}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Durée</div>
                  <div>{selectedAppt.duration} min</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Type</div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${APPOINTMENT_TYPE_COLORS[selectedAppt.type]}`}
                >
                  {APPOINTMENT_TYPE_LABELS[selectedAppt.type]}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Statut</div>
                <div className="font-medium capitalize">
                  {selectedAppt.status.replace("_", " ")}
                </div>
              </div>
              {selectedAppt.notes && (
                <div>
                  <div className="text-sm text-gray-500">Notes</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedAppt.notes}
                  </div>
                </div>
              )}
              {perms.canScheduleAppointments && (
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => openEdit(selectedAppt)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
                    style={{ borderColor: "#1B2559", color: "#1B2559" }}
                  >
                    Modifier
                  </button>
                  {selectedAppt.status === "planifie" && (
                    <button
                      onClick={() => updateStatus(selectedAppt, "confirme")}
                      className="flex-1 text-white py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: "#D4A03C" }}
                    >
                      Confirmer
                    </button>
                  )}
                  {(selectedAppt.status === "planifie" ||
                    selectedAppt.status === "confirme") && (
                    <button
                      onClick={() => updateStatus(selectedAppt, "complete")}
                      className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ backgroundColor: "#1B2559" }}
                    >
                      Compléter
                    </button>
                  )}
                  {selectedAppt.status !== "annule" &&
                    selectedAppt.status !== "complete" && (
                      <button
                        onClick={() => updateStatus(selectedAppt, "annule")}
                        className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Annuler
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div
              className="flex items-center justify-between p-5 border-b rounded-t-2xl"
              style={{ backgroundColor: "#EAEDF5" }}
            >
              <h2 className="text-lg font-bold" style={{ color: "#1B2559" }}>
                {editingAppt ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white/50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clientId: e.target.value,
                      caseId: "",
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>
              {formData.clientId &&
                clientCases(formData.clientId).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FileText className="w-3.5 h-3.5 inline mr-1" />
                      Dossier (optionnel)
                    </label>
                    <select
                      value={formData.caseId ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, caseId: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Aucun dossier</option>
                      {clientCases(formData.clientId).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Objet du rendez-vous"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée
                </label>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() =>
                        setFormData({ ...formData, duration: d.value })
                      }
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                        formData.duration === d.value
                          ? "text-white border-transparent"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      style={
                        formData.duration === d.value
                          ? { backgroundColor: "#D4A03C" }
                          : {}
                      }
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as AppointmentType,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {(
                    Object.entries(APPOINTMENT_TYPE_LABELS) as [
                      AppointmentType,
                      string,
                    ][]
                  ).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigné à
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {DEMO_USERS.filter((u) => u.active).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Notes supplémentaires..."
                />
              </div>
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowModal(false); setFormError(""); }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={saveAppt}
                  disabled={!formData.clientId || !formData.title}
                  className="flex-1 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: "#D4A03C" }}
                >
                  {editingAppt ? "Sauvegarder" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tab 2: Disponibilités (Availability Management)
// ============================================================
function DisponibilitesTab({
  calendarData,
  setCalendarData,
  appointments,
  currentUser,
}: {
  calendarData: CalendarData;
  setCalendarData: (d: CalendarData) => void;
  appointments: Appointment[];
  currentUser: { id: string; role: string };
}) {
  const isAdmin =
    currentUser.role === "superadmin" || currentUser.role === "coordinatrice";
  const [selectedEmployee, setSelectedEmployee] = useState(
    isAdmin ? "all" : currentUser.id,
  );
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionData, setExceptionData] = useState({
    employeeId: "",
    date: formatDate(new Date()),
    type: "blocked" as "blocked" | "reduced",
    reason: "",
    hours: [{ start: "09:00", end: "12:00" }] as AvailabilitySlot[],
  });

  const weekDates = getWeekDates(weekOffset);

  const visibleEmployees = useMemo(() => {
    if (!isAdmin) return DEMO_USERS.filter((u) => u.id === currentUser.id);
    if (selectedEmployee === "all")
      return DEMO_USERS.filter((u) => u.active);
    return DEMO_USERS.filter((u) => u.id === selectedEmployee);
  }, [isAdmin, currentUser.id, selectedEmployee]);

  const getSlotStatus = (
    employeeId: string,
    date: Date,
    time: string,
  ): "available" | "blocked" | "booked" => {
    if (isSlotBooked(employeeId, date, time, appointments)) return "booked";
    if (isSlotAvailable(employeeId, date, time, calendarData)) return "available";
    return "blocked";
  };

  const slotColors = {
    available: { bg: "#D1FAE5", border: "#6EE7B7" },
    blocked: { bg: "#FEE2E2", border: "#FCA5A5" },
    booked: { bg: "#DBEAFE", border: "#93C5FD" },
  };

  const updateTemplate = (
    employeeId: string,
    dayKey: string,
    slots: AvailabilitySlot[],
  ) => {
    const updated = { ...calendarData };
    if (!updated.availability[employeeId]) {
      updated.availability[employeeId] = buildDefaultAvailability();
    }
    updated.availability[employeeId] = {
      ...updated.availability[employeeId],
      weeklyTemplate: {
        ...updated.availability[employeeId].weeklyTemplate,
        [dayKey]: slots,
      },
    };
    setCalendarData(updated);
    saveCalendarData(updated);
  };

  const addException = () => {
    const updated = { ...calendarData };
    const empId = exceptionData.employeeId;
    if (!updated.availability[empId]) {
      updated.availability[empId] = buildDefaultAvailability();
    }
    // Remove any existing exception for same date
    updated.availability[empId].exceptions = updated.availability[
      empId
    ].exceptions.filter((e) => e.date !== exceptionData.date);
    updated.availability[empId].exceptions.push({
      date: exceptionData.date,
      type: exceptionData.type,
      hours:
        exceptionData.type === "reduced" ? exceptionData.hours : undefined,
      reason: exceptionData.reason || undefined,
    });
    setCalendarData(updated);
    saveCalendarData(updated);
    setShowExceptionModal(false);
  };

  const removeException = (employeeId: string, date: string) => {
    const updated = { ...calendarData };
    if (updated.availability[employeeId]) {
      updated.availability[employeeId].exceptions = updated.availability[
        employeeId
      ].exceptions.filter((e) => e.date !== date);
      setCalendarData(updated);
      saveCalendarData(updated);
    }
  };

  // Template editing state
  const [editTemplate, setEditTemplate] = useState<{
    employeeId: string;
    day: string;
    slots: AvailabilitySlot[];
  } | null>(null);

  const canEditEmployee = (empId: string) => {
    if (isAdmin) return true;
    return empId === currentUser.id;
  };

  // Display time slots for the grid (simplified: every hour from 8 to 18)
  const gridHours = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white rounded-xl border p-4">
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="text-sm border rounded-lg px-2 py-1.5"
              >
                <option value="all">Tous les employés</option>
                {DEMO_USERS.filter((u) => u.active).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: "#EAEDF5", color: "#1B2559" }}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded border"
              style={{
                backgroundColor: slotColors.available.bg,
                borderColor: slotColors.available.border,
              }}
            />
            Disponible
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded border"
              style={{
                backgroundColor: slotColors.blocked.bg,
                borderColor: slotColors.blocked.border,
              }}
            />
            Bloqué
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded border"
              style={{
                backgroundColor: slotColors.booked.bg,
                borderColor: slotColors.booked.border,
              }}
            />
            Réservé
          </div>
        </div>
      </div>

      {/* Availability grid per employee */}
      {visibleEmployees.map((emp) => {
        const avail = calendarData.availability[emp.id];
        const exceptions = avail?.exceptions ?? [];

        return (
          <div key={emp.id} className="bg-white rounded-xl border overflow-hidden">
            <div
              className="flex items-center justify-between p-3 border-b"
              style={{ backgroundColor: "#EAEDF5" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: "#1B2559" }}
                >
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: "#1B2559" }}
                  >
                    {emp.name}
                  </div>
                  <div className="text-xs text-gray-500">{emp.email}</div>
                </div>
              </div>
              {canEditEmployee(emp.id) && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingEmployee(
                        editingEmployee === emp.id ? null : emp.id,
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded-lg font-medium border hover:bg-white/50"
                    style={{ borderColor: "#1B2559", color: "#1B2559" }}
                  >
                    <Settings2 className="w-3.5 h-3.5 inline mr-1" />
                    {editingEmployee === emp.id
                      ? "Fermer"
                      : "Modifier horaire"}
                  </button>
                  <button
                    onClick={() => {
                      setExceptionData({
                        employeeId: emp.id,
                        date: formatDate(new Date()),
                        type: "blocked",
                        reason: "",
                        hours: [{ start: "09:00", end: "12:00" }],
                      });
                      setShowExceptionModal(true);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                    style={{ backgroundColor: "#D4A03C" }}
                  >
                    <Ban className="w-3.5 h-3.5 inline mr-1" />
                    Exception
                  </button>
                </div>
              )}
            </div>

            {/* Visual grid */}
            <div className="overflow-auto">
              <div className="grid grid-cols-[90px_repeat(5,1fr)] border-b min-w-[700px]">
                <div className="p-1 text-xs text-gray-400 border-r" />
                {weekDates.map((d, i) => (
                  <div
                    key={i}
                    className="p-1 text-center border-r last:border-r-0 text-xs"
                  >
                    <div className="font-medium text-gray-700">{JOURS[i]}</div>
                    <div className="text-gray-400">{d.getDate()}/{d.getMonth() + 1}</div>
                  </div>
                ))}
              </div>
              <div className="min-w-[700px]">
                {gridHours.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-[90px_repeat(5,1fr)] border-b last:border-b-0"
                    style={{ height: "28px" }}
                  >
                    <div className="text-[11px] text-gray-400 border-r flex items-center justify-end pr-2">
                      {hour}
                    </div>
                    {weekDates.map((d, di) => {
                      const status = getSlotStatus(emp.id, d, hour);
                      const sc = slotColors[status];
                      return (
                        <div
                          key={di}
                          className="border-r last:border-r-0"
                          style={{ backgroundColor: sc.bg }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Template editing */}
            {editingEmployee === emp.id && (
              <div className="p-4 border-t bg-gray-50 space-y-3">
                <h4
                  className="text-sm font-semibold"
                  style={{ color: "#1B2559" }}
                >
                  Horaire hebdomadaire
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {JOURS_KEYS.map((dayKey, i) => {
                    const daySlots =
                      avail?.weeklyTemplate[dayKey] ?? [];
                    return (
                      <div
                        key={dayKey}
                        className="bg-white rounded-lg border p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {JOURS[i]}
                          </span>
                          <button
                            onClick={() =>
                              setEditTemplate({
                                employeeId: emp.id,
                                day: dayKey,
                                slots: [...daySlots],
                              })
                            }
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Modifier
                          </button>
                        </div>
                        {daySlots.length === 0 ? (
                          <div className="text-xs text-gray-400">
                            Non disponible
                          </div>
                        ) : (
                          daySlots.map((s, si) => (
                            <div
                              key={si}
                              className="text-xs text-gray-600 bg-green-50 rounded px-2 py-0.5 mb-1"
                            >
                              {s.start} - {s.end}
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current exceptions */}
                {exceptions.length > 0 && (
                  <div className="mt-3">
                    <h4
                      className="text-sm font-semibold mb-2"
                      style={{ color: "#1B2559" }}
                    >
                      Exceptions
                    </h4>
                    <div className="space-y-1">
                      {exceptions.map((exc) => (
                        <div
                          key={exc.date}
                          className="flex items-center justify-between bg-white rounded-lg border p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${exc.type === "blocked" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {exc.type === "blocked"
                                ? "Bloqué"
                                : "Réduit"}
                            </span>
                            <span className="text-gray-700">{exc.date}</span>
                            {exc.reason && (
                              <span className="text-gray-400 text-xs">
                                — {exc.reason}
                              </span>
                            )}
                          </div>
                          {canEditEmployee(emp.id) && (
                            <button
                              onClick={() =>
                                removeException(emp.id, exc.date)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit template modal */}
      {editTemplate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div
              className="flex items-center justify-between p-5 border-b rounded-t-2xl"
              style={{ backgroundColor: "#EAEDF5" }}
            >
              <h2 className="text-lg font-bold" style={{ color: "#1B2559" }}>
                Modifier horaire —{" "}
                {JOURS[JOURS_KEYS.indexOf(editTemplate.day)]}
              </h2>
              <button
                onClick={() => setEditTemplate(null)}
                className="p-1 hover:bg-white/50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {editTemplate.slots.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={s.start}
                    onChange={(e) => {
                      const ns = [...editTemplate.slots];
                      ns[i] = { ...ns[i], start: e.target.value };
                      setEditTemplate({ ...editTemplate, slots: ns });
                    }}
                    className="border rounded-lg px-2 py-1.5 text-sm"
                  />
                  <span className="text-gray-400">à</span>
                  <input
                    type="time"
                    value={s.end}
                    onChange={(e) => {
                      const ns = [...editTemplate.slots];
                      ns[i] = { ...ns[i], end: e.target.value };
                      setEditTemplate({ ...editTemplate, slots: ns });
                    }}
                    className="border rounded-lg px-2 py-1.5 text-sm"
                  />
                  <button
                    onClick={() => {
                      const ns = editTemplate.slots.filter(
                        (_, j) => j !== i,
                      );
                      setEditTemplate({ ...editTemplate, slots: ns });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setEditTemplate({
                    ...editTemplate,
                    slots: [
                      ...editTemplate.slots,
                      { start: "09:00", end: "17:00" },
                    ],
                  })
                }
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une plage
              </button>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditTemplate(null)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    updateTemplate(
                      editTemplate.employeeId,
                      editTemplate.day,
                      editTemplate.slots,
                    );
                    setEditTemplate(null);
                  }}
                  className="flex-1 text-white py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#D4A03C" }}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exception modal */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div
              className="flex items-center justify-between p-5 border-b rounded-t-2xl"
              style={{ backgroundColor: "#EAEDF5" }}
            >
              <h2 className="text-lg font-bold" style={{ color: "#1B2559" }}>
                Ajouter une exception
              </h2>
              <button
                onClick={() => setShowExceptionModal(false)}
                className="p-1 hover:bg-white/50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={exceptionData.date}
                  onChange={(e) =>
                    setExceptionData({
                      ...exceptionData,
                      date: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setExceptionData({
                        ...exceptionData,
                        type: "blocked",
                      })
                    }
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${exceptionData.type === "blocked" ? "bg-red-100 text-red-700 border-red-300" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    Bloqué (journée entière)
                  </button>
                  <button
                    onClick={() =>
                      setExceptionData({
                        ...exceptionData,
                        type: "reduced",
                      })
                    }
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${exceptionData.type === "reduced" ? "bg-amber-100 text-amber-700 border-amber-300" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    Réduit (heures spécifiques)
                  </button>
                </div>
              </div>
              {exceptionData.type === "reduced" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Heures disponibles
                  </label>
                  {exceptionData.hours.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={h.start}
                        onChange={(e) => {
                          const nh = [...exceptionData.hours];
                          nh[i] = { ...nh[i], start: e.target.value };
                          setExceptionData({
                            ...exceptionData,
                            hours: nh,
                          });
                        }}
                        className="border rounded-lg px-2 py-1.5 text-sm"
                      />
                      <span className="text-gray-400">à</span>
                      <input
                        type="time"
                        value={h.end}
                        onChange={(e) => {
                          const nh = [...exceptionData.hours];
                          nh[i] = { ...nh[i], end: e.target.value };
                          setExceptionData({
                            ...exceptionData,
                            hours: nh,
                          });
                        }}
                        className="border rounded-lg px-2 py-1.5 text-sm"
                      />
                      {exceptionData.hours.length > 1 && (
                        <button
                          onClick={() =>
                            setExceptionData({
                              ...exceptionData,
                              hours: exceptionData.hours.filter(
                                (_, j) => j !== i,
                              ),
                            })
                          }
                          className="text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setExceptionData({
                        ...exceptionData,
                        hours: [
                          ...exceptionData.hours,
                          { start: "09:00", end: "12:00" },
                        ],
                      })
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Ajouter une plage
                  </button>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison (optionnel)
                </label>
                <input
                  type="text"
                  value={exceptionData.reason}
                  onChange={(e) =>
                    setExceptionData({
                      ...exceptionData,
                      reason: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Vacances, congé maladie, réunion..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExceptionModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={addException}
                  className="flex-1 text-white py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#D4A03C" }}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tab 3: Demandes (Booking Requests)
// ============================================================
function DemandesTab({
  calendarData,
  setCalendarData,
  appointments,
  setAppointments,
  currentUser,
}: {
  calendarData: CalendarData;
  setCalendarData: (d: CalendarData) => void;
  appointments: Appointment[];
  setAppointments: (a: Appointment[]) => void;
  currentUser: { id: string; role: string };
}) {
  const [statusFilter, setStatusFilter] = useState<BookingRequest["status"] | "all">("all");
  const [confirmModal, setConfirmModal] = useState<BookingRequest | null>(null);
  const [refuseModal, setRefuseModal] = useState<BookingRequest | null>(null);
  const [confirmData, setConfirmData] = useState({
    assignedTo: "",
    confirmedDate: "",
    confirmedTime: "",
  });
  const [refusalReason, setRefusalReason] = useState("");

  const requests = calendarData.bookingRequests ?? [];
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filtered = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const updateRequest = (id: string, updates: Partial<BookingRequest>) => {
    const updated = { ...calendarData };
    updated.bookingRequests = updated.bookingRequests.map((r) =>
      r.id === id ? { ...r, ...updates } : r,
    );
    setCalendarData(updated);
    saveCalendarData(updated);
  };

  const confirmRequest = () => {
    if (!confirmModal || !confirmData.assignedTo) return;

    // Update request
    updateRequest(confirmModal.id, {
      status: "confirmed",
      assignedTo: confirmData.assignedTo,
      confirmedDate: confirmData.confirmedDate || confirmModal.preferredDate,
      confirmedTime: confirmData.confirmedTime || confirmModal.preferredTime,
    });

    // Create appointment
    const typeMap: Record<string, AppointmentType> = {
      consultation: "consultation_initiale",
      suivi: "suivi",
      juridique: "revision_formulaires",
      administratif: "autre",
    };
    const newAppt: Appointment = {
      id: `a${Date.now()}`,
      clientId: confirmModal.clientId || "",
      userId: confirmData.assignedTo,
      title: `${BOOKING_TYPE_LABELS[confirmModal.type]} — ${confirmModal.clientName}`,
      date: confirmData.confirmedDate || confirmModal.preferredDate,
      time: confirmData.confirmedTime || confirmModal.preferredTime,
      duration: confirmModal.duration,
      type: typeMap[confirmModal.type] || "autre",
      status: "confirme",
      notes: confirmModal.notes || "",
    };
    setAppointments([...appointments, newAppt]);
    setConfirmModal(null);
  };

  const refuseRequest = () => {
    if (!refuseModal) return;
    updateRequest(refuseModal.id, {
      status: "refused",
      refusalReason: refusalReason,
    });
    setRefuseModal(null);
    setRefusalReason("");
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Filtrer :</span>
          {(
            ["all", "pending", "confirmed", "refused", "cancelled"] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                statusFilter === s
                  ? "text-white"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
              style={
                statusFilter === s ? { backgroundColor: "#1B2559" } : {}
              }
            >
              {s === "all"
                ? "Toutes"
                : BOOKING_STATUS_LABELS[s as BookingRequest["status"]]}
              {s === "pending" && pendingCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {filtered.length} demande{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Requests list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aucune demande trouvée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {req.clientName}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${BOOKING_STATUS_COLORS[req.status]}`}
                    >
                      {BOOKING_STATUS_LABELS[req.status]}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium text-white"
                      style={{
                        backgroundColor: BOOKING_TYPE_COLORS[req.type],
                      }}
                    >
                      {BOOKING_TYPE_LABELS[req.type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {req.clientEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {req.preferredDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {req.preferredTime}
                    </span>
                    <span>{req.duration} min</span>
                  </div>
                  {req.notes && (
                    <p className="text-xs text-gray-400 mt-1">{req.notes}</p>
                  )}
                  {req.assignedTo && (
                    <p className="text-xs text-gray-500 mt-1">
                      Assigné à : {getUserName(req.assignedTo)}
                    </p>
                  )}
                  {req.refusalReason && (
                    <p className="text-xs text-red-500 mt-1">
                      Raison du refus : {req.refusalReason}
                    </p>
                  )}
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setConfirmData({
                          assignedTo: currentUser.id,
                          confirmedDate: req.preferredDate,
                          confirmedTime: req.preferredTime,
                        });
                        setConfirmModal(req);
                      }}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                      style={{ backgroundColor: "#10B981" }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirmer
                    </button>
                    <button
                      onClick={() => {
                        setRefusalReason("");
                        setRefuseModal(req);
                      }}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Refuser
                    </button>
                    <button
                      onClick={() => updateRequest(req.id, { status: "cancelled" })}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div
              className="flex items-center justify-between p-5 border-b rounded-t-2xl"
              style={{ backgroundColor: "#EAEDF5" }}
            >
              <h2 className="text-lg font-bold" style={{ color: "#1B2559" }}>
                Confirmer la demande
              </h2>
              <button
                onClick={() => setConfirmModal(null)}
                className="p-1 hover:bg-white/50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <strong>{confirmModal.clientName}</strong> —{" "}
                {BOOKING_TYPE_LABELS[confirmModal.type]} —{" "}
                {confirmModal.duration} min
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigner à *
                </label>
                <select
                  value={confirmData.assignedTo}
                  onChange={(e) =>
                    setConfirmData({
                      ...confirmData,
                      assignedTo: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner</option>
                  {DEMO_USERS.filter((u) => u.active).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={confirmData.confirmedDate}
                    onChange={(e) =>
                      setConfirmData({
                        ...confirmData,
                        confirmedDate: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={confirmData.confirmedTime}
                    onChange={(e) =>
                      setConfirmData({
                        ...confirmData,
                        confirmedTime: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmRequest}
                  disabled={!confirmData.assignedTo}
                  className="flex-1 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: "#10B981" }}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refuse modal */}
      {refuseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div
              className="flex items-center justify-between p-5 border-b rounded-t-2xl"
              style={{ backgroundColor: "#EAEDF5" }}
            >
              <h2 className="text-lg font-bold" style={{ color: "#1B2559" }}>
                Refuser la demande
              </h2>
              <button
                onClick={() => setRefuseModal(null)}
                className="p-1 hover:bg-white/50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <strong>{refuseModal.clientName}</strong> —{" "}
                {BOOKING_TYPE_LABELS[refuseModal.type]}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison du refus
                </label>
                <textarea
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Indiquer la raison..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRefuseModal(null)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={refuseRequest}
                  className="flex-1 text-white py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700"
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// BookingWidget (Client Portal - exported for reuse)
// ============================================================
export function BookingWidget() {
  const [calendarData, setCalendarData] = useState<CalendarData>({
    availability: {},
    bookingRequests: [],
  });
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<BookingRequest["type"]>("consultation");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setCalendarData(loadCalendarData());
  }, []);

  // Generate next 2 weeks of dates (weekdays only)
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; dates.length < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) dates.push(d);
    }
    return dates;
  }, []);

  // For selected date, find available time slots where at least one employee is free
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate + "T12:00:00");
    const slots: string[] = [];
    const timeSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    ];
    for (const t of timeSlots) {
      const anyAvailable = DEMO_USERS.some(
        (u) =>
          u.active &&
          isSlotAvailable(u.id, date, t, calendarData),
      );
      if (anyAvailable) slots.push(t);
    }
    return slots;
  }, [selectedDate, calendarData]);

  const submitRequest = () => {
    if (!clientName || !clientEmail || !selectedDate || !selectedTime) return;
    const request: BookingRequest = {
      id: `br${Date.now()}`,
      clientId: "",
      clientName,
      clientEmail,
      type: selectedType,
      preferredDate: selectedDate,
      preferredTime: selectedTime,
      duration: selectedType === "consultation" ? 60 : selectedType === "suivi" ? 30 : 45,
      status: "pending",
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = { ...calendarData };
    updated.bookingRequests = [...(updated.bookingRequests || []), request];
    saveCalendarData(updated);
    setCalendarData(updated);
    setSubmitted(true);
    setStep(4);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl border shadow-sm p-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#D1FAE5" }}
        >
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: "#1B2559" }}
        >
          Demande envoyée!
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Votre demande de rendez-vous a été soumise. Notre équipe vous
          contactera pour confirmer les détails.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-left space-y-1">
          <div>
            <span className="text-gray-500">Type :</span>{" "}
            {BOOKING_TYPE_LABELS[selectedType]}
          </div>
          <div>
            <span className="text-gray-500">Date :</span> {selectedDate}
          </div>
          <div>
            <span className="text-gray-500">Heure :</span> {selectedTime}
          </div>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setSelectedType("consultation");
            setSelectedDate("");
            setSelectedTime("");
            setClientName("");
            setClientEmail("");
            setNotes("");
          }}
          className="mt-6 text-sm font-medium px-6 py-2 rounded-lg text-white"
          style={{ backgroundColor: "#D4A03C" }}
        >
          Nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b" style={{ backgroundColor: "#1B2559" }}>
        <h3 className="text-lg font-bold text-white">
          Prendre rendez-vous
        </h3>
        <p className="text-sm text-gray-300 mt-0.5">
          Sélectionnez le type, la date et l&apos;heure souhaités
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex border-b">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 py-2 text-center text-xs font-medium ${
              step === s
                ? "border-b-2"
                : step > s
                  ? "text-green-600"
                  : "text-gray-400"
            }`}
            style={
              step === s
                ? { borderBottomColor: "#D4A03C", color: "#D4A03C" }
                : {}
            }
          >
            {s === 1 && "Type"}
            {s === 2 && "Date & Heure"}
            {s === 3 && "Vos informations"}
          </div>
        ))}
      </div>

      <div className="p-5">
        {/* Step 1: Type */}
        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rendez-vous
            </label>
            {(
              Object.entries(BOOKING_TYPE_LABELS) as [
                BookingRequest["type"],
                string,
              ][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  selectedType === key
                    ? "border-transparent"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                style={
                  selectedType === key
                    ? {
                        borderColor: BOOKING_TYPE_COLORS[key],
                        backgroundColor: `${BOOKING_TYPE_COLORS[key]}10`,
                      }
                    : {}
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: BOOKING_TYPE_COLORS[key] }}
                  />
                  <span className="font-medium text-sm text-gray-800">
                    {label}
                  </span>
                </div>
              </button>
            ))}
            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 text-white py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#D4A03C" }}
            >
              Continuer
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date souhaitée
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableDates.map((d) => {
                  const ds = formatDate(d);
                  return (
                    <button
                      key={ds}
                      onClick={() => {
                        setSelectedDate(ds);
                        setSelectedTime("");
                      }}
                      className={`p-2 rounded-lg text-sm border text-center ${
                        selectedDate === ds
                          ? "text-white border-transparent"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      style={
                        selectedDate === ds
                          ? { backgroundColor: "#1B2559" }
                          : {}
                      }
                    >
                      <div className="font-medium">
                        {d.toLocaleDateString("fr-CA", {
                          weekday: "short",
                        })}
                      </div>
                      <div className="text-xs opacity-75">
                        {d.toLocaleDateString("fr-CA", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure souhaitée
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Aucune disponibilité pour cette date.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`p-2 rounded-lg text-sm border ${
                          selectedTime === t
                            ? "text-white border-transparent"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        style={
                          selectedTime === t
                            ? { backgroundColor: "#D4A03C" }
                            : {}
                        }
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#D4A03C" }}
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact info */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Courriel *
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="votre@courriel.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Détails supplémentaires..."
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="font-medium" style={{ color: "#1B2559" }}>
                Résumé
              </div>
              <div>
                <span className="text-gray-500">Type :</span>{" "}
                {BOOKING_TYPE_LABELS[selectedType]}
              </div>
              <div>
                <span className="text-gray-500">Date :</span> {selectedDate}
              </div>
              <div>
                <span className="text-gray-500">Heure :</span> {selectedTime}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                onClick={submitRequest}
                disabled={!clientName || !clientEmail}
                className="flex-1 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#D4A03C" }}
              >
                <Send className="w-4 h-4" />
                Envoyer la demande
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Tab 4: Canaux de reservation (Calendly-like)
// ============================================================
const CHANNEL_COLORS = [
  "#1B2559", "#D4A03C", "#3B82F6", "#10B981", "#8B5CF6",
  "#EF4444", "#F59E0B", "#06B6D4", "#EC4899", "#6366F1",
];

function CanauxTab({
  calendarData,
  setCalendarData,
}: {
  calendarData: CalendarData;
  setCalendarData: (d: CalendarData) => void;
}) {
  const channels = calendarData.bookingChannels ?? [];
  const [showModal, setShowModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<BookingChannel | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const emptyChannel = (): BookingChannel => ({
    id: `ch-${Date.now()}`,
    slug: "",
    name: "",
    title: "",
    email: "",
    ccEmails: [],
    bio: "",
    color: CHANNEL_COLORS[channels.length % CHANNEL_COLORS.length],
    duration: 30,
    types: ["Consultation", "Suivi", "Juridique", "Administratif"],
    active: true,
    createdAt: new Date().toISOString(),
  });

  const [form, setForm] = useState<BookingChannel>(emptyChannel());
  const [ccInput, setCcInput] = useState("");

  const openNew = () => {
    setForm(emptyChannel());
    setEditingChannel(null);
    setCcInput("");
    setShowModal(true);
  };

  const openEdit = (ch: BookingChannel) => {
    setForm({ ...ch });
    setEditingChannel(ch);
    setCcInput("");
    setShowModal(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  };

  const saveChannel = () => {
    if (!form.name || !form.email || !form.slug) return;
    const updated = { ...calendarData };
    const list = [...(updated.bookingChannels ?? [])];
    const idx = list.findIndex((c) => c.id === form.id);
    if (idx >= 0) {
      list[idx] = form;
    } else {
      list.push(form);
    }
    updated.bookingChannels = list;
    setCalendarData(updated);
    saveCalendarData(updated);
    setShowModal(false);
  };

  const deleteChannel = (id: string) => {
    if (!confirm("Supprimer ce canal de reservation ?")) return;
    const updated = { ...calendarData };
    updated.bookingChannels = (updated.bookingChannels ?? []).filter((c) => c.id !== id);
    setCalendarData(updated);
    saveCalendarData(updated);
  };

  const toggleActive = (id: string) => {
    const updated = { ...calendarData };
    updated.bookingChannels = (updated.bookingChannels ?? []).map((c) =>
      c.id === id ? { ...c, active: !c.active } : c,
    );
    setCalendarData(updated);
    saveCalendarData(updated);
  };

  const copyLink = (slug: string, id: string) => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://soshubca.vercel.app";
    navigator.clipboard.writeText(`${base}/rdv/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addCcEmail = () => {
    const email = ccInput.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (form.ccEmails.includes(email)) return;
    setForm({ ...form, ccEmails: [...form.ccEmails, email] });
    setCcInput("");
  };

  const removeCcEmail = (email: string) => {
    setForm({ ...form, ccEmails: form.ccEmails.filter((e) => e !== email) });
  };

  const toggleType = (type: string) => {
    const types = form.types.includes(type)
      ? form.types.filter((t) => t !== type)
      : [...form.types, type];
    setForm({ ...form, types });
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://soshubca.vercel.app";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl border p-4">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Globe size={18} className="text-[#D4A03C]" />
            Canaux de reservation
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configurez vos liens de prise de RDV — employes, services, departements ou courriels generiques
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90"
          style={{ backgroundColor: "#D4A03C" }}
        >
          <Plus size={16} />
          Nouveau canal
        </button>
      </div>

      {/* Channel list */}
      <div className="grid gap-3">
        {channels.length === 0 && (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
            <Link2 size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucun canal configure</p>
            <p className="text-sm mt-1">Creez votre premier canal de reservation</p>
          </div>
        )}
        {channels.map((ch) => (
          <div
            key={ch.id}
            className={`bg-white rounded-xl border p-4 transition-all ${!ch.active ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-4">
              {/* Color avatar */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: `linear-gradient(135deg, ${ch.color}, #D4A03C)` }}
              >
                {ch.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 truncate">{ch.name}</h4>
                  {!ch.active && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">Inactif</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{ch.title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Mail size={10} /> {ch.email}
                  </span>
                  {ch.ccEmails.length > 0 && (
                    <span className="text-[11px] text-gray-400">
                      +{ch.ccEmails.length} CC
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> {ch.duration} min
                  </span>
                </div>
              </div>

              {/* Link */}
              <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <Link2 size={12} className="text-gray-400" />
                <span className="text-xs text-gray-600 font-mono truncate max-w-[180px]">
                  /rdv/{ch.slug}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyLink(ch.slug, ch.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Copier le lien"
                >
                  {copiedId === ch.id ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} className="text-gray-400" />
                  )}
                </button>
                <a
                  href={`/rdv/${ch.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Apercu"
                >
                  <Eye size={16} className="text-gray-400" />
                </a>
                <button
                  onClick={() => toggleActive(ch.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title={ch.active ? "Desactiver" : "Activer"}
                >
                  {ch.active ? (
                    <EyeOff size={16} className="text-gray-400" />
                  ) : (
                    <Eye size={16} className="text-green-500" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(ch)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Modifier"
                >
                  <Edit3 size={16} className="text-gray-400" />
                </button>
                <button
                  onClick={() => deleteChannel(ch.id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Channel Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b" style={{ backgroundColor: "#FAFBFD" }}>
              <h3 className="font-bold text-gray-900">
                {editingChannel ? "Modifier le canal" : "Nouveau canal de reservation"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-gray-200">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du canal *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm({
                      ...form,
                      name,
                      slug: editingChannel ? form.slug : generateSlug(name),
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                  placeholder="Ex: Service juridique, Info general, Marie Dupont..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lien de reservation
                </label>
                <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                  <span className="text-xs text-gray-400 bg-gray-50 px-3 py-2 border-r whitespace-nowrap">
                    {baseUrl}/rdv/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    className="flex-1 px-2 py-2 text-sm font-mono focus:outline-none"
                    placeholder="mon-canal"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Consultation generale, Departement RH..."
                />
              </div>

              {/* Email principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courriel de notification principal *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: info@soshubcanada.com, juridique@soshubcanada.com..."
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Ce courriel recevra les notifications de nouveaux RDV
                </p>
              </div>

              {/* CC Emails */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courriels en copie (CC)
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCcEmail())}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder="ajouter@courriel.com"
                  />
                  <button
                    onClick={addCcEmail}
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {form.ccEmails.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.ccEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                      >
                        <Mail size={10} />
                        {email}
                        <button
                          onClick={() => removeCcEmail(email)}
                          className="hover:text-red-500 ml-0.5"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Description affichee sur la page de reservation..."
                />
              </div>

              {/* Duration + Color row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duree</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 heure</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2 heures</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Palette size={14} /> Couleur
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CHANNEL_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-7 h-7 rounded-lg border-2 transition-all ${form.color === c ? "border-gray-800 scale-110 shadow" : "border-transparent hover:scale-105"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Appointment types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Types de RDV disponibles</label>
                <div className="flex flex-wrap gap-2">
                  {["Consultation", "Suivi", "Juridique", "Administratif"].map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.types.includes(t)
                          ? "bg-[#1B2559] text-white border-[#1B2559]"
                          : "border-gray-200 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign to CRM user */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lier a un employe CRM (optionnel)
                </label>
                <select
                  value={form.assignToUserId || ""}
                  onChange={(e) => setForm({ ...form, assignToUserId: e.target.value || undefined })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Aucun (canal generique)</option>
                  {DEMO_USERS.filter((u) => u.active).map((u) => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Si lie, le RDV apparaitra dans le calendrier de cet employe
                </p>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Canal actif</p>
                  <p className="text-[11px] text-gray-400">Les canaux inactifs ne sont plus accessibles au public</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`w-12 h-7 rounded-full transition-all ${form.active ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Annuler
              </button>
              <button
                onClick={saveChannel}
                disabled={!form.name || !form.email || !form.slug}
                className="px-6 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#1B2559" }}
              >
                {editingChannel ? "Enregistrer" : "Creer le canal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function CalendrierPage() {
  const { currentUser, clients, cases, appointments, setAppointments, refreshData } =
    useCrm();
  const [activeTab, setActiveTab] = useState<
    "calendrier" | "disponibilites" | "demandes" | "canaux"
  >("calendrier");
  const [calendarData, setCalendarData] = useState<CalendarData>({
    availability: {},
    bookingRequests: [],
  });

  useEffect(() => {
    setCalendarData(loadCalendarData());
  }, []);

  // Sync: inject Supabase appointments as booking requests for the "Demandes" tab
  useEffect(() => {
    if (!appointments.length) return;
    setCalendarData((prev) => {
      const existingIds = new Set((prev.bookingRequests ?? []).map((r) => r.id));
      const newRequests: BookingRequest[] = [];
      for (const a of appointments) {
        if (existingIds.has(a.id)) continue;
        // Only show recent appointments (last 30 days) that came from the site
        if (a.notes?.includes("Pris en ligne") || a.notes?.includes("RDV pris en ligne")) {
          const client = clients.find((c) => c.id === a.clientId);
          newRequests.push({
            id: a.id,
            clientId: a.clientId,
            clientName: client ? `${client.firstName} ${client.lastName}` : "Client site web",
            clientEmail: client?.email || "",
            type: (a.type === "consultation_initiale" ? "consultation" : a.type === "revision_formulaires" ? "juridique" : a.type === "suivi" ? "suivi" : "administratif") as BookingRequest["type"],
            preferredDate: a.date,
            preferredTime: a.time,
            duration: a.duration,
            status: a.status === "planifie" ? "pending" : a.status === "confirme" ? "confirmed" : a.status === "annule" ? "cancelled" : "confirmed",
            assignedTo: a.userId,
            confirmedDate: a.status !== "planifie" ? a.date : undefined,
            confirmedTime: a.status !== "planifie" ? a.time : undefined,
            notes: a.notes,
            createdAt: new Date().toISOString(),
          });
        }
      }
      if (newRequests.length === 0) return prev;
      return { ...prev, bookingRequests: [...(prev.bookingRequests ?? []), ...newRequests] };
    });
  }, [appointments, clients]);

  if (!currentUser) return null;
  const perms = ROLE_PERMISSIONS[currentUser.role];
  const isAdmin =
    currentUser.role === "superadmin" || currentUser.role === "coordinatrice";

  const pendingCount = (calendarData.bookingRequests ?? []).filter(
    (r) => r.status === "pending",
  ).length;

  const channelCount = (calendarData.bookingChannels ?? []).filter(c => c.active).length;

  const tabs = [
    {
      id: "calendrier" as const,
      label: "Calendrier",
      icon: CalendarDays,
      badge: 0,
    },
    {
      id: "disponibilites" as const,
      label: "Disponibilités",
      icon: Settings2,
      badge: 0,
    },
    {
      id: "demandes" as const,
      label: "Demandes",
      icon: ClipboardList,
      badge: pendingCount,
    },
    {
      id: "canaux" as const,
      label: "Canaux",
      icon: Link2,
      badge: channelCount,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "#EAEDF5" }}
          >
            <Calendar className="w-6 h-6" style={{ color: "#1B2559" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2559" }}>
              Calendrier
            </h1>
            <p className="text-sm text-gray-500">
              Gestion des rendez-vous et disponibilités
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh from Supabase */}
          <button
            onClick={() => refreshData()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-[#1B2559] hover:bg-gray-100 rounded-lg transition-colors"
            title="Rafraichir les rendez-vous"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Sync</span>
          </button>
          {/* Personal booking link */}
          {(() => {
            const slug = currentUser.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://soshubca.vercel.app";
            const bookingUrl = `${baseUrl}/rdv/${slug}`;
            return (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <a href={`/rdv/${slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-[#1B2559] truncate max-w-[200px]">
                    {bookingUrl.replace("https://", "")}
                  </a>
                  <button
                    onClick={() => { navigator.clipboard.writeText(bookingUrl); alert("Lien copié !"); }}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Copier le lien"
                  >
                    <ClipboardList size={14} className="text-gray-400" />
                  </button>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(bookingUrl); alert("Lien de réservation copié !\n" + bookingUrl); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#1B2559]/20 text-[#1B2559] hover:bg-[#1B2559]/5 transition-colors"
                >
                  <Send size={14} />
                  <span className="hidden sm:inline">Mon lien</span>
                </button>
              </div>
            );
          })()}
          {perms.canScheduleAppointments && activeTab === "calendrier" && (
            <button
              onClick={() => {
                const event = new CustomEvent("calendar-new-appt");
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: "#D4A03C" }}
            >
              <Plus className="w-4 h-4" />
              Nouveau rendez-vous
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-current"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              style={
                activeTab === tab.id ? { color: "#1B2559" } : {}
              }
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "calendrier" && (
        <CalendarTab
          appointments={appointments}
          setAppointments={setAppointments}
          clients={clients}
          cases={cases}
          currentUser={currentUser}
          perms={perms}
          calendarData={calendarData}
        />
      )}
      {activeTab === "disponibilites" && (
        <DisponibilitesTab
          calendarData={calendarData}
          setCalendarData={setCalendarData}
          appointments={appointments}
          currentUser={currentUser}
        />
      )}
      {activeTab === "demandes" && (
        <DemandesTab
          calendarData={calendarData}
          setCalendarData={setCalendarData}
          appointments={appointments}
          setAppointments={setAppointments}
          currentUser={currentUser}
        />
      )}
      {activeTab === "canaux" && isAdmin && (
        <CanauxTab
          calendarData={calendarData}
          setCalendarData={setCalendarData}
        />
      )}
    </div>
  );
}
