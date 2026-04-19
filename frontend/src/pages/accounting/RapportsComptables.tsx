import React, { useState } from 'react';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ChartBarIcon,
  CalculatorIcon,
  ScaleIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Modal from "@shared/components/UI/Modal";
import { useAccountingStatements } from '@shared/hooks/useAccountingStatements';

const EtatsRapports: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedPeriode, setSelectedPeriode] = useState('2026-04');
  const [selectedEtat, setSelectedEtat] = useState('bilan');
  const [isAnalyseGraphiqueModalOpen, setIsAnalyseGraphiqueModalOpen] = useState(false);
  const [isImprimerModalOpen, setIsImprimerModalOpen] = useState(false);
  const [etatAImprimer, setEtatAImprimer] = useState('bilan');
  const { data: dynamicData, loading } = useAccountingStatements('2024');

  // Coherence metrics
  const CA_ACTUEL = 5200000;
  const CA_ANTERIEUR = 4850000;
  const RESULTAT_BRUT = 850000;
  const IBS_ANNUEL = 221000;
  const RESULTAT_NET = 629000;

  const bilan = {
    actif: {
      immobilise: [
        { compte: '21', libelle: t('accounting.ledger.accounts.fixed_assets'), montant: 2500000 },
        { compte: '28', libelle: t('accounting.ledger.accounts.depreciation'), montant: -450000 }
      ],
      circulant: [
        { compte: '31', libelle: t('accounting.ledger.accounts.inventory'), montant: 850000 },
        { compte: '411', libelle: t('accounting.ledger.accounts.customers'), montant: 1250000 },
        { compte: '512', libelle: t('accounting.ledger.accounts.bank'), montant: 668000 },
        { compte: '53', libelle: t('accounting.ledger.accounts.cash'), montant: 125000 }
      ]
    },
    passif: {
      capitaux: [
        { compte: '10', libelle: t('accounting.ledger.accounts.equity'), montant: 1000000 },
        { compte: '12', libelle: t('accounting.ledger.accounts.net_result'), montant: RESULTAT_NET }
      ],
      dettes: [
        { compte: '16', libelle: t('common.loans', { defaultValue: 'Emprunts' }), montant: 1500000 },
        { compte: '401', libelle: t('common.suppliers', { defaultValue: 'Fournisseurs' }), montant: 890000 },
        { compte: '4457', libelle: t('accounting.fiscal.rates.tva'), montant: 399000 },
        { compte: '444', libelle: t('accounting.ledger.accounts.ibs'), montant: 221000 },
        { compte: '447', libelle: t('accounting.fiscal.rates.tap'), montant: 104000 },
        { compte: '42', libelle: t('common.personnel', { defaultValue: 'Personnel' }), montant: 200000 }
      ]
    }
  };

  const compteResultat = {
    produits: [
      { compte: '70', libelle: t('accounting.ledger.accounts.sales'), montant: CA_ACTUEL },
      { compte: '76', libelle: t('common.financial_products', { defaultValue: 'Produits financiers' }), montant: 45000 }
    ],
    charges: [
      { compte: '60', libelle: t('accounting.ledger.accounts.purchases'), montant: 3100000 },
      { compte: '63', libelle: t('common.services', { defaultValue: 'Services' }), montant: 420000 },
      { compte: '64', libelle: t('common.staff_costs', { defaultValue: 'Frais de personnel' }), montant: 680000 },
      { compte: '66', libelle: t('common.financial_charges', { defaultValue: 'Charges financières' }), montant: 95000 },
      { compte: '68', libelle: t('accounting.ledger.accounts.depreciation'), montant: 100000 },
      { compte: '69', libelle: t('accounting.ledger.accounts.ibs'), montant: IBS_ANNUEL }
    ]
  };

  const totalActif = dynamicData?.actifTotal || 4943000;
  const totalPassif = dynamicData?.passifTotal || 4943000;
  const totalProduits = dynamicData?.produits || 5245000;
  const totalCharges = dynamicData?.charges || 4616000;
  const resultat = dynamicData?.resultatNet || 629000;

  // Données de la Balance Générale (tous les comptes avec soldes débiteurs et créditeurs)

  const balanceGenerale = [
    // Actif Immobilisé
    { compte: '21', libelle: t('accounting.ledger.accounts.fixed_assets'), debit: 2500000, credit: 0 },
    { compte: '28', libelle: t('accounting.ledger.accounts.depreciation'), debit: 0, credit: 450000 },
    // Actif Circulant
    { compte: '31', libelle: t('accounting.ledger.accounts.inventory'), debit: 850000, credit: 0 },
    { compte: '411', libelle: t('accounting.ledger.accounts.customers'), debit: 1250000, credit: 0 },
    { compte: '512', libelle: t('accounting.ledger.accounts.bank'), debit: 668000, credit: 0 },
    { compte: '53', libelle: t('accounting.ledger.accounts.cash'), debit: 125000, credit: 0 },
    // Passif - Capitaux
    { compte: '10', libelle: t('accounting.ledger.accounts.equity'), debit: 0, credit: 1000000 },
    { compte: '12', libelle: t('accounting.ledger.accounts.net_result'), debit: 0, credit: RESULTAT_NET },
    // Dettes
    { compte: '16', libelle: t('common.loans', { defaultValue: 'Emprunts' }), debit: 0, credit: 1500000 },
    { compte: '401', libelle: t('common.suppliers', { defaultValue: 'Fournisseurs' }), debit: 0, credit: 890000 },
    { compte: '4457', libelle: t('accounting.fiscal.rates.tva'), debit: 0, credit: 399000 },
    { compte: '444', libelle: t('accounting.ledger.accounts.ibs'), debit: 0, credit: 221000 },
    { compte: '447', libelle: t('accounting.fiscal.rates.tap'), debit: 0, credit: 104000 },
    { compte: '42', libelle: t('common.personnel', { defaultValue: 'Personnel' }), debit: 0, credit: 200000 },
    // Produits & Charges
    { compte: '70', libelle: t('accounting.ledger.accounts.sales'), debit: 0, credit: CA_ACTUEL },
    { compte: '76', libelle: t('common.financial_products', { defaultValue: 'Prod. Financiers' }), debit: 0, credit: 45000 },
    { compte: '60', libelle: t('accounting.ledger.accounts.purchases'), debit: 3100000, credit: 0 },
    { compte: '63', libelle: t('common.services', { defaultValue: 'Services' }), debit: 420000, credit: 0 },
    { compte: '64', libelle: t('common.staff_costs', { defaultValue: 'Personnel' }), debit: 680000, credit: 0 },
    { compte: '66', libelle: t('common.financial_charges', { defaultValue: 'Charges Fin.' }), debit: 95000, credit: 0 },
    { compte: '68', libelle: t('accounting.ledger.accounts.depreciation'), debit: 100000, credit: 0 },
    { compte: '69', libelle: t('accounting.ledger.accounts.ibs'), debit: 221000, credit: 0 }
  ].sort((a, b) => a.compte.localeCompare(b.compte));

  const totalDebitBalance = balanceGenerale.reduce((sum, item) => sum + item.debit, 0);
  const totalCreditBalance = balanceGenerale.reduce((sum, item) => sum + item.credit, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const etatsDisponibles = [
    { id: 'bilan', nom: t('accounting.reports.tabs.bilan'), icon: ScaleIcon, color: 'slate' },
    { id: 'resultat', nom: t('accounting.reports.tabs.resultat'), icon: ChartBarIcon, color: 'slate' },
    { id: 'flux', nom: t('accounting.reports.tabs.flux'), icon: BanknotesIcon, color: 'slate' },
    { id: 'balance', nom: t('accounting.reports.tabs.balance'), icon: CalculatorIcon, color: 'slate' },
    { id: 'grand-livre', nom: t('accounting.reports.tabs.grand_livre'), icon: ClipboardDocumentListIcon, color: 'slate' }
  ];

  const handleImprimerEtatsOfficiels = () => {
    setIsImprimerModalOpen(true);
  };

  const handleConfirmImprimer = () => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(t('common.allow_popups', { defaultValue: 'Veuillez autoriser les pop-ups pour imprimer les états officiels.' }));
      return;
    }

    // Générer le contenu HTML pour l'impression
    const etatNom = etatsDisponibles.find(e => e.id === etatAImprimer)?.nom || 'État Comptable';
    const periode = selectedPeriode;

    let contenuHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${etatNom} - ${periode}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #000;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
          }
          .header h2 {
            font-size: 18px;
            margin: 5px 0;
          }
          .info {
            margin: 20px 0;
            padding: 15px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
          }
          .info p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #e0e0e0;
            font-weight: bold;
          }
          .total {
            font-weight: bold;
            background-color: #f0f0f0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000;
            text-align: center;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t('accounting.reports.official_report')}</h1>
          <h2>${etatNom}</h2>
          <p>${t('common.period')}: ${periode}</p>
          <p>${t('common.edition_date')}: ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
        </div>
    `;

    // Ajouter le contenu selon l'état sélectionné
    if (etatAImprimer === 'bilan') {
      contenuHTML += `
        <div class="info">
          <p><strong>BILAN COMPTABLE</strong></p>
          <p>Période: ${periode}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ACTIF</th>
              <th style="text-align: right;">Montant (DA)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="2"><strong>ACTIF IMMOBILISÉ</strong></td></tr>
      `;
      bilan.actif.immobilise.forEach(item => {
        contenuHTML += `
          <tr>
            <td>${item.compte} - ${item.libelle}</td>
            <td style="text-align: right;">${formatCurrency(item.montant)}</td>
          </tr>
        `;
      });
      contenuHTML += `
            <tr><td colspan="2"><strong>ACTIF CIRCULANT</strong></td></tr>
      `;
      bilan.actif.circulant.forEach(item => {
        contenuHTML += `
          <tr>
            <td>${item.compte} - ${item.libelle}</td>
            <td style="text-align: right;">${formatCurrency(item.montant)}</td>
          </tr>
        `;
      });
      contenuHTML += `
            <tr class="total">
              <td><strong>TOTAL ACTIF</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(totalActif)}</strong></td>
            </tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th>PASSIF</th>
              <th style="text-align: right;">Montant (DA)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="2"><strong>CAPITAUX PROPRES</strong></td></tr>
      `;
      bilan.passif.capitaux.forEach(item => {
        contenuHTML += `
          <tr>
            <td>${item.compte} - ${item.libelle}</td>
            <td style="text-align: right;">${formatCurrency(item.montant)}</td>
          </tr>
        `;
      });
      contenuHTML += `
            <tr><td colspan="2"><strong>DETTES</strong></td></tr>
      `;
      bilan.passif.dettes.forEach(item => {
        contenuHTML += `
          <tr>
            <td>${item.compte} - ${item.libelle}</td>
            <td style="text-align: right;">${formatCurrency(item.montant)}</td>
          </tr>
        `;
      });
      contenuHTML += `
            <tr class="total">
              <td><strong>TOTAL PASSIF</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(totalPassif)}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (etatAImprimer === 'resultat') {
      contenuHTML += `
        <div class="info">
          <p><strong>COMPTE DE RÉSULTAT</strong></p>
          <p>Période: ${periode}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>PRODUITS</th>
              <th style="text-align: right;">Montant (DA)</th>
            </tr>
          </thead>
          <tbody>
      `;
      compteResultat.produits.forEach(item => {
        contenuHTML += `
          <tr>
            <td>${item.compte} - ${item.libelle}</td>
            <td style="text-align: right;">${formatCurrency(item.montant)}</td>
          </tr>
        `;
      });
      contenuHTML += `
            <tr class="total">
              <td><strong>TOTAL PRODUITS</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(totalProduits)}</strong></td>
            </tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th>CHARGES</th>
              <th style="text-align: right;">Montant (DA)</th>
            </tr>
          </thead>
          <tbody>
      `;
      compteResultat.charges.forEach(item => {
        contenuHTML += `
          <tr>
            <td>${item.compte} - ${item.libelle}</td>
            <td style="text-align: right;">${formatCurrency(item.montant)}</td>
          </tr>
        `;
      });
      contenuHTML += `
            <tr class="total">
              <td><strong>TOTAL CHARGES</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(totalCharges)}</strong></td>
            </tr>
            <tr class="total">
              <td><strong>RÉSULTAT NET</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(resultat)}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (etatAImprimer === 'balance') {
      contenuHTML += `
        <div class="info">
          <p><strong>BALANCE GÉNÉRALE</strong></p>
          <p>Période: ${periode}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Compte</th>
              <th style="width: 45%;">Libellé</th>
              <th style="width: 20%; text-align: right;">Débit (DA)</th>
              <th style="width: 20%; text-align: right;">Crédit (DA)</th>
            </tr>
          </thead>
          <tbody>
      `;
      balanceGenerale.forEach(item => {
        contenuHTML += `
          <tr>
            <td><strong>${item.compte}</strong></td>
            <td>${item.libelle}</td>
            <td style="text-align: right;">${item.debit > 0 ? formatCurrency(item.debit) : '-'}</td>
            <td style="text-align: right;">${item.credit > 0 ? formatCurrency(item.credit) : '-'}</td>
          </tr>
        `;
      });
      contenuHTML += `
            <tr class="total" style="border-top: 3px solid #000;">
              <td colspan="2"><strong>TOTAL GÉNÉRAL</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(totalDebitBalance)}</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(totalCreditBalance)}</strong></td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 5px;">
          <p style="margin: 5px 0;"><strong>Vérification de l'équilibre:</strong></p>
          <p style="margin: 5px 0;">Total Débit: ${formatCurrency(totalDebitBalance)}</p>
          <p style="margin: 5px 0;">Total Crédit: ${formatCurrency(totalCreditBalance)}</p>
          <p style="margin: 5px 0; ${totalDebitBalance === totalCreditBalance ? 'color: #008000; font-weight: bold;' : 'color: #ff0000; font-weight: bold;'}">
            ${totalDebitBalance === totalCreditBalance ? '✓ Balance équilibrée' : '⚠ Balance déséquilibrée'}
          </p>
        </div>
      `;
    } else {
      contenuHTML += `
        <div class="info">
          <p><strong>${etatNom.toUpperCase()}</strong></p>
          <p>${t('common.period')}: ${periode}</p>
          <p>${t('common.available_soon', { defaultValue: 'Cet état sera disponible prochainement.' })}</p>
        </div>
      `;
    }

    contenuHTML += `
        <div class="footer">
          <p>${t('common.document_generated_on', { defaultValue: 'Document généré le' })} ${new Date().toLocaleString('fr-FR')}</p>
          <p>${t('accounting.reports.disclaimer', { defaultValue: 'Ce document est un état comptable officiel conforme aux normes comptables algériennes.' })}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(contenuHTML);
    printWindow.document.close();

    // Attendre que le contenu soit chargé puis déclencher l'impression
    setTimeout(() => {
      printWindow.print();
      setIsImprimerModalOpen(false);
    }, 500);
  };

  return (
    <>
      <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <DocumentTextIcon className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('accounting.reports.title')}</h1>
              <p className="text-slate-600">{t('accounting.reports.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select title={t('accounting.reports.period_select')}
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="2026-04">{t('common.months.april')} 2026</option>
              <option value="2026-03">{t('common.months.march')} 2026</option>
              <option value="2026-02">{t('common.months.february')} 2026</option>
              <option value="2026-01">{t('common.months.january')} 2026</option>
              <option value="2024">{t('common.periods.year')} 2024</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
              <PrinterIcon className="h-5 w-5 inline mr-2" />
              {t('accounting.reports.actions.print')}
            </button>
            <button
              onClick={() => {
                const year = selectedPeriode.split('-')[0];
                window.open(`http://localhost:8000/fiscality/liasse-fiscale/xml?year=${year}&token=${localStorage.getItem('token')}`, '_blank');
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              {t('accounting.reports.actions.export_xml')}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation des états */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {etatsDisponibles.map((etat) => {
            const Icon = etat.icon;
            return (
              <button
                key={etat.id}
                onClick={() => setSelectedEtat(etat.id)}
                className={`flex items-center px-4 py-3 rounded-lg border transition-all ${selectedEtat === etat.id
                  ? 'border-slate-900 bg-slate-100 text-slate-900'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Icon className={`h-5 w-5 mr-2 ${selectedEtat === etat.id ? 'text-slate-900' : 'text-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{etat.nom}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bilan Comptable */}
      {selectedEtat === 'bilan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Actif */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-slate-900 flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">{t('accounting.reports.bilan.actif')}</h3>
              <span className="text-xs font-bold text-slate-400">{t('accounting.reports.bilan.total_da')}</span>
            </div>
            <div className="p-8 space-y-8">
              {/* Actif immobilisé */}
              <div>
                <h4 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">{t('accounting.reports.bilan.actif_immobilise')}</h4>
                <div className="space-y-1">
                  {bilan.actif.immobilise.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-400">{item.compte}</span>
                        <span className="text-sm font-bold text-slate-700">{item.libelle}</span>
                      </div>
                      <span className="text-base font-black text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 mt-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase">{t('accounting.reports.bilan.subtotal_immobilise')}</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actif circulant */}
              <div>
                <h4 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">{t('accounting.reports.bilan.actif_circulant')}</h4>
                <div className="space-y-1">
                  {bilan.actif.circulant.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-400">{item.compte}</span>
                        <span className="text-sm font-bold text-slate-700">{item.libelle}</span>
                      </div>
                      <span className="text-base font-black text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 mt-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase">{t('accounting.reports.bilan.subtotal_circulant')}</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(bilan.actif.circulant.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Actif */}
              <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl shadow-lg transform hover:scale-[1.01] transition-transform">
                <span className="text-sm font-black text-white uppercase tracking-widest">{t('accounting.reports.bilan.total_actif')}</span>
                <span className="text-2xl font-black text-white">{formatCurrency(totalActif)}</span>
              </div>
            </div>
          </div>

          {/* Passif */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-slate-900 flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">{t('accounting.reports.bilan.passif')}</h3>
              <span className="text-xs font-bold text-slate-400">{t('accounting.reports.bilan.total_da')}</span>
            </div>
            <div className="p-8 space-y-8">
              {/* Capitaux propres */}
              <div>
                <h4 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">{t('accounting.reports.bilan.capitaux_propres')}</h4>
                <div className="space-y-1">
                  {bilan.passif.capitaux.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-400">{item.compte}</span>
                        <span className="text-sm font-bold text-slate-700">{item.libelle}</span>
                      </div>
                      <span className="text-base font-black text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 mt-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase">{t('accounting.reports.bilan.subtotal_capitaux')}</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dettes */}
              <div>
                <h4 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">{t('accounting.reports.bilan.dettes_engagements')}</h4>
                <div className="space-y-1">
                  {bilan.passif.dettes.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-400">{item.compte}</span>
                        <span className="text-sm font-bold text-slate-700">{item.libelle}</span>
                      </div>
                      <span className="text-base font-black text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 mt-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase">{t('accounting.reports.bilan.subtotal_dettes')}</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(bilan.passif.dettes.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Passif */}
              <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl shadow-lg transform hover:scale-[1.01] transition-transform">
                <span className="text-sm font-black text-white uppercase tracking-widest">{t('accounting.reports.bilan.total_passif')}</span>
                <span className="text-2xl font-black text-white">{formatCurrency(totalPassif)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compte de Résultat */}
      {selectedEtat === 'resultat' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-slate-900 flex items-center justify-between">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">{t('accounting.reports.resultat.title')}</h3>
            <span className="text-xs font-bold text-slate-400">{t('common.period')} : {selectedPeriode}</span>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Charges */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">{t('accounting.reports.resultat.charges_exploitation')}</h4>
                <div className="space-y-1">
                  {compteResultat.charges.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-400">{item.compte}</span>
                        <span className="text-sm font-bold text-slate-700">{item.libelle}</span>
                      </div>
                      <span className="text-base font-black text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-black text-slate-500 uppercase">{t('accounting.reports.resultat.total_charges')}</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(totalCharges)}</span>
                </div>
              </div>

              {/* Produits */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">{t('accounting.reports.resultat.produits_exploitation')}</h4>
                <div className="space-y-1">
                  {compteResultat.produits.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-400">{item.compte}</span>
                        <span className="text-sm font-bold text-slate-700">{item.libelle}</span>
                      </div>
                      <span className="text-base font-black text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-black text-slate-500 uppercase">{t('accounting.reports.resultat.total_produits')}</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(totalProduits)}</span>
                </div>
              </div>
            </div>

            {/* Résultat */}
            <div className="mt-8 p-8 bg-slate-900 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    {resultat >= 0 ? (
                      <ArrowTrendingUpIcon className="h-10 w-10 text-emerald-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-10 w-10 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('accounting.reports.resultat.net_result')}</p>
                    <p className="text-4xl font-black text-white">
                      {formatCurrency(resultat)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 text-right">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('accounting.reports.resultat.net_margin')}</p>
                  <p className="text-3xl font-black text-white">
                    {((resultat / totalProduits) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flux de Trésorerie */}
      {selectedEtat === 'flux' && (
        <div className="space-y-6">
          {/* Tableau des flux */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-900">{t('accounting.reports.flux.title')}</h3>
                  <div className="flex space-x-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-[10px] font-black text-white rounded uppercase tracking-tighter">
                      {t('common.international')}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-black text-white rounded uppercase tracking-tighter">
                      {t('common.ifrs_badge')}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-1">{t('accounting.reports.flux.method_indirect', { period: selectedPeriode })}</p>
            </div>
            <div className="p-6">
              {/* Flux opérationnels */}
              <div className="mb-6">
                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-emerald-500 mr-3"></div>
                  {t('accounting.reports.flux.activity')}
                </h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t('accounting.reports.flux.net_result')}</span>
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(resultat)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 ml-4">{t('accounting.reports.flux.depreciation')}</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(100000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 ml-4">{t('accounting.reports.flux.inventory_var')}</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(85000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 ml-4">{t('accounting.reports.flux.receivables_var')}</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(125000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 ml-4">{t('accounting.reports.flux.payables_var')}</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(95000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl shadow-md mt-4">
                    <span className="text-sm font-black text-white uppercase tracking-widest">{t('accounting.reports.flux.net_op_flow')}</span>
                    <span className="text-xl font-black text-white">{formatCurrency(resultat + 100000 - 85000 - 125000 + 95000)}</span>
                  </div>
                </div>
              </div>

              {/* Flux d'investissement */}
              <div className="mb-6">
                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-cyan-500 mr-3"></div>
                  {t('accounting.reports.flux.investment')}
                </h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t('accounting.reports.flux.acquisition_fixed')}</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(450000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t('accounting.reports.flux.disposal_fixed')}</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(80000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl shadow-md mt-4">
                    <span className="text-sm font-black text-white uppercase tracking-widest">{t('accounting.reports.flux.net_inv_flow')}</span>
                    <span className="text-xl font-black text-white">({formatCurrency(370000)})</span>
                  </div>
                </div>
              </div>

              {/* Flux de financement */}
              <div className="mb-6">
                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-amber-500 mr-3"></div>
                  {t('accounting.reports.flux.financing')}
                </h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t('accounting.reports.flux.capital_increase')}</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t('accounting.reports.flux.new_loans')}</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(500000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t('accounting.reports.flux.loan_repayment')}</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(180000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t('accounting.reports.flux.dividends')}</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(120000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl shadow-md mt-4">
                    <span className="text-sm font-black text-white uppercase tracking-widest">{t('accounting.reports.flux.net_fin_flow')}</span>
                    <span className="text-xl font-black text-white">{formatCurrency(200000)}</span>
                  </div>
                </div>
              </div>

              {/* Variation de trésorerie */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg text-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-base font-medium">{t('accounting.reports.flux.opening_cash')}</span>
                    <span className="text-lg font-bold">{formatCurrency(450000)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-base font-medium">{t('accounting.reports.flux.net_variation')}</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency((resultat + 100000 - 85000 - 125000 + 95000) - 370000 + 200000)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold">{t('accounting.reports.flux.closing_cash')}</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(450000 + ((resultat + 100000 - 85000 - 125000 + 95000) - 370000 + 200000))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique de flux */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('accounting.reports.flux.visualization', { defaultValue: 'Visualisation des Flux' })}</h3>
            <div className="space-y-4">
              {[
                { label: t('accounting.reports.flux.net_op_flow'), montant: (resultat + 100000 - 85000 - 125000 + 95000), color: 'emerald', pourcent: 100 },
                { label: t('accounting.reports.flux.net_inv_flow'), montant: -370000, color: 'red', pourcent: 40 },
                { label: t('accounting.reports.flux.financing'), montant: 200000, color: 'amber', pourcent: 22 }
              ].map((flux, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{flux.label}</span>
                    <span className={`font-bold ${flux.montant >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(flux.montant)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${flux.color === 'emerald' ? 'bg-emerald-500' :
                        flux.color === 'red' ? 'bg-red-500' :
                          'bg-amber-500'
                        }`}
                      style={{ width: `${flux.pourcent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Balance Générale */}
      {selectedEtat === 'balance' && (() => {
        const balanceData = [
          { compte: '21', libelle: t('accounting.ledger.accounts.fixed_assets'), debit: 2500000, credit: 0, solde: 2500000 },
          { compte: '28', libelle: t('accounting.ledger.accounts.depreciation'), debit: 0, credit: 450000, solde: -450000 },
          { compte: '31', libelle: t('accounting.ledger.accounts.inventory'), debit: 850000, credit: 0, solde: 850000 },
          { compte: '411', libelle: t('accounting.ledger.accounts.customers'), debit: 1250000, credit: 0, solde: 1250000 },
          { compte: '512', libelle: t('accounting.ledger.accounts.bank'), debit: 450000, credit: 0, solde: 450000 },
          { compte: '53', libelle: t('accounting.ledger.accounts.cash'), debit: 125000, credit: 0, solde: 125000 },
          { compte: '10', libelle: t('accounting.ledger.accounts.equity'), debit: 0, credit: 1000000, solde: -1000000 },
          { compte: '12', libelle: t('accounting.ledger.accounts.net_result'), debit: 0, credit: resultat, solde: -resultat },
          { compte: '16', libelle: t('common.loans', { defaultValue: 'Emprunts' }), debit: 0, credit: 1500000, solde: -1500000 },
          { compte: '401', libelle: t('common.suppliers', { defaultValue: 'Fournisseurs' }), debit: 0, credit: 890000, solde: -890000 },
          { compte: '4457', libelle: t('accounting.fiscal.rates.tva'), debit: 0, credit: 285000, solde: -285000 },
          { compte: '70', libelle: t('accounting.ledger.accounts.sales'), debit: 0, credit: 5200000, solde: -5200000 },
          { compte: '60', libelle: t('accounting.ledger.accounts.purchases'), debit: 3100000, credit: 0, solde: 3100000 },
          { compte: '64', libelle: t('common.staff_costs', { defaultValue: 'Frais de personnel' }), debit: 680000, credit: 0, solde: 680000 }
        ];

        const totalDebitBalance = balanceData.reduce((sum, ligne) => sum + ligne.debit, 0);
        const totalCreditBalance = balanceData.reduce((sum, ligne) => sum + ligne.credit, 0);

        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-slate-900 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest">{t('accounting.reports.balance.title')}</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{t('accounting.reports.balance.subtitle', { period: selectedPeriode })}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-slate-700">{t('accounting.reports.audit_ready')}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-900 border-b-2 border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.balance.account')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.balance.label')}</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.balance.debit')}</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.balance.credit')}</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.balance.balance')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {balanceData.map((ligne, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-900 font-mono">{ligne.compte}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{ligne.libelle}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-slate-700">
                          {ligne.debit > 0 ? formatCurrency(ligne.debit) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-slate-700">
                          {ligne.credit > 0 ? formatCurrency(ligne.credit) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-black ${ligne.solde >= 0 ? 'text-slate-900' : 'text-slate-900'}`}>
                            {formatCurrency(Math.abs(ligne.solde))}
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">{ligne.solde >= 0 ? t('common.debtor') : t('common.creditor')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900/50">
                  <tr className="border-t-2 border-slate-800">
                    <td colSpan={2} className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest">
                      {t('accounting.reports.balance.total_general')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-black text-white">{formatCurrency(totalDebitBalance)}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-white">{formatCurrency(totalCreditBalance)}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-white">{formatCurrency(Math.abs(totalDebitBalance - totalCreditBalance))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Grand Livre */}
      {selectedEtat === 'grand-livre' && (() => {
        const grandLivreData = [
          {
            compte: '512',
            nom: t('accounting.reports.ledger.accounts.bank'),
            ecritures: [
              { date: '2026-04-01', libelle: t('accounting.reports.ledger.labels.opening_balance'), debit: 450000, credit: 0, solde: 450000 },
              { date: '2026-04-05', libelle: `${t('accounting.reports.ledger.labels.sale_invoice')} F2026-001`, debit: 125000, credit: 0, solde: 575000 },
              { date: '2026-04-10', libelle: `${t('accounting.reports.ledger.labels.supplier_payment')} Sarl ABC`, debit: 0, credit: 85000, solde: 490000 },
              { date: '2026-04-15', libelle: `${t('accounting.reports.ledger.labels.salary_payment')} ${t('common.months.april')}`, debit: 0, credit: 150000, solde: 340000 }
            ]
          },
          {
            compte: '411',
            nom: t('accounting.reports.ledger.accounts.clients'),
            ecritures: [
              { date: '2026-04-01', libelle: t('accounting.reports.ledger.labels.opening_balance'), debit: 1250000, credit: 0, solde: 1250000 },
              { date: '2026-04-05', libelle: `${t('accounting.reports.ledger.labels.sale_invoice')} F2026-001 - Client XYZ`, debit: 85000, credit: 0, solde: 1335000 },
              { date: '2026-04-20', libelle: `${t('accounting.reports.ledger.labels.client_payment')} F2026-001`, debit: 0, credit: 85000, solde: 1250000 }
            ]
          }
        ];

        return (
          <div className="space-y-6">
            {grandLivreData.map((compte, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-slate-800 text-white rounded-lg mr-3 font-mono font-black text-xs border border-slate-700">
                      {t('accounting.reports.ledger.account_abbr')} {compte.compte}
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">{compte.nom}</h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.ledger.final_balance')}</span>
                    <span className="text-lg font-black text-white">
                      {formatCurrency(compte.ecritures[compte.ecritures.length - 1].solde)}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('accounting.reports.ledger.date')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('accounting.reports.ledger.label')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('accounting.reports.ledger.debit')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('accounting.reports.ledger.credit')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('accounting.reports.ledger.balance')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {compte.ecritures.map((ecriture, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                            {new Date(ecriture.date).toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'en' ? 'en-US' : 'fr-FR')}
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-900">{ecriture.libelle}</td>
                          <td className="px-6 py-3 text-right text-sm font-medium text-slate-900">
                            {ecriture.debit > 0 ? formatCurrency(ecriture.debit) : '-'}
                          </td>
                          <td className="px-6 py-3 text-right text-sm font-medium text-slate-900">
                            {ecriture.credit > 0 ? formatCurrency(ecriture.credit) : '-'}
                          </td>
                          <td className={`px-6 py-3 text-right text-sm font-bold ${ecriture.solde >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(ecriture.solde))} {ecriture.solde < 0 ? t('accounting.reports.ledger.creditor_short') : t('accounting.reports.ledger.debtor_short')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Ratios financiers détaillés */}
      <div className="mt-12 space-y-12">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <CalculatorIcon className="h-6 w-6 text-slate-600 mr-2" />
          {t('accounting.reports.ratios.title', { defaultValue: 'Ratios Financiers Clés' })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.ratios.current_liquidity', { defaultValue: 'Liquidité Générale' })}</p>
              <BanknotesIcon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">
              {(bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / bilan.passif.dettes.reduce((s, i) => s + i.montant, 0)).toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400 mb-4 font-mono">{t('accounting.reports.ratios.current_liquidity_desc')}</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full"
                style={{ width: `${Math.min((bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / bilan.passif.dettes.reduce((s, i) => s + i.montant, 0)) * 50, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.ratios.financial_autonomy', { defaultValue: 'Autonomie Financière' })}</p>
              <ScaleIcon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">
              {((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0)) * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 mb-4 font-mono">{t('accounting.reports.ratios.financial_autonomy_desc')}</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full"
                style={{ width: `${Math.min(((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0)) * 100) / 2, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.resultat.net_margin')}</p>
              <ChartBarIcon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">
              {((resultat / totalProduits) * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 mb-4 font-mono">{t('accounting.reports.resultat.net_margin_desc')}</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full"
                style={{ width: `${((resultat / totalProduits) * 100) * 5}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.ratios.added_value', { defaultValue: 'Valeur Ajoutée' })}</p>
              <ArrowTrendingUpIcon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">
              {(((totalProduits - compteResultat.charges.find(c => c.compte === '60')!.montant) / totalProduits) * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 mb-4 font-mono">{t('accounting.reports.ratios.added_value_desc')}</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full"
                style={{ width: `${(((totalProduits - compteResultat.charges.find(c => c.compte === '60')!.montant) / totalProduits) * 100) * 2}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Ratios supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* ROE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.ratios.roe')}</p>
                <p className="text-xs font-bold text-slate-700">{t('accounting.reports.ratios.roe_desc')}</p>
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-3xl font-black text-slate-900">
              {((RESULTAT_NET / bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0)) * 100).toFixed(1)}%
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">{t('accounting.reports.ratios.labels.net_result')}</span>
                <span className="font-bold text-slate-700">{formatCurrency(RESULTAT_NET)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">{t('accounting.reports.ratios.labels.equity')}</span>
                <span className="font-bold text-slate-700">{formatCurrency(bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0))}</span>
              </div>
            </div>
          </div>

          {/* ROA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.ratios.roa')}</p>
                <p className="text-xs font-bold text-slate-700">{t('accounting.reports.ratios.roa_desc')}</p>
              </div>
              <ChartBarIcon className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-3xl font-black text-slate-900">
              {((RESULTAT_NET / totalActif) * 100).toFixed(1)}%
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">{t('accounting.reports.ratios.labels.net_result')}</span>
                <span className="font-bold text-slate-700">{formatCurrency(RESULTAT_NET)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">{t('accounting.reports.ratios.labels.total_assets')}</span>
                <span className="font-bold text-slate-700">{formatCurrency(totalActif)}</span>
              </div>
            </div>
          </div>

          {/* Fonds de roulement */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.reports.ratios.working_capital')}</p>
                <p className="text-xs font-bold text-slate-700">{t('accounting.reports.ratios.working_capital_desc')}</p>
              </div>
              <BanknotesIcon className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-3xl font-black text-slate-900">
              {formatCurrency(
                (bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0) + bilan.passif.dettes.find(d => d.compte === '16')!.montant) -
                (bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0))
              )}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">{t('accounting.reports.ratios.labels.stable_resources')}</span>
                <span className="font-bold text-slate-700">{formatCurrency(bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0) + 1500000)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">{t('accounting.reports.ratios.labels.stable_uses')}</span>
                <span className="font-bold text-slate-700">{formatCurrency(bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyse comparative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des principaux postes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-900 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('accounting.reports.evolution_title', { defaultValue: 'Évolution des Postes Clés' })}</h3>
            <span className="text-[10px] font-bold text-slate-400">{t('accounting.reports.comparison_n_n1', { defaultValue: 'Comparaison N / N-1' })}</span>
          </div>
          <div className="p-6 space-y-4">
            {([
              { poste: t('accounting.ledger.accounts.sales'), actuel: CA_ACTUEL, precedent: CA_ANTERIEUR, color: 'emerald' },
              { poste: t('accounting.reports.resultat.charges_exploitation'), actuel: 4200000, precedent: 4100000, color: 'red' },
              { poste: t('accounting.reports.resultat.net_result'), actuel: RESULTAT_NET, precedent: 725000, color: 'cyan' },
              { poste: t('accounting.reports.tabs.flux'), actuel: 575000, precedent: 450000, color: 'amber' }
            ].map((item, i) => {
              const evolution = ((item.actuel - item.precedent) / item.precedent) * 100;
              return (
                <div key={i} className="p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.poste}</span>
                    <div className={`flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${evolution >= 0 ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                      {evolution >= 0 ? '↗' : '↘'} {Math.abs(evolution).toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{t('accounting.reports.period_n1')}</span>
                      <span className="text-sm font-bold text-slate-500">{formatCurrency(item.precedent)}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] font-bold text-slate-900 uppercase">{t('accounting.reports.period_n')}</span>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(item.actuel)}</span>
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Graphique de structure */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-900 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('accounting.reports.structure_title', { defaultValue: 'Structure du Bilan' })}</h3>
            <span className="text-[10px] font-bold text-slate-400">{t('accounting.reports.post_weight', { defaultValue: 'Poids des Postes' })}</span>
          </div>
          <div className="p-8 space-y-8">
            {/* Actif */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">{t('accounting.reports.actif_distribution', { defaultValue: 'RÉPARTITION DE L\'ACTIF' })}</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">{t('accounting.reports.fixed_assets')}</span>
                    <span className="text-xs font-black text-slate-900">
                      {((Math.abs(bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0)) / totalActif) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full opacity-60"
                      style={{ width: `${((Math.abs(bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0)) / totalActif) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">{t('accounting.reports.current_assets')}</span>
                    <span className="text-xs font-black text-slate-900">
                      {((bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / totalActif) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full"
                      style={{ width: `${((bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / totalActif) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passif */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">{t('accounting.reports.passif_structure', { defaultValue: 'STRUCTURE DU PASSIF' })}</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">{t('accounting.reports.equity')}</span>
                    <span className="text-xs font-black text-slate-900">
                      {((bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0) / totalPassif) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full"
                      style={{ width: `${((bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0) / totalPassif) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">{t('accounting.reports.liabilities')}</span>
                    <span className="text-xs font-black text-slate-900">
                      {((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / totalPassif) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full opacity-40"
                      style={{ width: `${((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / totalPassif) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95 group">
          <DocumentArrowDownIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-900 mr-2" />
          <span className="text-sm font-bold text-slate-700">{t('accounting.reports.actions.export_pdf', { defaultValue: 'Exporter PDF' })}</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95 group">
          <DocumentArrowDownIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-900 mr-2" />
          <span className="text-sm font-bold text-slate-700">{t('accounting.reports.actions.export_excel', { defaultValue: 'Exporter Excel' })}</span>
        </button>
        <button
          onClick={handleImprimerEtatsOfficiels}
          className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95 group"
        >
          <PrinterIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-900 mr-2" />
          <span className="text-sm font-bold text-slate-700">{t('common.print', { defaultValue: 'Imprimer' })}</span>
        </button>
        <button
          onClick={() => setIsAnalyseGraphiqueModalOpen(true)}
          className="flex items-center justify-center p-4 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-lg active:scale-95 group"
        >
          <ChartBarIcon className="h-5 w-5 text-slate-400 group-hover:text-white mr-2" />
          <span className="text-sm font-bold">{t('accounting.reports.actions.graphical_analysis', { defaultValue: 'Analyse Graphique' })}</span>
        </button>
      </div>

      {/* Modal Analyse Graphique */}
      <Modal
        isOpen={isAnalyseGraphiqueModalOpen}
        onClose={() => setIsAnalyseGraphiqueModalOpen(false)}
        title={t('accounting.reports.actions.graphical_analysis')}
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('accounting.reports.modals.graphical_desc', { defaultValue: '📊 Visualisez vos états comptables sous forme de graphiques interactifs pour une meilleure compréhension de vos données financières.' })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setIsAnalyseGraphiqueModalOpen(false);
                navigate('/dashboard/graphiques');
              }}
              className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-slate-900 hover:shadow-xl transition-all text-left group"
            >
              <ChartBarIcon className="h-10 w-10 text-slate-400 group-hover:text-slate-900 mb-4 transition-colors" />
              <h3 className="font-black text-slate-900 uppercase tracking-widest mb-2 text-xs">{t('accounting.reports.modals.graphical_analysis.title')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('accounting.reports.modals.graphical_analysis.desc')}
              </p>
            </button>

            <button
              onClick={() => {
                setIsAnalyseGraphiqueModalOpen(false);
                navigate('/rapports-analytics');
              }}
              className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-slate-900 hover:shadow-xl transition-all text-left group"
            >
              <ChartBarIcon className="h-10 w-10 text-slate-400 group-hover:text-slate-900 mb-4 transition-colors" />
              <h3 className="font-black text-slate-900 uppercase tracking-widest mb-2 text-xs">{t('accounting.reports.modals.reports_analytics.title')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('accounting.reports.modals.reports_analytics.desc')}
              </p>
            </button>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            <h4 className="text-[10px] font-black text-slate-900 mb-6 uppercase tracking-[0.2em] flex items-center">
              <span className="w-8 h-[1px] bg-slate-300 mr-3"></span>
              {t('accounting.reports.modals.metrics_title')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 relative z-10">
              {[
                t('accounting.reports.modals.metrics_list.balance_evolution'),
                t('accounting.reports.modals.metrics_list.net_income_performance'),
                t('accounting.reports.modals.metrics_list.operating_cash_flow'),
                t('accounting.reports.modals.metrics_list.liquidity_solvency_ratios'),
                t('accounting.reports.modals.metrics_list.comparative_analysis'),
                t('accounting.reports.modals.metrics_list.working_capital_monitoring')
              ].map((item, i) => (
                <div key={i} className="flex items-center text-xs text-slate-600 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-3 group-hover:bg-slate-900 transition-colors"></div>
                  <span className="font-bold group-hover:text-slate-900 transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Imprimer États Officiels */}
      <Modal
        isOpen={isImprimerModalOpen}
        onClose={() => setIsImprimerModalOpen(false)}
        title={t('accounting.reports.modals.print_official_title')}
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('accounting.reports.modals.imprimer_desc')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('accounting.reports.modals.state_to_print')} <span className="text-red-500">*</span>
            </label>
            <select title="Sélectionner un état à imprimer"
              value={etatAImprimer}
              onChange={(e) => setEtatAImprimer(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
            >
              {etatsDisponibles.map(etat => (
                <option key={etat.id} value={etat.id}>
                  {etat.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('common.period')}
            </label>
            <input title="Sélectionner un mois" placeholder="mm/yyyy"
              type="month"
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
            />
          </div>

          <div className="bg-slate-50 border-l-4 border-slate-900 rounded-xl p-6 shadow-sm">
            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mb-1">{t('common.warning')}</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('accounting.reports.modals.popup_warning')}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsImprimerModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirmImprimer}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              {t('common.print')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  </>
);
};

export default EtatsRapports;


