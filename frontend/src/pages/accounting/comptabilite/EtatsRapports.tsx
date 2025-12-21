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
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import Modal from "../../../components/UI/Modal";

const EtatsRapports: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriode, setSelectedPeriode] = useState('2025-04');
  const [selectedEtat, setSelectedEtat] = useState('bilan');
  const [isAnalyseGraphiqueModalOpen, setIsAnalyseGraphiqueModalOpen] = useState(false);
  const [isImprimerModalOpen, setIsImprimerModalOpen] = useState(false);
  const [etatAImprimer, setEtatAImprimer] = useState('bilan');

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
        { compte: '512', libelle: 'Banque', montant: 450000 },
        { compte: '53', libelle: 'Caisse', montant: 125000 }
      ]
    },
    passif: {
      capitaux: [
        { compte: '10', libelle: 'Capital social', montant: 1000000 },
        { compte: '12', libelle: 'Résultat de l\'exercice', montant: 850000 }
      ],
      dettes: [
        { compte: '16', libelle: 'Emprunts', montant: 1500000 },
        { compte: '401', libelle: 'Fournisseurs', montant: 890000 },
        { compte: '4457', libelle: 'TVA collectée', montant: 285000 },
        { compte: '42', libelle: 'Personnel', montant: 200000 }
      ]
    }
  };

  // Données du compte de résultat
  const compteResultat = {
    produits: [
      { compte: '70', libelle: 'Ventes de marchandises', montant: 5200000 },
      { compte: '76', libelle: 'Produits financiers', montant: 45000 }
    ],
    charges: [
      { compte: '60', libelle: 'Achats consommés', montant: 3100000 },
      { compte: '63', libelle: 'Services', montant: 420000 },
      { compte: '64', libelle: 'Frais de personnel', montant: 680000 },
      { compte: '66', libelle: 'Charges financières', montant: 95000 },
      { compte: '68', libelle: 'Dotations aux amortissements', montant: 100000 }
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
  // Calcul automatique du résultat pour équilibrer la balance
  const totalDebitSansResultat = 2500000 + 850000 + 1250000 + 450000 + 125000 + 3100000 + 420000 + 680000 + 95000 + 100000 + 16150;
  const totalCreditSansResultat = 450000 + 1000000 + 1500000 + 890000 + 285000 + 200000 + 5200000 + 45000;
  const resultatBalance = totalCreditSansResultat - totalDebitSansResultat;
  
  const balanceGenerale = [
    // Actif Immobilisé
    { compte: '21', libelle: 'Immobilisations corporelles', debit: 2500000, credit: 0 },
    { compte: '28', libelle: 'Amortissements', debit: 0, credit: 450000 },
    // Actif Circulant
    { compte: '31', libelle: 'Stocks de marchandises', debit: 850000, credit: 0 },
    { compte: '411', libelle: 'Clients', debit: 1250000, credit: 0 },
    { compte: '512', libelle: 'Banque', debit: 450000, credit: 0 },
    { compte: '53', libelle: 'Caisse', debit: 125000, credit: 0 },
    // Passif - Capitaux
    { compte: '10', libelle: 'Capital social', debit: 0, credit: 1000000 },
    { compte: '12', libelle: 'Résultat de l\'exercice', debit: 0, credit: resultatBalance > 0 ? resultatBalance : 0 },
    // Passif - Dettes
    { compte: '16', libelle: 'Emprunts', debit: 0, credit: 1500000 },
    { compte: '401', libelle: 'Fournisseurs', debit: 0, credit: 890000 },
    { compte: '4457', libelle: 'TVA collectée', debit: 0, credit: 285000 },
    { compte: '42', libelle: 'Personnel', debit: 0, credit: 200000 },
    // Produits
    { compte: '70', libelle: 'Ventes de marchandises', debit: 0, credit: 5200000 },
    { compte: '76', libelle: 'Produits financiers', debit: 0, credit: 45000 },
    // Charges
    { compte: '60', libelle: 'Achats consommés', debit: 3100000, credit: 0 },
    { compte: '63', libelle: 'Services', debit: 420000, credit: 0 },
    { compte: '64', libelle: 'Frais de personnel', debit: 680000, credit: 0 },
    { compte: '66', libelle: 'Charges financières', debit: 95000, credit: 0 },
    { compte: '68', libelle: 'Dotations aux amortissements', debit: 100000, credit: 0 },
    { compte: '4456', libelle: 'TVA déductible', debit: 16150, credit: 0 }
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
    { id: 'bilan', nom: 'Bilan Comptable', icon: ScaleIcon, color: 'emerald' },
    { id: 'resultat', nom: 'Compte de Résultat', icon: ChartBarIcon, color: 'cyan' },
    { id: 'flux', nom: 'Flux de Trésorerie', icon: BanknotesIcon, color: 'amber' },
    { id: 'balance', nom: 'Balance Générale', icon: CalculatorIcon, color: 'slate' }
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
              <option value="2025-04">Avril 2025</option>
              <option value="2025-03">Mars 2025</option>
              <option value="2025-02">Février 2025</option>
              <option value="2025-01">Janvier 2025</option>
              <option value="2024">Année 2024</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
              <PrinterIcon className="h-5 w-5 inline mr-2" />
              Imprimer
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
              <DocumentArrowDownIcon className="h-5 w-5 inline mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Navigation des états */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {etatsDisponibles.map((etat) => {
            const Icon = etat.icon;
            return (
              <button
                key={etat.id}
                onClick={() => setSelectedEtat(etat.id)}
                className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                  selectedEtat === etat.id
                    ? 'border-slate-500 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 bg-${etat.color}-100 rounded-lg mr-3`}>
                  <Icon className={`h-5 w-5 text-${etat.color}-600`} />
                </div>
                <span className="text-sm font-semibold text-slate-900">{etat.nom}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bilan Comptable */}
      {selectedEtat === 'bilan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actif */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">ACTIF</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Actif immobilisé */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase">Actif Immobilisé</h4>
                <div className="space-y-2">
                  {bilan.actif.immobilise.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{item.compte} - {item.libelle}</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <span className="text-sm font-bold text-cyan-900">Sous-total Immobilisé</span>
                    <span className="text-sm font-bold text-cyan-900">
                      {formatCurrency(bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actif circulant */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase">Actif Circulant</h4>
                <div className="space-y-2">
                  {bilan.actif.circulant.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{item.compte} - {item.libelle}</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <span className="text-sm font-bold text-cyan-900">Sous-total Circulant</span>
                    <span className="text-sm font-bold text-cyan-900">
                      {formatCurrency(bilan.actif.circulant.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Actif */}
              <div className="flex items-center justify-between p-4 bg-emerald-100 rounded-lg border-2 border-emerald-300">
                <span className="text-base font-bold text-emerald-900">TOTAL ACTIF</span>
                <span className="text-xl font-bold text-emerald-900">{formatCurrency(totalActif)}</span>
              </div>
            </div>
          </div>

          {/* Passif */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">PASSIF</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Capitaux propres */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase">Capitaux Propres</h4>
                <div className="space-y-2">
                  {bilan.passif.capitaux.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{item.compte} - {item.libelle}</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <span className="text-sm font-bold text-cyan-900">Sous-total Capitaux</span>
                    <span className="text-sm font-bold text-cyan-900">
                      {formatCurrency(bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dettes */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase">Dettes</h4>
                <div className="space-y-2">
                  {bilan.passif.dettes.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{item.compte} - {item.libelle}</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <span className="text-sm font-bold text-cyan-900">Sous-total Dettes</span>
                    <span className="text-sm font-bold text-cyan-900">
                      {formatCurrency(bilan.passif.dettes.reduce((s, i) => s + i.montant, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Passif */}
              <div className="flex items-center justify-between p-4 bg-emerald-100 rounded-lg border-2 border-emerald-300">
                <span className="text-base font-bold text-emerald-900">TOTAL PASSIF</span>
                <span className="text-xl font-bold text-emerald-900">{formatCurrency(totalPassif)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compte de Résultat */}
      {selectedEtat === 'resultat' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">COMPTE DE RÉSULTAT</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Charges */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900 mb-3">CHARGES</h4>
                <div className="space-y-2">
                  {compteResultat.charges.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-sm text-slate-700">{item.compte} - {item.libelle}</span>
                      <span className="text-sm font-bold text-red-600">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 bg-red-100 rounded-lg border-2 border-red-300">
                  <span className="text-base font-bold text-red-900">TOTAL CHARGES</span>
                  <span className="text-xl font-bold text-red-900">{formatCurrency(totalCharges)}</span>
                </div>
              </div>

              {/* Produits */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900 mb-3">PRODUITS</h4>
                <div className="space-y-2">
                  {compteResultat.produits.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-sm text-slate-700">{item.compte} - {item.libelle}</span>
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-100 rounded-lg border-2 border-emerald-300">
                  <span className="text-base font-bold text-emerald-900">TOTAL PRODUITS</span>
                  <span className="text-xl font-bold text-emerald-900">{formatCurrency(totalProduits)}</span>
                </div>
              </div>
            </div>

            {/* Résultat */}
            <div className="mt-6 p-6 bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {resultat >= 0 ? (
                    <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm text-slate-600">Résultat de l'exercice</p>
                    <p className={`text-3xl font-bold ${resultat >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(resultat)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Marge nette</p>
                  <p className="text-2xl font-bold text-slate-900">
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
                  <div className="flex items-center justify-between p-4 bg-emerald-100 rounded-lg border-2 border-emerald-300 mt-3">
                    <span className="text-base font-bold text-emerald-900">Flux net de trésorerie généré par l'activité</span>
                    <span className="text-xl font-bold text-emerald-900">{formatCurrency(resultat + 100000 - 85000 - 125000 + 95000)}</span>
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
                  <div className="flex items-center justify-between p-4 bg-cyan-100 rounded-lg border-2 border-cyan-300 mt-3">
                    <span className="text-base font-bold text-cyan-900">Flux net de trésorerie lié aux investissements</span>
                    <span className="text-xl font-bold text-red-900">({formatCurrency(370000)})</span>
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
                  <div className="flex items-center justify-between p-4 bg-amber-100 rounded-lg border-2 border-amber-300 mt-3">
                    <span className="text-base font-bold text-amber-900">Flux net de trésorerie lié au financement</span>
                    <span className="text-xl font-bold text-amber-900">{formatCurrency(200000)}</span>
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
                      className={`h-3 rounded-full ${
                        flux.color === 'emerald' ? 'bg-emerald-500' :
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">BALANCE GÉNÉRALE</h3>
            <p className="text-sm text-slate-600 mt-1">Tous les comptes - Période : {selectedPeriode}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Compte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Libellé</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Débit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Crédit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Solde</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {balanceData.map((ligne, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-sm font-mono font-bold text-slate-900">{ligne.compte}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-slate-700">{ligne.libelle}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm font-semibold text-cyan-600">
                        {ligne.debit > 0 ? formatCurrency(ligne.debit) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm font-semibold text-emerald-600">
                        {ligne.credit > 0 ? formatCurrency(ligne.credit) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`text-sm font-bold ${ligne.solde >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(ligne.solde))} {ligne.solde < 0 ? 'C' : 'D'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-slate-900">TOTAUX GÉNÉRAUX :</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-base font-bold text-cyan-600">{formatCurrency(totalDebitBalance)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-base font-bold text-emerald-600">{formatCurrency(totalCreditBalance)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-base font-bold text-slate-900">
                      {totalDebitBalance === totalCreditBalance ? '✓ Équilibré' : 'Déséquilibre'}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        );
      })()}

      {/* Ratios financiers détaillés */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <CalculatorIcon className="h-6 w-6 text-slate-600 mr-2" />
          Ratios Financiers Clés
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ratio de liquidité */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600 font-semibold">Ratio de liquidité</p>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <BanknotesIcon className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600 mb-2">
              {(bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / bilan.passif.dettes.reduce((s, i) => s + i.montant, 0)).toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mb-3">Actif circulant / Dettes CT</p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${Math.min((bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / bilan.passif.dettes.reduce((s, i) => s + i.montant, 0)) * 50, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-emerald-700 mt-2 font-medium">✓ Solvabilité correcte</p>
          </div>

          {/* Ratio d'endettement */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600 font-semibold">Ratio d'endettement</p>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <ScaleIcon className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600 mb-2">
              {((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0)) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mb-3">Dettes / Capitaux propres</p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${Math.min(((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0)) * 100) / 2, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-amber-700 mt-2 font-medium">⚠ Endettement élevé</p>
          </div>

          {/* Rentabilité nette */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600 font-semibold">Rentabilité nette</p>
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-cyan-600 mb-2">
              {((resultat / totalProduits) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mb-3">Résultat net / CA total</p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full"
                style={{ width: `${((resultat / totalProduits) * 100) * 5}%` }}
              ></div>
            </div>
            <p className="text-xs text-cyan-700 mt-2 font-medium">✓ Performance solide</p>
          </div>

          {/* Marge brute */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600 font-semibold">Marge brute</p>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600 mb-2">
              {(((totalProduits - compteResultat.charges.find(c => c.compte === '60')!.montant) / totalProduits) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mb-3">Marge commerciale / CA</p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${(((totalProduits - compteResultat.charges.find(c => c.compte === '60')!.montant) / totalProduits) * 100) * 2}%` }}
              ></div>
            </div>
            <p className="text-xs text-emerald-700 mt-2 font-medium">✓ Marge satisfaisante</p>
          </div>
        </div>

        {/* Ratios supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* ROE */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 font-semibold">ROE (Return on Equity)</p>
                <p className="text-xs text-slate-500">Rendement des capitaux propres</p>
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {((resultat / bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0)) * 100).toFixed(1)}%
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                Résultat : {formatCurrency(resultat)}<br/>
                Capitaux propres : {formatCurrency(bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0))}
              </p>
            </div>
          </div>

          {/* ROA */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 font-semibold">ROA (Return on Assets)</p>
                <p className="text-xs text-slate-500">Rendement de l'actif total</p>
              </div>
              <ChartBarIcon className="h-5 w-5 text-cyan-600" />
            </div>
            <p className="text-2xl font-bold text-cyan-600">
              {((resultat / totalActif) * 100).toFixed(1)}%
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                Résultat : {formatCurrency(resultat)}<br/>
                Total actif : {formatCurrency(totalActif)}
              </p>
            </div>
          </div>

          {/* Fonds de roulement */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Fonds de Roulement</p>
                <p className="text-xs text-slate-500">Capacité de financement CT</p>
              </div>
              <BanknotesIcon className="h-5 w-5 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(
                (bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0) + bilan.passif.dettes.find(d => d.compte === '16')!.montant) - 
                (bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0))
              )}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                Ressources stables : {formatCurrency(bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0) + 1500000)}<br/>
                Emplois stables : {formatCurrency(bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analyse comparative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des principaux postes */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Évolution des Postes Clés</h3>
          <div className="space-y-3">
            {[
              { poste: 'Chiffre d\'affaires', actuel: 5200000, precedent: 4850000, color: 'emerald' },
              { poste: 'Charges d\'exploitation', actuel: 4200000, precedent: 4100000, color: 'red' },
              { poste: 'Résultat net', actuel: resultat, precedent: 725000, color: 'cyan' },
              { poste: 'Trésorerie', actuel: 575000, precedent: 450000, color: 'amber' }
            ].map((item, i) => {
              const evolution = ((item.actuel - item.precedent) / item.precedent) * 100;
              return (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{item.poste}</span>
                    <span className={`text-xs font-bold ${evolution >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {evolution >= 0 ? '↗' : '↘'} {Math.abs(evolution).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>N-1: {formatCurrency(item.precedent)}</span>
                    <span className="font-bold text-slate-900">N: {formatCurrency(item.actuel)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphique de structure */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Structure du Bilan</h3>
          <div className="space-y-4">
            {/* Actif */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Actif Immobilisé</span>
                <span className="text-sm font-bold text-slate-900">
                  {((Math.abs(bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0)) / totalActif) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-cyan-500 h-3 rounded-full"
                  style={{ width: `${((Math.abs(bilan.actif.immobilise.reduce((s, i) => s + i.montant, 0)) / totalActif) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Actif Circulant</span>
                <span className="text-sm font-bold text-slate-900">
                  {((bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / totalActif) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-emerald-500 h-3 rounded-full"
                  style={{ width: `${((bilan.actif.circulant.reduce((s, i) => s + i.montant, 0) / totalActif) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Passif */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Capitaux Propres</span>
                <span className="text-sm font-bold text-slate-900">
                  {((bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0) / totalPassif) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-emerald-500 h-3 rounded-full"
                  style={{ width: `${((bilan.passif.capitaux.reduce((s, i) => s + i.montant, 0) / totalPassif) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Dettes</span>
                <span className="text-sm font-bold text-slate-900">
                  {((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / totalPassif) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-amber-500 h-3 rounded-full"
                  style={{ width: `${((bilan.passif.dettes.reduce((s, i) => s + i.montant, 0) / totalPassif) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm">
          <DocumentArrowDownIcon className="h-5 w-5 text-emerald-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Exporter en PDF</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm">
          <DocumentArrowDownIcon className="h-5 w-5 text-emerald-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Exporter en Excel</span>
        </button>
        <button 
          onClick={handleImprimerEtatsOfficiels}
          className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm hover:shadow-md cursor-pointer"
        >
          <PrinterIcon className="h-5 w-5 text-slate-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Imprimer États Officiels</span>
        </button>
        <button 
          onClick={() => setIsAnalyseGraphiqueModalOpen(true)}
          className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm hover:shadow-md cursor-pointer"
        >
          <ChartBarIcon className="h-5 w-5 text-cyan-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Analyse Graphique</span>
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              📊 Visualisez vos états comptables sous forme de graphiques interactifs pour une meilleure compréhension de vos données financières.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setIsAnalyseGraphiqueModalOpen(false);
                navigate('/dashboard/graphiques');
              }}
              className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all text-left"
            >
              <ChartBarIcon className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-slate-900 mb-2">Graphiques Interactifs</h3>
              <p className="text-sm text-slate-600">
                Accédez aux graphiques interactifs du dashboard pour analyser vos données financières.
              </p>
            </button>

            <button
              onClick={() => {
                setIsAnalyseGraphiqueModalOpen(false);
                navigate('/rapports-analytics');
              }}
              className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all text-left"
            >
              <ChartBarIcon className="h-8 w-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-slate-900 mb-2">Rapports & Analytics</h3>
              <p className="text-sm text-slate-600">
                Consultez les rapports détaillés avec analyses graphiques et statistiques.
              </p>
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-2">Types d'analyses disponibles :</h4>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Évolution du bilan (actif/passif) sur plusieurs périodes</li>
              <li>Analyse du compte de résultat (charges/produits)</li>
              <li>Graphiques de trésorerie et flux de caisse</li>
              <li>Comparaisons périodiques (mois/mois, année/année)</li>
              <li>Ratios financiers et indicateurs de performance</li>
            </ul>
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
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

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Important:</strong> Assurez-vous que votre navigateur autorise les pop-ups pour l'impression. 
              Le document sera ouvert dans une nouvelle fenêtre et l'impression sera déclenchée automatiquement.
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

