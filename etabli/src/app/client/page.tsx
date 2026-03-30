"use client";
// ========================================================
// SOS Hub Canada - Portail Client - Page de connexion
// ========================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { portalSignIn, portalResetPassword } from "@/lib/portal-auth";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: signInError } = await portalSignIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      router.push("/client/dashboard");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez entrer votre adresse courriel.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: resetError } = await portalResetPassword(email);
    if (resetError) {
      setError(resetError);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B2559] via-[#242E6B] to-[#1B2559] px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4A03C]/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D4A03C]/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <svg viewBox="0 0 280 120" width="150" height="65" aria-label="SOS Hub Canada">
              <path d="M10 10 H30 V18 H18 V102 H30 V110 H10 V10Z" fill="#FFFFFF"/>
              <path d="M250 10 H270 V110 H250 V102 H262 V18 H250 V10Z" fill="#FFFFFF"/>
              <text x="140" y="72" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="62" fill="#FFFFFF" letterSpacing="-1">SOS</text>
              <text x="140" y="105" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="36" fill="#D4A03C" letterSpacing="8">HUB</text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Portail Client</h1>
          <p className="text-white/60 text-sm">SOS Hub Canada</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
          {resetMode ? (
            /* Reset Password Form */
            <>
              <button
                onClick={() => { setResetMode(false); setError(null); setResetSent(false); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2559] mb-5 transition-colors"
              >
                <ArrowLeft size={16} />
                Retour
              </button>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={24} className="text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Courriel envoyé</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Si un compte existe avec cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Mot de passe oublié?</h2>
                    <p className="text-sm text-gray-500">Entrez votre adresse courriel pour recevoir un lien de réinitialisation.</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Courriel</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@courriel.com"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20 focus:border-[#1B2559] transition-all"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1B2559] hover:bg-[#242E6B] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
              )}
            </>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Connexion</h2>
                <p className="text-sm text-gray-500">Accédez à votre espace client sécurisé</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Courriel</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@courriel.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20 focus:border-[#1B2559] transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20 focus:border-[#1B2559] transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setResetMode(true); setError(null); }}
                  className="text-sm text-[#1B2559] hover:text-[#D4A03C] font-medium transition-colors"
                >
                  Mot de passe oublié?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1B2559] to-[#242E6B] hover:from-[#242E6B] hover:to-[#2D3780] text-white font-medium py-3 rounded-xl shadow-lg shadow-[#1B2559]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Accès réservé aux clients de SOS Hub Canada
        </p>
      </div>
    </div>
  );
}
