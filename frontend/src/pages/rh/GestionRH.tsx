import React, { useState, useMemo } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  BanknotesIcon,
  ChartBarIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useApp } from '@core/context/AppContext';
import Modal from '@shared/components/UI/Modal';
import { useEmployees } from '@shared/hooks/useEmployees';
import { usePermission } from '@shared/hooks/usePermission';
import { Employee } from '@/services/modules/hrService';
import apiClient from '@/services/apiClient';

type ContractType = 'cdi' | 'cdd' | 'stage' | 'freelance';
type Department = 'direction' | 'finance' | 'commercial' | 'it' | 'rh' | 'logistique' | 'production';
type PayStatus = 'paid' | 'pending' | 'processing';

interface Bulletin {
  mois: string;
  salaireBase: number;
  primes: number;
  cotisationsCnas: number;
  cotisationsCaramate: number;
  impotIrg: number;
  netAPayer: number;
  status: PayStatus;
}

// Bulletin period defaults to current month dynamically

const GestionRH: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useApp();
  const { employees, loading, error, createEmployee } = useEmployees();
  const [payslips, setPayslips] = useState<Record<string, { cnas_employee: number; irg: number; net_salary: number }>>({});
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [validatingPayroll, setValidatingPayroll] = useState(false);
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const currentPeriodValidated = payrollRuns.some(r => r.period === currentPeriod);

  const fetchPayrollRuns = () => {
    apiClient.get<any[]>('/rh/employees/payroll/runs').then(res => {
      setPayrollRuns(res.data || []);
    }).catch(() => {});
  };

  React.useEffect(() => {
    apiClient.get<any>('/rh/employees/payroll/summary').then(res => {
      const map: Record<string, any> = {};
      (res.data?.payslips || []).forEach((p: any) => { map[p.employee_id] = p; });
      setPayslips(map);
    }).catch(() => {});
    fetchPayrollRuns();
  }, [employees]);

  const handleValidatePayroll = async () => {
    if (currentPeriodValidated) return;
    if (!confirm(`Valider la paie de ${currentPeriod} pour ${employees.filter(e => e.status !== 'inactif').length} employé(s) ? Une écriture comptable sera générée.`)) return;
    setValidatingPayroll(true);
    try {
      const res = await apiClient.post<any>('/rh/employees/payroll/validate', { period: currentPeriod });
      alert(`Paie validée : écriture comptable ${res.data.journal_entry_number} générée (net total : ${formatCurrency(res.data.total_net)}).`);
      fetchPayrollRuns();
    } catch (err: any) {
      console.error('Failed to validate payroll', err);
      alert(err?.response?.data?.detail || 'Erreur lors de la validation de la paie.');
    } finally {
      setValidatingPayroll(false);
    }
  };
  const { has } = usePermission();
  const canManageEmployees = has('admin-users');
  const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'holidays' | 'analytics'>('employees');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBulletinOpen, setIsBulletinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newEmp, setNewEmp] = useState({
    matricule: '', nom: '', prenom: '', poste: '', department: 'commercial' as Department,
    contractType: 'cdi' as ContractType, dateEmbauche: new Date().toISOString().slice(0, 10),
    salaireBase: 0, primes: 0, email: '', telephone: ''
  });

  const resetCreateForm = () => {
    setNewEmp({ matricule: '', nom: '', prenom: '', poste: '', department: 'commercial', contractType: 'cdi', dateEmbauche: new Date().toISOString().slice(0, 10), salaireBase: 0, primes: 0, email: '', telephone: '' });
    setCreateError(null);
  };

  const handleCreateEmployee = async () => {
    if (!newEmp.matricule || !newEmp.nom || !newEmp.prenom || !newEmp.poste) {
      setCreateError(t('rh.create.validation_error') || 'Matricule, nom, prénom et poste requis');
      return;
    }
    try {
      await createEmployee({ ...newEmp, status: 'actif' });
      resetCreateForm();
      setIsCreateOpen(false);
    } catch (err: any) {
      setCreateError(err?.response?.data?.detail || err.message || 'Erreur lors de la création');
    }
  };

  const deptColors: Record<Department, string> = {
    direction: 'bg-slate-800 text-white', finance: 'bg-blue-100 text-blue-800',
    commercial: 'bg-emerald-100 text-emerald-800', it: 'bg-violet-100 text-violet-800',
    rh: 'bg-pink-100 text-pink-800', logistique: 'bg-amber-100 text-amber-800',
    production: 'bg-orange-100 text-orange-800'
  };

  const contractColors: Record<ContractType, string> = {
    cdi: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cdd: 'bg-blue-50 text-blue-700 border border-blue-200',
    stage: 'bg-amber-50 text-amber-700 border border-amber-200',
    freelance: 'bg-violet-50 text-violet-700 border border-violet-200'
  };

  const etatConfig = {
    actif: { label: t('rh.status.active'), color: 'bg-emerald-100 text-emerald-700' },
    conge: { label: t('rh.status.on_leave'), color: 'bg-amber-100 text-amber-700' },
    inactif: { label: t('rh.status.inactive'), color: 'bg-red-100 text-red-700' }
  };

  const filtered = useMemo(() => employees.filter(e => {
    const matchSearch = `${e.nom} ${e.prenom} ${e.poste}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || e.department === deptFilter;
    return matchSearch && matchDept;
  }), [search, deptFilter]);

  const kpis = useMemo(() => ({
    total: employees.length,
    actifs: employees.filter(e => e.status === 'actif').length,
    masseSalariale: employees.reduce((a, e) => a + e.salaireBase + e.primes, 0),
    avgSalary: employees.length > 0 ? Math.round(employees.reduce((a, e) => a + e.salaireBase, 0) / employees.length) : 0,
  }), [employees]);

  const departments = [...new Set(employees.map(e => e.department))];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <UserGroupIcon className="h-7 w-7 text-indigo-600 mr-3" />
            {t('rh.title')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('rh.subtitle')}</p>
        </div>
        {canManageEmployees && (
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
            <PlusIcon className="h-4 w-4 mr-2" />{t('rh.add_employee_btn')}
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('rh.kpi.headcount'), value: kpis.total, sub: `${kpis.actifs} ${t('rh.kpi.active')}`, icon: UserGroupIcon, color: 'text-slate-800' },
          { label: t('rh.kpi.payroll'), value: formatCurrency(kpis.masseSalariale), sub: t('rh.kpi.payroll_sub'), icon: BanknotesIcon, color: 'text-blue-700' },
          { label: t('rh.kpi.avg_salary'), value: formatCurrency(kpis.avgSalary), sub: t('rh.kpi.avg_salary_sub'), icon: ChartBarIcon, color: 'text-indigo-700' },
          { label: t('rh.kpi.departments'), value: departments.length, sub: t('rh.kpi.departments_sub'), icon: BuildingOfficeIcon, color: 'text-emerald-700' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{kpi.label}</p>
                <Icon className="h-5 w-5 text-slate-300" />
              </div>
              <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6">
          <nav className="flex overflow-x-auto no-scrollbar gap-1 pt-2">
            {[
              { id: 'employees', label: t('rh.tabs.employees') },
              { id: 'payroll', label: t('rh.tabs.payroll') },
              { id: 'holidays', label: t('rh.tabs.holidays') },
              { id: 'analytics', label: t('rh.tabs.analytics') }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.id ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="p-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={t('rh.search_placeholder')}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"/>
              </div>
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value as any)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none">
                <option value="all">{t('rh.filter.all_depts')}</option>
                {departments.map(d => <option key={d} value={d}>{t(`rh.departments.${d}`)}</option>)}
              </select>
            </div>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(emp => (
                <div key={emp.id} onClick={() => { setSelectedEmp(emp); setIsDetailOpen(true); }}
                  className="border border-slate-200 rounded-xl p-4 hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                        {emp.prenom[0]}{emp.nom[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm group-hover:text-slate-900">{emp.prenom} {emp.nom}</p>
                        <p className="text-[11px] text-slate-500">{emp.poste}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${etatConfig[emp.status].color}`}>
                      {etatConfig[emp.status].label}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${deptColors[emp.department as Department]}`}>{t(`rh.departments.${emp.department}`)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${contractColors[emp.contractType as ContractType]}`}>{t(`rh.contract.${emp.contractType}`)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                      <span className="text-[11px] text-slate-400">{t('rh.card.base_salary')}</span>
                      <span className="text-sm font-bold text-slate-700">{formatCurrency(emp.salaireBase)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{t('rh.card.since')} {emp.dateEmbauche}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">{t('rh.payroll.monthly_run')}</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                  <PrinterIcon className="h-4 w-4 mr-2" />{t('rh.payroll.print_all')}
                </button>
                <button
                  onClick={handleValidatePayroll}
                  disabled={currentPeriodValidated || validatingPayroll}
                  title={currentPeriodValidated ? `Paie ${currentPeriod} déjà validée` : undefined}
                  className="flex items-center px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  {currentPeriodValidated ? 'Paie validée' : validatingPayroll ? 'Validation...' : t('rh.payroll.generate')}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {[t('rh.payroll.table.employee'), t('rh.payroll.table.base'), t('rh.payroll.table.primes'), t('rh.payroll.table.cnas'), t('rh.payroll.table.irg'), t('rh.payroll.table.net'), t('rh.payroll.table.status')].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.filter(e => e.status !== 'inactif').map(emp => {
                    // Bulletin réel (barème IRG algérien LF2022 + CNAS 9%)
                    // via GET /rh/employees/payroll/summary — remplace le
                    // calcul forfaitaire 9%/12% client qui ignorait
                    // l'exonération/lissage IRG en dessous de 35 000 DA.
                    const slip = payslips[emp.id];
                    const cnas = slip ? Math.round(slip.cnas_employee) : Math.round((emp.salaireBase + emp.primes) * 0.09);
                    const irg = slip ? Math.round(slip.irg) : Math.round((emp.salaireBase + emp.primes - cnas) * 0.12);
                    const net = slip ? Math.round(slip.net_salary) : (emp.salaireBase + emp.primes - cnas - irg);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{emp.prenom} {emp.nom}</div>
                          <div className="text-[11px] text-slate-400">{emp.matricule}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatCurrency(emp.salaireBase)}</td>
                        <td className="px-4 py-3 text-emerald-600 font-semibold whitespace-nowrap">{formatCurrency(emp.primes)}</td>
                        <td className="px-4 py-3 text-red-500 whitespace-nowrap">-{formatCurrency(cnas)}</td>
                        <td className="px-4 py-3 text-red-500 whitespace-nowrap">-{formatCurrency(irg)}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">{formatCurrency(net)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {currentPeriodValidated ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />Validée
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                              <ClockIcon className="h-3 w-3 mr-1" />{t('rh.payroll.status.pending')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Holidays Tab */}
        {activeTab === 'holidays' && (
          <div className="p-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <CalendarIcon className="h-10 w-10 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">{t('rh.holidays.not_available_title') || 'Gestion des congés à venir'}</p>
              <p className="text-sm text-slate-500 mt-1">{t('rh.holidays.not_available_desc') || "Cette fonctionnalité n'est pas encore connectée au backend."}</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department distribution */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">{t('rh.analytics.by_department')}</h4>
              <div className="space-y-3">
                {Object.entries(employees.reduce((acc, e) => { acc[e.department] = (acc[e.department] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([dept, count]) => (
                  <div key={dept}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{t(`rh.departments.${dept}`)}</span>
                      <span className="text-slate-900">{count} {t('rh.analytics.employees')}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-700 rounded-full" style={{ width: `${(count / employees.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Contract distribution */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">{t('rh.analytics.by_contract')}</h4>
              <div className="space-y-3">
                {(['cdi', 'cdd', 'stage', 'freelance'] as ContractType[]).map(ct => {
                  const count = employees.filter(e => e.contractType === ct).length;
                  return count > 0 ? (
                    <div key={ct}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">{t(`rh.contract.${ct}`)}</span>
                        <span className="text-slate-900">{count} {t('rh.analytics.employees')}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(count / employees.length) * 100}%` }} />
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmp && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`${selectedEmp.prenom} ${selectedEmp.nom} — ${selectedEmp.matricule}`} size="lg">
          <div className="p-2 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: UserIcon, label: t('rh.detail.position'), value: selectedEmp.poste },
                { icon: BuildingOfficeIcon, label: t('rh.detail.department'), value: t(`rh.departments.${selectedEmp.department}`) },
                { icon: CalendarIcon, label: t('rh.detail.hire_date'), value: selectedEmp.dateEmbauche },
                { icon: DocumentTextIcon, label: t('rh.detail.contract'), value: t(`rh.contract.${selectedEmp.contractType}`) },
                { icon: EnvelopeIcon, label: 'Email', value: selectedEmp.email },
                { icon: PhoneIcon, label: t('rh.detail.phone'), value: selectedEmp.telephone },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Icon className="h-3 w-3"/>{label}</p>
                  <p className="font-semibold text-slate-800 text-sm">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">{t('rh.detail.base_salary')}</p>
                <p className="text-xl font-black text-indigo-900">{formatCurrency(selectedEmp.salaireBase)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">{t('rh.detail.primes')}</p>
                <p className="text-xl font-black text-emerald-800">{formatCurrency(selectedEmp.primes)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => { setIsDetailOpen(false); setIsBulletinOpen(true); }}
                className="flex items-center px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                <DocumentTextIcon className="h-4 w-4 mr-2" />{t('rh.detail.view_bulletin')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulletin Modal */}
      {selectedEmp && (
        <Modal isOpen={isBulletinOpen} onClose={() => setIsBulletinOpen(false)} title={t('rh.bulletin.title')} size="lg">
          <div className="p-2 space-y-5">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold mb-1">{t('rh.bulletin.employee')}</p>
                  <h3 className="text-xl font-black">{selectedEmp.prenom} {selectedEmp.nom}</h3>
                  <p className="text-slate-400 text-sm mt-1">{selectedEmp.poste} — {selectedEmp.matricule}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs uppercase font-bold mb-1">{t('rh.bulletin.period')}</p>
                  <p className="text-lg font-bold">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
            {/* Bulletin Lines — barème IRG algérien réel + CNAS 9% via
                GET /rh/employees/payroll/summary, pas un calcul forfaitaire.
                La ligne "CACOBATPH" (2,5%) a été retirée : elle ne
                correspond à aucune cotisation réellement calculée par
                AlgerianPayrollCalculator (seuls CNAS et IRG existent). */}
            <div className="space-y-2">
              {payslips[selectedEmp.id] ? (
                <>
                  {[
                    { label: t('rh.bulletin.base_salary'), value: formatCurrency(selectedEmp.salaireBase), type: 'income' },
                    { label: t('rh.bulletin.primes'), value: formatCurrency(selectedEmp.primes), type: 'income' },
                    { label: t('rh.bulletin.cnas'), value: `-${formatCurrency(Math.round(payslips[selectedEmp.id].cnas_employee))}`, type: 'deduction' },
                    { label: t('rh.bulletin.irg'), value: `-${formatCurrency(Math.round(payslips[selectedEmp.id].irg))}`, type: 'deduction' },
                  ].map((line, i) => (
                    <div key={i} className={`flex justify-between items-center p-3 rounded-lg ${line.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <span className="text-sm font-semibold text-slate-700">{line.label}</span>
                      <span className={`font-bold ${line.type === 'income' ? 'text-emerald-700' : 'text-red-600'}`}>{line.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl">
                    <span className="text-white font-bold uppercase text-sm tracking-wide">{t('rh.bulletin.net')}</span>
                    <span className="text-white text-2xl font-black">
                      {formatCurrency(Math.round(payslips[selectedEmp.id].net_salary))}
                    </span>
                  </div>
                </>
              ) : (
                // Un bulletin de paie est un document légal — mieux vaut ne
                // rien afficher qu'un calcul forfaitaire faux (12% IRG /
                // 9% CNAS) pendant le court instant avant que le vrai
                // barème (GET /rh/employees/payroll/summary) ne charge.
                <p className="text-sm text-slate-500 italic p-3">Calcul du bulletin en cours...</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => window.print()} className="flex items-center px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <PrinterIcon className="h-4 w-4 mr-2"/>{t('rh.bulletin.print')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Employee Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); resetCreateForm(); }} title={t('rh.add_employee_btn')} size="lg">
        <div className="p-2 space-y-4">
          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{createError}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder={t('rh.detail.position') as string + ' — Matricule'} value={newEmp.matricule}
              onChange={e => setNewEmp({ ...newEmp, matricule: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
            <input type="text" placeholder="Nom" value={newEmp.nom}
              onChange={e => setNewEmp({ ...newEmp, nom: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
            <input type="text" placeholder="Prénom" value={newEmp.prenom}
              onChange={e => setNewEmp({ ...newEmp, prenom: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
            <input type="text" placeholder={t('rh.detail.position') as string} value={newEmp.poste}
              onChange={e => setNewEmp({ ...newEmp, poste: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
            <select value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value as Department })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2">
              {Object.keys(deptColors).map(d => <option key={d} value={d}>{t(`rh.departments.${d}`)}</option>)}
            </select>
            <select value={newEmp.contractType} onChange={e => setNewEmp({ ...newEmp, contractType: e.target.value as ContractType })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2">
              {Object.keys(contractColors).map(c => <option key={c} value={c}>{t(`rh.contract.${c}`)}</option>)}
            </select>
            <input type="date" value={newEmp.dateEmbauche}
              onChange={e => setNewEmp({ ...newEmp, dateEmbauche: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
            <input type="number" min={0} placeholder={t('rh.detail.base_salary') as string} value={newEmp.salaireBase}
              onChange={e => setNewEmp({ ...newEmp, salaireBase: Number(e.target.value) })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
            <input type="number" min={0} placeholder={t('rh.detail.primes') as string} value={newEmp.primes}
              onChange={e => setNewEmp({ ...newEmp, primes: Number(e.target.value) })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
            <input type="email" placeholder="Email" value={newEmp.email}
              onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
            <input type="text" placeholder={t('rh.detail.phone') as string} value={newEmp.telephone}
              onChange={e => setNewEmp({ ...newEmp, telephone: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={() => { setIsCreateOpen(false); resetCreateForm(); }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              {t('common.cancel')}
            </button>
            <button onClick={handleCreateEmployee}
              className="px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
              {t('rh.add_employee_btn')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GestionRH;
