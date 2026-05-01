import React, { useState, useMemo } from 'react';
import {
  ShoppingCartIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CheckCircleIcon,
  TruckIcon,
  BanknotesIcon,
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import Card from '@shared/components/UI/Card';
import LineChart from '@shared/components/Charts/LineChart';
import BarChart from '@shared/components/Charts/BarChart';
import DoughnutChart from '@shared/components/Charts/DoughnutChart';
import { useSuppliers } from '@shared/hooks/useSuppliers';
import Modal from '@shared/components/UI/Modal';

// --- Types ---
type TabType = 'dashboard' | 'suppliers' | 'orders' | 'analytics';

const AchatsFournisseursPage: React.FC = () => {
  const { formatCurrency, user } = useApp();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data Fetching (Mocked or Hooks)
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  
  // Mock Data for Dashboard
  const kpis = [
    { label: t('suppliers.stats.total_purchases'), value: 35094, trend: '+12.5%', icon: ShoppingCartIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('suppliers.stats.debts'), value: 9045, trend: '-2.1%', icon: BanknotesIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('suppliers.stats.total_orders'), value: 0, trend: '+3', icon: TruckIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('suppliers.messages.quality_score'), value: '4.2/5', trend: t('common.status_stable'), icon: StarIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const evolutionData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      { label: `${t('common.purchase_invoices')} 2024`, data: [650000, 820000, 750000, 910000, 1100000, 950000], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true },
      { label: `${t('common.purchase_invoices')} 2023`, data: [580000, 610000, 690000, 720000, 850000, 800000], borderColor: '#94a3b8', backgroundColor: 'transparent', borderDash: [5, 5], fill: false },
    ]
  };

  const distributionData = {
    labels: ['Tech Solutions', 'Global Log', 'Office Co', t('common.others')],
    datasets: [{
      data: [45, 25, 15, 15],
      backgroundColor: ['#1e293b', '#334155', '#475569', '#94a3b8'],
      borderWidth: 0,
    }]
  };

  const recentOrders = [
    { id: 'BC-2024-042', supplier: 'Tech Solutions SARL', date: '12/04/2024', amount: 1049, status: 'approved', urgency: 'high' },
    { id: 'BC-2024-043', supplier: 'Global Logistics', date: '14/04/2024', amount: 644, status: 'pending', urgency: 'medium' },
    { id: 'BC-2024-044', supplier: 'Office Supplies Co', date: '15/04/2024', amount: 90, status: 'received', urgency: 'low' },
  ];

  // Helper for Status Tags
  const renderStatus = (status: string) => {
    const config: any = {
      approved: { label: t('suppliers.status.approved'), class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      pending: { label: t('suppliers.status.pending'), class: 'bg-amber-100 text-amber-700 border-amber-200' },
      received: { label: t('suppliers.status.delivered'), class: 'bg-blue-100 text-blue-700 border-blue-200' },
      cancelled: { label: t('common.cancel'), class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const c = config[status] || config.pending;
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.class}`}>{c.label}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 animate-in fade-in duration-500">
      {/* --- Premium Header Section --- */}
      <div className="bg-slate-900 text-white pt-12 pb-24 px-4 sm:px-8 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full -mr-64 -mt-64 blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl opacity-30 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl">
                <ShoppingCartIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">{t('suppliers.title')}</h1>
                  <span className="px-2 py-0.5 bg-blue-500 text-[10px] font-black uppercase tracking-widest rounded-md">ERP Core</span>
                </div>
                <p className="text-slate-400 font-medium max-w-lg">
                  {t('suppliers.subtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto">
                <PlusIcon className="h-5 w-5" />
                {t('suppliers.actions.new_order')}
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm w-full sm:w-auto">
                <ArrowDownTrayIcon className="h-5 w-5" />
                {t('common.export')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Container (Pulled up) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-16 relative z-20">
        
        {/* --- Tabs Navigation --- */}
        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-3xl border border-white/20 shadow-xl flex overflow-x-auto mb-8 no-scrollbar">
          {[
            { id: 'dashboard', label: t('nav.global_view'), icon: ChartBarIcon },
            { id: 'suppliers', label: t('suppliers.tabs.list'), icon: BuildingOfficeIcon },
            { id: 'orders', label: t('suppliers.tabs.orders'), icon: TruckIcon },
            { id: 'analytics', label: t('suppliers.tabs.analytics'), icon: ArrowTrendingUpIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 whitespace-nowrap' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 whitespace-nowrap'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- Tab Content --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${kpi.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                      <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {kpi.trend}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</h3>
                  <p className="text-2xl font-black text-slate-900">
                    {typeof kpi.value === 'number' ? formatCurrency(kpi.value) : kpi.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-xl font-black text-slate-900">{t('suppliers.analytics.commitment_evolution')}</h2>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ArrowPathIcon className="h-5 w-5 text-slate-400"/></button>
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><FunnelIcon className="h-5 w-5 text-slate-400"/></button>
                  </div>
                </div>
                <div className="h-[300px]">
                  <LineChart 
                    data={evolutionData.datasets[0].data} 
                    labels={evolutionData.labels}
                    borderColor={evolutionData.datasets[0].borderColor}
                    backgroundColor={evolutionData.datasets[0].backgroundColor}
                    title={t('suppliers.analytics.commitment_evolution')}
                  />
                </div>
              </div>

              {/* Insights Column */}
              <div className="space-y-6">
                {/* Distribution Card */}
                <div className="bg-white p-4 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-full flex flex-col">
                  <h2 className="text-xl font-black text-slate-900 mb-6 text-center">{t('suppliers.analytics.distribution_supplier')}</h2>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-48 h-48">
                      <DoughnutChart 
                        data={distributionData.datasets[0].data} 
                        labels={distributionData.labels}
                        colors={distributionData.datasets[0].backgroundColor}
                        title={t('suppliers.analytics.distribution_supplier')}
                      />
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    {distributionData.labels.map((l, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-bold text-slate-600">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: distributionData.datasets[0].backgroundColor[i] }}></div>
                          {l}
                        </span>
                        <span className="font-black text-slate-900">{distributionData.datasets[0].data[i]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900">{t('suppliers.messages.purchase_orders')}</h2>
                <button className="text-xs sm:text-sm font-black text-blue-600 hover:text-blue-700 transition-colors">{t('common.view')} {t('common.all')} →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('suppliers.table.reference')}</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('suppliers.table.supplier')}</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.date')}</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.amount')}</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.status')}</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('suppliers.table.quality')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                        <td className="px-4 sm:px-8 py-5 font-black text-slate-900">{order.id}</td>
                        <td className="px-4 sm:px-8 py-5 font-bold text-slate-600">{order.supplier}</td>
                        <td className="px-4 sm:px-8 py-5 text-sm text-slate-400 font-medium">{order.date}</td>
                        <td className="px-4 sm:px-8 py-5 font-black text-slate-900">{formatCurrency(order.amount)}</td>
                        <td className="px-4 sm:px-8 py-5">{renderStatus(order.status)}</td>
                        <td className="px-4 sm:px-8 py-5">
                          <div className={`w-2 h-2 rounded-full ${order.urgency === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : order.urgency === 'medium' ? 'bg-amber-400' : 'bg-slate-300'}`}></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab === 'suppliers' && (
          <div className="bg-white p-6 sm:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
            <BuildingOfficeIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">{t('suppliers.tabs.list')}</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">{t('suppliers.subtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* This would be the supplier list */}
              {suppliersLoading ? (
                <div className="col-span-full py-12 flex justify-center"><ArrowPathIcon className="h-8 w-8 text-slate-300 animate-spin"/></div>
              ) : (
                suppliers?.slice(0, 6).map((s: any, idx: number) => (
                  <div key={idx} className="p-6 border border-slate-100 rounded-3xl hover:border-slate-300 transition-all text-left group">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <BuildingOfficeIcon className="h-6 w-6" />
                    </div>
                    <h3 className="font-black text-slate-900 mb-1">{s.name || s.nom}</h3>
                    <p className="text-xs text-slate-400 mb-4">{s.email || 'Pas d\'email'}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Score</span>
                      <div className="flex gap-0.5 text-amber-400"><StarIcon className="h-3 w-3 fill-current"/><StarIcon className="h-3 w-3 fill-current"/><StarIcon className="h-3 w-3 fill-current"/><StarIcon className="h-3 w-3 fill-current"/><StarIcon className="h-3 w-3 text-slate-200"/></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab (Simplified) */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-4 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  {t('suppliers.tabs.analytics')}
                </h3>
                <div className="h-64">
                   <BarChart 
                    data={[450, 320, 210, 150]} 
                    labels={['IT', 'Bureautique', 'Logistique', 'Marketing']}
                    backgroundColor="#0f172a"
                    title={t('suppliers.tabs.analytics')}
                   />
                </div>
             </div>
             <div className="bg-slate-900 p-4 sm:p-8 rounded-[2.5rem] shadow-2xl text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <DocumentTextIcon className="h-32 w-32" />
                </div>
                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                   <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
                   {t('suppliers.sections.executive_summary')}
                </h3>
                <div className="space-y-4 relative z-10">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('suppliers.actions.optimization')}</p>
                      <p className="text-sm">Une consolidation des commandes chez <span className="text-blue-400 font-bold">Tech Solutions</span> pourrait réduire vos coûts logistiques de <span className="text-emerald-400 font-black">12%</span>.</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">{t('suppliers.actions.risks')}</p>
                      <p className="text-sm">Le fournisseur <span className="text-amber-400 font-bold">ElectroMax</span> présente une volatilité des prix de <span className="text-rose-400 font-black">18%</span>. Envisagez un contrat cadre.</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchatsFournisseursPage;
