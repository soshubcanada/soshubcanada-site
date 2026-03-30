"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { portalEmployerSignIn, portalResetPassword } from "@/lib/portal-auth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

type Mode = "login" | "reset" | "reset_sent";

export default function EmployeurLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const { user, error: authError } = await portalEmployerSignIn(email, password);
      if (authError || !user) {
        setError(authError ?? "Identifiants invalides.");
        setLoading(false);
        return;
      }
      router.push("/employeur/dashboard");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Veuillez entrer votre courriel.");
      return;
    }
    setLoading(true);
    const { error: resetError } = await portalResetPassword(email);
    setLoading(false);
    if (resetError) {
      setError(resetError);
    } else {
      setMode("reset_sent");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2559] via-[#242E6B] to-[#1B2559] flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4A03C]/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4A03C]/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-white/[0.02] rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 280 120" width="150" height="65" aria-label="SOS Hub Canada">
              <path d="M10 10 H30 V18 H18 V102 H30 V110 H10 V10Z" fill="#FFFFFF"/>
              <path d="M250 10 H270 V110 H250 V102 H262 V18 H250 V10Z" fill="#FFFFFF"/>
              <text x="140" y="72" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="62" fill="#FFFFFF" letterSpacing="-1">SOS</text>
              <text x="140" y="105" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="36" fill="#D4A03C" letterSpacing="8">HUB</text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Portail Employeur</h1>
          <p className="text-white/60 text-sm mt-1">SOS Hub Canada</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
          {/* Login Mode */}
          {mode === "login" && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Connexion</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Accédez à votre espace employeur
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Courriel
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="employeur@entreprise.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C] outline-none placeholder:text-gray-400 transition-colors"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="Votre mot de passe"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C] outline-none placeholder:text-gray-400 transition-colors"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: "#1B2559" }}
                  onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = "#242E6B"); }}
                  onMouseLeave={(e) => { (e.currentTarget.style.backgroundColor = "#1B2559"); }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>

                {/* Forgot password */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setMode("reset"); setError(""); }}
                    className="text-sm text-[#D4A03C] hover:text-[#b8882e] font-medium transition-colors"
                  >
                    Mot de passe oubli&eacute;?
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Reset Mode */}
          {mode === "reset" && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  R&eacute;initialiser le mot de passe
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Entrez votre courriel pour recevoir un lien de r&eacute;initialisation
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Courriel
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="employeur@entreprise.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C] outline-none placeholder:text-gray-400 transition-colors"
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: "#D4A03C" }}
                  onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = "#b8882e"); }}
                  onMouseLeave={(e) => { (e.currentTarget.style.backgroundColor = "#D4A03C"); }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>
            </>
          )}

          {/* Reset Sent */}
          {mode === "reset_sent" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Courriel envoy&eacute;
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Si un compte existe avec ce courriel, vous recevrez un lien de r&eacute;initialisation.
              </p>
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="text-sm text-[#1B2559] hover:text-[#242E6B] font-medium transition-colors"
              >
                Retour &agrave; la connexion
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6 px-4">
          Acc&egrave;s r&eacute;serv&eacute; aux employeurs partenaires de SOS Hub Canada
        </p>
      </div>
    </div>
  );
}
