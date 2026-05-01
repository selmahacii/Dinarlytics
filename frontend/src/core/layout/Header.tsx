import React from 'react';
import { UserCircleIcon, GlobeAltIcon, CurrencyDollarIcon, ArrowRightOnRectangleIcon, Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { UserRoleBadge } from '@shared/components/UserRoleBadge';
import { LanguageSwitcher } from '@shared/components/UI/LanguageSwitcher';
import { useNavigate } from 'react-router-dom';


const Header: React.FC = () => {
  const { user, currentDevise, setCurrentDevise, setMobileMenuOpen } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem('app_user');
    window.location.href = '/login';
  };

  const handleAlertsClick = () => {
    navigate('/dashboard/alertes');
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors mr-2"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex items-center">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {t('nav.global_view')}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Dashboard Quick Links */}
          <div className="hidden md:flex items-center space-x-1 border-r border-slate-200 pr-6 mr-2">
            <button
               onClick={handleAlertsClick}
               className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all relative group"
               title={t('nav.alerts_risks')}
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1.5 flex h-4 w-4 shrink-0 transition-transform group-hover:scale-110">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[10px] font-bold text-white items-center justify-center">3</span>
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSwitcher />

            {/* Currency Selector */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <CurrencyDollarIcon className="h-4 w-4 text-slate-500" />
              <select
                title="Sélectionner la devise"
                value={currentDevise}
                onChange={(e) => setCurrentDevise(e.target.value as any)}
                className="bg-transparent border-none text-xs font-bold focus:outline-none text-slate-700 cursor-pointer"
              >
                <option value="DZD">DZD (دج)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            {/* User Info */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-sm font-bold text-slate-800 leading-none mb-0.5">{user?.nom}</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{user?.role}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group cursor-pointer hover:border-slate-300 transition-colors">
                 <UserCircleIcon className="h-6 w-6 text-slate-500 group-hover:text-slate-700" />
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title={t('common.logout')}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

