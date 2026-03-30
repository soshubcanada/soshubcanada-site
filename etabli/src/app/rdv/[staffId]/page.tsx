"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CalendarPlus,
  Globe,
  MapPin,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChannelData {
  slug: string;
  name: string;
  title: string;
  bio: string;
  color: string;
  duration: number;
  types: string[];
}

interface Booking {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  email: string;
  phone: string;
  type: string;
  notes: string;
  createdAt: string;
}

type Step = "date" | "time" | "form" | "confirmation";

const DEFAULT_TYPES = [
  "Consultation",
  "Suivi",
  "Juridique",
  "Administratif",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NAVY = "#1B2559";
const GOLD = "#D4A03C";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateId() {
  return `rdv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDateFr(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const months = [
    "janvier",
    "fevrier",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "aout",
    "septembre",
    "octobre",
    "novembre",
    "decembre",
  ];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function buildTimeSlots(): string[] {
  const slots: string[] = [];
  // Morning: 9:00 - 12:00
  for (let h = 9; h < 12; h++) {
    slots.push(`${pad(h)}:00`);
    slots.push(`${pad(h)}:30`);
  }
  // Afternoon: 13:00 - 17:00
  for (let h = 13; h < 17; h++) {
    slots.push(`${pad(h)}:00`);
    slots.push(`${pad(h)}:30`);
  }
  return slots;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based (Mon=0)
  return day === 0 ? 6 : day - 1;
}

function isWeekend(year: number, month: number, day: number) {
  const d = new Date(year, month, day).getDay();
  return d === 0 || d === 6;
}

function isPast(year: number, month: number, day: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(year, month, day);
  return target < today;
}

function isToday(year: number, month: number, day: number) {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getBookingsFromStorage(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("soshub_bookings") || "[]");
  } catch {
    return [];
  }
}

function saveBookingToStorage(booking: Booking) {
  const bookings = getBookingsFromStorage();
  bookings.push(booking);
  localStorage.setItem("soshub_bookings", JSON.stringify(bookings));
}

function buildGoogleCalendarUrl(booking: Booking, channel: ChannelData) {
  const duration = channel.duration || 30;
  const start = booking.date.replace(/-/g, "") + "T" + booking.time.replace(":", "") + "00";
  const [h, m] = booking.time.split(":").map(Number);
  const endMin = m + duration;
  const endH = h + Math.floor(endMin / 60);
  const endM = endMin % 60;
  const end = booking.date.replace(/-/g, "") + "T" + pad(endH) + pad(endM) + "00";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `RDV ${booking.type} - ${channel.name}`,
    dates: `${start}/${end}`,
    details: `Rendez-vous ${booking.type} avec ${channel.name}`,
    location: "SOS Hub Canada",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function ChannelAvatar({
  channel,
  size = "lg",
}: {
  channel: ChannelData;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "w-20 h-20 text-2xl" : "w-12 h-12 text-base";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-bold text-white shadow-lg`}
      style={{
        background: `linear-gradient(135deg, ${channel.color}, ${GOLD})`,
      }}
    >
      {getInitials(channel.name)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calendar component
// ---------------------------------------------------------------------------

function CalendarGrid({
  selectedDate,
  onSelect,
}: {
  selectedDate: string | null;
  onSelect: (d: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthNames = [
    "Janvier",
    "Fevrier",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Aout",
    "Septembre",
    "Octobre",
    "Novembre",
    "Decembre",
  ];
  const dayHeaders = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const maxMonth = today.getMonth() + 2; // current + next month
  const maxYear =
    today.getMonth() + 2 > 11 ? today.getFullYear() + 1 : today.getFullYear();
  const maxMonthNorm = maxMonth > 11 ? maxMonth - 12 : maxMonth;
  const canGoNext =
    viewYear < maxYear ||
    (viewYear === maxYear && viewMonth < maxMonthNorm);

  function prev() {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function next() {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prev}
          disabled={!canGoPrev}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold" style={{ color: NAVY }}>
          {monthNames[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={next}
          disabled={!canGoNext}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayHeaders.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const disabled =
            isPast(viewYear, viewMonth, day) ||
            isWeekend(viewYear, viewMonth, day);
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const selected = selectedDate === dateStr;
          const todayCell = isToday(viewYear, viewMonth, day);

          return (
            <button
              key={dateStr}
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                ${disabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-amber-50 cursor-pointer"}
                ${selected ? "text-white shadow-md scale-105" : ""}
                ${!selected && !disabled ? "text-gray-700" : ""}
              `}
              style={
                selected
                  ? { backgroundColor: GOLD }
                  : undefined
              }
            >
              {day}
              {todayCell && !selected && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Time slot picker
// ---------------------------------------------------------------------------

function TimeSlotPicker({
  selectedDate,
  staffId,
  selectedTime,
  onSelect,
}: {
  selectedDate: string;
  staffId: string;
  selectedTime: string | null;
  onSelect: (t: string) => void;
}) {
  const allSlots = useMemo(() => buildTimeSlots(), []);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    const bookings = getBookingsFromStorage();
    const booked = new Set(
      bookings
        .filter((b) => b.staffId === staffId && b.date === selectedDate)
        .map((b) => b.time)
    );
    setBookedSlots(booked);
  }, [staffId, selectedDate]);

  // Filter out slots in the past if the date is today
  const today = new Date();
  const isSelectedToday =
    selectedDate === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const availableSlots = allSlots.filter((slot) => {
    if (bookedSlots.has(slot)) return false;
    if (isSelectedToday) {
      const [h, m] = slot.split(":").map(Number);
      const slotMinutes = h * 60 + m;
      const nowMinutes = today.getHours() * 60 + today.getMinutes();
      if (slotMinutes <= nowMinutes) return false;
    }
    return true;
  });

  const morningSlots = availableSlots.filter((s) => parseInt(s) < 12);
  const afternoonSlots = availableSlots.filter((s) => parseInt(s) >= 13);

  function SlotGroup({ label, slots }: { label: string; slots: string[] }) {
    if (slots.length === 0) return null;
    return (
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          {label}
        </p>
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => {
            const active = selectedTime === slot;
            return (
              <button
                key={slot}
                onClick={() => onSelect(slot)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                  ${
                    active
                      ? "text-white border-transparent shadow-md scale-105"
                      : "border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50"
                  }
                `}
                style={
                  active
                    ? { backgroundColor: GOLD, borderColor: GOLD }
                    : undefined
                }
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock size={32} className="mx-auto mb-2 opacity-40" />
        <p>Aucun creneau disponible pour cette date.</p>
        <p className="text-sm mt-1">Veuillez choisir une autre date.</p>
      </div>
    );
  }

  return (
    <div>
      <SlotGroup label="Matin" slots={morningSlots} />
      <SlotGroup label="Apres-midi" slots={afternoonSlots} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Booking form
// ---------------------------------------------------------------------------

function BookingForm({
  onSubmit,
  submitting = false,
  appointmentTypes = DEFAULT_TYPES,
}: {
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    type: string;
    notes: string;
  }) => void;
  submitting?: boolean;
  appointmentTypes?: string[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState(appointmentTypes[0] || "Consultation");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Nom requis";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Email invalide";
    if (!phone.trim()) errs.phone = "Telephone requis";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit({ name, email, phone, type, notes });
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-lg border ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200"
    } focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all text-sm`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
          <User size={14} /> Nom complet
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass("name")}
          placeholder="Jean Dupont"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
          <Mail size={14} /> Courriel
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass("email")}
          placeholder="jean@exemple.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
          <Phone size={14} /> Telephone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass("phone")}
          placeholder="+1 (514) 000-0000"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
          <FileText size={14} /> Type de rendez-vous
        </label>
        <div className="grid grid-cols-2 gap-2">
          {appointmentTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                type === t
                  ? "text-white border-transparent shadow-sm"
                  : "border-gray-200 text-gray-600 hover:border-amber-300"
              }`}
              style={
                type === t
                  ? { backgroundColor: NAVY }
                  : undefined
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
          <FileText size={14} /> Notes (optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all text-sm resize-none"
          placeholder="Decrivez brievement l'objet de votre rendez-vous..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-lg text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: NAVY }}
      >
        {submitting ? "Enregistrement en cours..." : "Confirmer le rendez-vous"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Confirmation
// ---------------------------------------------------------------------------

function ConfirmationScreen({
  booking,
  channel,
}: {
  booking: Booking;
  channel: ChannelData;
}) {
  const gcalUrl = buildGoogleCalendarUrl(booking, channel);

  return (
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "#E8F5E9" }}
      >
        <CheckCircle2 size={32} style={{ color: "#4CAF50" }} />
      </div>

      <h2
        className="text-xl font-bold mb-1"
        style={{ color: NAVY }}
      >
        Rendez-vous confirme!
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Un courriel de confirmation a ete envoye a {booking.email}
      </p>

      <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {formatDateFr(booking.date)}
            </p>
            <p className="text-sm text-gray-500">
              {booking.time} - {(() => {
                const [h, m] = booking.time.split(":").map(Number);
                const endM = m + 30;
                return `${pad(h + Math.floor(endM / 60))}:${pad(endM % 60)}`;
              })()}{" "}
              (30 min)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User size={18} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-800">{channel.name}</p>
            <p className="text-sm text-gray-500">{channel.title}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText size={18} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-800">{booking.type}</p>
        </div>

        {booking.notes && (
          <div className="flex items-start gap-3">
            <FileText size={18} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-500 italic">{booking.notes}</p>
          </div>
        )}
      </div>

      <a
        href={gcalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm shadow hover:shadow-md transition-all duration-200"
        style={{ backgroundColor: NAVY }}
      >
        <CalendarPlus size={16} />
        Ajouter a Google Agenda
      </a>

      <p className="text-xs text-gray-400 mt-4">
        Reference: {booking.id}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 404 screen
// ---------------------------------------------------------------------------

function ChannelNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#FFF3E0" }}
        >
          <User size={32} style={{ color: GOLD }} />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: NAVY }}>
          Canal introuvable
        </h1>
        <p className="text-gray-500 text-sm">
          Ce lien de rendez-vous n&apos;est pas valide ou n&apos;est plus actif.
          Veuillez verifier l&apos;URL ou contacter SOS Hub Canada.
        </p>
        <a
          href="https://soshubcanada.com"
          className="inline-block mt-6 px-5 py-2.5 rounded-lg text-white font-medium text-sm"
          style={{ backgroundColor: NAVY }}
        >
          Retour au site
        </a>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-gray-200 rounded-full animate-spin mx-auto mb-3" style={{ borderTopColor: GOLD }} />
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function BookingPage() {
  const params = useParams();
  const staffId = params.staffId as string;

  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch channel data from API
  useEffect(() => {
    async function loadChannel() {
      try {
        const res = await fetch(`/api/crm/appointments/channels?slug=${encodeURIComponent(staffId)}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.channel) {
          setChannel(data.channel);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    loadChannel();
  }, [staffId]);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    setStep("form");
  }, []);

  const handleFormSubmit = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      type: string;
      notes: string;
    }) => {
      if (!selectedDate || !selectedTime || submitting) return;
      setSubmitting(true);

      const newBooking: Booking = {
        id: generateId(),
        staffId,
        date: selectedDate,
        time: selectedTime,
        ...data,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage (local slot blocking)
      saveBookingToStorage(newBooking);

      // POST to API → Supabase + emails
      try {
        const res = await fetch("/api/crm/appointments/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staffId,
            date: selectedDate,
            time: selectedTime,
            name: data.name,
            email: data.email,
            phone: data.phone,
            type: data.type,
            notes: data.notes,
          }),
        });
        const result = await res.json();
        if (result.appointmentId) {
          newBooking.id = result.appointmentId;
        }
      } catch (err) {
        console.error("Booking API error:", err);
      }

      setBooking(newBooking);
      setStep("confirmation");
      setSubmitting(false);
    },
    [selectedDate, selectedTime, staffId, submitting]
  );

  const goBack = useCallback(() => {
    if (step === "time") {
      setStep("date");
      setSelectedTime(null);
    } else if (step === "form") {
      setStep("time");
    }
  }, [step]);

  if (loading) return <LoadingScreen />;
  if (notFound || !channel) return <ChannelNotFound />;

  const stepLabel: Record<Step, string> = {
    date: "Choisir une date",
    time: "Choisir un creneau",
    form: "Vos informations",
    confirmation: "Confirmation",
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header bar */}
      <header
        className="w-full py-3 px-4 text-center text-white text-xs font-medium tracking-wide"
        style={{ backgroundColor: NAVY }}
      >
        <div className="flex items-center justify-center gap-2">
          <Globe size={14} />
          <span>SOS Hub Canada &mdash; Prise de rendez-vous en ligne</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Channel header */}
            <div
              className="px-6 py-6 text-white"
              style={{
                background: `linear-gradient(135deg, ${channel.color} 0%, ${NAVY} 100%)`,
              }}
            >
              <div className="flex items-center gap-4">
                <ChannelAvatar channel={channel} />
                <div>
                  <h1 className="text-xl font-bold">{channel.name}</h1>
                  <p className="text-sm opacity-80">{channel.title}</p>
                  <p className="text-xs opacity-60 mt-1">{channel.bio}</p>
                </div>
              </div>
              {/* Duration badge */}
              <div className="mt-4 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
                <Clock size={12} />
                <span>{channel.duration} minutes</span>
              </div>
            </div>

            {/* Step indicator */}
            <div className="px-6 pt-5 pb-2">
              <div className="flex items-center gap-2 mb-1">
                {step !== "date" && step !== "confirmation" && (
                  <button
                    onClick={goBack}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={16} className="text-gray-400" />
                  </button>
                )}
                <p className="text-sm font-semibold" style={{ color: NAVY }}>
                  {stepLabel[step]}
                </p>
              </div>
              {/* Progress bar */}
              <div className="flex gap-1 mt-2">
                {(["date", "time", "form", "confirmation"] as Step[]).map(
                  (s, i) => {
                    const currentIdx = ["date", "time", "form", "confirmation"].indexOf(step);
                    return (
                      <div
                        key={s}
                        className="h-1 flex-1 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: i <= currentIdx ? GOLD : "#E5E7EB",
                        }}
                      />
                    );
                  }
                )}
              </div>
              {/* Selected date/time summary */}
              {selectedDate && step !== "date" && step !== "confirmation" && (
                <p className="text-xs text-gray-400 mt-2">
                  {formatDateFr(selectedDate)}
                  {selectedTime && ` a ${selectedTime}`}
                </p>
              )}
            </div>

            {/* Content area */}
            <div className="px-6 pb-6 pt-2">
              <div
                key={step}
                className="animate-[fadeIn_0.3s_ease-out]"
              >
                {step === "date" && (
                  <CalendarGrid
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                  />
                )}
                {step === "time" && selectedDate && (
                  <TimeSlotPicker
                    selectedDate={selectedDate}
                    staffId={staffId}
                    selectedTime={selectedTime}
                    onSelect={handleTimeSelect}
                  />
                )}
                {step === "form" && (
                  <BookingForm
                    onSubmit={handleFormSubmit}
                    submitting={submitting}
                    appointmentTypes={channel.types}
                  />
                )}
                {step === "confirmation" && booking && (
                  <ConfirmationScreen booking={booking} channel={channel} />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <a
                href="mailto:info@soshubcanada.com"
                className="flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                <Mail size={12} />
                info@soshubcanada.com
              </a>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                Montreal, QC
              </span>
            </div>
            <p className="text-[11px] text-gray-300">
              Powered by{" "}
              <span className="font-semibold" style={{ color: NAVY }}>
                SOS Hub Canada
              </span>
            </p>
          </footer>
        </div>
      </main>

      {/* CSS animation keyframe */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
