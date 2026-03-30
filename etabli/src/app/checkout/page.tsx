"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import {
  Check,
  ChevronLeft,
  CreditCard,
  User,
  ShoppingCart,
  ArrowRight,
  BookOpen,
  Briefcase,
  LayoutDashboard,
  Shield,
  Star,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const DURATIONS = [3, 6, 9, 12] as const;
type Duration = (typeof DURATIONS)[number];
type Plan = "standard" | "premium";

const PRICES: Record<Plan, Record<Duration, number>> = {
  standard: { 3: 59.99, 6: 49.99, 9: 39.99, 12: 34.99 },
  premium: { 3: 149.99, 6: 129.99, 9: 109.99, 12: 89.99 },
};

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

const STANDARD_FEATURES_FR = [
  "Simulateurs CRS + Arrima",
  "Francisation A1-B2",
  "Exercices interactifs",
  "SRS Leitner",
  "5 candidatures emploi/mois",
  "Guide établissement",
];
const STANDARD_FEATURES_EN = [
  "CRS + Arrima simulators",
  "Francisation A1-B2",
  "Interactive exercises",
  "Leitner SRS",
  "5 job applications/month",
  "Settlement guide",
];
const PREMIUM_FEATURES_FR = [
  "Tout Standard +",
  "Cours live illimités",
  "Prep TCF/TEF complète",
  "Candidatures illimitées + priorité",
  "Message personnalisé employeur",
  "Marketplace -10%",
  "Support prioritaire",
];
const PREMIUM_FEATURES_EN = [
  "Everything in Standard +",
  "Unlimited live classes",
  "Full TCF/TEF prep",
  "Unlimited applications + priority",
  "Personalized employer message",
  "Marketplace -10%",
  "Priority support",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isDuration(v: number): v is Duration {
  return [3, 6, 9, 12].includes(v);
}

function ProgressBar({ step, fr }: { step: number; fr: boolean }) {
  const labels = fr
    ? ["Plan", "Compte", "Paiement"]
    : ["Plan", "Account", "Payment"];
  const icons = [ShoppingCart, User, CreditCard];
  return (
    <div className="w-full max-w-lg mx-auto mb-10">
      <div className="flex items-center justify-between relative">
        {/* background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-[#1D9E75] transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
        {labels.map((label, i) => {
          const Icon = icons[i];
          const active = i + 1 <= step;
          const current = i + 1 === step;
          return (
            <div key={i} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  current
                    ? "bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/30 scale-110"
                    : active
                    ? "bg-[#1D9E75] text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {active && i + 1 < step ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs mt-2 font-semibold ${
                  active ? "text-[#085041]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 - Plan Summary                                              */
/* ------------------------------------------------------------------ */

function StepPlan({
  plan,
  setPlan,
  duration,
  setDuration,
  onNext,
  fr,
}: {
  plan: Plan;
  setPlan: (p: Plan) => void;
  duration: Duration;
  setDuration: (d: Duration) => void;
  onNext: () => void;
  fr: boolean;
}) {
  const monthly = PRICES[plan][duration];
  const total = monthly * duration;

  const stdFeats = fr ? STANDARD_FEATURES_FR : STANDARD_FEATURES_EN;
  const premFeats = fr ? PREMIUM_FEATURES_FR : PREMIUM_FEATURES_EN;
  const feats = plan === "standard" ? stdFeats : premFeats;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Plan toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setPlan("standard")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              plan === "standard"
                ? "bg-[#1D9E75] text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setPlan("premium")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              plan === "premium"
                ? "bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Star className="w-4 h-4" /> Premium
          </button>
        </div>
      </div>

      {/* Plan card */}
      <div
        className={`rounded-2xl border-2 p-8 ${
          plan === "premium"
            ? "border-[#D97706] bg-gradient-to-br from-[#FFFBEB] to-white"
            : "border-[#1D9E75] bg-white"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          {plan === "premium" ? (
            <Star className="w-6 h-6 text-[#D97706]" />
          ) : (
            <Zap className="w-6 h-6 text-[#1D9E75]" />
          )}
          <h2
            className={`text-2xl font-bold font-[family-name:var(--font-heading)] ${
              plan === "premium" ? "text-[#D97706]" : "text-[#085041]"
            }`}
          >
            etabli. {plan === "premium" ? "Premium" : "Standard"}
          </h2>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {feats.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-gray-700"
            >
              <Check
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  plan === "premium" ? "text-[#D97706]" : "text-[#1D9E75]"
                }`}
              />
              {f}
            </li>
          ))}
        </ul>

        {/* Duration selector */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-500 mb-3">
            {fr ? "Durée de l'abonnement" : "Subscription duration"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  duration === d
                    ? plan === "premium"
                      ? "bg-[#D97706] text-white shadow-lg shadow-[#D97706]/25"
                      : "bg-[#085041] text-white shadow-lg shadow-[#085041]/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {d} {fr ? "mois" : "mo"}
              </button>
            ))}
          </div>
          {duration >= 9 && (
            <p className="text-xs text-[#1D9E75] font-semibold mt-2 text-center">
              {fr ? "Meilleur prix!" : "Best value!"}
            </p>
          )}
        </div>

        {/* Price summary */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-gray-500">
              {fr ? "Prix mensuel" : "Monthly price"}
            </span>
            <span className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              ${monthly.toFixed(2)}
              <span className="text-sm font-normal text-gray-400">
                /{fr ? "mois" : "mo"}
              </span>
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                ${monthly.toFixed(2)}/{fr ? "mois" : "mo"} x {duration}{" "}
                {fr ? "mois" : "months"}
              </span>
              <span
                className={`text-xl font-bold font-[family-name:var(--font-heading)] ${
                  plan === "premium" ? "text-[#D97706]" : "text-[#085041]"
                }`}
              >
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className={`w-full mt-6 py-4 rounded-xl font-semibold text-white text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
          plan === "premium"
            ? "bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:opacity-90 shadow-[#D97706]/25"
            : "bg-[#1D9E75] hover:bg-[#178a65] shadow-[#1D9E75]/25"
        }`}
      >
        {fr ? "Continuer" : "Continue"} <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 - Account Information                                       */
/* ------------------------------------------------------------------ */

interface AccountData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

function StepAccount({
  onNext,
  onBack,
  fr,
  accountData,
  setAccountData,
}: {
  onNext: () => void;
  onBack: () => void;
  fr: boolean;
  accountData: AccountData;
  setAccountData: (d: AccountData) => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof AccountData, string>>>({});
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("etabli_user_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name && parsed.email) {
          setHasProfile(true);
          setProfileData(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  function useExistingProfile() {
    if (!profileData) return;
    setAccountData({
      name: profileData.name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      password: "existing_user",
      confirmPassword: "existing_user",
    });
    onNext();
  }

  function validate(): boolean {
    const e: Partial<Record<keyof AccountData, string>> = {};
    if (!accountData.name.trim())
      e.name = fr ? "Nom requis" : "Name required";
    if (!accountData.email.trim() || !/\S+@\S+\.\S+/.test(accountData.email))
      e.email = fr ? "Courriel invalide" : "Invalid email";
    if (!accountData.phone.trim())
      e.phone = fr ? "Téléphone requis" : "Phone required";
    if (accountData.password.length < 8)
      e.password = fr
        ? "Minimum 8 caractères"
        : "Minimum 8 characters";
    if (accountData.password !== accountData.confirmPassword)
      e.confirmPassword = fr
        ? "Les mots de passe ne correspondent pas"
        : "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  const fields: { key: keyof AccountData; label: string; type: string; placeholder: string }[] = [
    {
      key: "name",
      label: fr ? "Nom complet" : "Full name",
      type: "text",
      placeholder: fr ? "Jean Tremblay" : "John Smith",
    },
    {
      key: "email",
      label: fr ? "Courriel" : "Email",
      type: "email",
      placeholder: fr ? "nom@exemple.com" : "name@example.com",
    },
    {
      key: "phone",
      label: fr ? "Téléphone" : "Phone",
      type: "tel",
      placeholder: "+1 (514) 555-0123",
    },
    {
      key: "password",
      label: fr ? "Mot de passe" : "Password",
      type: "password",
      placeholder: fr ? "Minimum 8 caractères" : "Minimum 8 characters",
    },
    {
      key: "confirmPassword",
      label: fr ? "Confirmer mot de passe" : "Confirm password",
      type: "password",
      placeholder: fr ? "Retaper le mot de passe" : "Re-enter password",
    },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#085041] transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> {fr ? "Retour" : "Back"}
      </button>

      <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
        {fr ? "Informations du compte" : "Account information"}
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        {fr
          ? "Crée ton compte pour finaliser l'abonnement."
          : "Create your account to finalize your subscription."}
      </p>

      {/* Existing profile banner */}
      {hasProfile && profileData && (
        <div className="bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#1D9E75] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#085041] mb-1">
                {fr ? "Profil existant détecté" : "Existing profile detected"}
              </p>
              <p className="text-sm text-gray-600">
                {profileData.name} &mdash; {profileData.email}
              </p>
              <button
                onClick={useExistingProfile}
                className="mt-3 px-4 py-2 bg-[#1D9E75] text-white text-sm font-semibold rounded-lg hover:bg-[#178a65] transition"
              >
                {fr ? "Utiliser ce profil" : "Use this profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {f.label}
            </label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={accountData[f.key]}
              onChange={(e) =>
                setAccountData({ ...accountData, [f.key]: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors[f.key]
                  ? "border-red-300 focus:ring-red-300 bg-red-50"
                  : "border-gray-200 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
              }`}
            />
            {errors[f.key] && (
              <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="w-full mt-8 py-4 rounded-xl font-semibold text-white text-lg bg-[#1D9E75] hover:bg-[#178a65] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1D9E75]/25"
      >
        {fr ? "Continuer" : "Continue"} <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 - Payment                                                   */
/* ------------------------------------------------------------------ */

function StepPayment({
  plan,
  duration,
  onBack,
  onComplete,
  fr,
}: {
  plan: Plan;
  duration: Duration;
  onBack: () => void;
  onComplete: () => void;
  fr: boolean;
}) {
  const monthly = PRICES[plan][duration];
  const total = monthly * duration;

  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  function formatCard(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (card.replace(/\s/g, "").length < 16)
      e.card = fr ? "Numéro invalide" : "Invalid number";
    if (expiry.length < 5)
      e.expiry = fr ? "Date invalide" : "Invalid date";
    if (cvc.length < 3) e.cvc = fr ? "CVC invalide" : "Invalid CVC";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePay() {
    if (!validate()) return;
    setProcessing(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#085041] transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> {fr ? "Retour" : "Back"}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Payment form */}
        <div className="md:col-span-3">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
            {fr ? "Paiement" : "Payment"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {fr
              ? "Mode demo \u2014 aucun paiement reel ne sera effectue"
              : "Demo mode \u2014 no real payment will be processed"}
          </p>

          <div className="space-y-5">
            {/* Card number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {fr ? "Numéro de carte" : "Card number"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={card}
                  onChange={(e) => setCard(formatCard(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.card
                      ? "border-red-300 focus:ring-red-300 bg-red-50"
                      : "border-gray-200 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                  }`}
                />
                <CreditCard className="absolute right-3 top-3.5 w-5 h-5 text-gray-300" />
              </div>
              {errors.card && (
                <p className="text-xs text-red-500 mt-1">{errors.card}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {fr ? "Expiration" : "Expiry"}
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.expiry
                      ? "border-red-300 focus:ring-red-300 bg-red-50"
                      : "border-gray-200 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                  }`}
                />
                {errors.expiry && (
                  <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>
                )}
              </div>

              {/* CVC */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  CVC
                </label>
                <input
                  type="text"
                  placeholder="123"
                  maxLength={3}
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.cvc
                      ? "border-red-300 focus:ring-red-300 bg-red-50"
                      : "border-gray-200 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                  }`}
                />
                {errors.cvc && (
                  <p className="text-xs text-red-500 mt-1">{errors.cvc}</p>
                )}
              </div>
            </div>

            {/* Accepted cards */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="font-medium">{fr ? "Cartes acceptées :" : "Accepted cards:"}</span>
              <span className="px-2 py-1 bg-gray-100 rounded font-semibold text-gray-500">
                VISA
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded font-semibold text-gray-500">
                Mastercard
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded font-semibold text-gray-500">
                Amex
              </span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className={`w-full mt-8 py-4 rounded-xl font-semibold text-white text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
              processing
                ? "bg-gray-400 cursor-not-allowed"
                : plan === "premium"
                ? "bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:opacity-90 shadow-[#D97706]/25"
                : "bg-[#1D9E75] hover:bg-[#178a65] shadow-[#1D9E75]/25"
            }`}
          >
            {processing ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                {fr ? "Traitement..." : "Processing..."}
              </>
            ) : (
              <>
                {fr ? "Payer" : "Pay"} ${total.toFixed(2)}
              </>
            )}
          </button>
        </div>

        {/* Order summary sidebar */}
        <div className="md:col-span-2">
          <div
            className={`rounded-2xl border p-6 sticky top-8 ${
              plan === "premium"
                ? "border-[#D97706]/30 bg-gradient-to-br from-[#FFFBEB] to-white"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              {fr ? "Résumé de la commande" : "Order summary"}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{fr ? "Plan" : "Plan"}</span>
                <span className="font-semibold text-gray-900">
                  {plan === "premium" ? "Premium" : "Standard"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {fr ? "Durée" : "Duration"}
                </span>
                <span className="font-semibold text-gray-900">
                  {duration} {fr ? "mois" : "months"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {fr ? "Mensuel" : "Monthly"}
                </span>
                <span className="font-semibold text-gray-900">
                  ${monthly.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span
                    className={`text-xl font-bold font-[family-name:var(--font-heading)] ${
                      plan === "premium" ? "text-[#D97706]" : "text-[#085041]"
                    }`}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Success Screen                                                     */
/* ------------------------------------------------------------------ */

function SuccessScreen({ plan, duration, fr }: { plan: Plan; duration: Duration; fr: boolean }) {
  const monthly = PRICES[plan][duration];
  const total = monthly * duration;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + duration);

  const fmt = (d: Date) =>
    d.toLocaleDateString(fr ? "fr-CA" : "en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Animated checkmark */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E1F5EE] flex items-center justify-center animate-[scaleIn_0.5s_ease-out]">
        <Check className="w-10 h-10 text-[#1D9E75]" strokeWidth={3} />
      </div>

      <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
        {fr
          ? `Bienvenue dans etabli. ${plan === "premium" ? "Premium" : "Standard"}!`
          : `Welcome to etabli. ${plan === "premium" ? "Premium" : "Standard"}!`}
      </h2>
      <p className="text-gray-500 mb-8">
        {fr
          ? "Ton abonnement est maintenant actif."
          : "Your subscription is now active."}
      </p>

      {/* Subscription details */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-left mb-8">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          {fr ? "Détails de l'abonnement" : "Subscription details"}
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{fr ? "Plan" : "Plan"}</span>
            <span className="font-semibold text-gray-900">
              {plan === "premium" ? "Premium" : "Standard"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{fr ? "Début" : "Start"}</span>
            <span className="font-semibold text-gray-900">{fmt(startDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{fr ? "Fin" : "End"}</span>
            <span className="font-semibold text-gray-900">{fmt(endDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">
              {fr ? "Prochaine facturation" : "Next billing"}
            </span>
            <span className="font-semibold text-gray-900">{fmt(nextBilling)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="font-bold text-gray-700">Total</span>
              <span className="font-bold text-[#085041] font-[family-name:var(--font-heading)]">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Link
          href="/francisation"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white bg-[#1D9E75] hover:bg-[#178a65] transition-all shadow-lg shadow-[#1D9E75]/25"
        >
          <BookOpen className="w-5 h-5" />
          {fr ? "Commencer la francisation" : "Start francisation"}
        </Link>
        <Link
          href="/emplois"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-[#085041] bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <Briefcase className="w-5 h-5" />
          {fr ? "Voir les emplois" : "Browse jobs"}
        </Link>
        <Link
          href="/francisation/tableau-de-bord"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-[#085041] bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <LayoutDashboard className="w-5 h-5" />
          {fr ? "Mon tableau de bord" : "My dashboard"}
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Checkout Content (reads search params)                        */
/* ------------------------------------------------------------------ */

function CheckoutContent() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const searchParams = useSearchParams();

  const paramPlan = searchParams.get("plan");
  const paramDuration = searchParams.get("duration");

  const [plan, setPlan] = useState<Plan>(
    paramPlan === "premium" ? "premium" : "standard"
  );
  const [duration, setDuration] = useState<Duration>(() => {
    const d = parseInt(paramDuration || "3", 10);
    return isDuration(d) ? d : 3;
  });
  const [step, setStep] = useState(1);
  const [accountData, setAccountData] = useState<AccountData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [completed, setCompleted] = useState(false);

  const handleComplete = useCallback(() => {
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration);

    const monthly = PRICES[plan][duration];
    const total = monthly * duration;

    // Save subscription
    const subscription = {
      plan,
      duration,
      startDate,
      endDate: endDate.toISOString(),
      status: "active",
      monthlyPrice: monthly,
      total,
    };
    localStorage.setItem("etabli_subscription", JSON.stringify(subscription));

    // Update or create user profile
    let profile: Record<string, string> = {};
    try {
      const existing = localStorage.getItem("etabli_user_profile");
      if (existing) profile = JSON.parse(existing);
    } catch {
      /* ignore */
    }
    profile.tier = plan;
    if (accountData.name) profile.name = accountData.name;
    if (accountData.email) profile.email = accountData.email;
    if (accountData.phone) profile.phone = accountData.phone;
    localStorage.setItem("etabli_user_profile", JSON.stringify(profile));

    setCompleted(true);
  }, [plan, duration, accountData]);

  if (completed) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SuccessScreen plan={plan} duration={duration} fr={fr} />
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero header */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-2">
            {fr ? "Finaliser ton abonnement" : "Complete your subscription"}
          </h1>
          <p className="text-white/60 text-sm">
            {fr
              ? "Sécurisé, rapide, et sans engagement."
              : "Secure, fast, and commitment-free."}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-16 bg-gray-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgressBar step={step} fr={fr} />

          {step === 1 && (
            <StepPlan
              plan={plan}
              setPlan={setPlan}
              duration={duration}
              setDuration={setDuration}
              onNext={() => setStep(2)}
              fr={fr}
            />
          )}

          {step === 2 && (
            <StepAccount
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              fr={fr}
              accountData={accountData}
              setAccountData={setAccountData}
            />
          )}

          {step === 3 && (
            <StepPayment
              plan={plan}
              duration={duration}
              onBack={() => setStep(2)}
              onComplete={handleComplete}
              fr={fr}
            />
          )}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Export                                                         */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <Shell>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-4 border-[#1D9E75] border-t-transparent rounded-full" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </Shell>
  );
}
