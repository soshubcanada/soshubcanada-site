'use client';

import { useState, useEffect } from 'react';
import { Save, LogIn, LogOut, Phone, Mail, MapPin, Clock, Globe2, Edit3, CheckCircle2, Settings, FileText, Users, MessageCircle } from 'lucide-react';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

interface SiteConfig {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  hours: string;
  hoursWeekend: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  feeAmount: string;
  languages: string;
  statsClients: string;
  statsSatisfaction: string;
  statsPrograms: string;
  statsResponse: string;
  testimonial1Name: string;
  testimonial1Text: string;
  testimonial1Origin: string;
  testimonial2Name: string;
  testimonial2Text: string;
  testimonial2Origin: string;
  testimonial3Name: string;
  testimonial3Text: string;
  testimonial3Origin: string;
  faq1Question: string;
  faq1Answer: string;
  faq2Question: string;
  faq2Answer: string;
  faq3Question: string;
  faq3Answer: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  phone: '+1 514-533-0482',
  whatsapp: '+1 438-630-2869',
  email: 'info@soshubcanada.com',
  address: '3737 Crémazie Est #402',
  city: 'Montréal, QC H1Z 2K4',
  postalCode: 'H1Z 2K4',
  hours: 'Lun-Ven: 9h - 17h',
  hoursWeekend: 'Sam: Sur rendez-vous',
  heroTitle: 'Votre nouvelle vie au Canada commence ici',
  heroSubtitle: 'Service de relocalisation et d\'intégration à Montréal. Nous accompagnons les familles et les professionnels dans chaque étape de leur projet au Canada.',
  ctaText: 'Tester mon admissibilité',
  feeAmount: 'Sur consultation',
  languages: 'Français, Anglais, Arabe, Espagnol',
  statsClients: '500+',
  statsSatisfaction: '95%',
  statsPrograms: '50+',
  statsResponse: '24h',
  testimonial1Name: 'Marie-Claire D.',
  testimonial1Text: 'Grâce à SOS Hub Canada, j\'ai obtenu mon CSQ en seulement 4 mois après mon diplôme.',
  testimonial1Origin: 'France — PEQ Diplômés',
  testimonial2Name: 'Ahmed K.',
  testimonial2Text: 'Un accompagnement professionnel du début à la fin. Mon score CRS a été optimisé.',
  testimonial2Origin: 'Maroc — Entrée Express',
  testimonial3Name: 'Sofia L.',
  testimonial3Text: 'L\'équipe m\'a aidée avec mon EIMT et mon permis de travail fermé.',
  testimonial3Origin: 'Colombie — Permis de travail',
  faq1Question: 'Comment débuter mon dossier d\'immigration?',
  faq1Answer: 'Commencez par une évaluation gratuite d\'admissibilité. Notre équipe analysera votre profil et vous proposera un plan d\'action personnalisé.',
  faq2Question: 'Combien de temps prend un processus d\'immigration?',
  faq2Answer: 'Entrée Express 6-8 mois, PEQ 6-12 mois, permis de travail 2-6 mois.',
  faq3Question: 'En quelles langues offrez-vous vos services?',
  faq3Answer: 'Français, anglais, arabe et espagnol.',
};

type TabType = 'general' | 'contenu' | 'temoignages' | 'faq';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<TabType>('general');

  useEffect(() => {
    const session = sessionStorage.getItem('admin_auth');
    if (session === 'true') setAuthenticated(true);

    const stored = localStorage.getItem('soshub_config');
    if (stored) {
      try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) }); } catch { /* ignore */ }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
  };

  const handleSave = () => {
    localStorage.setItem('soshub_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const update = (key: keyof SiteConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-navy font-serif">Administration</h1>
            <p className="text-sm text-gray-400 font-sans mt-1">SOS Hub Canada — Gestion du site</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans"
                placeholder="Entrez le mot de passe"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm font-sans">{error}</p>}
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg transition-all font-sans">
              <LogIn className="w-5 h-5" /> Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: typeof Settings }[] = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'contenu', label: 'Contenu', icon: FileText },
    { id: 'temoignages', label: 'Témoignages', icon: Users },
    { id: 'faq', label: 'FAQ', icon: MessageCircle },
  ];

  const Field = ({ label, field, type = 'text', rows }: { label: string; field: keyof SiteConfig; type?: string; rows?: number }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5 font-sans">{label}</label>
      {rows ? (
        <textarea
          value={config[field]}
          onChange={e => update(field, e.target.value)}
          rows={rows}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans resize-none text-sm"
        />
      ) : (
        <input
          type={type}
          value={config[field]}
          onChange={e => update(field, e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none font-sans text-sm"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <div className="bg-navy text-white py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
            <span className="text-white font-bold text-sm font-serif">S</span>
          </div>
          <span className="font-semibold font-sans text-sm">Administration — SOS Hub Canada</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="text-white/60 hover:text-white text-sm font-sans transition-colors">
            Voir le site →
          </a>
          <button onClick={handleLogout} className="flex items-center gap-1 text-white/60 hover:text-white text-sm font-sans transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Success banner */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-green-700 text-sm font-sans font-semibold">Modifications sauvegardées avec succès!</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy font-serif">Gestion du site web</h1>
            <p className="text-sm text-gray-400 font-sans mt-1">Modifiez les informations affichées sur votre site</p>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg transition-all font-sans">
            <Save className="w-5 h-5" /> Sauvegarder
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium font-sans transition-all flex-1 justify-center ${
                tab === t.id ? 'bg-navy text-white shadow-md' : 'text-gray-500 hover:text-navy hover:bg-gray-50'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {tab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2 mb-2">
                <Edit3 className="w-5 h-5 text-gold" /> Informations de contact
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Téléphone" field="phone" type="tel" />
                <Field label="WhatsApp" field="whatsapp" type="tel" />
              </div>

              <Field label="Courriel" field="email" type="email" />

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Adresse" field="address" />
                <Field label="Ville, Province, Code postal" field="city" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Heures d'ouverture (semaine)" field="hours" />
                <Field label="Heures d'ouverture (weekend)" field="hoursWeekend" />
              </div>

              <Field label="Langues de service" field="languages" />
              <Field label="Frais d'ouverture de dossier" field="feeAmount" />

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-navy mb-4 font-sans flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-gold" /> Statistiques affichées
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Field label="Clients" field="statsClients" />
                  <Field label="Satisfaction" field="statsSatisfaction" />
                  <Field label="Programmes" field="statsPrograms" />
                  <Field label="Réponse" field="statsResponse" />
                </div>
              </div>
            </div>
          )}

          {tab === 'contenu' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-gold" /> Contenu du site
              </h2>

              <Field label="Titre principal (Hero)" field="heroTitle" />
              <Field label="Sous-titre (Hero)" field="heroSubtitle" rows={3} />
              <Field label="Texte du bouton principal" field="ctaText" />
            </div>
          )}

          {tab === 'temoignages' && (
            <div className="space-y-8">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gold" /> Témoignages clients
              </h2>

              {[1, 2, 3].map(n => (
                <div key={n} className="p-5 bg-cream rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-navy text-sm mb-4 font-sans">Témoignage #{n}</h3>
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <Field label="Nom" field={`testimonial${n}Name` as keyof SiteConfig} />
                      <Field label="Origine — Programme" field={`testimonial${n}Origin` as keyof SiteConfig} />
                    </div>
                    <Field label="Témoignage" field={`testimonial${n}Text` as keyof SiteConfig} rows={2} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'faq' && (
            <div className="space-y-8">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-gold" /> Questions fréquentes
              </h2>

              {[1, 2, 3].map(n => (
                <div key={n} className="p-5 bg-cream rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-navy text-sm mb-4 font-sans">Question #{n}</h3>
                  <div className="space-y-3">
                    <Field label="Question" field={`faq${n}Question` as keyof SiteConfig} />
                    <Field label="Réponse" field={`faq${n}Answer` as keyof SiteConfig} rows={3} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom save */}
        <div className="flex justify-end mt-6">
          <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg transition-all font-sans">
            <Save className="w-5 h-5" /> Sauvegarder les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
