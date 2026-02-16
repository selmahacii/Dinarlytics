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
  CalculatorIcon
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
    // Rediriger vers la page du plan comptable ou ouvrir un modal
    navigate('/gestion-comptable');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Disclaimer amélioré */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Avertissement Important</h3>
            <p className="text-blue-800 text-sm leading-relaxed mb-3">
              Les paramètres de cette page affectent le comportement global de l'application. 
              Toute modification des paramètres comptables ou fiscaux peut impacter vos déclarations et rapports.
            </p>
            <div className="bg-white rounded-md p-3 border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Recommandation:</strong> Consultez votre expert-comptable avant de modifier les paramètres fiscaux ou comptables. 
                Les valeurs par défaut sont conformes à la législation algérienne en vigueur pour l'année {fiscalSettings.year}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile amélioré */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 p-6 -m-6 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <UserGroupIcon className="h-6 w-6 mr-2" />
            Profil Utilisateur
          </h2>
        </div>
        <div className="flex items-start space-x-6">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">
              {user?.nom.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">{user?.nom}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
              {user?.role}
            </span>
            </div>
            <p className="text-gray-600 mb-3">
              {user?.email}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Type d'entreprise</p>
                <p className="text-sm font-semibold text-gray-900">{user?.companyType?.toUpperCase() || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Segment</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{user?.segment || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Application Settings amélioré */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 p-6 -m-6 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <CogIcon className="h-6 w-6 mr-2" />
            Paramètres de l'Application
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-500" />
              Langue d'interface
            </label>
            <select
              value={currentLang}
              onChange={(e) => changeLang(e.target.value as any)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:border-gray-300"
            >
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">La langue sélectionnée s'applique à toute l'interface</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-500" />
              Devise par défaut
            </label>
            <select
              value={currentDevise}
              onChange={(e) => setCurrentDevise(e.target.value as any)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:border-gray-300"
            >
              <option value="DZD">Dinar Algérien (DZD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">Dollar US (USD)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Utilisée pour l'affichage des montants dans toute l'application</p>
          </div>
        </div>
      </Card>

      {/* Roles and Permissions amélioré */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 p-6 -m-6 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2" />
            Gestion des Rôles et Permissions
          </h2>
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white text-slate-800 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Configurer Rôles
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <div 
              key={index} 
              className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{role.nom}</h3>
                </div>
                <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                  {role.utilisateurs} utilisateur{role.utilisateurs > 1 ? 's' : ''}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{role.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Permissions:</p>
                <ul className="text-xs text-gray-600 space-y-2">
                  {role.permissions.map((permission, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{permission}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Configuration amélioré */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 p-6 -m-6 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <CogIcon className="h-6 w-6 mr-2" />
            Configuration Système
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Paramètres Comptables */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Paramètres Comptables</h4>
            </div>
            
          <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Plan comptable:</label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handlePlanComptableChange('algerien')}
                    className={`px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                      planComptable === 'algerien'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Plan Comptable Algérien 2010</span>
                      {planComptable === 'algerien' && (
                        <CheckIcon className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => handlePlanComptableChange('international')}
                    className={`px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                      planComptable === 'international'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Plan Comptable International (IFRS/GAAP)</span>
                      {planComptable === 'international' && (
                        <CheckIcon className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 leading-relaxed">
                  {planComptable === 'algerien' 
                    ? 'Conforme aux normes comptables algériennes' 
                    : 'Standards comptables internationaux IFRS/GAAP'
                  }
                </p>
              </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <label className="block text-sm font-semibold text-gray-700">Exercice fiscal:</label>
                  </div>
                  {!isEditingFiscalYear ? (
                    <button
                      onClick={() => setIsEditingFiscalYear(true)}
                      className="flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex space-x-1">
                      <button
                        onClick={handleSaveFiscalYear}
                        className="flex items-center px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      >
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setIsEditingFiscalYear(false)}
                        className="flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      >
                        <XMarkIcon className="h-3 w-3 mr-1" />
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Date de début</label>
                    <input
                      type="date"
                      value={fiscalYear.start}
                      onChange={(e) => handleFiscalYearChange(e.target.value, fiscalYear.end)}
                      disabled={!isEditingFiscalYear}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingFiscalYear ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={fiscalYear.end}
                      onChange={(e) => handleFiscalYearChange(fiscalYear.start, e.target.value)}
                      disabled={!isEditingFiscalYear}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingFiscalYear ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                      }`}
                    />
                  </div>
                </div>
                {!isEditingFiscalYear && (
                  <p className="text-xs text-gray-500 mt-2">
                    Période: {new Date(fiscalYear.start).toLocaleDateString('fr-FR')} - {new Date(fiscalYear.end).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Norme comptable:</label>
                <p className="text-sm font-medium text-gray-900">
                  {planComptable === 'algerien' ? 'PCA (Plan Comptable Algérien)' : 'IFRS/GAAP'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button 
                  onClick={handleViewPlanComptable}
                  className="flex items-center w-full px-4 py-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium border-2 border-blue-200 hover:border-blue-300"
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Consulter le Plan Comptable
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Accédez à la liste complète des comptes du plan comptable {planComptable === 'algerien' ? 'algérien' : 'international'}
                </p>
              </div>
            </div>
          </div>

          {/* Paramètres Fiscaux améliorés et éditables */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CalculatorIcon className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">Paramètres Fiscaux</h4>
              </div>
              {!isEditingFiscal ? (
                <button
                  onClick={() => setIsEditingFiscal(true)}
                  className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Modifier
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveFiscal}
                    className="flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setIsEditingFiscal(false)}
                    className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Annuler
                  </button>
                </div>
              )}
          </div>

          <div className="space-y-4">
              {/* Badge indiquant le plan comptable actif */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800">Plan comptable actif:</span>
                  <span className="text-sm font-bold text-blue-900">
                    {planComptable === 'algerien' ? 'PCA (Plan Comptable Algérien)' : 'IFRS/GAAP'}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Les taux fiscaux sont adaptés selon le plan comptable sélectionné
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {planComptable === 'algerien' ? 'Taux IBS (Impôt sur les Bénéfices):' : 'Corporate Tax:'}
                </label>
                {isEditingFiscal ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={fiscalSettings.ibs}
                      onChange={(e) => setFiscalSettings({...fiscalSettings, ibs: parseFloat(e.target.value)})}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-sm text-gray-600">%</span>
                    <span className="text-xs text-gray-500">({fiscalSettings.year})</span>
                  </div>
                ) : (
              <div>
                    <p className="text-sm font-medium text-gray-900">{fiscalSettings.ibs}% ({fiscalSettings.year})</p>
                    {planComptable === 'international' && fiscalRates?.autresTaxes && (
                      <p className="text-xs text-gray-500 mt-1">
                        Autres taxes: {Object.entries(fiscalRates.autresTaxes).map(([key, val]) => `${key} ${(val * 100).toFixed(1)}%`).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Taux TVA normal:</label>
                {isEditingFiscal ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={fiscalSettings.tvaNormal}
                      onChange={(e) => setFiscalSettings({...fiscalSettings, tvaNormal: parseFloat(e.target.value)})}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                ) : (
              <div>
                    <p className="text-sm font-medium text-gray-900">{fiscalSettings.tvaNormal}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {planComptable === 'algerien' 
                        ? 'Conforme à la législation algérienne' 
                        : 'Conforme aux normes IFRS/GAAP'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Taux TVA réduit:</label>
                {isEditingFiscal ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={fiscalSettings.tvaReduit}
                      onChange={(e) => setFiscalSettings({...fiscalSettings, tvaReduit: parseFloat(e.target.value)})}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                ) : (
              <div>
                    <p className="text-sm font-medium text-gray-900">{fiscalSettings.tvaReduit}%</p>
                    {fiscalRates?.tvaIntermediaire && planComptable === 'international' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Taux intermédiaire: {(fiscalRates.tvaIntermediaire * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Afficher les autres taxes selon le plan comptable */}
              {fiscalRates?.autresTaxes && Object.keys(fiscalRates.autresTaxes).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {planComptable === 'algerien' ? 'Autres taxes (Algérie):' : 'Autres taxes (International):'}
                  </label>
                  <div className="space-y-2">
                    {Object.entries(fiscalRates.autresTaxes).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{key}:</span>
                        <span className="text-sm font-medium text-gray-900">{(value * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isEditingFiscal && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    <strong>Attention:</strong> La modification des taux fiscaux affectera tous les calculs futurs. 
                    Assurez-vous que ces valeurs sont conformes à la législation en vigueur.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Role Configuration Modal amélioré */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Configuration des Rôles et Permissions"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Créez ou modifiez un rôle personnalisé en sélectionnant les permissions appropriées. 
              Les rôles définissent les accès et actions autorisées pour chaque utilisateur.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du rôle
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ex: Expert-comptable, Responsable financier, etc."
            />
            <p className="text-xs text-gray-500 mt-1">Choisissez un nom descriptif pour ce rôle</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description du rôle
            </label>
            <textarea
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              rows={3}
              placeholder="Décrivez les responsabilités et le périmètre d'action de ce rôle..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Permissions disponibles
            </label>
            <div className="border-2 border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <label key={index} className="flex items-start p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                    <div className="ml-3 flex-1">
                      <span className="text-sm font-medium text-gray-700 block">{permission.name}</span>
                      <span className="text-xs text-gray-500">{permission.category}</span>
                    </div>
                </label>
              ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Cochez les permissions que vous souhaitez attribuer à ce rôle</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
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


