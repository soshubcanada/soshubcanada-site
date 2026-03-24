'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-light py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Prêt à commencer votre projet d&apos;immigration?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Faites évaluer votre admissibilité gratuitement et découvrez les programmes qui s&apos;offrent à vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admissibilite"
              className="px-8 py-3 bg-white text-gold-dark font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Évaluation gratuite
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy-light transition-colors shadow-lg"
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <span className="text-white font-bold">SOS Hub Canada</span>
                <p className="text-xs text-white/50">Immigration & Relocalisation</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Cabinet de consultation en immigration canadienne situé à Montréal.
              Accompagnement personnalisé pour tous vos projets d&apos;immigration.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5">
              {['Entrée Express', 'PEQ Québec', 'Permis de travail', 'Permis d\'études', 'Parrainage familial', 'Visa visiteur'].map(s => (
                <li key={s}>
                  <Link href="/services" className="text-sm hover:text-gold transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Outils */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Outils gratuits</h4>
            <ul className="space-y-2.5">
              <li><Link href="/admissibilite" className="text-sm hover:text-gold transition-colors">Test d&apos;admissibilité</Link></li>
              <li><Link href="/calculateur-crs" className="text-sm hover:text-gold transition-colors">Calculateur CRS</Link></li>
              <li>
                <a href="https://soshubca.vercel.app/inscription" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-gold transition-colors flex items-center gap-1">
                  Inscription en ligne <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://soshubca.vercel.app/client" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-gold transition-colors flex items-center gap-1">
                  Portail client <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>Montréal, Québec<br />Canada</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+15145551234" className="hover:text-gold transition-colors">(514) 555-1234</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:info@soshubcanada.com" className="hover:text-gold transition-colors">info@soshubcanada.com</a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Clock className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>Lun-Ven: 9h - 17h<br />Sam: Sur rendez-vous</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} SOS Hub Canada Inc. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/politique-confidentialite" className="hover:text-white/70 transition-colors">Politique de confidentialité</Link>
            <Link href="/conditions" className="hover:text-white/70 transition-colors">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
