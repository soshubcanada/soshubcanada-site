"use client";
import { crmFetch } from '@/lib/crm-fetch';
import { useState } from "react";
import { useCrm, getUserName, DEMO_USERS } from "@/lib/crm-store";
import { ROLE_PERMISSIONS } from "@/lib/crm-types";
import { COMPANY_TAX_INFO } from "@/lib/crm-facturation";
import {
  PRICING_2026,
  PRICING_CATEGORIES_2026,
  ADDITIONAL_SERVICES_2026,
  FRAIS_OUVERTURE_DOSSIER,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
} from "@/lib/crm-pricing-2026";
import type { ServiceContract, PricingTier, ContractInstallment } from "@/lib/crm-pricing-2026";
import {
  FileSignature, ArrowLeft, Plus, CheckCircle2, Clock, AlertCircle,
  DollarSign, Users, Send, Download, Pen, ShieldCheck, Eye, Building2,
  ChevronDown, ChevronUp, FileText, Calendar, MapPin, CreditCard,
} from "lucide-react";

type View = "list" | "grille" | "new" | "detail" | "sign";

export default function ContratsPage() {
  const { currentUser, clients, cases, contracts, setContracts } = useCrm();
  const [view, setView] = useState<View>("list");
  const [selectedContract, setSelectedContract] = useState<ServiceContract | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState("");
  const [signatureAccepted, setSignatureAccepted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!currentUser) return null;

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c ? `${c.firstName} ${c.lastName}` : "Inconnu";
  };

  const getPricingTier = (tierId: string) => PRICING_2026.find(p => p.id === tierId);

  const formatMoney = (n: number) => n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

  const installmentStatusIcon = (status: string) => {
    if (status === "paye") return <CheckCircle2 size={16} className="text-green-600" />;
    if (status === "en_retard") return <AlertCircle size={16} className="text-red-600" />;
    if (status === "facture") return <Send size={16} className="text-blue-600" />;
    return <Clock size={16} className="text-gray-400" />;
  };

  // ========== NOUVEAU CONTRAT ==========
  if (view === "new") {
    return <NewContractForm
      clients={clients}
      cases={cases}
      currentUser={currentUser}
      contracts={contracts}
      setContracts={setContracts}
      onBack={() => setView("list")}
      onCreated={(c) => { setSelectedContract(c); setView("detail"); }}
    />;
  }

  // ========== GRILLE TARIFAIRE 2026 ==========
  if (view === "grille") {
    const categories = [...new Set(PRICING_2026.map(p => p.category))];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#F7F3E8" }}>
            <DollarSign className="w-6 h-6" style={{ color: "#D4A03C" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2559" }}>Grille tarifaire 2026</h1>
            <p className="text-sm text-gray-500">SOS Hub Canada — Tarifs en vigueur</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 flex items-center gap-3 text-sm">
          <ShieldCheck size={18} className="text-green-600 shrink-0" />
          <span className="text-gray-600">
            Consultation initiale: <strong className="text-gray-900">GRATUITE</strong> (60 minutes). Frais d&apos;ouverture de dossier: <strong className="text-gray-900">{formatMoney(FRAIS_OUVERTURE_DOSSIER)}</strong> — déduits de la facture si le client signe le contrat. <strong>Les honoraires professionnels et les déboursés gouvernementaux sont ventilés séparément.</strong>
          </span>
        </div>

        {categories.map(cat => {
          const catPricing = PRICING_2026.filter(p => p.category === cat);
          const isExpanded = expandedCategory === cat;
          return (
            <div key={cat} className="bg-white rounded-xl border overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50"
              >
                <h3 className="text-lg font-bold" style={{ color: "#1B2559" }}>
                  {PRICING_CATEGORIES_2026[cat] ?? cat}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{catPricing.length} services</span>
                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </button>
              {isExpanded && (
                <div className="border-t">
                  {catPricing.map((tier, idx) => (
                    <div key={tier.id} className={`p-5 ${idx > 0 ? "border-t" : ""}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">{tier.name}</div>
                          <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-2xl font-bold" style={{ color: "#D4A03C" }}>{formatMoney(tier.serviceFee)}</div>
                          <div className="text-xs text-gray-500">Honoraires professionnels</div>
                          {tier.governmentFee > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              + {formatMoney(tier.governmentFee)} déboursés gouv.
                              {tier.governmentFeePayeur === 'employeur' && (
                                <span className="text-orange-600 font-medium"> (à la charge de l&apos;employeur)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tier.location === "canada" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Depuis le Canada</span>
                        )}
                        {tier.location === "etranger" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Depuis l&apos;étranger</span>
                        )}
                        {tier.location === "les_deux" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">Canada ou étranger</span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {tier.estimatedTimeline}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong className="text-gray-700">Inclus:</strong>
                        <ul className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-1">
                          {tier.includes.map((inc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {tier.addOns && tier.addOns.length > 0 && (
                        <div className="mt-3 text-sm">
                          <strong className="text-gray-700">Options supplémentaires:</strong>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {tier.addOns.map((addon, i) => (
                              <span key={i} className="px-2 py-1 rounded-lg bg-gray-50 border text-gray-600">
                                {addon.name}: <strong>{formatMoney(addon.price)}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {tier.notes && (
                        <p className="mt-2 text-xs text-gray-400 italic">{tier.notes}</p>
                      )}
                      {tier.governmentFeePayeur === 'employeur' && (
                        <p className="mt-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
                          Conformément à l&apos;art. 209.2 du RIPR, les frais de traitement de l&apos;EIMT ({formatMoney(tier.governmentFee)}/poste) sont à la charge exclusive de l&apos;employeur et ne peuvent être imputés au travailleur étranger.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Services additionnels */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <button
            onClick={() => setExpandedCategory(expandedCategory === "additionnel" ? null : "additionnel")}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50"
          >
            <h3 className="text-lg font-bold" style={{ color: "#1B2559" }}>Services additionnels</h3>
            {expandedCategory === "additionnel" ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {expandedCategory === "additionnel" && (
            <div className="border-t p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADDITIONAL_SERVICES_2026.map(svc => (
                  <div key={svc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-700">{svc.name}</span>
                    <span className="font-semibold text-sm" style={{ color: "#1B2559" }}>{formatMoney(svc.price)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Les frais gouvernementaux sont des déboursés facturés sans majoration.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== DÉTAIL D'UN CONTRAT ==========
  if (view === "detail" && selectedContract) {
    const contract = selectedContract;
    const tier = getPricingTier(contract.pricingTierId);
    const client = clients.find(c => c.id === contract.clientId);
    const paidInstallments = contract.installments.filter(i => i.status === "paye");
    const totalPaid = paidInstallments.reduce((s, i) => s + i.amount, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setView("list"); setSelectedContract(null); }} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2559" }}>
              Contrat — {getClientName(contract.clientId)}
            </h1>
            <p className="text-sm text-gray-500">{tier?.name ?? "Service"}</p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${CONTRACT_STATUS_COLORS[contract.status]}`}>
            {CONTRACT_STATUS_LABELS[contract.status]}
          </span>
        </div>

        {/* Résumé du contrat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold mb-4" style={{ color: "#1B2559" }}>Détails du contrat</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Client</span>
                <span className="font-medium">{getClientName(contract.clientId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{tier?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Honoraires professionnels</span>
                <span className="font-medium">{formatMoney(contract.serviceFee)}</span>
              </div>
              {contract.addOns.map((addon, i) => (
                <div key={i} className="flex justify-between text-gray-600">
                  <span className="pl-4">+ {addon.name}</span>
                  <span>{formatMoney(addon.price)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-gray-500">Frais gouvernementaux</span>
                <span className="font-medium">{formatMoney(contract.governmentFee)}</span>
              </div>
              {contract.discount && contract.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Rabais{contract.discountReason ? ` (${contract.discountReason})` : ''}</span>
                  <span>-{formatMoney(contract.discount)}</span>
                </div>
              )}
              <div className="text-xs text-gray-400 italic">Taxes incluses dans le tarif</div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold" style={{ color: "#1B2559" }}>
                <span>Total</span>
                <span>{formatMoney(contract.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold mb-4" style={{ color: "#1B2559" }}>Signature et paiements</h3>
            {contract.signedAt ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <ShieldCheck size={18} />
                  Contrat signé électroniquement
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Par: {contract.signedByClient} — Le {contract.signedAt}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-700 font-medium">
                  <Pen size={18} />
                  En attente de signature
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setView("sign")}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "#D4A03C" }}
                  >
                    <span className="flex items-center gap-1"><Pen size={14} /> Signer sur place</span>
                  </button>
                  <button
                    onClick={async () => {
                      const client = clients.find(c => c.id === contract.clientId);
                      if (!client) return;
                      const signUrl = `${window.location.origin}/signer/${contract.id}`;
                      try {
                        await crmFetch('/api/crm/send-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            clientId: contract.clientId,
                            toEmail: client.email,
                            subject: `Contrat de service à signer — SOS Hub Canada`,
                            emailBody: `Bonjour ${client.firstName},\n\nVotre contrat de service est prêt pour signature.\n\nCliquez ici pour signer : ${signUrl}\n\nCordialement,\nSOS Hub Canada Inc.`,
                            type: 'contract',
                            sentBy: currentUser.id,
                          }),
                        });
                        const updated = { ...contract, status: 'envoye' as const };
                        setContracts(contracts.map(c => c.id === updated.id ? updated : c));
                        setSelectedContract(updated);
                        setNotification({ type: 'success', message: 'Contrat envoyé au client par courriel !' });
                      } catch {
                        setNotification({ type: 'error', message: 'Erreur lors de l\'envoi du contrat par courriel. Vérifiez la connexion et réessayez.' });
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium bg-[#1B2559] hover:bg-[#242E6B]"
                  >
                    <span className="flex items-center gap-1"><Send size={14} /> Envoyer au client</span>
                  </button>
                </div>
              </div>
            )}

            {/* Progression paiement */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Progression des paiements</span>
                <span className="font-medium">{formatMoney(totalPaid)} / {formatMoney(contract.grandTotal)}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(totalPaid / contract.grandTotal) * 100}%`, backgroundColor: "#D4A03C" }}
                />
              </div>
            </div>

            {/* Échéancier */}
            <div className="space-y-3">
              {contract.installments.map((inst) => (
                <div key={inst.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  {installmentStatusIcon(inst.status)}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{inst.description}</div>
                    <div className="text-xs text-gray-500">Échéance: {inst.dueDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{formatMoney(inst.amount)}</div>
                    <div className={`text-xs ${
                      inst.status === "paye" ? "text-green-600" :
                      inst.status === "en_retard" ? "text-red-600" :
                      inst.status === "facture" ? "text-blue-600" : "text-gray-400"
                    }`}>
                      {inst.status === "paye" ? "Payé" : inst.status === "facture" ? "Facturé" : inst.status === "en_retard" ? "En retard" : "À venir"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {contract.notes && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold mb-2" style={{ color: "#1B2559" }}>Notes</h3>
            <p className="text-sm text-gray-600">{contract.notes}</p>
          </div>
        )}
      </div>
    );
  }

  // ========== SIGNATURE EN LIGNE ==========
  if (view === "sign" && selectedContract) {
    const contract = selectedContract;
    const tier = getPricingTier(contract.pricingTierId);
    const client = clients.find(c => c.id === contract.clientId);

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold" style={{ color: "#1B2559" }}>SOS Hub</span>
            <span className="text-2xl font-bold" style={{ color: "#D4A03C" }}>Canada</span>
          </div>
          <h1 className="text-xl font-bold text-gray-700">Contrat de service professionnel</h1>
          <p className="text-sm text-gray-400 mt-1">Signature électronique sécurisée</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4" style={{ color: "#1B2559" }}>Parties au contrat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-2">LE PRESTATAIRE</div>
              <div className="font-semibold">{COMPANY_TAX_INFO.nomLegal}</div>
              <div className="text-gray-600">{COMPANY_TAX_INFO.adresse}</div>
              <div className="text-gray-600">{COMPANY_TAX_INFO.ville}, {COMPANY_TAX_INFO.province} {COMPANY_TAX_INFO.codePostal}</div>
              <div className="text-gray-500 mt-1">NEQ: {COMPANY_TAX_INFO.neq}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-2">LE CLIENT</div>
              <div className="font-semibold">{client ? `${client.firstName} ${client.lastName}` : "—"}</div>
              <div className="text-gray-600">{client?.email}</div>
              <div className="text-gray-600">{client?.phone}</div>
              <div className="text-gray-600 mt-1">{client?.address}</div>
              <div className="text-gray-600">{client?.city}, {client?.province} {client?.postalCode}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4" style={{ color: "#1B2559" }}>Service retenu</h3>
          <div className="text-lg font-semibold text-gray-900 mb-2">{tier?.name}</div>
          <p className="text-sm text-gray-600 mb-4">{tier?.description}</p>

          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2 text-gray-600">Honoraires professionnels</td>
                <td className="py-2 text-right font-medium">{formatMoney(contract.serviceFee)}</td>
              </tr>
              {contract.addOns.map((addon, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 text-gray-600 pl-4">+ {addon.name}</td>
                  <td className="py-2 text-right">{formatMoney(addon.price)}</td>
                </tr>
              ))}
              <tr className="border-b">
                <td className="py-2 text-gray-600">Frais gouvernementaux (déboursés)</td>
                <td className="py-2 text-right font-medium">{formatMoney(contract.governmentFee)}</td>
              </tr>
              {contract.discount && contract.discount > 0 && (
                <tr className="border-b">
                  <td className="py-2 text-green-600">Rabais{contract.discountReason ? ` (${contract.discountReason})` : ''}</td>
                  <td className="py-2 text-right text-green-600">-{formatMoney(contract.discount)}</td>
                </tr>
              )}
              <tr>
                <td className="py-3 font-bold text-lg" style={{ color: "#1B2559" }}>TOTAL</td>
                <td className="py-3 text-right font-bold text-lg" style={{ color: "#D4A03C" }}>{formatMoney(contract.grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4" style={{ color: "#1B2559" }}>Modalités de paiement</h3>
          <p className="text-sm text-gray-600 mb-3">{contract.paymentOption}</p>
          <div className="space-y-2">
            {contract.installments.map(inst => (
              <div key={inst.id} className="flex justify-between p-3 rounded-lg bg-gray-50 text-sm">
                <div>
                  <span className="font-medium">{inst.description}</span>
                  <span className="text-gray-400 ml-2">— {inst.dueDate}</span>
                </div>
                <span className="font-semibold">{formatMoney(inst.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4" style={{ color: "#1B2559" }}>Conditions générales</h3>
          <div className="text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto pr-2">
            <p>1. Le prestataire s&apos;engage à fournir les services professionnels décrits ci-dessus avec diligence et compétence.</p>
            <p>2. Les frais gouvernementaux sont des déboursés effectués au nom du client et sont non remboursables une fois payés au gouvernement.</p>
            <p>3. Les honoraires professionnels sont exigibles selon le calendrier de paiement convenu. Tout retard de plus de 30 jours entraînera des frais d&apos;intérêt de 1,5% par mois.</p>
            <p>4. Le client reconnaît que le résultat d&apos;une demande d&apos;immigration dépend de la décision des autorités gouvernementales et que le prestataire ne peut garantir l&apos;approbation.</p>
            <p>5. Le client s&apos;engage à fournir des informations véridiques et complètes. Toute fausse déclaration pourrait compromettre le dossier.</p>
            <p>6. En cas d&apos;annulation par le client, les honoraires déjà facturés pour les services rendus ne sont pas remboursables.</p>
            <p>7. Ce contrat est régi par les lois de la province de Québec et les lois fédérales du Canada applicables.</p>
            <p>8. Le prestataire est membre en règle du Collège des consultants en immigration et en citoyenneté (CCIC) ou du Barreau du Québec, selon le cas.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4" style={{ color: "#1B2559" }}>Signature électronique</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Nom complet (tel qu&apos;il apparaît sur votre pièce d&apos;identité)</label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Prénom et nom de famille"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg"
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={signatureAccepted}
                onChange={(e) => setSignatureAccepted(e.target.checked)}
                className="mt-1 rounded"
              />
              <label className="text-sm text-gray-600">
                Je confirme avoir lu et accepté les conditions générales de ce contrat de service. Ma signature électronique ci-dessus a la même valeur juridique qu&apos;une signature manuscrite conformément à la Loi concernant le cadre juridique des technologies de l&apos;information du Québec (LCCJTI).
              </label>
            </div>

            {signatureName && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="text-3xl font-serif italic text-gray-700">{signatureName}</div>
                <div className="text-xs text-gray-400 mt-2">Signature électronique — {new Date().toLocaleDateString("fr-CA")}</div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setView("detail")}
                className="px-6 py-3 rounded-lg border text-gray-600 font-medium"
              >
                Annuler
              </button>
              <button
                disabled={!signatureName || !signatureAccepted}
                onClick={() => {
                  if (!selectedContract || !signatureName || !signatureAccepted) return;
                  const updated = {
                    ...selectedContract,
                    status: 'signe' as const,
                    signedAt: new Date().toISOString(),
                    signedByClient: signatureName,
                  };
                  setContracts(contracts.map(c => c.id === updated.id ? updated : c));
                  setSelectedContract(updated);
                  setView("detail");
                  setSignatureName("");
                  setSignatureAccepted(false);
                  // Also update via API
                  crmFetch('/api/crm/contracts', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contractId: updated.id, status: 'signe', signedAt: updated.signedAt, signedByClient: signatureName }),
                  }).catch(() => {
                    setNotification({ type: 'error', message: 'Le contrat est signé localement, mais la synchronisation serveur a échoué. Réessayez plus tard.' });
                  });
                }}
                className={`flex-1 px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
                  signatureName && signatureAccepted ? "" : "opacity-50 cursor-not-allowed"
                }`}
                style={{ backgroundColor: signatureName && signatureAccepted ? "#D4A03C" : "#ccc" }}
              >
                <ShieldCheck size={18} />
                Signer le contrat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== LISTE DES CONTRATS ==========
  const filteredContracts = searchQuery.trim()
    ? contracts.filter(c => {
        const q = searchQuery.toLowerCase();
        const clientName = getClientName(c.clientId).toLowerCase();
        const tierName = (getPricingTier(c.pricingTierId)?.name ?? "").toLowerCase();
        const status = (CONTRACT_STATUS_LABELS[c.status] ?? "").toLowerCase();
        return clientName.includes(q) || tierName.includes(q) || status.includes(q) || c.id.toLowerCase().includes(q);
      })
    : contracts;

  return (
    <div className="space-y-6">
      {/* Notification banner */}
      {notification && (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span className="text-sm">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-sm font-medium hover:underline">Fermer</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#EAEDF5" }}>
            <FileSignature className="w-6 h-6" style={{ color: "#1B2559" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2559" }}>Contrats et tarification</h1>
            <p className="text-sm text-gray-500">Gestion des contrats de service, signature en ligne et facturation automatique</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grille")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
            style={{ color: "#1B2559" }}
          >
            <DollarSign size={16} />
            Grille tarifaire 2026
          </button>
          <button onClick={() => setView("new")} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "#D4A03C" }}>
            <Plus size={16} />
            Nouveau contrat
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher un contrat (client, service, statut...)"
          className="w-full px-4 py-2.5 pl-10 border rounded-xl text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C] outline-none"
        />
        <Eye size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <div className="text-sm text-gray-500 mb-1">Contrats actifs</div>
          <div className="text-3xl font-bold" style={{ color: "#1B2559" }}>
            {contracts.filter(c => c.status === "actif" || c.status === "signe").length}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="text-sm text-gray-500 mb-1">Valeur totale</div>
          <div className="text-3xl font-bold" style={{ color: "#D4A03C" }}>
            {formatMoney(contracts.reduce((s, c) => s + c.grandTotal, 0))}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="text-sm text-gray-500 mb-1">Montant perçu</div>
          <div className="text-3xl font-bold text-green-600">
            {formatMoney(contracts.reduce((s, c) => s + c.installments.filter(i => i.status === "paye").reduce((ss, i) => ss + i.amount, 0), 0))}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="text-sm text-gray-500 mb-1">Solde à percevoir</div>
          <div className="text-3xl font-bold text-amber-600">
            {formatMoney(contracts.reduce((s, c) => s + c.installments.filter(i => i.status !== "paye").reduce((ss, i) => ss + i.amount, 0), 0))}
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {contracts.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <FileSignature size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700 mb-1">Aucun contrat</p>
            <p className="text-sm text-gray-400 mb-4">Commencez par creer un nouveau contrat de service pour un client.</p>
            <button onClick={() => setView("new")} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "#D4A03C" }}>
              <Plus size={16} className="inline mr-1" /> Nouveau contrat
            </button>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Eye size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">Aucun contrat ne correspond a votre recherche.</p>
            <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-[#D4A03C] hover:underline">Effacer la recherche</button>
          </div>
        ) : null}
        {filteredContracts.map(contract => {
          const tier = getPricingTier(contract.pricingTierId);
          const totalPaid = contract.installments.filter(i => i.status === "paye").reduce((s, i) => s + i.amount, 0);
          const pctPaid = Math.round(contract.grandTotal > 0 ? (totalPaid / contract.grandTotal) * 100 : 0);
          return (
            <button
              key={contract.id}
              onClick={() => { setSelectedContract(contract); setView("detail"); }}
              className="w-full bg-white rounded-xl border p-5 text-left hover:border-[#D4A03C] hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EAEDF5" }}>
                    <FileSignature size={18} style={{ color: "#1B2559" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{getClientName(contract.clientId)}</div>
                    <div className="text-sm text-gray-500">{tier?.name ?? "Service"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONTRACT_STATUS_COLORS[contract.status]}`}>
                    {CONTRACT_STATUS_LABELS[contract.status]}
                  </span>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: "#1B2559" }}>{formatMoney(contract.grandTotal)}</div>
                    <div className="text-xs text-gray-400">{pctPaid}% perçu</div>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pctPaid}%`, backgroundColor: pctPaid >= 100 ? "#22c55e" : "#D4A03C" }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ========================================================
// Formulaire de création de contrat
// ========================================================
import { IMMIGRATION_PROGRAMS } from "@/lib/crm-programs";
import { generateContractNumber, getServicesForProgram } from "@/lib/contract-template";
import type { Client, Case, CrmUser } from "@/lib/crm-types";
import { Loader2 } from "lucide-react";

function NewContractForm({
  clients, cases, currentUser, contracts, setContracts, onBack, onCreated,
}: {
  clients: Client[];
  cases: Case[];
  currentUser: CrmUser;
  contracts: ServiceContract[];
  setContracts: (c: ServiceContract[]) => void;
  onBack: () => void;
  onCreated: (c: ServiceContract) => void;
}) {
  const [step] = useState<'select'>('select');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formNotification, setFormNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientCases = cases.filter(c => c.clientId === selectedClientId);
  const selectedCase = cases.find(c => c.id === selectedCaseId);
  const selectedProgram = IMMIGRATION_PROGRAMS.find(p => p.id === selectedProgramId);
  const pricingTier = PRICING_2026.find(p => p.id === selectedProgramId);
  const services = selectedProgramId ? getServicesForProgram(selectedProgramId) : [];
  const formatMoney = (n: number) => n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

  // Auto-select program from case
  const handleCaseChange = (caseId: string) => {
    setSelectedCaseId(caseId);
    const c = cases.find(x => x.id === caseId);
    if (c?.programId) setSelectedProgramId(c.programId);
  };

  const canProceed = selectedClientId && selectedProgramId;

  const handleCreate = async () => {
    // Validation
    const errors: string[] = [];
    if (!selectedClientId) errors.push('Le client est obligatoire.');
    if (!selectedProgramId) errors.push('Le programme immigration est obligatoire.');
    if (!pricingTier) errors.push('Le programme selectionne n\'a pas de tarification valide.');
    if (pricingTier && pricingTier.serviceFee <= 0) errors.push('Le montant des honoraires doit etre superieur a 0.');
    if (discount < 0) errors.push('Le rabais ne peut pas etre negatif.');
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    if (!selectedClient || !pricingTier) return;
    setSaving(true);

    const contractNumber = generateContractNumber();
    const now = new Date().toISOString();

    const validDiscount = Math.min(discount, pricingTier.serviceFee);
    const totalBeforeTax = pricingTier.serviceFee + FRAIS_OUVERTURE_DOSSIER + pricingTier.governmentFee - validDiscount;
    const grandTotal = totalBeforeTax;

    const newContract: ServiceContract = {
      id: contractNumber,
      clientId: selectedClientId,
      caseId: selectedCaseId || undefined,
      pricingTierId: selectedProgramId,
      status: 'brouillon',
      serviceFee: pricingTier.serviceFee,
      governmentFee: pricingTier.governmentFee,
      governmentFeePayeur: 'client',
      addOns: [],
      totalBeforeTax,
      tps: 0,
      tvq: 0,
      grandTotal,
      discount: validDiscount > 0 ? validDiscount : undefined,
      discountReason: validDiscount > 0 ? discountReason : undefined,
      paymentOption: pricingTier.paymentOptions?.[0]?.label || '50% à la signature, 50% à la soumission',
      installments: [
        { id: 'inst-1', description: 'Frais d\'ouverture de dossier', amount: FRAIS_OUVERTURE_DOSSIER, dueDate: now, status: 'a_venir' },
        { id: 'inst-2', description: '1er versement — Signature du contrat', amount: Math.round((grandTotal - FRAIS_OUVERTURE_DOSSIER) * 0.5), dueDate: now, status: 'a_venir' },
        { id: 'inst-3', description: '2e versement — Soumission du dossier', amount: grandTotal - FRAIS_OUVERTURE_DOSSIER - Math.round((grandTotal - FRAIS_OUVERTURE_DOSSIER) * 0.5), dueDate: new Date(Date.now() + 90 * 86400000).toISOString(), status: 'a_venir' },
      ],
      createdAt: now,
      createdBy: currentUser.id,
      notes: `Programme: ${selectedProgram?.name || selectedProgramId}`,
    };

    // Save via API
    try {
      await crmFetch('/api/crm/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContract),
      });
    } catch {
      setFormNotification({ type: 'error', message: 'Le contrat a ete cree localement, mais la sauvegarde serveur a echoue. Il sera synchronise ulterieurement.' });
    }

    setContracts([...contracts, newContract]);
    setSaving(false);
    onCreated(newContract);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B2559' }}>Nouveau contrat de service</h1>
          <p className="text-sm text-gray-500">Créez un contrat pour un client et un programme immigration</p>
        </div>
      </div>

      {step === 'select' ? (
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setSelectedCaseId(''); }}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]">
              <option value="">Sélectionner un client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
              ))}
            </select>
          </div>

          {/* Case (optional) */}
          {selectedClientId && clientCases.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dossier (optionnel)</label>
              <select value={selectedCaseId} onChange={e => handleCaseChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]">
                <option value="">Aucun dossier lié</option>
                {clientCases.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Program */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programme immigration *</label>
            <select value={selectedProgramId} onChange={e => setSelectedProgramId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]">
              <option value="">Sélectionner un programme</option>
              {PRICING_2026.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.serviceFee.toLocaleString('fr-CA')} $ (honoraires)</option>
              ))}
            </select>
          </div>

          {/* Rabais */}
          {canProceed && pricingTier && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rabais ($)</label>
                <input type="number" min="0" max={pricingTier.serviceFee} step="1" value={discount || ''} onChange={e => setDiscount(Math.min(parseFloat(e.target.value) || 0, pricingTier.serviceFee))}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif du rabais</label>
                <input type="text" value={discountReason} onChange={e => setDiscountReason(e.target.value)}
                  placeholder="Ex: Référence client, promotion..."
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]" />
              </div>
            </div>
          )}

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-medium text-red-700 mb-1">Veuillez corriger les erreurs suivantes :</p>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-0.5">
                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {/* Form notification */}
          {formNotification && (
            <div className={`flex items-center justify-between p-3 rounded-xl border text-sm ${formNotification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <span>{formNotification.message}</span>
              <button onClick={() => setFormNotification(null)} className="font-medium hover:underline ml-2">Fermer</button>
            </div>
          )}

          {/* Preview summary */}
          {canProceed && pricingTier && selectedClient && (() => {
            const previewDiscount = Math.min(discount, pricingTier.serviceFee);
            const previewTotal = pricingTier.serviceFee + FRAIS_OUVERTURE_DOSSIER + pricingTier.governmentFee - previewDiscount;
            return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-[#1B2559]">Résumé du contrat</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Client:</span> <strong>{selectedClient.firstName} {selectedClient.lastName}</strong></div>
                <div><span className="text-gray-500">Programme:</span> <strong>{pricingTier.name}</strong></div>
                <div><span className="text-gray-500">Délai estimé:</span> <strong>{pricingTier.estimatedTimeline || 'Variable'}</strong></div>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Honoraires:</span><span className="font-medium">{formatMoney(pricingTier.serviceFee)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Rabais{discountReason ? ` (${discountReason})` : ''}:</span><span>-{formatMoney(previewDiscount)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-gray-600">Frais d&apos;ouverture:</span><span className="font-medium">{formatMoney(FRAIS_OUVERTURE_DOSSIER)}</span></div>
                {pricingTier.governmentFee > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">Frais gouvernementaux:</span><span className="font-medium">{formatMoney(pricingTier.governmentFee)}</span></div>
                )}
                <div className="text-xs text-gray-400 italic">Taxes incluses dans le tarif</div>
                <div className="flex justify-between font-bold border-t border-blue-200 pt-1 mt-1">
                  <span>TOTAL:</span>
                  <span style={{ color: '#D4A03C' }}>{formatMoney(previewTotal)}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">Services inclus:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {services.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border rounded text-xs text-gray-600">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onBack} className="px-4 py-2.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button onClick={handleCreate} disabled={!canProceed || saving}
              className="flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#D4A03C' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />}
              {saving ? 'Création...' : 'Créer le contrat'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
