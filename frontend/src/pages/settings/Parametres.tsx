import React, { useState } from 'react';
import {
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  InformationCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

const Parametres: React.FC = () => {
  const { user, currentDevise, setCurrentDevise, planComptable, setPlanComptable, fiscalRates } = useApp();
  const { t, currentLang, changeLang } = useTranslation();
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isEditingFiscal, setIsEditingFiscal] = useState(false);
  const [isEditingFiscalYear, setIsEditingFiscalYear] = useState(false);

  // Synchroniser les paramètres fiscaux avec les taux du contexte selon le plan comptable
  const [fiscalSettings, setFiscalSettings] = useState({
    ibs: planComptable === 'algerien' ? (fiscalRates?.ibs ? fiscalRates.ibs * 100 : 19) : (fiscalRates?.corporateTax ? fiscalRates.corporateTax * 100 : 19),
    tvaNormal: fiscalRates?.tvaNormal ? fiscalRates.tvaNormal * 100 : 19,
    tvaReduit: fiscalRates?.tvaReduit ? fiscalRates.tvaReduit * 100 : 9,
    year: 2025
  });

  // Mettre à jour les paramètres fiscaux quand le plan comptable change
  React.useEffect(() => {
    if (fiscalRates) {
      setFiscalSettings({
        ibs: planComptable === 'algerien'
          ? (fiscalRates.ibs ? fiscalRates.ibs * 100 : 19)
          : (fiscalRates.corporateTax ? fiscalRates.corporateTax * 100 : 19),
        tvaNormal: fiscalRates.tvaNormal ? fiscalRates.tvaNormal * 100 : 19,
        tvaReduit: fiscalRates.tvaReduit ? fiscalRates.tvaReduit * 100 : 9,
        year: 2025
      });
    }
  }, [planComptable, fiscalRates]);
  const [fiscalYear, setFiscalYear] = useState({
    start: '2025-01-01',
    end: '2025-12-31'
  });

  // Charger les paramètres depuis localStorage au montage
  React.useEffect(() => {
    const savedFiscalYear = localStorage.getItem('fiscalYear');
    if (savedFiscalYear) {
      try {
        const parsed = JSON.parse(savedFiscalYear);
        setFiscalYear(parsed);
      } catch (e) {
        console.error('Error loading fiscal year', e);
      }
    }

    const savedFiscalSettings = localStorage.getItem('fiscalSettings');
    if (savedFiscalSettings) {
      try {
        const parsed = JSON.parse(savedFiscalSettings);
        setFiscalSettings(parsed);
      } catch (e) {
        console.error('Error loading fiscal settings', e);
      }
    }
  }, []);

  // Sauvegarder les changements (le contexte s'occupe déjà de localStorage)
  const handlePlanComptableChange = (plan: 'algerien' | 'international') => {
    setPlanComptable(plan);
  };

  const handleFiscalYearChange = (start: string, end: string) => {
    const newFiscalYear = { start, end };
    setFiscalYear(newFiscalYear);
    localStorage.setItem('fiscalYear', JSON.stringify(newFiscalYear));
  };

  const handleSaveFiscalYear = () => {
    localStorage.setItem('fiscalYear', JSON.stringify(fiscalYear));
    setIsEditingFiscalYear(false);
  };

  const roles = [
    {
      nom: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: ['Gestion utilisateurs', 'Configuration système', 'Toutes opérations comptables', 'Exports'],
      utilisateurs: 1
    },
    {
      nom: 'Comptable',
      description: 'Gestion des opérations comptables et factures',
      permissions: ['Création factures', 'Saisie écritures', 'Consultation rapports', 'Exports limités'],
      utilisateurs: 2
    },
    {
      nom: 'Utilisateur',
      description: 'Consultation des données et rapports',
      permissions: ['Consultation données', 'Visualisation rapports'],
      utilisateurs: 5
    }
  ];

  const handleSaveFiscal = () => {
    localStorage.setItem('fiscalSettings', JSON.stringify(fiscalSettings));
    setIsEditingFiscal(false);
  };

  const handleViewPlanComptable = () => {
    navigate('/gestion-comptable');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ══════════════ HEADER & WARNING ══════════════ */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-700 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-900/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-8">
            <div className="p-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/20">
              <CogIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Configuration Système</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Gérez les paramètres globaux, la fiscalité et les accès de l'organisation</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 border-l-8 border-l-slate-900">
            <div className="flex items-start gap-4">
              <InformationCircleIcon className="h-6 w-6 text-slate-900 dark:text-white shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2">Avertissement Important</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                  Les paramètres de cette page affectent le comportement global de l'application.
                  Toute modification des paramètres comptables ou fiscaux peut impacter vos déclarations et rapports financiers.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommandation :</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Consultez votre expert-comptable avant de modifier les paramètres 2025.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ══════════════ PROFIL UTILISATEUR ══════════════ */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">Profil Utilisateur</h3>
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 relative group cursor-pointer">
                <span className="text-white font-black text-3xl font-mono">D</span>
                <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <PencilIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Demo Admin</h4>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1">admin@demo.com</p>

              <div className="mt-8 w-full space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entreprise</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase">SPA</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Segment</span>
                  <span className="text-xs font-black text-slate-400 uppercase font-mono">N/A</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">Préférences Interface</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Langue d'interface</label>
                <select
                  value={currentLang}
                  onChange={(e) => changeLang(e.target.value as any)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                >
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-3 tracking-tight">Affecte l'ensemble de l'interface ERP</p>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Devise par défaut</label>
                <select
                  value={currentDevise}
                  onChange={(e) => setCurrentDevise(e.target.value as any)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                >
                  <option value="DZD">Dinar Algérien (DZD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                </select>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-3 tracking-tight">Utilisée pour l'affichage des montants</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ══════════════ SYSTEM CONFIGURATION & PERMISSIONS ══════════════ */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-600">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                Rôles & Permissions
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
              >
                Configurer Rôles
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map((role, index) => (
                <div key={index} className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-slate-900 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{role.nom}</h4>
                    <span className="text-[9px] font-black px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg uppercase">
                      {role.utilisateurs} UTILISATEURS
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed line-clamp-2">{role.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((p, i) => (
                      <span key={i} className="text-[8px] font-black text-slate-400 uppercase bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3 mb-10">
              <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-600">
                <BookOpenIcon className="h-6 w-6" />
              </div>
              Paramètres Comptables
            </h3>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Système de Référence</label>
                  <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => handlePlanComptableChange('algerien')}
                      className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${planComptable === 'algerien'
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      PCA 2010
                    </button>
                    <button
                      onClick={() => handlePlanComptableChange('international')}
                      className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${planComptable === 'international'
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      IFRS / GAAP
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Norme en vigueur</label>
                  <div className="py-3.5 px-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">
                      {planComptable === 'algerien' ? 'PCA Algérien' : 'International'}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-900 animate-pulse"></div>
                      <span className="text-[9px] font-black text-slate-400 uppercase">Certifié Audit</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-slate-400" />
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Exercice Fiscal 2025</h4>
                  </div>
                  {!isEditingFiscalYear ? (
                    <button onClick={() => setIsEditingFiscalYear(true)} className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-900 transition-colors">Modifier</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleSaveFiscalYear} className="text-[10px] font-black text-slate-900 uppercase">Valider</button>
                      <button onClick={() => setIsEditingFiscalYear(false)} className="text-[10px] font-black text-rose-500 uppercase">Annuler</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ouverture</label>
                    <input
                      type="date"
                      value={fiscalYear.start}
                      disabled={!isEditingFiscalYear}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Clôture</label>
                    <input
                      type="date"
                      value={fiscalYear.end}
                      disabled={!isEditingFiscalYear}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Plan Comptable Complet</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Accédez à la base de données optimisée des comptes PCA</p>
                </div>
                <button
                  onClick={handleViewPlanComptable}
                  className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-900 dark:border-white text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                >
                  Ouvrir le Plan
                </button>
              </div>
            </div>
          </Card>

          {/* ══════════════ PARAMÈTRES FISCAUX ══════════════ */}
          <Card className="p-10 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-600 shadow-sm">
                  <CalculatorIcon className="h-6 w-6" />
                </div>
                Matrice Fiscale 2025
              </h3>
              {!isEditingFiscal ? (
                <button
                  onClick={() => setIsEditingFiscal(true)}
                  className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
                >
                  Editer Taux
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveFiscal} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Enregistrer</button>
                  <button onClick={() => setIsEditingFiscal(false)} className="px-6 py-3 bg-white text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Fermer</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: planComptable === 'algerien' ? 'IBS (Impôt Bénéfices)' : 'Corporate Tax', val: fiscalSettings.ibs, unit: '%' },
                { label: 'TVA Taux Normal', val: fiscalSettings.tvaNormal, unit: '%' },
                { label: 'TVA Taux Réduit', val: fiscalSettings.tvaReduit, unit: '%' }
              ].map((tax, i) => (
                <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{tax.label}</p>
                  {isEditingFiscal ? (
                    <input
                      type="number"
                      value={tax.val}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none p-0 text-2xl font-black font-mono text-slate-900 dark:text-white focus:ring-0"
                    />
                  ) : (
                    <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{tax.val}{tax.unit}</p>
                  )}
                  <div className="mt-4 h-1 w-12 bg-slate-100 dark:bg-slate-700 rounded-full group-hover:w-full transition-all duration-700"></div>
                </div>
              ))}
            </div>

            {isEditingFiscal && (
              <div className="mt-8 p-6 bg-slate-900 text-white rounded-[2rem] flex items-start gap-4 shadow-2xl">
                <ExclamationTriangleIcon className="h-6 w-6 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Contrôle de Cohérence</p>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Toute modification de la matrice fiscale impacte directement les audits de conformité de l'exercice 2025.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Role Configuration Modal amélioré */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Configuration des Rôles et Permissions"
        size="lg"
      >
        <div className="space-y-8">
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 border-l-8 border-l-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Créez ou modifiez un rôle personnalisé en sélectionnant les permissions appropriées.
              Les rôles définissent les accès et actions autorisées pour chaque utilisateur au sein du système ERP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nom du rôle</label>
              <input
                type="text"
                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 transition-all"
                placeholder="Ex: Expert-comptable, Responsable financier..."
              />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight px-1">Choisissez un nom descriptif pour ce rôle</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description du rôle</label>
              <input
                type="text"
                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 transition-all"
                placeholder="Périmètre d'action du rôle..."
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-4 block">Permissions disponibles</label>
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Gestion clients', category: 'CRM' },
                  { name: 'Gestion fournisseurs', category: 'Achats' },
                  { name: 'Création factures', category: 'Facturation' },
                  { name: 'Validation factures', category: 'Facturation' },
                  { name: 'Consultation rapports', category: 'Rapports' },
                  { name: 'Export données', category: 'Rapports' },
                  { name: 'Paramètres système', category: 'Administration' },
                  { name: 'Gestion utilisateurs', category: 'Administration' },
                  { name: 'Saisie écritures comptables', category: 'Comptabilité' },
                  { name: 'Validation écritures', category: 'Comptabilité' },
                  { name: 'Clôture comptable', category: 'Comptabilité' },
                  { name: 'Gestion stocks', category: 'Inventaire' }
                ].map((permission, index) => (
                  <label key={index} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-slate-900 transition-all cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded-lg border-2 border-slate-200 text-slate-900 focus:ring-slate-900 transition-all"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight block">{permission.name}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{permission.category}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-4 px-1">Cochez les permissions que vous souhaitez attribuer à ce rôle</p>
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all"
            >
              Sauvegarder Rôle
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Parametres;


