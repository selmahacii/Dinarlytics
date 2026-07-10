import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { User } from '@/types';
import currencyIcon from '@shared/assets/currency.png';
import api from '@/services/api';
import i18n from '@/i18n/config';

interface DemoUserCredentials {
  id: string;
  email: string;
  password: string;
  companyName: string;
  companyType?: string;
  segment?: string;
  prenom: string;
  nom: string;
  role: string;
  role_display?: string;
  description: string;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const { setUser } = useApp();
  const { t, currentLang, changeLang } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [showDemoUsers, setShowDemoUsers] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLanguageChange = (lng: string) => {
    changeLang(lng as any);
    setShowLangMenu(false);
  };

  const getLangName = (lng: string) => {
    switch (lng) {
      case 'fr': return 'Français';
      case 'en': return 'English';
      case 'ar': return 'العربية';
      default: return 'English';
    }
  };

  // Données de démonstration dynamiques depuis le backend
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [allDemoUserCreds, setAllDemoUserCreds] = useState<DemoUserCredentials[]>([]);
  const [loadingDemoUsers, setLoadingDemoUsers] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Charger les utilisateurs de démo depuis le backend
  React.useEffect(() => {
    setLoadingDemoUsers(true);
    api.auth.getDemoUsers()
      .then(data => {
        setDemoUsers(data.users || []);
        setAllDemoUserCreds(data.credentials || []);
      })
      .catch(() => setLoginError(t('auth.login.demo_load_error')))
      .finally(() => setLoadingDemoUsers(false));
  }, [t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  const handleDemoUserClick = async (demoUser: DemoUserCredentials) => {
    setFormData({
      email: demoUser.email,
      password: demoUser.password,
      rememberMe: false
    });
    setIsLoading(true);
    setError(null);
    try {
      // Appel API pour login via api.ts
      const response = await api.auth.login(demoUser.email, demoUser.password);
      const apiUser = response.user as any;
      const user = {
        ...apiUser,
        role: (apiUser.roles && apiUser.roles.length > 0 ? apiUser.roles[0] : apiUser.role || demoUser.role || 'utilisateur') as any,
        nom: apiUser.last_name || apiUser.nom || demoUser.nom || '',
        prenom: apiUser.first_name || apiUser.prenom || demoUser.prenom || '',
        companyId: apiUser.company_id || apiUser.companyId || '',
        companyType: apiUser.companyType || demoUser.companyType,
        segment: apiUser.segment || demoUser.segment,
        role_display: apiUser.role_display || demoUser.role_display,
        avatar: '',
        permissions: apiUser.permissions || [],
        email: demoUser.email,
        accessLevel: apiUser.accessLevel || (demoUser.segment === 'enterprise' || demoUser.segment === 'large' ? 'enterprise' : demoUser.segment === 'medium' || demoUser.segment === 'small' ? 'professional' : 'starter')
      } as User;
      setUser(user);
      setShowSuccess(true);
      setTimeout(() => {
        if (user.companyType === 'boutique' || (user.nom && user.nom.includes('Boutique'))) {
          navigate('/dashboard/boutique');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err) {
      setError(t('auth.login.error_generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, email: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const getUsersByCompany = () => {
    const grouped: Record<string, DemoUserCredentials[]> = {};
    allDemoUserCreds.forEach(user => {
      if (!grouped[user.companyName]) {
        grouped[user.companyName] = [];
      }
      grouped[user.companyName].push(user);
    });
    return grouped;
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      'admin': '👑',
      'gerant': '👔', // Propriétaire
      'dg': '🏛️', // CEO
      'daf': '💰', // CFO
      'commercial_director': '🤝', // Directeur Commercial
      'hr_director': '👥', // DRH
      'logistics_director': '🚚', // Directeur Logistique
      'production_director': '🏭', // Directeur Prod
      'comptable_senior': '📑', // Chef Comptable
      'comptable': '📊',
      'controleur_gestion': '📉', // Contrôleur
      'auditeur': '🔍',
      'commercial': '💼', // Vendeur itinérant
      'vendeur': '🛍️', // Vendeur boutique
      'magasinier': '📦',
      'tresorier': '💵',
      'manager': '🎯',
      'utilisateur': '👤'
    };
    return icons[role] || '👤';
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-800 border-purple-300',
      'gerant': 'bg-blue-100 text-blue-800 border-blue-300',

      // C-Level & Directeurs
      'dg': 'bg-slate-800 text-white border-slate-600',
      'daf': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'commercial_director': 'bg-blue-600 text-white border-blue-500',
      'hr_director': 'bg-pink-100 text-pink-800 border-pink-300',
      'logistics_director': 'bg-orange-100 text-orange-800 border-orange-300',
      'production_director': 'bg-zinc-100 text-zinc-800 border-zinc-300',

      // Finance & Gestion
      'comptable_senior': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'comptable': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'controleur_gestion': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'auditeur': 'bg-amber-100 text-amber-800 border-amber-300',
      'tresorier': 'bg-green-100 text-green-800 border-green-300',

      // Ops
      'commercial': 'bg-blue-50 text-blue-700 border-blue-200',
      'vendeur': 'bg-pink-50 text-pink-700 border-pink-200',
      'magasinier': 'bg-yellow-100 text-yellow-800 border-yellow-300',

      'manager': 'bg-teal-100 text-teal-800 border-teal-300',
      'utilisateur': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Appel API pour login via api.ts
      const response = await api.auth.login(formData.email, formData.password);
      const apiUser = response.user as any;
      const user = {
        ...apiUser,
        role: (apiUser.roles && apiUser.roles.length > 0 ? apiUser.roles[0] : apiUser.role || 'utilisateur') as any,
        nom: apiUser.last_name || apiUser.nom || '',
        prenom: apiUser.first_name || apiUser.prenom || '',
        companyId: apiUser.company_id || apiUser.companyId || '',
        companyType: apiUser.companyType || 'eurl',
        segment: apiUser.segment || 'micro',
        role_display: apiUser.role_display,
        avatar: '',
        permissions: apiUser.permissions || [],
        accessLevel: apiUser.accessLevel || (apiUser.segment === 'enterprise' || apiUser.segment === 'large' ? 'enterprise' : apiUser.segment === 'medium' || apiUser.segment === 'small' ? 'professional' : 'starter')
      } as User;
      setUser(user);
      setShowSuccess(true);
      setTimeout(() => {
        if (user.companyType === 'boutique' || (user.nom && user.nom.includes('Boutique'))) {
          navigate('/dashboard/boutique');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err) {
      setError(t('auth.login.error_incorrect'));
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (segment: string = 'micro') => {
    switch (segment) {
      case 'micro': return 'bg-green-100 text-green-800 border-green-300';
      case 'small': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medium': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'large': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'enterprise': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getCompanyTypeLabel = (companyType: string = 'eurl') => {
    switch (companyType) {
      case 'eurl': return 'EURL';
      case 'sarl': return 'SARL';
      case 'spa': return 'SPA';
      default: return 'EURL';
    }
  };

  const formatRevenue = (revenue: number = 0) => {
    if (revenue >= 1000000000) {
      return `${(revenue / 1000000000).toFixed(1)} Mds DA`;
    } else if (revenue >= 1000000) {
      return `${(revenue / 1000000).toFixed(1)}M DA`;
    } else {
      return `${(revenue / 1000).toFixed(0)}K DA`;
    }
  };

  const getSegmentLabel = (segment: string = 'micro') => {
    switch (segment) {
      case 'micro': return t('segments.micro');
      case 'small': return t('segments.small');
      case 'medium': return t('segments.medium');
      case 'large': return t('segments.large');
      case 'enterprise': return t('segments.enterprise');
  default: return t('segments.micro');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 font-outfit relative">
      {/* Language Switcher */}
      <div className="absolute top-6 end-6 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all text-sm font-bold text-slate-700"
          >
            <span className="uppercase">{currentLang}</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {showLangMenu && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-slideDown">
              {['en', 'fr', 'ar'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => handleLanguageChange(lng)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors ${currentLang === lng ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                >
                  {getLangName(lng)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Professional Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(30,41,59,0.02),transparent_50%)]"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-slate-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gray-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* Title Section - Above Container */}
      <div className="relative w-full max-w-lg mx-auto mb-8 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
            <img src={currencyIcon} alt={t('auth.login.title')} className="w-12 h-12 bg-white rounded-lg p-2" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight">{t('auth.login.title')}</h1>
            <p className="text-slate-600 text-lg lg:text-xl font-medium">{t('auth.login.subtitle')}</p>
          </div>
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full mx-auto"></div>
      </div>

      {/* Centralized Container */}
      <div className="relative w-full max-w-lg mx-auto space-y-6">
        {/* Login Form */}
        <div className="bg-white/98 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/60 p-10">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">D</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{t('auth.login.title')}</h1>
                <p className="text-slate-600 font-medium">{t('auth.login.subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">{t('auth.login.card_title')}</h2>
            <p className="text-slate-600 text-lg mb-6">{t('auth.login.card_subtitle')}</p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-4 shadow-sm">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
              <span className="text-emerald-800 font-medium">{t('auth.login.success')}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-4 shadow-sm">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                {t('auth.login.email_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full ps-12 pe-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg shadow-sm"
                  placeholder={t('auth.login.email_placeholder')}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                {t('auth.login.password_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full ps-12 pe-14 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg shadow-sm"
                  placeholder={t('auth.login.password_placeholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 pe-4 flex items-center outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-slate-500 hover:text-slate-700 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-slate-500 hover:text-slate-700 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-slate-600 focus:ring-slate-500 border-gray-300 rounded-lg"
                />
                <label htmlFor="rememberMe" className="ms-3 block text-sm font-medium text-slate-700">
                  {t('auth.login.remember_me')}
                </label>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                {t('auth.login.forgot_password')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold rounded-2xl hover:from-slate-800 hover:to-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white me-3"></div>
                  <span className="text-lg">{t('auth.login.submitting_btn')}</span>
                </>
              ) : (
                <>
                  <span className="text-lg">{t('auth.login.submit_btn')}</span>
                  <ArrowRightIcon className="h-6 w-6 ms-3" />
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-10 text-center space-y-3">
            <p className="text-sm text-slate-600">
              {t('auth.login.no_account')}{' '}
              <button className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
                {t('auth.login.contact_admin')}
              </button>
            </p>

          </div>

          {/* Security Notice */}

        </div>

        {/* Demo Users Credentials - Collapsible */}
        <div className="bg-white/98 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden">
          {/* Header - Clickable to toggle */}
          <button
            onClick={() => setShowDemoUsers(!showDemoUsers)}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold text-slate-800 mb-1">{t('auth.login.demo_title')}</h3>
                <p className="text-slate-600 text-sm">{t('auth.login.demo_subtitle')}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                <p className="text-sm font-semibold text-emerald-800">
                  🔑 {t('auth.login.password_demo_label')} <span className="font-mono">demo123</span>
                </p>
              </div>
            </div>
            <div className="ml-4">
              {showDemoUsers ? (
                <ChevronUpIcon className="h-6 w-6 text-slate-600" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-slate-600" />
              )}
            </div>
          </button>

          {/* Collapsible Content */}
          {showDemoUsers && (
            <div className="px-8 pb-8">
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {Object.entries(getUsersByCompany()).map(([companyName, users]) => (
                  <div key={companyName} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedCompany(expandedCompany === companyName ? null : companyName)}
                      className="w-full p-4 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <BuildingOfficeIcon className="h-5 w-5 text-slate-600" />
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800">{companyName}</h4>
                          <p className="text-xs text-slate-500">{users.length} {users.length > 1 ? t('auth.login.users_suffix_plural') : t('auth.login.users_suffix')}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getRoleColor(users[0].segment || 'micro')}`}>
                        {(users[0].segment || 'micro').toUpperCase()}
                      </div>
                    </button>

                    {expandedCompany === companyName && (
                      <div className="p-4 space-y-2 bg-white">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleDemoUserClick(user)}
                            className="p-3 rounded-lg border border-gray-200 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <span className="text-2xl">{getRoleIcon(user.role)}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-slate-800 text-sm">
                                      {user.prenom} {user.nom}
                                    </p>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                      {user.role}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-xs text-slate-600 font-mono">{user.email}</p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(user.email, user.email);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded"
                                      title={t('auth.login.copy_email')}
                                    >
                                      {copiedEmail === user.email ? (
                                        <CheckIcon className="h-3 w-3 text-emerald-600" />
                                      ) : (
                                        <ClipboardDocumentIcon className="h-3 w-3 text-slate-500" />
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">{user.description}</p>
                                </div>
                              </div>
                              <ArrowRightIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;



