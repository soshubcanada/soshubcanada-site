"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  Heart,
  ArrowRight,
  CheckCircle,
  Shield,
  Globe,
  Users,
  Gift,
  Mail,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// ─── TYPES ───
type Partner = {
  email: string;
  type: "employeur" | "professionnel" | "organisme";
  name: string;
};

// ─── PARTNER TYPE CARD ───
function PartnerCard({
  icon,
  color,
  colorBg,
  colorBorder,
  title,
  description,
  benefits,
  cta,
  href,
}: {
  icon: React.ReactNode;
  color: string;
  colorBg: string;
  colorBorder: string;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  href: string;
}) {
  return (
    <div
      className="group bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
      style={{ borderColor: colorBorder }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: colorBg }}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Benefits */}
      <div className="px-6 pb-4 flex-1">
        <ul className="space-y-2">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle
                size={16}
                className="shrink-0 mt-0.5"
                style={{ color }}
              />
              <span className="text-gray-700">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="p-6 pt-2">
        <Link
          href={href}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:gap-3"
          style={{ backgroundColor: color }}
        >
          {cta}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───
function PortailPage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState({ employeurs: 0, professionnels: 0, organismes: 0 });

  // Load stats from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("etabli_partners");
      if (raw) {
        const partners: Partner[] = JSON.parse(raw);
        setStats({
          employeurs: partners.filter((p) => p.type === "employeur").length,
          professionnels: partners.filter((p) => p.type === "professionnel").length,
          organismes: partners.filter((p) => p.type === "organisme").length,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogin = () => {
    setLoginError("");
    if (!email.trim()) {
      setLoginError(
        fr ? "Veuillez entrer votre courriel." : "Please enter your email."
      );
      return;
    }
    try {
      const raw = localStorage.getItem("etabli_partners");
      if (raw) {
        const partners: Partner[] = JSON.parse(raw);
        const found = partners.find(
          (p) => p.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (found) {
          window.location.href = `/portail/dashboard?email=${encodeURIComponent(found.email)}`;
          return;
        }
      }
    } catch {
      // ignore
    }
    setLoginError(
      fr
        ? "Aucun compte partenaire trouvé avec ce courriel."
        : "No partner account found with this email."
    );
  };

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#1D9E75] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={14} className="text-[#D97706]" />
            <span className="text-white/90 text-xs font-medium">
              {fr ? "Espace partenaires" : "Partner space"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4 leading-tight">
            {fr
              ? "Portail partenaires etabli."
              : "etabli. Partner Portal"}
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {fr
              ? "Rejoignez notre réseau et contribuez à l'établissement des nouveaux arrivants au Québec"
              : "Join our network and help newcomers settle in Quebec"}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              {
                value: stats.employeurs || 12,
                label: fr ? "employeurs" : "employers",
                icon: <Building2 size={18} />,
              },
              {
                value: stats.professionnels || 28,
                label: fr ? "professionnels" : "professionals",
                icon: <Briefcase size={18} />,
              },
              {
                value: stats.organismes || 15,
                label: fr ? "organismes" : "organizations",
                icon: <Heart size={18} />,
              },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {s.icon}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                    {s.value}+
                  </div>
                  <div className="text-xs text-white/70">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNER TYPE CARDS ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] text-center mb-3">
          {fr ? "Choisissez votre espace" : "Choose your space"}
        </h2>
        <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
          {fr
            ? "Trois espaces dédiés pour répondre à vos besoins"
            : "Three dedicated spaces to meet your needs"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Employeur */}
          <PartnerCard
            icon={<Building2 size={28} className="text-emerald-600" />}
            color="#059669"
            colorBg="#D1FAE5"
            colorBorder="#A7F3D0"
            title={fr ? "Espace Employeur" : "Employer Space"}
            description={
              fr
                ? "Publiez des offres d'emploi gratuitement, accédez à un bassin de talents internationaux qualifiés, et gérez vos recrutements."
                : "Post job offers for free, access a pool of qualified international talent, and manage your recruitment."
            }
            benefits={
              fr
                ? [
                    "Publication gratuite",
                    "Bassin de talents EIMT",
                    "Profils vérifiés",
                    "Visibilité accrue",
                  ]
                : [
                    "Free job posting",
                    "LMIA talent pool",
                    "Verified profiles",
                    "Increased visibility",
                  ]
            }
            cta={fr ? "Inscription gratuite" : "Free registration"}
            href="/portail/inscription?type=employeur"
          />

          {/* Professionnel */}
          <PartnerCard
            icon={<Briefcase size={28} className="text-blue-600" />}
            color="#2563EB"
            colorBg="#DBEAFE"
            colorBorder="#BFDBFE"
            title={fr ? "Espace Professionnel" : "Professional Space"}
            description={
              fr
                ? "Inscrivez-vous à notre marketplace de professionnels réglementés : avocats, RCIC, CPA, notaires, traducteurs."
                : "Register on our regulated professionals marketplace: lawyers, RCIC, CPA, notaries, translators."
            }
            benefits={
              fr
                ? [
                    "Profil vérifié",
                    "Visibilité sur la marketplace",
                    "Demandes de clients",
                    "Badge Premium disponible",
                  ]
                : [
                    "Verified profile",
                    "Marketplace visibility",
                    "Client requests",
                    "Premium badge available",
                  ]
            }
            cta={fr ? "Rejoindre la marketplace" : "Join the marketplace"}
            href="/portail/inscription?type=professionnel"
          />

          {/* Organisme */}
          <PartnerCard
            icon={<Heart size={28} className="text-amber-600" />}
            color="#D97706"
            colorBg="#FEF3C7"
            colorBorder="#FDE68A"
            title={fr ? "Espace Organisme" : "Organization Space"}
            description={
              fr
                ? "Ajoutez votre organisme communautaire au répertoire etabli. et aidez les nouveaux arrivants à trouver vos services."
                : "Add your community organization to the etabli. directory and help newcomers find your services."
            }
            benefits={
              fr
                ? [
                    "Référencement gratuit",
                    "Visibilité locale",
                    "Lien direct vers vos services",
                    "Badge partenaire",
                  ]
                : [
                    "Free listing",
                    "Local visibility",
                    "Direct link to your services",
                    "Partner badge",
                  ]
            }
            cta={fr ? "Ajouter votre organisme" : "Add your organization"}
            href="/portail/inscription?type=organisme"
          />
        </div>
      </section>

      {/* ─── WHY BECOME A PARTNER ─── */}
      <section className="bg-[#F0FAF5] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)] text-center mb-3">
            {fr ? "Pourquoi devenir partenaire?" : "Why become a partner?"}
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            {fr
              ? "Une plateforme pensée pour maximiser votre impact"
              : "A platform designed to maximize your impact"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Gift size={24} className="text-[#1D9E75]" />,
                title: fr ? "Gratuit" : "Free",
                desc: fr
                  ? "L'inscription et les fonctionnalités de base sont entièrement gratuites pour tous les partenaires."
                  : "Registration and basic features are completely free for all partners.",
              },
              {
                icon: <Globe size={24} className="text-[#2563EB]" />,
                title: fr ? "Bilingue" : "Bilingual",
                desc: fr
                  ? "Plateforme entièrement bilingue français/anglais pour rejoindre un maximum de nouveaux arrivants."
                  : "Fully bilingual French/English platform to reach the most newcomers.",
              },
              {
                icon: <Shield size={24} className="text-[#D97706]" />,
                title: fr ? "Vérifié" : "Verified",
                desc: fr
                  ? "Tous les partenaires sont vérifiés. Profils professionnels validés via les registres publics."
                  : "All partners are verified. Professional profiles validated through public registries.",
              },
              {
                icon: <Users size={24} className="text-[#085041]" />,
                title: fr ? "Communauté" : "Community",
                desc: fr
                  ? "Rejoignez un réseau engagé d'employeurs, professionnels et organismes qui soutiennent les nouveaux arrivants."
                  : "Join a committed network of employers, professionals and organizations supporting nouveaux arrivants.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ALREADY REGISTERED ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 md:p-10 max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#085041]/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-[#085041]" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
            {fr ? "Déjà inscrit?" : "Already registered?"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {fr
              ? "Accédez à votre espace partenaire avec votre courriel"
              : "Access your partner space with your email"}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLoginError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder={fr ? "votre@courriel.com" : "your@email.com"}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none placeholder:text-gray-400"
            />
            <button
              onClick={handleLogin}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#085041] hover:bg-[#085041]/90 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
            >
              {fr ? "Accéder à mon espace" : "Access my space"}
              <ArrowRight size={16} />
            </button>
          </div>

          {loginError && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Shell>
      <PortailPage />
    </Shell>
  );
}
