import React, { useState } from 'react';
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  EyeIcon,
  EnvelopeIcon,
  ChartBarSquareIcon,
  XMarkIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CalculatorIcon,
  BookOpenIcon,
  DocumentCheckIcon,
  ScaleIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';

import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { usePermission } from '@shared/hooks/usePermission';
import api from '@/services/api';

const Statistiques: React.FC = () => {
  const { formatCurrency, planComptable } = useApp();
  const { t } = useTranslation();
  const { user } = usePermission();

  // Détermination automatique de la taille pour l'échelle des données
  const currentSize = React.useMemo(() => {
    if (user?.segment) {
      if (user.segment === 'micro') return 'micro';
      if (user.segment === 'small' || user.segment === 'medium') return 'sme';
      if (user.segment === 'large' || user.segment === 'enterprise') return 'mid';
    }
    if (!user?.companyType) return 'sme';
    if (['eurl', 'micro', 'auto-entrepreneur'].includes(user.companyType)) return 'micro';
    if (['sarl', 'pme'].includes(user.companyType)) return 'sme';
    return 'mid';
  }, [user]);

  // États pour les modals
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Données comptables SCF/IFRS
  const normesComptables = {
    algerien: {
      nom: t('steering.dashboard.accounting.norm_scf'),
      code: 'SCF',
      emoji: '🇩🇿',
      comptes: {
        ventes: `701 - ${t('steering.dashboard.chart_accounts.items.sales_goods')}`,
        tva: `44571 - ${t('steering.dashboard.chart_accounts.items.vat_collected')}`,
        clients: `411 - ${t('steering.dashboard.chart_accounts.items.clients')}`,
        stocks: `31 - ${t('steering.dashboard.chart_accounts.items.inventory')}`,
        produits: `7011 - ${t('steering.dashboard.chart_accounts.items.finished_products')}`,
        charges: `601 - ${t('steering.dashboard.chart_accounts.items.purchase_merchandise')}`,
        immobilisations: `20 - ${t('steering.dashboard.chart_accounts.items.fixed_assets')}`
      }
    },
    international: {
      nom: t('steering.dashboard.accounting.norm_ifrs'),
      code: 'IFRS',
      emoji: '🌍',
      comptes: {
        ventes: t('steering.dashboard.chart_accounts.items.sales_intl'),
        tva: t('steering.dashboard.chart_accounts.items.vat_payable'),
        clients: t('steering.dashboard.chart_accounts.items.trade_receivables'),
        stocks: t('steering.dashboard.chart_accounts.items.inventory_intl'),
        produits: t('steering.dashboard.chart_accounts.items.revenue_intl'),
        charges: t('steering.dashboard.chart_accounts.items.cogs'),
        immobilisations: t('steering.dashboard.chart_accounts.items.ppe')
      }
    }
  };


  // States for dynamic KPIs and top clients
  const [kpiComptables, setKpiComptables] = useState<any>(null);
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);

  // Load KPIs and top clients from backend
  React.useEffect(() => {
    setLoadingKpi(true);
    api.analytics.getKPIs(currentSize)
      .then((data: any) => {
        setKpiComptables(data);
      })
      .catch(() => setKpiError('Erreur lors du chargement des KPIs'))
      .finally(() => setLoadingKpi(false));

    setLoadingClients(true);
    api.clients.getAll()
      .then(data => {
        const factor = currentSize === 'micro' ? 0.3 : currentSize === 'mid' ? 10 : 1;
        const scaledData = data.map(c => ({
          ...c,
          ca: (c.ca || 0) * factor
        }));
        setTopClients(scaledData.slice(0, 3));
      })
      .catch(() => setClientsError('Erreur lors du chargement des clients'))
      .finally(() => setLoadingClients(false));
  }, [currentSize]);

  // Fonctions de gestion des actions
  const handleViewDetails = (client: any) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleContact = (client: any) => {
    setSelectedClient(client);
    setShowContactModal(true);
  };

  const handleAnalyze = (client: any) => {
    setSelectedClient(client);
    setShowAnalysisModal(true);
  };

  // Métriques clés pour l'aperçu (peuvent être extraites des KPIs)
  const metriques = kpiComptables?.metriques || {};

  if (loadingKpi || !kpiComptables) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-500 font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  const clientsToDisplay = topClients;

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      {/* Header & Overview Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ChartBarSquareIcon className="w-32 h-32 text-slate-900" />
        </div>

        <div className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {t('steering.dashboard.title')}
              </h1>
              <p className="text-slate-500 mt-2 text-lg max-w-2xl">
                {t('steering.dashboard.subtitle')}
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="text-sm">
                <p className="text-slate-900 font-semibold">{t('steering.dashboard.real_time')}</p>
                <p className="text-slate-500 text-xs text-right">{t('steering.dashboard.updated_now')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Line */}
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 w-full"></div>
      </div>

      {/* 🎯 Métriques Clés Reformatted */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mb-6 relative z-10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('steering.dashboard.metrics.revenue')}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{formatCurrency(metriques.ventesTotal)}</h3>
          <div className="flex items-center mt-3 text-[9px] font-black text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            <span>+{metriques.croissanceCA}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <ChartBarIcon className="h-8 w-8 text-emerald-600 mb-6 relative z-10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('steering.dashboard.metrics.gross_margin')}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{metriques.margeBrute}%</h3>
          <div className="flex items-center mt-3 text-[9px] font-black text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            <span>+2.1%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600 mb-6 relative z-10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('steering.dashboard.metrics.stock_rotation')}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{metriques.rotationStock}x</h3>
          <div className="flex items-center mt-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {t('steering.dashboard.metrics.target')} 8x
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <UserGroupIcon className="h-8 w-8 text-orange-600 mb-6 relative z-10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('steering.dashboard.metrics.active_clients')}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{metriques.nombreClients}</h3>
          <div className="flex items-center mt-3 text-[9px] font-black text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            <span>+{metriques.nouveauxClients} {t('steering.dashboard.metrics.new')}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <CheckCircleIcon className="h-8 w-8 text-teal-600 mb-6 relative z-10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('steering.dashboard.metrics.loyalty')}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{metriques.tauxFidelisation}%</h3>
          <div className="flex items-center mt-3 text-[9px] font-black text-teal-700 bg-teal-50 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            {t('steering.dashboard.metrics.top_tier')}
          </div>
        </div>
      </div>

      {/* 📚 Section Comptable & Journaux - Premium Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: Accounting Indicators */}
        <div className="lg:col-span-2 space-y-6">
          {/* Accounting Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{t('steering.dashboard.accounting.title')}</h2>
                  <p className="text-sm text-slate-500">
                    {t('steering.dashboard.accounting.norm_label')} <span className="font-semibold text-indigo-600">{normesComptables[planComptable as keyof typeof normesComptables].nom}</span>
                  </p>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {normesComptables[planComptable as keyof typeof normesComptables].emoji} {normesComptables[planComptable as keyof typeof normesComptables].code}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Écritures */}
              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-sm font-medium">{t('steering.dashboard.accounting.total_entries')}</span>
                    <span className="text-2xl font-bold text-slate-800">{kpiComptables.ecrituresComptables.total}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-slate-600" />
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(kpiComptables.ecrituresComptables.validees / kpiComptables.ecrituresComptables.total) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{kpiComptables.ecrituresComptables.validees} {t('steering.dashboard.accounting.validated')}</span>
                  <span className="text-orange-500 font-medium">{kpiComptables.ecrituresComptables.enAttente} {t('steering.dashboard.accounting.pending')}</span>
                </div>
              </div>

              {/* TVA */}
              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-sm font-medium">{t('steering.dashboard.accounting.vat_to_pay')}</span>
                    <span className="text-2xl font-bold text-slate-800">{formatCurrency(kpiComptables.tva.aVerser)}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
                    <DocumentCheckIcon className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-xs">
                    <p className="text-slate-400">{t('steering.dashboard.accounting.collected')}</p>
                    <p className="font-semibold text-slate-700">{formatCurrency(kpiComptables.tva.collectee)}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-400">{t('steering.dashboard.accounting.deductible')}</p>
                    <p className="font-semibold text-slate-700">{formatCurrency(kpiComptables.tva.deductible)}</p>
                  </div>
                </div>
              </div>

              {/* Bilan Summary */}
              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-sm font-medium">{t('steering.dashboard.accounting.total_balance_sheet')}</span>
                    <span className="text-2xl font-bold text-slate-800">{formatCurrency(kpiComptables.bilans.actif)}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
                    <ScaleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  <span className="font-medium text-emerald-600">+{kpiComptables.bilans.evolution}%</span> {t('steering.dashboard.accounting.vs_previous')}
                </div>
              </div>

              {/* Ratios Quick View */}
              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-slate-500 text-sm font-medium">{t('steering.dashboard.ratios.title')}</span>
                  <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
                    <ChartBarSquareIcon className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  {kpiComptables.ratios.slice(0, 2).map((ratio: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 truncate">{ratio.nom}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${ratio.couleur === 'green' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{ratio.valeur}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Codes Comptables */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{t('steering.dashboard.chart_accounts.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Ventes', 'Gestion', 'Stocks'].map((section) => (
                <div key={section} className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">{t(`steering.dashboard.chart_accounts.${section.toLowerCase()}`)}</h4>
                  <div className="space-y-1">
                    {(section === 'Ventes' ? [
                      { label: t('steering.dashboard.chart_accounts.items.sales_goods'), code: normesComptables[planComptable as keyof typeof normesComptables].comptes.ventes },
                      { label: t('steering.dashboard.chart_accounts.items.finished_products'), code: normesComptables[planComptable as keyof typeof normesComptables].comptes.produits }
                    ] : section === 'Gestion' ? [
                      { label: t('steering.dashboard.chart_accounts.items.vat_collected'), code: normesComptables[planComptable as keyof typeof normesComptables].comptes.tva },
                      { label: t('steering.dashboard.chart_accounts.items.clients'), code: normesComptables[planComptable as keyof typeof normesComptables].comptes.clients }
                    ] : [
                      { label: t('steering.dashboard.chart_accounts.items.inventory'), code: normesComptables[planComptable as keyof typeof normesComptables].comptes.stocks },
                      { label: t('steering.dashboard.chart_accounts.items.fixed_assets'), code: normesComptables[planComptable as keyof typeof normesComptables].comptes.immobilisations }
                    ]).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-mono font-medium text-slate-800">{item.code.split(' - ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Journals & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2 text-slate-400" />
              {t('steering.dashboard.journals.title')}
            </h3>
            <div className="space-y-4">
              {kpiComptables.journaux.map((journal: any, index: number) => (
                <div key={index} className="group p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-slate-700">{journal.nom}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${journal.statut === 'Validé' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {journal.statut === 'Validé' ? t('steering.dashboard.journals.status.validated') : t('steering.dashboard.journals.status.in_progress')}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-500">
                      <p>{t('steering.dashboard.journals.update')} {journal.lastUpdate || 'N/A'}</p>
                      <p className="mt-0.5">{journal.entries || 0} {t('steering.dashboard.journals.lines')}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-800 text-sm">{formatCurrency(journal.montant || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('steering.dashboard.actions.title')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                  <DocumentCheckIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-semibold">{t('steering.dashboard.actions.entry')}</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                  <CalculatorIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-semibold">{t('steering.dashboard.actions.vat')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Top Clients Professional Cards */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{t('steering.dashboard.top_clients.title')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clientsToDisplay.map((client: any) => (
            <div key={client.id || client.nom} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                    {(() => {
                      const name = typeof client?.nom === 'string' ? client.nom : (client?.name || '?');
                      return name.substring(0, 2).toUpperCase();
                    })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{client.nom}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{client.secteur}</span>
                  </div>
                </div>
                <div className={`p-1.5 rounded-full ${client.risque === 'faible' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                  <ShieldCheckIcon className={`h-4 w-4 ${client.risque === 'faible' ? 'text-emerald-600' : 'text-orange-600'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 mb-1">{t('steering.dashboard.top_clients.business_volume')}</p>
                  <p className="font-bold text-slate-800">{formatCurrency(client.ca || 0)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 mb-1">{t('steering.dashboard.top_clients.performance')}</p>
                  <p className="font-bold text-emerald-600">+{client.croissance ?? 0}%</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(client)}
                  className="flex-1 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
                >
                  {t('steering.dashboard.top_clients.full_details')}
                </button>
                <button
                  onClick={() => handleContact(client)}
                  className="flex-1 py-2 text-sm font-semibold text-white bg-slate-900 border border-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  {t('steering.dashboard.top_clients.action')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation vers les autres sections */}
      <Card title={t('steering.dashboard.sections_access.title')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-blue-900 mb-3">{t('steering.dashboard.sections_access.financial_dashboard')}</h3>
            <p className="text-blue-700 mb-4">
              {t('steering.dashboard.sections_access.financial_dashboard_desc')}
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('steering.dashboard.sections_access.financial_dashboard_btn')}
            </a>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-green-900 mb-3">{t('steering.dashboard.sections_access.kpi')}</h3>
            <p className="text-green-700 mb-4">
              {t('steering.dashboard.sections_access.kpi_desc')}
            </p>
            <a
              href="/dashboard/analytics"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('steering.dashboard.sections_access.kpi_btn')}
            </a>
          </div>
        </div>
      </Card>

      {/* Bouton d'export */}
      <div className="flex justify-center">
        <button className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          {t('steering.dashboard.export')}
        </button>
      </div>

      {/* Modal Détails Complets */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={t('steering.dashboard.modals.details.title', { name: selectedClient?.nom })}
        size="xl"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-600 mr-2" />
                  {t('steering.dashboard.modals.details.financial_info')}
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t('steering.dashboard.metrics.revenue')}:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedClient.ca)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t('steering.dashboard.modals.details.revenue_share')}</span>
                    <span className="font-medium text-gray-900">{selectedClient.pourcentage}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t('steering.dashboard.top_clients.performance')}:</span>
                    <span className="font-medium text-green-600">+{selectedClient.croissance}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Secteur:</span>
                    <span className="font-medium text-gray-900">{selectedClient.secteur}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 text-gray-600 mr-2" />
                  {t('steering.dashboard.modals.details.performance')}
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t('steering.dashboard.modals.details.payment_delay')}</span>
                    <span className="font-medium text-gray-900">{selectedClient.metriques.delaiPaiement} {t('common.days')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t('steering.dashboard.modals.details.renewal_rate')}</span>
                    <span className="font-medium text-gray-900">{selectedClient.metriques.tauxRenouvellement}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t('steering.dashboard.modals.details.satisfaction')}</span>
                    <span className="font-medium text-gray-900">{selectedClient.metriques.satisfaction}/5</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{t('steering.dashboard.modals.details.recommendations')}</span>
                    <span className="font-medium text-gray-900">{selectedClient.metriques.recommandations}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raisons du TOP */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-gray-600 mr-2" />
                {t('steering.dashboard.modals.details.why_top')}
              </h4>
              <ul className="space-y-3">
                {selectedClient.raisonsTop.map((raison: string, index: number) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    {raison}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </Modal>

      {/* Modal Contacter */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={t('steering.dashboard.modals.contact.title', { name: selectedClient?.nom })}
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Informations de contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-600 mr-2" />
                  {t('steering.dashboard.modals.contact.main')}
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <PhoneIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedClient.telephone || '-'}</p>
                      <p className="text-sm text-gray-600">{t('steering.dashboard.modals.contact.phone_label')}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedClient.email || '-'}</p>
                      <p className="text-sm text-gray-600">{t('steering.dashboard.modals.contact.email_label')}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <MapPinIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedClient.adresse || '-'}</p>
                      <p className="text-sm text-gray-600">{t('steering.dashboard.modals.contact.address_label')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions de contact */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-600 mr-2" />
                {t('steering.dashboard.modals.contact.actions')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-200">
                  <EnvelopeIcon className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                  {t('steering.dashboard.modals.contact.send_email')}
                </button>
                <button className="p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-200">
                  <PhoneIcon className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                  {t('steering.dashboard.modals.contact.call')}
                </button>
                <button className="p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-200">
                  <CalendarIcon className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                  {t('steering.dashboard.modals.contact.schedule')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Analyse */}
      <Modal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        title={t('steering.dashboard.modals.analysis.title', { name: selectedClient?.nom })}
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Analyse de performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <ChartBarSquareIcon className="h-5 w-5 text-gray-600 mr-2" />
                  {t('steering.dashboard.modals.analysis.financial')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t('steering.dashboard.modals.analysis.profitability')}</span>
                    <div className="flex items-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-medium text-green-600">{t('steering.dashboard.modals.analysis.levels.excellent')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t('steering.dashboard.modals.analysis.stability')}</span>
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-medium text-green-600">{t('steering.dashboard.modals.analysis.levels.stable')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">{t('steering.dashboard.modals.analysis.potential')}</span>
                    <div className="flex items-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-gray-600 mr-1" />
                      <span className="font-medium text-gray-900">{t('steering.dashboard.modals.analysis.levels.high')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-gray-600 mr-2" />
                  {t('steering.dashboard.modals.analysis.recommendations')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    Augmenter le volume de commandes
                  </div>
                  <div className="flex items-start text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    Proposer des services premium
                  </div>
                  <div className="flex items-start text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    Renforcer la relation partenariale
                  </div>
                </div>
              </div>
            </div>

            {/* Métriques de risque */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 mr-2" />
                {t('steering.dashboard.modals.analysis.risk')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded border border-gray-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">{t('steering.dashboard.modals.analysis.levels.low')}</div>
                  <div className="text-sm text-gray-600">{t('steering.dashboard.modals.analysis.risks.financial')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded border border-gray-100">
                  <div className="text-2xl font-bold text-gray-600 mb-1">{t('steering.dashboard.modals.analysis.levels.medium')}</div>
                  <div className="text-sm text-gray-600">{t('steering.dashboard.modals.analysis.risks.commercial')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded border border-gray-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">{t('steering.dashboard.modals.analysis.levels.low')}</div>
                  <div className="text-sm text-gray-600">{t('steering.dashboard.modals.analysis.risks.operational')}</div>
                </div>
              </div>
            </div>

            {/* Actions recommandées */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-600 mr-2" />
                {t('steering.dashboard.modals.analysis.action_plan')}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">{t('steering.dashboard.modals.analysis.actions.schedule_meeting')}</span>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors border border-gray-300">
                    {t('steering.dashboard.modals.analysis.actions.btn_schedule')}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">{t('steering.dashboard.modals.analysis.actions.prepare_proposal')}</span>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors border border-gray-300">
                    {t('steering.dashboard.modals.analysis.actions.btn_create')}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">{t('steering.dashboard.modals.analysis.actions.analyze_competition')}</span>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors border border-gray-300">
                    {t('steering.dashboard.modals.analysis.actions.btn_analyze')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Statistiques;


