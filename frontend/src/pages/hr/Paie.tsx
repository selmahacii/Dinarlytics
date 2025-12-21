import React, { useState, useMemo, useEffect } from 'react';
import {
  UserGroupIcon,
  DocumentTextIcon,
  CalculatorIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import { useApp } from '../../context/AppContext';
import { usePermission } from '../../hooks/usePermission';
import { useTranslation } from '../../hooks/useTranslation';
import type { Employee, BulletinPaie, DeclarationSociale, ParametresPaie, CalculPaieResult } from '../../types';

const Paie: React.FC = () => {
  const { formatCurrency, user, companyData } = useApp();
  const { t } = useTranslation();
  const { has } = usePermission();
  
  // États principaux
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'bulletins' | 'declarations' | 'parametres'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // États pour les modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isBulletinModalOpen, setIsBulletinModalOpen] = useState(false);
  const [isCalculModalOpen, setIsCalculModalOpen] = useState(false);
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [isParametresModalOpen, setIsParametresModalOpen] = useState(false);
  const [isViewBulletinModalOpen, setIsViewBulletinModalOpen] = useState(false);
  
  // États pour les données
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinPaie | null>(null);
  const [calculResult, setCalculResult] = useState<CalculPaieResult | null>(null);
  
  // Données mockées - À remplacer par des appels API
  const [employees] = useState<Employee[]>([
    {
      id: 'emp-001',
      matricule: 'EMP001',
      nom: 'Benali',
      prenom: 'Karim',
      dateNaissance: '1985-05-15',
      lieuNaissance: 'Alger',
      adresse: '123 Rue Didouche Mourad, Alger',
      telephone: '+213 555 123 456',
      email: 'karim.benali@example.dz',
      dateEmbauche: '2020-01-15',
      poste: 'Développeur Senior',
      departement: 'IT',
      typeContrat: 'cdi',
      statut: 'actif',
      salaireBase: 120000,
      devise: 'DZD',
      nif: '123456789012345',
      numeroSecuriteSociale: 'SS123456',
      numeroCNAS: 'CNAS001',
      banque: 'BNA',
      rib: 'DZ86 0070 0000 0000 0000 0001',
      nombreEnfants: 2,
      situationFamiliale: 'marié'
    },
    {
      id: 'emp-002',
      matricule: 'EMP002',
      nom: 'Messaoudi',
      prenom: 'Sonia',
      dateNaissance: '1990-08-20',
      lieuNaissance: 'Oran',
      adresse: '456 Avenue de la Révolution, Oran',
      telephone: '+213 555 789 012',
      email: 'sonia.messaoudi@example.dz',
      dateEmbauche: '2021-03-01',
      poste: 'Comptable',
      departement: 'Comptabilité',
      typeContrat: 'cdi',
      statut: 'actif',
      salaireBase: 85000,
      devise: 'DZD',
      nif: '987654321098765',
      numeroSecuriteSociale: 'SS789012',
      numeroCNAS: 'CNAS002',
      banque: 'ABC',
      rib: 'DZ86 0060 0000 0000 0000 0002',
      nombreEnfants: 0,
      situationFamiliale: 'célibataire'
    },
    {
      id: 'emp-003',
      matricule: 'EMP003',
      nom: 'Hamza',
      prenom: 'Amir',
      dateNaissance: '1992-11-10',
      lieuNaissance: 'Constantine',
      adresse: '789 Boulevard Zighout Youcef, Constantine',
      telephone: '+213 555 345 678',
      email: 'amir.hamza@example.dz',
      dateEmbauche: '2022-06-15',
      poste: 'Commercial',
      departement: 'Ventes',
      typeContrat: 'cdi',
      statut: 'actif',
      salaireBase: 70000,
      devise: 'DZD',
      nif: '456789012345678',
      numeroSecuriteSociale: 'SS345678',
      numeroCNAS: 'CNAS003',
      banque: 'BADR',
      rib: 'DZ86 0080 0000 0000 0000 0003',
      nombreEnfants: 1,
      situationFamiliale: 'marié'
    }
  ]);
  
  const [bulletins] = useState<BulletinPaie[]>([
    {
      id: 'bul-001',
      numero: 'BUL-2025-01-001',
      employeeId: 'emp-001',
      employee: employees[0],
      periode: '2025-01',
      datePaiement: '2025-02-05',
      dateGeneration: '2025-02-01',
      statut: 'payé',
      joursTravailles: 22,
      joursAbsents: 0,
      heuresNormales: 176,
      heuresSupplementaires: 8,
      salaireBase: 120000,
      primes: 10000,
      montantHeuresSupplementaires: 12000,
      avantagesEnNature: 0,
      autresGains: 0,
      totalBrut: 142000,
      cotisationsSociales: {
        cnas: { libelle: 'CNAS', base: 142000, taux: 1.5, montant: 2130 },
        cnss: { libelle: 'CNSS', base: 142000, taux: 0.5, montant: 710 },
        assurance_chomage: { libelle: 'Assurance Chômage', base: 142000, taux: 0.5, montant: 710 }
      },
      totalCotisationsSalariales: 3550,
      cotisationsPatronales: {
        cnas: { libelle: 'CNAS Patronale', base: 142000, taux: 12.5, montant: 17750 },
        cnss: { libelle: 'CNSS Patronale', base: 142000, taux: 9.5, montant: 13490 },
        assurance_chomage: { libelle: 'Assurance Chômage Patronale', base: 142000, taux: 1.5, montant: 2130 }
      },
      totalCotisationsPatronales: 33370,
      irg: 8500,
      autresImpot: 0,
      totalImpot: 8500,
      retenuesDiverses: 0,
      netAPayer: 129950,
      elementsPaie: [],
      soldeConge: 25,
      soldeCongePris: 5
    }
  ]);
  
  const [declarations] = useState<DeclarationSociale[]>([
    {
      id: 'dec-001',
      type: 'cnas',
      periode: '2025-01',
      dateDeclaration: '2025-02-10',
      statut: 'transmis',
      nombreSalaries: 3,
      masseSalariale: 275000,
      cotisationsSalariales: 8250,
      cotisationsPatronales: 68750,
      totalCotisations: 77000,
      montantVerse: 77000,
      dateVersement: '2025-02-15',
      numeroQuittance: 'QUIT-2025-001',
      details: []
    }
  ]);
  
  const [parametres] = useState<ParametresPaie>({
    id: 'param-001',
    nom: 'Paramètres Paie Standard',
    periodePaie: 'mensuel',
    jourPaiement: 5,
    tauxCNAS: 1.5,
    tauxCNSS: 0.5,
    tauxAssuranceChomage: 0.5,
    plafondCNAS: 200000,
    plafondCNSS: 200000,
    baremeIRG: [
      { tranche: '0-30,000', taux: 0, montantMin: 0, montantMax: 30000 },
      { tranche: '30,001-120,000', taux: 20, montantMin: 30001, montantMax: 120000 },
      { tranche: '120,001-240,000', taux: 30, montantMin: 120001, montantMax: 240000 },
      { tranche: '240,001+', taux: 35, montantMin: 240001, montantMax: Infinity }
    ],
    tauxHeuresSupplementaires: 1.5,
    tauxJoursFeries: 2,
    devise: 'DZD',
    dateDebutExercice: '2025-01-01',
    dateFinExercice: '2025-12-31'
  });
  
  // Calculs des KPIs
  const kpis = useMemo(() => {
    const totalSalaries = employees.filter(e => e.statut === 'actif').length;
    const masseSalariale = employees
      .filter(e => e.statut === 'actif')
      .reduce((sum, e) => sum + e.salaireBase, 0);
    const bulletinsPeriode = bulletins.filter(b => b.periode === selectedPeriod);
    const totalNetAPayer = bulletinsPeriode.reduce((sum, b) => sum + b.netAPayer, 0);
    const totalCotisations = bulletinsPeriode.reduce((sum, b) => sum + b.totalCotisationsSalariales + b.totalCotisationsPatronales, 0);
    
    return {
      totalSalaries,
      masseSalariale,
      totalNetAPayer,
      totalCotisations,
      moyenneSalaire: totalSalaries > 0 ? masseSalariale / totalSalaries : 0
    };
  }, [employees, bulletins, selectedPeriod]);
  
  // Fonctions de gestion
  const handleCalculerPaie = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsCalculModalOpen(true);
    // Simulation du calcul
    const result: CalculPaieResult = {
      employeeId: employee.id,
      periode: selectedPeriod,
      salaireBrut: employee.salaireBase,
      cotisationsSalariales: employee.salaireBase * 0.025, // 2.5%
      cotisationsPatronales: employee.salaireBase * 0.235, // 23.5%
      irg: calculateIRG(employee.salaireBase),
      netAPayer: 0,
      details: []
    };
    result.netAPayer = result.salaireBrut - result.cotisationsSalariales - result.irg;
    setCalculResult(result);
  };
  
  const calculateIRG = (salaireBrut: number): number => {
    const bareme = parametres.baremeIRG;
    let irg = 0;
    let reste = salaireBrut;
    
    for (let i = bareme.length - 1; i >= 0; i--) {
      const tranche = bareme[i];
      if (reste > tranche.montantMin) {
        const imposable = Math.min(reste, tranche.montantMax) - tranche.montantMin;
        irg += (imposable * tranche.taux) / 100;
        reste = tranche.montantMin;
      }
    }
    
    return Math.round(irg);
  };
  
  const handleGenererBulletin = (employee: Employee) => {
    // Génération du bulletin
    const nouveauBulletin: BulletinPaie = {
      id: `bul-${Date.now()}`,
      numero: `BUL-${selectedPeriod}-${employee.matricule}`,
      employeeId: employee.id,
      employee: employee,
      periode: selectedPeriod,
      datePaiement: new Date().toISOString().split('T')[0],
      dateGeneration: new Date().toISOString().split('T')[0],
      statut: 'brouillon',
      joursTravailles: 22,
      joursAbsents: 0,
      heuresNormales: 176,
      heuresSupplementaires: 0,
      salaireBase: employee.salaireBase,
      primes: 0,
      montantHeuresSupplementaires: 0,
      avantagesEnNature: 0,
      autresGains: 0,
      totalBrut: employee.salaireBase,
      cotisationsSociales: {
        cnas: { libelle: 'CNAS', base: employee.salaireBase, taux: 1.5, montant: employee.salaireBase * 0.015 },
        cnss: { libelle: 'CNSS', base: employee.salaireBase, taux: 0.5, montant: employee.salaireBase * 0.005 },
        assurance_chomage: { libelle: 'Assurance Chômage', base: employee.salaireBase, taux: 0.5, montant: employee.salaireBase * 0.005 }
      },
      totalCotisationsSalariales: employee.salaireBase * 0.025,
      cotisationsPatronales: {},
      totalCotisationsPatronales: employee.salaireBase * 0.235,
      irg: calculateIRG(employee.salaireBase),
      autresImpot: 0,
      totalImpot: calculateIRG(employee.salaireBase),
      retenuesDiverses: 0,
      netAPayer: employee.salaireBase - (employee.salaireBase * 0.025) - calculateIRG(employee.salaireBase),
      elementsPaie: [],
      soldeConge: 25,
      soldeCongePris: 0
    };
    
    setSelectedBulletin(nouveauBulletin);
    setIsBulletinModalOpen(true);
  };
  
  // Interface adaptative selon le segment
  if (user && user.segment === 'micro' && user.companyType === 'eurl') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gestion de la Paie</h1>
                <p className="text-slate-300 text-lg mt-1">Module réservé aux entreprises SARL et SPA</p>
              </div>
            </div>
          </div>
        </div>
        
        <Card>
          <div className="p-6 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Module Paie Non Disponible</h2>
            <p className="text-gray-600 mb-4">
              Le module de gestion de la paie est disponible pour les entreprises SARL et SPA uniquement.
            </p>
            <p className="text-sm text-gray-500">
              Pour les micro-entreprises (EURL), la gestion de la paie peut être effectuée manuellement ou via un module externe.
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <UserGroupIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestion de la Paie</h1>
              <p className="text-blue-100">Bulletins de paie, déclarations sociales et gestion des employés</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Période</p>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="mt-1 px-3 py-2 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white font-semibold"
              aria-label="Sélectionner la période"
              placeholder="Sélectionner la période"
              title="Sélectionner la période"
            />
          </div>
        </div>
      </div>
      
      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card title="Total Salariés">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{kpis.totalSalaries}</div>
            <div className="text-sm text-gray-600">Employés actifs</div>
          </div>
        </Card>
        
        <Card title="Masse Salariale">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{formatCurrency(kpis.masseSalariale)}</div>
            <div className="text-sm text-gray-600">Brut mensuel</div>
          </div>
        </Card>
        
        <Card title="Net à Payer">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{formatCurrency(kpis.totalNetAPayer)}</div>
            <div className="text-sm text-gray-600">Période {selectedPeriod}</div>
          </div>
        </Card>
        
        <Card title="Cotisations">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">{formatCurrency(kpis.totalCotisations)}</div>
            <div className="text-sm text-gray-600">Salariales + Patronales</div>
          </div>
        </Card>
        
        <Card title="Salaire Moyen">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-2">{formatCurrency(kpis.moyenneSalaire)}</div>
            <div className="text-sm text-gray-600">Moyenne mensuelle</div>
          </div>
        </Card>
      </div>
      
      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Vue d\'ensemble', icon: ChartBarIcon },
              { id: 'employees', name: 'Employés', icon: UserGroupIcon },
              { id: 'bulletins', name: 'Bulletins', icon: DocumentTextIcon },
              { id: 'declarations', name: 'Déclarations', icon: DocumentCheckIcon },
              { id: 'parametres', name: 'Paramètres', icon: CalculatorIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Répartition des Salaires">
                  <div className="space-y-3">
                    {employees.filter(e => e.statut === 'actif').slice(0, 5).map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{emp.prenom} {emp.nom}</div>
                          <div className="text-sm text-gray-600">{emp.poste}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatCurrency(emp.salaireBase)}</div>
                          <div className="text-xs text-gray-500">Brut</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card title="Déclarations Sociales">
                  <div className="space-y-3">
                    {declarations.slice(0, 3).map((dec) => (
                      <div key={dec.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{dec.type.toUpperCase()}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dec.statut === 'transmis' ? 'bg-green-100 text-green-800' :
                            dec.statut === 'validé' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {dec.statut}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">Période: {dec.periode}</div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          Total: {formatCurrency(dec.totalCotisations)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
          
          {/* Employés */}
          {activeTab === 'employees' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Liste des Employés</h3>
                {has('paie-create') && (
                  <button
                    onClick={() => {
                      setSelectedEmployee(null);
                      setIsEmployeeModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Nouvel Employé</span>
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salaire Brut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((emp) => (
                      <tr key={emp.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.matricule}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.prenom} {emp.nom}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.poste}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.departement}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(emp.salaireBase)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            emp.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {emp.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleCalculerPaie(emp)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Calculer la paie"
                            >
                              <CalculatorIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleGenererBulletin(emp)}
                              className="text-green-600 hover:text-green-900"
                              title="Générer bulletin"
                            >
                              <DocumentTextIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setIsEmployeeModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Modifier"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Bulletins */}
          {activeTab === 'bulletins' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Bulletins de Paie</h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>Exporter</span>
                  </button>
                  {has('paie-create') && (
                    <button
                      onClick={() => setIsCalculModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>Calculer Paie</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bulletins.filter(b => b.periode === selectedPeriod).map((bulletin) => (
                      <tr key={bulletin.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bulletin.numero}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bulletin.employee.prenom} {bulletin.employee.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{bulletin.periode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(bulletin.totalBrut)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(bulletin.netAPayer)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            bulletin.statut === 'payé' ? 'bg-green-100 text-green-800' :
                            bulletin.statut === 'validé' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bulletin.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBulletin(bulletin);
                                setIsViewBulletinModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Voir"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Imprimer"
                            >
                              <PrinterIcon className="h-5 w-5" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900"
                              title="Télécharger"
                            >
                              <ArrowDownTrayIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Déclarations */}
          {activeTab === 'declarations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Déclarations Sociales</h3>
                {has('paie-create') && (
                  <button
                    onClick={() => setIsDeclarationModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Nouvelle Déclaration</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {declarations.map((dec) => (
                  <Card key={dec.id}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{dec.type.toUpperCase()}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dec.statut === 'transmis' ? 'bg-green-100 text-green-800' :
                          dec.statut === 'validé' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dec.statut}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Période:</span>
                          <span className="font-medium">{dec.periode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Salariés:</span>
                          <span className="font-medium">{dec.nombreSalaries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Masse salariale:</span>
                          <span className="font-medium">{formatCurrency(dec.masseSalariale)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                          <span>Total cotisations:</span>
                          <span>{formatCurrency(dec.totalCotisations)}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">
                          Voir détails
                        </button>
                        <button className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100" aria-label="Télécharger" title="Télécharger" type="button">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Paramètres */}
          {activeTab === 'parametres' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Paramètres de Paie</h3>
                {has('paie-create') && (
                  <button
                    onClick={() => setIsParametresModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span>Modifier</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Cotisations Sociales">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Taux CNAS (Salarial)</span>
                      <span className="font-semibold">{parametres.tauxCNAS}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Taux CNSS (Salarial)</span>
                      <span className="font-semibold">{parametres.tauxCNSS}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Assurance Chômage</span>
                      <span className="font-semibold">{parametres.tauxAssuranceChomage}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Plafond CNAS</span>
                      <span className="font-semibold">{formatCurrency(parametres.plafondCNAS)}</span>
                    </div>
                  </div>
                </Card>
                
                <Card title="Période de Paie">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Fréquence</span>
                      <span className="font-semibold capitalize">{parametres.periodePaie}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Jour de paiement</span>
                      <span className="font-semibold">Le {parametres.jourPaiement} de chaque mois</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Taux heures supplémentaires</span>
                      <span className="font-semibold">{parametres.tauxHeuresSupplementaires}x</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Taux jours fériés</span>
                      <span className="font-semibold">{parametres.tauxJoursFeries}x</span>
                    </div>
                  </div>
                </Card>
                
                <Card title="Barème IRG" className="md:col-span-2">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tranche</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant Min</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant Max</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parametres.baremeIRG.map((tranche, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{tranche.tranche}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{tranche.taux}%</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatCurrency(tranche.montantMin)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {tranche.montantMax === Infinity ? '∞' : formatCurrency(tranche.montantMax)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Calcul Paie */}
      <Modal
        isOpen={isCalculModalOpen}
        onClose={() => setIsCalculModalOpen(false)}
        title="Calcul de la Paie"
      >
        {calculResult && selectedEmployee && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">{selectedEmployee.prenom} {selectedEmployee.nom}</div>
              <div className="text-sm text-gray-600">Matricule: {selectedEmployee.matricule}</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Salaire Brut</span>
                <span className="font-semibold">{formatCurrency(calculResult.salaireBrut)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Cotisations Salariales</span>
                <span className="font-semibold text-red-600">-{formatCurrency(calculResult.cotisationsSalariales)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">IRG</span>
                <span className="font-semibold text-red-600">-{formatCurrency(calculResult.irg)}</span>
              </div>
              <div className="flex justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <span className="font-semibold text-gray-900">Net à Payer</span>
                <span className="font-bold text-green-600 text-lg">{formatCurrency(calculResult.netAPayer)}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsCalculModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  handleGenererBulletin(selectedEmployee);
                  setIsCalculModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Générer Bulletin
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Modal Voir Bulletin */}
      <Modal
        isOpen={isViewBulletinModalOpen}
        onClose={() => setIsViewBulletinModalOpen(false)}
        title="Bulletin de Paie"
        size="xl"
      >
        {selectedBulletin && (
          <div className="space-y-6">
            {/* En-tête */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedBulletin.numero}</h3>
                  <p className="text-sm text-gray-600">Période: {selectedBulletin.periode}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedBulletin.statut === 'payé' ? 'bg-green-100 text-green-800' :
                  selectedBulletin.statut === 'validé' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedBulletin.statut}
                </span>
              </div>
            </div>
            
            {/* Informations employé */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Employé</div>
                <div className="font-semibold text-gray-900">
                  {selectedBulletin.employee.prenom} {selectedBulletin.employee.nom}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Matricule</div>
                <div className="font-semibold text-gray-900">{selectedBulletin.employee.matricule}</div>
              </div>
            </div>
            
            {/* Gains */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Gains</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">Salaire de base</span>
                  <span className="font-medium">{formatCurrency(selectedBulletin.salaireBase)}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">Primes</span>
                  <span className="font-medium">{formatCurrency(selectedBulletin.primes)}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">Heures supplémentaires</span>
                  <span className="font-medium">{formatCurrency(selectedBulletin.heuresSupplementaires)}</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-50 rounded border-2 border-blue-200">
                  <span className="font-semibold text-gray-900">Total Brut</span>
                  <span className="font-bold text-blue-600">{formatCurrency(selectedBulletin.totalBrut)}</span>
                </div>
              </div>
            </div>
            
            {/* Cotisations */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Cotisations Sociales</h4>
              <div className="space-y-2">
                {Object.entries(selectedBulletin.cotisationsSociales).map(([key, cot]) => (
                  <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">{cot.libelle}</span>
                    <span className="font-medium text-red-600">-{formatCurrency(cot.montant)}</span>
                  </div>
                ))}
                <div className="flex justify-between p-3 bg-red-50 rounded border-2 border-red-200">
                  <span className="font-semibold text-gray-900">Total Cotisations</span>
                  <span className="font-bold text-red-600">-{formatCurrency(selectedBulletin.totalCotisationsSalariales)}</span>
                </div>
              </div>
            </div>
            
            {/* Impôts */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Impôts</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">IRG</span>
                  <span className="font-medium text-red-600">-{formatCurrency(selectedBulletin.irg)}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded border-2 border-red-200">
                  <span className="font-semibold text-gray-900">Total Impôts</span>
                  <span className="font-bold text-red-600">-{formatCurrency(selectedBulletin.totalImpot)}</span>
                </div>
              </div>
            </div>
            
            {/* Net à payer */}
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Net à Payer</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(selectedBulletin.netAPayer)}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setIsViewBulletinModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <PrinterIcon className="h-5 w-5" />
                <span>Imprimer</span>
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Télécharger PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Paie;

