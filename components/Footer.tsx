import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ExternalLink, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      {/* CTA Banner */}
      <div className="relative py-16 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1462536943532-57a629f6cc60?w=1920&h=400&fit=crop"
          alt="Canada"
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gold-dark/95 via-gold/90 to-gold-light/85" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            Prêt à commencer votre projet?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto font-sans text-lg">
            Faites évaluer votre profil gratuitement et découvrez les programmes qui s&apos;offrent à vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admissibilite"
              className="px-8 py-4 bg-white text-gold-dark font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-xl font-sans"
            >
              Évaluation gratuite
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-colors shadow-xl font-sans"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl font-serif">S</span>
              </div>
              <div>
                <span className="text-white font-bold font-serif">SOS Hub Canada</span>
                <p className="text-xs text-white/40 font-sans">Relocalisation & Intégration</p>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-6 font-sans">
              Service de relocalisation et d&apos;intégration au Canada situé à Montréal.
              Accompagnement personnalisé pour tous vos projets.
            </p>
            <a
              href="https://wa.me/14386302869"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/20 rounded-lg text-sm text-[#25D366] hover:bg-[#25D366]/30 transition-colors font-sans"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider font-sans">Services</h4>
            <ul className="space-y-3">
              {['Entrée Express', 'PEQ Québec', 'Permis de travail', 'Permis d\'études', 'Parrainage familial', 'Relocalisation', 'Services employeurs'].map(s => (
                <li key={s}>
                  <Link href={s === 'Services employeurs' ? '/employeurs' : '/services'} className="text-sm hover:text-gold transition-colors font-sans">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Outils */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider font-sans">Outils gratuits</h4>
            <ul className="space-y-3">
              <li><Link href="/admissibilite" className="text-sm hover:text-gold transition-colors font-sans">Test d&apos;admissibilité</Link></li>
              <li><Link href="/calculateur-crs" className="text-sm hover:text-gold transition-colors font-sans">Calculateur CRS</Link></li>
              <li>
                <a href="https://soshubca.vercel.app/inscription" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-gold transition-colors flex items-center gap-1 font-sans">
                  Inscription en ligne <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://soshubca.vercel.app/client" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-gold transition-colors flex items-center gap-1 font-sans">
                  Portail client <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="pt-2 mt-2 border-t border-white/10">
                <a href="https://www.aidoqc.ca" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-gold transition-colors flex items-center gap-1 font-sans font-semibold">
                  AidoQC — Aide à domicile <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider font-sans">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-sans">
                <MapPin className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>3737 Crémazie Est #402<br />Montréal, QC H1Z 2K4</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-sans">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+15145330482" className="hover:text-gold transition-colors">+1 (514) 533-0482</a>
              </li>
              <li className="flex items-center gap-3 text-sm font-sans">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:info@soshubcanada.com" className="hover:text-gold transition-colors">info@soshubcanada.com</a>
              </li>
              <li className="flex items-start gap-3 text-sm font-sans">
                <Clock className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>Lun-Ven: 9h - 17h<br />Sam: Sur rendez-vous</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/30 font-sans">
          <p>&copy; {new Date().getFullYear()} SOS Hub Canada Inc. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/politique-confidentialite" className="hover:text-white/60 transition-colors">Politique de confidentialité</Link>
            <Link href="/conditions" className="hover:text-white/60 transition-colors">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
