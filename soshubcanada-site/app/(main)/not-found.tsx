import Link from 'next/link';
import { ArrowRight, Home, FileText, Phone } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cream">
      <div className="max-w-xl mx-auto px-6 text-center py-24">
        <div className="text-8xl font-bold text-gold/20 mb-4 font-serif">404</div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">Page introuvable</h1>
        <p className="text-gray-500 mb-10 font-sans text-lg">
          La page que vous recherchez n&apos;existe pas ou a été déplacée. Pas d&apos;inquiétude, votre projet d&apos;immigration continue!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all font-sans"
          >
            <Home className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
          <Link
            href="/admissibilite"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-all font-sans"
          >
            Tester mon admissibilité <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-left">
          <p className="text-sm font-bold text-navy mb-4 font-sans">Pages populaires :</p>
          <div className="space-y-3">
            {[
              { href: '/services', icon: FileText, label: 'Nos services d\'immigration' },
              { href: '/calculateur-crs', icon: FileText, label: 'Calculateur de score CRS' },
              { href: '/contact', icon: Phone, label: 'Nous contacter' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 text-sm text-gray-500 hover:text-gold transition-colors font-sans"
              >
                <link.icon className="w-4 h-4 text-gold" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
