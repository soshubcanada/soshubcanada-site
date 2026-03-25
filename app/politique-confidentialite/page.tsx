import type { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de SOS Hub Canada Inc. Protection de vos données personnelles dans le cadre de nos services d\'immigration et de relocalisation.',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Politique de confidentialité</h1>
          <div className="divider-gold mx-auto mt-4 mb-6" />
          <p className="text-white/60 font-sans">Dernière mise à jour : 1er janvier 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 prose prose-lg prose-gray font-sans">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">1. Introduction</h2>
              <p className="text-gray-500 leading-relaxed">
                SOS Hub Canada Inc. (&laquo;&nbsp;nous&nbsp;&raquo;, &laquo;&nbsp;notre&nbsp;&raquo;, &laquo;&nbsp;la Société&nbsp;&raquo;) s&apos;engage à protéger la vie privée et les renseignements personnels de ses clients, visiteurs et utilisateurs de son site Web. La présente politique de confidentialité décrit la manière dont nous recueillons, utilisons, divulguons et protégeons vos renseignements personnels conformément à la <strong className="text-navy">Loi sur la protection des renseignements personnels dans le secteur privé du Québec (Loi 25)</strong> et à la <strong className="text-navy">Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE)</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">2. Renseignements recueillis</h2>
              <p className="text-gray-500 leading-relaxed mb-4">Nous pouvons recueillir les renseignements suivants :</p>
              <ul className="space-y-2 text-gray-500">
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Nom complet, date de naissance, nationalité</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Coordonnées (adresse, courriel, numéro de téléphone)</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Situation familiale et professionnelle</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Diplômes, expérience de travail, résultats de tests de langue</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Historique d&apos;immigration et documents connexes</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Données de navigation et cookies sur notre site Web</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">3. Utilisation des renseignements</h2>
              <p className="text-gray-500 leading-relaxed mb-4">Vos renseignements personnels sont utilisés pour :</p>
              <ul className="space-y-2 text-gray-500">
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Évaluer votre admissibilité aux programmes d&apos;immigration</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Préparer et soumettre vos demandes d&apos;immigration</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Communiquer avec vous concernant votre dossier</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Vous envoyer des informations pertinentes (avec votre consentement)</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Améliorer nos services et notre site Web</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">4. Consentement</h2>
              <p className="text-gray-500 leading-relaxed">
                En utilisant nos services ou en soumettant un formulaire sur notre site, vous consentez à la collecte et à l&apos;utilisation de vos renseignements personnels aux fins décrites dans cette politique. Vous pouvez retirer votre consentement à tout moment en nous contactant à <a href="mailto:info@soshubcanada.com" className="text-gold hover:underline">info@soshubcanada.com</a>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">5. Protection des renseignements</h2>
              <p className="text-gray-500 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos renseignements personnels contre tout accès, utilisation ou divulgation non autorisés. Nos systèmes utilisent le chiffrement SSL/TLS, et l&apos;accès aux données est limité au personnel autorisé.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">6. Conservation des données</h2>
              <p className="text-gray-500 leading-relaxed">
                Vos renseignements personnels sont conservés aussi longtemps que nécessaire pour les fins pour lesquelles ils ont été recueillis, ou selon les exigences légales applicables. Les dossiers d&apos;immigration sont conservés pendant une période minimale de sept (7) ans après la fin du mandat.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">7. Divulgation à des tiers</h2>
              <p className="text-gray-500 leading-relaxed">
                Nous ne vendons ni ne louons vos renseignements personnels. Nous pouvons partager vos renseignements avec des tiers uniquement dans les cas suivants : avec votre consentement explicite, pour soumettre des demandes à IRCC, au MIFI ou à d&apos;autres organismes gouvernementaux, ou lorsque la loi l&apos;exige.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">8. Cookies et technologies de suivi</h2>
              <p className="text-gray-500 leading-relaxed">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient ne pas fonctionner correctement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">9. Vos droits</h2>
              <p className="text-gray-500 leading-relaxed mb-4">Conformément à la Loi 25 du Québec, vous avez le droit de :</p>
              <ul className="space-y-2 text-gray-500">
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Accéder à vos renseignements personnels</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Demander la rectification de renseignements inexacts</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Demander la suppression de vos données (droit à l&apos;oubli)</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Retirer votre consentement</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Déposer une plainte auprès de la Commission d&apos;accès à l&apos;information du Québec</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">10. Contact</h2>
              <p className="text-gray-500 leading-relaxed">
                Pour toute question concernant cette politique ou pour exercer vos droits, contactez notre responsable de la protection des renseignements personnels :
              </p>
              <div className="mt-4 p-6 bg-cream rounded-xl border border-gray-100">
                <p className="font-bold text-navy">SOS Hub Canada Inc.</p>
                <p className="text-gray-500 text-sm mt-1">3737 Crémazie Est #402, Montréal, QC H1Z 2K4</p>
                <p className="text-gray-500 text-sm">Courriel : <a href="mailto:info@soshubcanada.com" className="text-gold hover:underline">info@soshubcanada.com</a></p>
                <p className="text-gray-500 text-sm">Téléphone : <a href="tel:+15145330482" className="text-gold hover:underline">(514) 533-0482</a></p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
