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
import { hrService, Employee, Payroll } from '../../services/modules/hrService';

const Paie: React.FC = () => {
  const { formatCurrency, user } = useApp();
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bulletins, setBulletins] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedBulletin, setSelectedBulletin] = useState<Payroll | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, payrollData] = await Promise.all([
        hrService.getEmployees(),
        hrService.getPayroll(selectedPeriod)
      ]);
      setEmployees(empData);
      setBulletins(payrollData);
    } catch (err) {
      console.error('Failed to load HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  // Calculs des KPIs
  const kpis = useMemo(() => {
    const totalSalaries = employees.filter(e => e.status === 'active').length;
    const masseSalariale = employees
      .filter(e => e.status === 'active')
      .reduce((sum, e) => sum + Number(e.base_salary), 0);
    const totalNetAPayer = bulletins.reduce((sum, b) => sum + Number(b.net_salary), 0);

    return {
      totalSalaries,
      masseSalariale,
      totalNetAPayer,
      moyenneSalaire: totalSalaries > 0 ? masseSalariale / totalSalaries : 0
    };
  }, [employees, bulletins]);

  const handleCalculerPaie = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsCalculModalOpen(true);
  };

  const handleGenererBulletin = (employee: Employee) => {
    setSelectedEmployee(employee);
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
            <p className="text-gray-600 mb-4">Le module de gestion de la paie est disponible pour les entreprises SARL et SPA uniquement.</p>
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
              title="Sélectionner la période"
            />
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <nav className="flex space-x-8 px-6">
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
                  className={`${activeTab === tab.id
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                Vue d'ensemble synchronisée avec les données RH réelles.
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Liste des Employés</h3>
                <button onClick={() => { setSelectedEmployee(null); setIsEmployeeModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <PlusIcon className="h-5 w-5" />
                  <span>Nouvel Employé</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salaire Brut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((emp) => (
                      <tr key={emp.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.first_name} {emp.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(emp.base_salary)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleGenererBulletin(emp)} className="text-green-600 hover:text-green-900 mx-2" title="Générer bulletin">
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bulletins' && (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              Liste des bulletins de paie pour {selectedPeriod}.
            </div>
          )}

          {activeTab === 'declarations' && (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              Génération automatique des déclarations CNAS/CASNOS/DAS.
            </div>
          )}

          {activeTab === 'parametres' && (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              Paramètres globaux de paie et barèmes IRG 2025.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Paie;
