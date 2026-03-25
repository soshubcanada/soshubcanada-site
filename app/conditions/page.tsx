import type { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation',
  description: 'Conditions d\'utilisation du site Web de SOS Hub Canada Inc. Règles d\'utilisation de nos services en ligne, outils d\'évaluation et calculateur CRS.',
};

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FileText className="w-12 h-12 text-gold mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Conditions d&apos;utilisation</h1>
          <div className="divider-gold mx-auto mt-4 mb-6" />
          <p className="text-white/60 font-sans">Dernière mise à jour : 1er janvier 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 prose prose-lg prose-gray font-sans">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">1. Acceptation des conditions</h2>
              <p className="text-gray-500 leading-relaxed">
                En accédant au site Web de SOS Hub Canada Inc. (soshubcanada.com), vous acceptez d&apos;être lié par les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre site.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">2. Description des services</h2>
              <p className="text-gray-500 leading-relaxed">
                SOS Hub Canada Inc. est une entreprise de services de relocalisation et d&apos;intégration au Canada située à Montréal. Notre site offre des informations sur nos services, des outils d&apos;évaluation d&apos;admissibilité, un calculateur de score CRS, ainsi que des formulaires de contact et d&apos;inscription.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">3. Outils en ligne</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Les outils disponibles sur notre site (test d&apos;admissibilité, calculateur CRS) sont fournis à titre informatif uniquement. Les résultats obtenus :
              </p>
              <ul className="space-y-2 text-gray-500">
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Ne constituent pas un avis juridique ou professionnel</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Ne garantissent pas l&apos;admissibilité à un programme d&apos;immigration</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Sont des estimations basées sur les informations fournies</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span>Peuvent différer des résultats officiels d&apos;IRCC ou du MIFI</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">4. Aucune garantie de résultat</h2>
              <p className="text-gray-500 leading-relaxed">
                SOS Hub Canada Inc. s&apos;engage à fournir des services professionnels et diligents, mais <strong className="text-navy">ne peut garantir l&apos;issue favorable d&apos;une demande d&apos;immigration</strong>. Les décisions finales relèvent exclusivement des autorités gouvernementales compétentes (IRCC, MIFI, ambassades).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">5. Propriété intellectuelle</h2>
              <p className="text-gray-500 leading-relaxed">
                L&apos;ensemble du contenu du site (textes, images, logos, design, outils) est la propriété de SOS Hub Canada Inc. et est protégé par les lois canadiennes sur le droit d&apos;auteur. Toute reproduction, distribution ou utilisation non autorisée est interdite.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">6. Exactitude des informations</h2>
              <p className="text-gray-500 leading-relaxed">
                En utilisant nos formulaires et outils, vous vous engagez à fournir des informations exactes et véridiques. La soumission de renseignements faux ou trompeurs peut entraîner la résiliation de nos services sans remboursement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">7. Limitation de responsabilité</h2>
              <p className="text-gray-500 leading-relaxed">
                SOS Hub Canada Inc. ne peut être tenue responsable des dommages directs, indirects ou accessoires résultant de l&apos;utilisation de son site Web ou de ses outils en ligne. Notre responsabilité est limitée au montant des honoraires payés pour les services concernés.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">8. Liens externes</h2>
              <p className="text-gray-500 leading-relaxed">
                Notre site peut contenir des liens vers des sites tiers (IRCC, MIFI, etc.). Nous ne sommes pas responsables du contenu, des politiques de confidentialité ou des pratiques de ces sites externes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">9. Modifications</h2>
              <p className="text-gray-500 leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur dès leur publication sur cette page. Votre utilisation continue du site après la publication des modifications constitue votre acceptation des conditions modifiées.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">10. Loi applicable</h2>
              <p className="text-gray-500 leading-relaxed">
                Les présentes conditions sont régies par les lois de la province de Québec et les lois fédérales du Canada applicables. Tout litige sera soumis à la compétence exclusive des tribunaux de Montréal, Québec.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">11. Contact</h2>
              <p className="text-gray-500 leading-relaxed">
                Pour toute question concernant ces conditions d&apos;utilisation :
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
