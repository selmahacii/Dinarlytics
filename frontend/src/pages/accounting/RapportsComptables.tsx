import React, { useState } from 'react';
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

const EtatsRapports: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriode, setSelectedPeriode] = useState('2026-04');
  const [selectedEtat, setSelectedEtat] = useState('bilan');
  const [isAnalyseGraphiqueModalOpen, setIsAnalyseGraphiqueModalOpen] = useState(false);
  const [isImprimerModalOpen, setIsImprimerModalOpen] = useState(false);
  const [etatAImprimer, setEtatAImprimer] = useState('bilan');

  // Coherence metrics
  const CA_ACTUEL = 5200000;
  const CA_ANTERIEUR = 4850000;
  const RESULTAT_BRUT = 850000;
  const IBS_ANNUEL = 221000;
  const RESULTAT_NET = 629000;

  // Données du bilan
  const bilan = {
    actif: {
      immobilise: [
        { compte: '21', libelle: 'Immobilisations corporelles', montant: 2500000 },
        { compte: '28', libelle: 'Amortissements', montant: -450000 }
      ],
      circulant: [
        { compte: '31', libelle: 'Stocks de marchandises', montant: 850000 },
        { compte: '411', libelle: 'Clients', montant: 1250000 },
        { compte: '512', libelle: 'Banque', montant: 668000 },
        { compte: '53', libelle: 'Caisse', montant: 125000 }
      ]
    },
    passif: {
      capitaux: [
        { compte: '10', libelle: 'Capital social', montant: 1000000 },
        { compte: '12', libelle: 'Résultat net de l\'exercice', montant: RESULTAT_NET }
      ],
      dettes: [
        { compte: '16', libelle: 'Emprunts', montant: 1500000 },
        { compte: '401', libelle: 'Fournisseurs', montant: 890000 },
        { compte: '4457', libelle: 'TVA à verser', montant: 399000 },
        { compte: '444', libelle: 'IBS à payer', montant: 221000 },
        { compte: '447', libelle: 'TAP à payer', montant: 104000 },
        { compte: '42', libelle: 'Personnel', montant: 200000 }
      ]
    }
  };

  // Données du compte de résultat
  const compteResultat = {
    produits: [
      { compte: '70', libelle: 'Ventes de marchandises', montant: CA_ACTUEL },
      { compte: '76', libelle: 'Produits financiers', montant: 45000 }
    ],
    charges: [
      { compte: '60', libelle: 'Achats consommés', montant: 3100000 },
      { compte: '63', libelle: 'Services', montant: 420000 },
      { compte: '64', libelle: 'Frais de personnel', montant: 680000 },
      { compte: '66', libelle: 'Charges financières', montant: 95000 },
      { compte: '68', libelle: 'Dotations aux amortissements', montant: 100000 },
      { compte: '69', libelle: 'Impôts sur les bénéfices (IBS)', montant: IBS_ANNUEL }
    ]
  };

  const totalActif = [
    ...bilan.actif.immobilise,
    ...bilan.actif.circulant
  ].reduce((sum, item) => sum + item.montant, 0);

  const totalPassif = [
    ...bilan.passif.capitaux,
    ...bilan.passif.dettes
  ].reduce((sum, item) => sum + item.montant, 0);

  const totalProduits = compteResultat.produits.reduce((sum, item) => sum + item.montant, 0);
  const totalCharges = compteResultat.charges.reduce((sum, item) => sum + item.montant, 0);
  const resultat = totalProduits - totalCharges;

  // Données de la Balance Générale (tous les comptes avec soldes débiteurs et créditeurs)

  const balanceGenerale = [
    // Actif Immobilisé
    { compte: '21', libelle: 'Immobilisations corporelles', debit: 2500000, credit: 0 },
    { compte: '28', libelle: 'Amortissements', debit: 0, credit: 450000 },
    // Actif Circulant
    { compte: '31', libelle: 'Stocks de marchandises', debit: 850000, credit: 0 },
    { compte: '411', libelle: 'Clients', debit: 1250000, credit: 0 },
    { compte: '512', libelle: 'Banque', debit: 668000, credit: 0 },
    { compte: '53', libelle: 'Caisse', debit: 125000, credit: 0 },
    // Passif - Capitaux
    { compte: '10', libelle: 'Capital social', debit: 0, credit: 1000000 },
    { compte: '12', libelle: 'Résultat net', debit: 0, credit: RESULTAT_NET },
    // Dettes
    { compte: '16', libelle: 'Emprunts', debit: 0, credit: 1500000 },
    { compte: '401', libelle: 'Fournisseurs', debit: 0, credit: 890000 },
    { compte: '4457', libelle: 'TVA à verser', debit: 0, credit: 399000 },
    { compte: '444', libelle: 'IBS à payer', debit: 0, credit: 221000 },
    { compte: '447', libelle: 'TAP à payer', debit: 0, credit: 104000 },
    { compte: '42', libelle: 'Personnel', debit: 0, credit: 200000 },
    // Produits & Charges
    { compte: '70', libelle: 'Ventes', debit: 0, credit: CA_ACTUEL },
    { compte: '76', libelle: 'Prod. Financiers', debit: 0, credit: 45000 },
    { compte: '60', libelle: 'Achats', debit: 3100000, credit: 0 },
    { compte: '63', libelle: 'Services', debit: 420000, credit: 0 },
    { compte: '64', libelle: 'Personnel', debit: 680000, credit: 0 },
    { compte: '66', libelle: 'Charges Fin.', debit: 95000, credit: 0 },
    { compte: '68', libelle: 'Dotations', debit: 100000, credit: 0 },
    { compte: '69', libelle: 'IBS', debit: 221000, credit: 0 }
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
    { id: 'bilan', nom: 'Bilan Comptable', icon: ScaleIcon, color: 'slate' },
    { id: 'resultat', nom: 'Compte de Résultat', icon: ChartBarIcon, color: 'slate' },
    { id: 'flux', nom: 'Flux de Trésorerie', icon: BanknotesIcon, color: 'slate' },
    { id: 'balance', nom: 'Balance Générale', icon: CalculatorIcon, color: 'slate' },
    { id: 'grand-livre', nom: 'Grand Livre', icon: ClipboardDocumentListIcon, color: 'slate' }
  ];

  const handleImprimerEtatsOfficiels = () => {
    setIsImprimerModalOpen(true);
  };

  const handleConfirmImprimer = () => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour imprimer les états officiels.');
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
          <h1>ÉTAT COMPTABLE OFFICIEL</h1>
          <h2>${etatNom}</h2>
          <p>Période: ${periode}</p>
          <p>Date d'édition: ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
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
          <p>Période: ${periode}</p>
          <p>Cet état sera disponible prochainement.</p>
        </div>
      `;
    }

    contenuHTML += `
        <div class="footer">
          <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
          <p>Ce document est un état comptable officiel conforme aux normes comptables algériennes.</p>
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
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <DocumentTextIcon className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">États & Rapports Comptables</h1>
              <p className="text-slate-600">Bilan, compte de résultat et états financiers</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select title="Sélectionner une période"
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="2026-04">Avril 2026</option>
              <option value="2026-03">Mars 2026</option>
              <option value="2026-02">Février 2026</option>
              <option value="2026-01">Janvier 2026</option>
              <option value="2024">Année 2024</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
              <PrinterIcon className="h-5 w-5 inline mr-2" />
              Imprimer
            </button>
            <button
              onClick={() => {
                const year = selectedPeriode.split('-')[0];
                window.open(`http://localhost:8000/fiscality/liasse-fiscale/xml?year=${year}&token=${localStorage.getItem('token')}`, '_blank');
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Exporter Jibaya XML
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
              <h3 className="text-lg font-black text-white uppercase tracking-widest">ACTIF</h3>
              <span className="text-xs font-bold text-slate-400">Total en DA</span>
            </div>
            <div className="p-8 space-y-8">
              {/* Actif immobilisé */}
              <div>
                <h4 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Actif Immobilisé</h4>
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
                    <span className="text-xs font-black text-slate-500 uppercase">Sous-total Immobilisé</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actif circulant */}
              <div>
                <h4 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Actif Circulant</h4>
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
                    <span className="text-xs font-black text-slate-500 uppercase">Sous-total Circulant</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(bilan.actif.circulant.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Actif */}
              <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl shadow-lg transform hover:scale-[1.01] transition-transform">
                <span className="text-sm font-black text-white uppercase tracking-widest">TOTAL ACTIF</span>
                <span className="text-2xl font-black text-white">{formatCurrency(totalActif)}</span>
              </div>
            </div>
          </div>

          {/* Passif */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-slate-900 flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">PASSIF</h3>
              <span className="text-xs font-bold text-slate-400">Total en DA</span>
            </div>
            <div className="p-8 space-y-8">
              {/* Capitaux propres */}
              <div>
                <h4 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Capitaux Propres</h4>
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
                    <span className="text-xs font-black text-slate-500 uppercase">Sous-total Capitaux</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dettes */}
              <div>
                <h4 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Dettes & Engagements</h4>
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
                    <span className="text-xs font-black text-slate-500 uppercase">Sous-total Dettes</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(bilan.passif.dettes.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Passif */}
              <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl shadow-lg transform hover:scale-[1.01] transition-transform">
                <span className="text-sm font-black text-white uppercase tracking-widest">TOTAL PASSIF</span>
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
            <h3 className="text-lg font-black text-white uppercase tracking-widest">COMPTE DE RÉSULTAT</h3>
            <span className="text-xs font-bold text-slate-400">Période : {selectedPeriode}</span>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Charges */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">CHARGES D'EXPLOITATION</h4>
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
                  <span className="text-xs font-black text-slate-500 uppercase">TOTAL DES CHARGES</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(totalCharges)}</span>
                </div>
              </div>

              {/* Produits */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">PRODUITS D'EXPLOITATION</h4>
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
                  <span className="text-xs font-black text-slate-500 uppercase">TOTAL DES PRODUITS</span>
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
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Résultat Net de l'Exercice</p>
                    <p className="text-4xl font-black text-white">
                      {formatCurrency(resultat)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 text-right">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Marge Nette</p>
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
              <h3 className="text-lg font-bold text-slate-900">TABLEAU DES FLUX DE TRÉSORERIE</h3>
              <p className="text-sm text-slate-600 mt-1">Méthode indirecte - Période : {selectedPeriode}</p>
            </div>
            <div className="p-6">
              {/* Flux opérationnels */}
              <div className="mb-6">
                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-emerald-500 mr-3"></div>
                  FLUX DE TRÉSORERIE LIÉS À L'ACTIVITÉ
                </h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">Résultat net de l'exercice</span>
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(resultat)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 ml-4">+ Dotations aux amortissements</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(100000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 ml-4">- Variation des stocks</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(85000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 ml-4">- Variation des créances clients</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(125000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 ml-4">+ Variation des dettes fournisseurs</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(95000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl shadow-md mt-4">
                    <span className="text-sm font-black text-white uppercase tracking-widest">Flux net opérationnel</span>
                    <span className="text-xl font-black text-white">{formatCurrency(resultat + 100000 - 85000 - 125000 + 95000)}</span>
                  </div>
                </div>
              </div>

              {/* Flux d'investissement */}
              <div className="mb-6">
                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-cyan-500 mr-3"></div>
                  FLUX DE TRÉSORERIE LIÉS AUX INVESTISSEMENTS
                </h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">- Acquisition immobilisations</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(450000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">+ Cession d'immobilisations</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(80000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl shadow-md mt-4">
                    <span className="text-sm font-black text-white uppercase tracking-widest">Flux net d'investissement</span>
                    <span className="text-xl font-black text-white">({formatCurrency(370000)})</span>
                  </div>
                </div>
              </div>

              {/* Flux de financement */}
              <div className="mb-6">
                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-amber-500 mr-3"></div>
                  FLUX DE TRÉSORERIE LIÉS AU FINANCEMENT
                </h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">+ Augmentation de capital</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">+ Nouveaux emprunts</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(500000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">- Remboursement emprunts</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(180000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">- Dividendes versés</span>
                    <span className="text-sm font-semibold text-red-600">({formatCurrency(120000)})</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl shadow-md mt-4">
                    <span className="text-sm font-black text-white uppercase tracking-widest">Flux net de financement</span>
                    <span className="text-xl font-black text-white">{formatCurrency(200000)}</span>
                  </div>
                </div>
              </div>

              {/* Variation de trésorerie */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg text-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-base font-medium">Trésorerie d'ouverture</span>
                    <span className="text-lg font-bold">{formatCurrency(450000)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-base font-medium">Variation nette de trésorerie</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency((resultat + 100000 - 85000 - 125000 + 95000) - 370000 + 200000)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold">Trésorerie de clôture</span>
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
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Visualisation des Flux</h3>
            <div className="space-y-4">
              {[
                { label: 'Flux Opérationnels', montant: (resultat + 100000 - 85000 - 125000 + 95000), color: 'emerald', pourcent: 100 },
                { label: 'Flux d\'Investissement', montant: -370000, color: 'red', pourcent: 40 },
                { label: 'Flux de Financement', montant: 200000, color: 'amber', pourcent: 22 }
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
          { compte: '21', libelle: 'Immobilisations corporelles', debit: 2500000, credit: 0, solde: 2500000 },
          { compte: '28', libelle: 'Amortissements', debit: 0, credit: 450000, solde: -450000 },
          { compte: '31', libelle: 'Stocks de marchandises', debit: 850000, credit: 0, solde: 850000 },
          { compte: '411', libelle: 'Clients', debit: 1250000, credit: 0, solde: 1250000 },
          { compte: '512', libelle: 'Banque', debit: 450000, credit: 0, solde: 450000 },
          { compte: '53', libelle: 'Caisse', debit: 125000, credit: 0, solde: 125000 },
          { compte: '10', libelle: 'Capital social', debit: 0, credit: 1000000, solde: -1000000 },
          { compte: '12', libelle: 'Résultat', debit: 0, credit: resultat, solde: -resultat },
          { compte: '16', libelle: 'Emprunts', debit: 0, credit: 1500000, solde: -1500000 },
          { compte: '401', libelle: 'Fournisseurs', debit: 0, credit: 890000, solde: -890000 },
          { compte: '4457', libelle: 'TVA collectée', debit: 0, credit: 285000, solde: -285000 },
          { compte: '70', libelle: 'Ventes', debit: 0, credit: 5200000, solde: -5200000 },
          { compte: '60', libelle: 'Achats', debit: 3100000, credit: 0, solde: 3100000 },
          { compte: '64', libelle: 'Frais de personnel', debit: 680000, credit: 0, solde: 680000 }
        ];

        const totalDebitBalance = balanceData.reduce((sum, ligne) => sum + ligne.debit, 0);
        const totalCreditBalance = balanceData.reduce((sum, ligne) => sum + ligne.credit, 0);

        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-slate-900 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest">BALANCE GÉNÉRALE</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">État exhaustif des comptes • {selectedPeriode}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-slate-700">Audit Ready</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Compte</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Libellé</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Débit</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Crédit</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Solde Net</th>
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
                          <span className="text-[9px] font-black text-slate-400 uppercase">{ligne.solde >= 0 ? 'Débiteur' : 'Créditeur'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900">
                  <tr>
                    <td colSpan={2} className="px-6 py-5 text-right">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">TOTAUX GÉNÉRAUX DE BALANCE :</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-lg font-black text-white">{formatCurrency(totalDebitBalance)}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-lg font-black text-white">{formatCurrency(totalCreditBalance)}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${totalDebitBalance === totalCreditBalance ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-black text-white uppercase tracking-widest">
                          {totalDebitBalance === totalCreditBalance ? 'Balance Équilibrée' : 'Déséquilibre Détecté'}
                        </span>
                      </div>
                    </td>
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
            nom: 'Banque Standard Chartered',
            ecritures: [
              { date: '2026-04-01', libelle: 'Solde à nouveau', debit: 450000, credit: 0, solde: 450000 },
              { date: '2026-04-05', libelle: 'Vente Facture F2026-001', debit: 125000, credit: 0, solde: 575000 },
              { date: '2026-04-10', libelle: 'Paiement Fournisseur Sarl ABC', debit: 0, credit: 85000, solde: 490000 },
              { date: '2026-04-15', libelle: 'Virement salaire Avril', debit: 0, credit: 150000, solde: 340000 }
            ]
          },
          {
            compte: '411',
            nom: 'Clients Collectifs',
            ecritures: [
              { date: '2026-04-01', libelle: 'Solde à nouveau', debit: 1250000, credit: 0, solde: 1250000 },
              { date: '2026-04-05', libelle: 'Facture F2026-001 - Client XYZ', debit: 85000, credit: 0, solde: 1335000 },
              { date: '2026-04-20', libelle: 'Règlement Facture F2026-001', debit: 0, credit: 85000, solde: 1250000 }
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
                      Cpt {compte.compte}
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">{compte.nom}</h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solde Final de Période</span>
                    <span className="text-lg font-black text-white">
                      {formatCurrency(compte.ecritures[compte.ecritures.length - 1].solde)}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Libellé</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Débit</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Crédit</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Solde</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {compte.ecritures.map((ecriture, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                            {new Date(ecriture.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-900">{ecriture.libelle}</td>
                          <td className="px-6 py-3 text-right text-sm font-medium text-slate-900">
                            {ecriture.debit > 0 ? formatCurrency(ecriture.debit) : '-'}
                          </td>
                          <td className="px-6 py-3 text-right text-sm font-medium text-slate-900">
                            {ecriture.credit > 0 ? formatCurrency(ecriture.credit) : '-'}
                          </td>
                          <td className={`px-6 py-3 text-right text-sm font-bold ${ecriture.solde >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(ecriture.solde))} {ecriture.solde < 0 ? 'C' : 'D'}
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
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <CalculatorIcon className="h-6 w-6 text-slate-600 mr-2" />
          Ratios Financiers Clés
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ratio de liquidité */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Liquidité Générale</p>
              <BanknotesIcon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">
              {(bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / bilan.passif.dettes.reduce((s, i) => s + i.montant, 0)).toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400 mb-4 font-mono">Actif circulant / Dettes CT</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full"
                style={{ width: `${Math.min((bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / bilan.passif.dettes.reduce((s, i) => s + i.montant, 0)) * 50, 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <CheckCircleIcon className="h-3 w-3 mr-1 text-emerald-500" />
              Solvabilité correcte
            </div>
          </div>

          {/* Ratio d'endettement */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Autonomie Financière</p>
              <ScaleIcon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">
              {((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0)) * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 mb-4 font-mono">Dettes / Capitaux propres</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full"
                style={{ width: `${Math.min(((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0)) * 100) / 2, 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <InformationCircleIcon className="h-3 w-3 mr-1" />
              Endettement à surveiller
            </div>
          </div>

          {/* Rentabilité nette */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Marge Nette</p>
              <ChartBarIcon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">
              {((resultat / totalProduits) * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 mb-4 font-mono">Résultat net / CA total</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full"
                style={{ width: `${((resultat / totalProduits) * 100) * 5}%` }}
              ></div>
            </div>
            <div className="flex items-center mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Performance solide
            </div>
          </div>

          {/* Marge brute */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Valeur Ajoutée</p>
              <ArrowTrendingUpIcon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">
              {(((totalProduits - compteResultat.charges.find(c => c.compte === '60')!.montant) / totalProduits) * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 mb-4 font-mono">Marge brute / CA</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full"
                style={{ width: `${(((totalProduits - compteResultat.charges.find(c => c.compte === '60')!.montant) / totalProduits) * 100) * 2}%` }}
              ></div>
            </div>
            <div className="flex items-center mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Liquidité correcte
            </div>
          </div>
        </div>

        {/* Ratios supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* ROE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ROE (Return on Equity)</p>
                <p className="text-xs font-bold text-slate-700">Rentabilité des capitaux propres</p>
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-3xl font-black text-slate-900">
              {((RESULTAT_NET / bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0)) * 100).toFixed(1)}%
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">Résultat Net</span>
                <span className="font-bold text-slate-700">{formatCurrency(RESULTAT_NET)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">Capitaux propres</span>
                <span className="font-bold text-slate-700">{formatCurrency(bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0))}</span>
              </div>
            </div>
          </div>

          {/* ROA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ROA (Return on Assets)</p>
                <p className="text-xs font-bold text-slate-700">Rentabilité de l'actif total</p>
              </div>
              <ChartBarIcon className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-3xl font-black text-slate-900">
              {((RESULTAT_NET / totalActif) * 100).toFixed(1)}%
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">Résultat Net</span>
                <span className="font-bold text-slate-700">{formatCurrency(RESULTAT_NET)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">Total Actif</span>
                <span className="font-bold text-slate-700">{formatCurrency(totalActif)}</span>
              </div>
            </div>
          </div>

          {/* Fonds de roulement */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fonds de Roulement</p>
                <p className="text-xs font-bold text-slate-700">Capacité de financement CT</p>
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
                <span className="text-slate-400 uppercase tracking-tight">Ressources stables</span>
                <span className="font-bold text-slate-700">{formatCurrency(bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0) + 1500000)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-tight">Emplois stables</span>
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
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Évolution des Postes Clés</h3>
            <span className="text-[10px] font-bold text-slate-400">Comparaison N / N-1</span>
          </div>
          <div className="p-6 space-y-4">
            {[
              { poste: 'Chiffre d\'affaires', actuel: CA_ACTUEL, precedent: CA_ANTERIEUR, color: 'emerald' },
              { poste: 'Charges d\'exploitation', actuel: 4200000, precedent: 4100000, color: 'red' },
              { poste: 'Résultat net', actuel: RESULTAT_NET, precedent: 725000, color: 'cyan' },
              { poste: 'Trésorerie', actuel: 575000, precedent: 450000, color: 'amber' }
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
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Exercice N-1</span>
                      <span className="text-sm font-bold text-slate-500">{formatCurrency(item.precedent)}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] font-bold text-slate-900 uppercase">Exercice N</span>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(item.actuel)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphique de structure */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-900 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Structure du Bilan</h3>
            <span className="text-[10px] font-bold text-slate-400">Poids des Postes</span>
          </div>
          <div className="p-8 space-y-8">
            {/* Actif */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">RÉPARTITION DE L'ACTIF</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Actif Immobilisé</span>
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
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Actif Circulant</span>
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
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">STRUCTURE DU PASSIF</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Capitaux Propres</span>
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
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Dettes</span>
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

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95 group">
          <DocumentArrowDownIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-900 mr-2" />
          <span className="text-sm font-bold text-slate-700">Exporter PDF</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95 group">
          <DocumentArrowDownIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-900 mr-2" />
          <span className="text-sm font-bold text-slate-700">Exporter Excel</span>
        </button>
        <button
          onClick={handleImprimerEtatsOfficiels}
          className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95 group"
        >
          <PrinterIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-900 mr-2" />
          <span className="text-sm font-bold text-slate-700">Imprimer</span>
        </button>
        <button
          onClick={() => setIsAnalyseGraphiqueModalOpen(true)}
          className="flex items-center justify-center p-4 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-lg active:scale-95 group"
        >
          <ChartBarIcon className="h-5 w-5 text-slate-400 group-hover:text-white mr-2" />
          <span className="text-sm font-bold">Analyse Graphique</span>
        </button>
      </div>

      {/* Modal Analyse Graphique */}
      <Modal
        isOpen={isAnalyseGraphiqueModalOpen}
        onClose={() => setIsAnalyseGraphiqueModalOpen(false)}
        title="Analyse Graphique des États Comptables"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
            <p className="text-sm text-slate-600 leading-relaxed">
              📊 Visualisez vos états comptables sous forme de graphiques interactifs pour une meilleure compréhension de vos données financières.
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
              <h3 className="font-black text-slate-900 uppercase tracking-widest mb-2 text-xs">Graphiques Interactifs</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Accédez aux graphiques interactifs du dashboard pour analyser vos données financières.
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
              <h3 className="font-black text-slate-900 uppercase tracking-widest mb-2 text-xs">Rapports & Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consultez les rapports détaillés avec analyses graphiques et statistiques.
              </p>
            </button>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            <h4 className="text-[10px] font-black text-slate-900 mb-6 uppercase tracking-[0.2em] flex items-center">
              <span className="w-8 h-[1px] bg-slate-300 mr-3"></span>
              Indicateurs & Métriques Disponibles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 relative z-10">
              {[
                'Évolution du bilan (Actif / Passif)',
                'Performance du résultat net',
                'Flux de trésorerie opérationnels',
                'Ratios de liquidité & solvabilité',
                'Analyses comparatives N / N-1',
                'Suivi du besoin en fonds de roulement'
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
        title="Imprimer États Officiels"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-600 leading-relaxed">
              Sélectionnez l'état comptable que vous souhaitez imprimer. Le document sera généré au format officiel conforme aux normes comptables algériennes.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              État à imprimer <span className="text-red-500">*</span>
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
              Période
            </label>
            <input title="Sélectionner un mois" placeholder="mm/yyyy"
              type="month"
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
            />
          </div>

          <div className="bg-slate-50 border-l-4 border-slate-900 rounded-xl p-6 shadow-sm">
            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mb-1">Attention</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Assurez-vous que votre navigateur autorise les pop-ups pour l'impression. Le document sera ouvert dans une nouvelle fenêtre.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsImprimerModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmImprimer}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Imprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EtatsRapports;


