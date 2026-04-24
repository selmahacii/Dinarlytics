/**
 * Coherent Mock Data for Dinarlytics ERP - Pure Interface Compliance
 */

export const MOCK_DATA = {
  // --- PROCUREMENT ---
  '/bons-commande': [
    {
      id: 'BC001',
      numero: 'BC-2024-001',
      fournisseur: 'Sonatrach DP',
      fournisseurScore: 4.8,
      demandeur: 'Ahmed Benali',
      department: 'Exploration',
      montantHT: 3781512,
      montantTTC: 4500000,
      dateCreation: '2024-09-01',
      dateLivraison: '2024-10-15',
      urgency: 'high',
      status: 'pending_approval',
      motif: 'Pièces de rechange forage complexe Hassi Messaoud',
      items: [
        { ref: 'PR-102', designation: 'Vanne Haute Pression', qty: 5, unitPrice: 756302, tva: 19 }
      ],
      approvals: [
        { role: 'Responsable Opé', status: 'approved', date: '2024-09-02', comment: 'Validé pour maintenance.' },
        { role: 'DAF', status: 'pending' },
        { role: 'DG', status: 'pending' }
      ]
    },
    {
      id: 'BC002',
      numero: 'BC-2024-002',
      fournisseur: 'Cévital Agro',
      fournisseurScore: 4.2,
      demandeur: 'Karim Taleb',
      department: 'Logistique',
      montantHT: 1050420,
      montantTTC: 1250000,
      dateCreation: '2024-09-05',
      dateLivraison: '2024-10-20',
      urgency: 'medium',
      status: 'approved',
      motif: 'Approvisionnement matières premières R2',
      items: [
        { ref: 'MAT-22', designation: 'Lot Huile Raffinée', qty: 100, unitPrice: 10504, tva: 19 }
      ],
      approvals: [
        { role: 'Chef Service', status: 'approved', date: '2024-09-06' },
        { role: 'DAF', status: 'approved', date: '2024-09-07' }
      ]
    }
  ],

  // --- CRM ---
  '/devis': [
    {
      id: 'QT-24-105',
      numero: 'QT-24-105',
      client: 'Condor Electronics',
      contact: 'M. Mansouri',
      montantHT: 850000,
      tva: 161500,
      totalTTC: 1011500,
      dateEmission: '2024-09-20',
      validite: '2024-10-20',
      statut: 'envoyé',
      probabilite: 80,
      items: [
        { ref: 'SRV-IT', designation: 'Audit Système Information', qte: 1, pu_ht: 850000, tva: 19 }
      ]
    }
  ],

  // --- ACCOUNTING ---
  '/amortissements': {
    assets: [
      {
        id: 'IMM001',
        code: 'VEH-001',
        designation: 'Véhicule Utilitaire Renault Master',
        categorie: 'Véhicules',
        dateAcquisition: '2021-03-15',
        dureeVie: 5,
        valeurAcquisition: 3500000,
        methode: 'lineaire',
        tauxAmort: 20,
        valeurResiduelle: 350000,
        departement: 'Logistique',
        fournisseur: 'Auto Pro Algérie',
        status: 'active',
        comptePCA: '2340',
        compteIFRS: 'IAS16'
      },
      {
        id: 'IMM002',
        code: 'INF-001',
        designation: 'Serveur Dell PowerEdge R750',
        categorie: 'Matériel Informatique',
        dateAcquisition: '2022-01-10',
        dureeVie: 5,
        valeurAcquisition: 850000,
        methode: 'degressif',
        tauxAmort: 40,
        valeurResiduelle: 85000,
        departement: 'IT',
        fournisseur: 'Tech Solutions SARL',
        status: 'active',
        comptePCA: '2340',
        compteIFRS: 'IAS16'
      }
    ],
    summary: {
      totalBrut: 4350000,
      totalNet: 3200000,
      amortCumule: 1150000,
      dotationAnnuelle: 850000
    }
  },

  // --- RELANCES ---
  '/relances-clients': [
    {
      id: 'R001',
      factureNum: 'FAC-2023-098',
      client: 'Sonatrach EP',
      clientEmail: 'comptabilite@sonatrach.dz',
      clientPhone: '021-XX-XX-XX',
      montant: 850000,
      dateFact: '2023-11-15',
      dateEcheance: '2023-12-15',
      daysOverdue: 47,
      level: 2,
      status: 'sent',
      lastContact: '2024-01-10',
      commercial: 'Karim Benali',
      notes: 'En attente de visa DG pour paiement'
    },
    {
      id: 'R002',
      factureNum: 'FAC-2023-112',
      client: 'Cévital Agro',
      clientEmail: 'procurement@cevital.com',
      clientPhone: '034-YY-YY-YY',
      montant: 3450000,
      dateFact: '2023-12-01',
      dateEcheance: '2023-12-31',
      daysOverdue: 31,
      level: 1,
      status: 'pending',
      lastContact: null,
      commercial: 'Ahmed Tounsi',
      notes: 'Promesse de virement fin de mois'
    }
  ],

  // --- DASHBOARD ---
  '/dashboard/metrics': {
    revenue: 124500000,
    expenses: 85000000,
    profitMargin: 31.7,
    clientsCount: 156,
    suppliersCount: 42,
    invoicesCount: 890,
    invoicesDue: 24,
    totalReceivables: 45600000,
    totalPayables: 12300000,
    cashBalance: 89000000,
    stockTurnover: 4.5,
    averageInvoice: 140000
  },

  // --- OTHERS ---
  '/articles': [
    { id: 1, code: 'ART-001', designation: 'Câble Industrial 5G', stock_actuel: 450, stock_minimum: 100, prix_unitaire: 1200, categorie: 'Câblage' },
    { id: 2, code: 'ART-002', designation: 'Connecteur RJ45 Cat6', stock_actuel: 2500, stock_minimum: 500, prix_unitaire: 45, categorie: 'Accessoires' }
  ],

  // --- HR ---
  '/rh/employees': [
    { id: 'EMP001', matricule: 'MAT-001', nom: 'Benali', prenom: 'Karim', poste: 'Directeur Général', department: 'direction', contractType: 'cdi', dateEmbauche: '2018-03-01', salaireBase: 280000, primes: 45000, email: 'k.benali@dinarlytics.dz', telephone: '0550 12 34 56', status: 'actif' },
    { id: 'EMP002', matricule: 'MAT-002', nom: 'Hadj', prenom: 'Amira', poste: 'DAF', department: 'finance', contractType: 'cdi', dateEmbauche: '2019-06-15', salaireBase: 220000, primes: 35000, email: 'a.hadj@dinarlytics.dz', telephone: '0661 23 45 67', status: 'actif' },
    { id: 'EMP005', matricule: 'MAT-005', nom: 'Khelif', prenom: 'Djamel', poste: 'Développeur Senior', department: 'it', contractType: 'cdi', dateEmbauche: '2021-03-15', salaireBase: 155000, primes: 15000, email: 'd.khelif@dinarlytics.dz', telephone: '0661 56 78 90', status: 'actif' }
  ],

  // --- SUPPLIERS ---
  '/suppliers': [
    { id: 'f-001', name: 'Global Logistics Algerie', nif: '000116109000101', rc: '16/00-123456B16', ai: '16123456789', email: 'contact@global-log.dz', phone: '023 45 67 89', address: 'Zone Industrielle, Oued Smar', score: 92, status: 'actif' },
    { id: 'f-002', name: 'Industrie Plastique Nord', nif: '000216109000202', rc: '16/00-789012B16', ai: '16223344556', email: 'sales@ip-nord.dz', phone: '024 12 34 56', address: 'Z.I Rouiba, Alger', score: 85, status: 'actif' },
    { id: 'f-003', name: 'TechSolutions SARL', nif: '000316109000303', rc: '16/00-112233B16', ai: '16334455667', email: 'info@tech-sol.dz', phone: '021 98 76 54', address: 'Sidi Abdellah, Alger', score: 78, status: 'actif' }
  ]
};
