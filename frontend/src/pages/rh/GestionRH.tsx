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
import { Employee } from '@/services/modules/hrService';

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
  const { employees, loading, error } = useEmployees();
  const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'holidays' | 'analytics'>('employees');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBulletinOpen, setIsBulletinOpen] = useState(false);

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
        <button className="flex items-center px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
          <PlusIcon className="h-4 w-4 mr-2" />{t('rh.add_employee_btn')}
        </button>
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
                <button className="flex items-center px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                  <PrinterIcon className="h-4 w-4 mr-2" />{t('rh.payroll.print_all')}
                </button>
                <button className="flex items-center px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                  <SparklesIcon className="h-4 w-4 mr-2" />{t('rh.payroll.generate')}
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
                    const cnas = Math.round((emp.salaireBase + emp.primes) * 0.09);
                    const irg = Math.round((emp.salaireBase + emp.primes - cnas) * 0.12);
                    const net = emp.salaireBase + emp.primes - cnas - irg;
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            <ClockIcon className="h-3 w-3 mr-1" />{t('rh.payroll.status.pending')}
                          </span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { label: t('rh.holidays.pending'), count: 0, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
                { label: t('rh.holidays.approved'), count: 0, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
                { label: t('rh.holidays.refused'), count: 0, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border ${item.bg} flex items-center justify-between`}>
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  <span className={`text-3xl font-black ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50"><tr>
                  {[t('rh.holidays.table.employee'), t('rh.holidays.table.type'), t('rh.holidays.table.from'), t('rh.holidays.table.to'), t('rh.holidays.table.days'), t('rh.holidays.table.status')].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {([] as { emp: string; type: string; from: string; to: string; days: number; status: string }[]).map((row, i) => {
                    const statusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', refused: 'bg-red-100 text-red-700' };
                    const statusLabels: Record<string, string> = { pending: t('rh.holidays.status.pending'), approved: t('rh.holidays.status.approved'), refused: t('rh.holidays.status.refused') };
                    return (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.emp}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.type}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.from}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.to}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{row.days} {t('rh.holidays.days_label')}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[row.status]}`}>{statusLabels[row.status]}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
            {/* Bulletin Lines */}
            <div className="space-y-2">
              {[
                { label: t('rh.bulletin.base_salary'), value: formatCurrency(selectedEmp.salaireBase), type: 'income' },
                { label: t('rh.bulletin.primes'), value: formatCurrency(selectedEmp.primes), type: 'income' },
                { label: t('rh.bulletin.cnas'), value: `-${formatCurrency(Math.round((selectedEmp.salaireBase + selectedEmp.primes) * 0.09))}`, type: 'deduction' },
                { label: t('rh.bulletin.caramate'), value: `-${formatCurrency(Math.round((selectedEmp.salaireBase + selectedEmp.primes) * 0.025))}`, type: 'deduction' },
                { label: t('rh.bulletin.irg'), value: `-${formatCurrency(Math.round((selectedEmp.salaireBase + selectedEmp.primes) * 0.12))}`, type: 'deduction' },
              ].map((line, i) => (
                <div key={i} className={`flex justify-between items-center p-3 rounded-lg ${line.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <span className="text-sm font-semibold text-slate-700">{line.label}</span>
                  <span className={`font-bold ${line.type === 'income' ? 'text-emerald-700' : 'text-red-600'}`}>{line.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl">
                <span className="text-white font-bold uppercase text-sm tracking-wide">{t('rh.bulletin.net')}</span>
                <span className="text-white text-2xl font-black">
                  {formatCurrency(selectedEmp.salaireBase + selectedEmp.primes -
                    Math.round((selectedEmp.salaireBase + selectedEmp.primes) * 0.09) -
                    Math.round((selectedEmp.salaireBase + selectedEmp.primes) * 0.025) -
                    Math.round((selectedEmp.salaireBase + selectedEmp.primes) * 0.12))}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => window.print()} className="flex items-center px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <PrinterIcon className="h-4 w-4 mr-2"/>{t('rh.bulletin.print')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GestionRH;
