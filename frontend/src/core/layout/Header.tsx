import React from 'react';
import { UserCircleIcon, GlobeAltIcon, CurrencyDollarIcon, ArrowRightOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { UserRoleBadge } from '@shared/components/UserRoleBadge';


const Header: React.FC = () => {
  const { user, currentDevise, setCurrentDevise, setMobileMenuOpen } = useApp();

  const { currentLang, changeLang } = useTranslation();

  const handleLogout = () => {
    // Fonction de déconnexion
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
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

            <h2 className="text-2xl font-semibold text-slate-800">

            </h2>
          </div>

        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-1.5 border border-transparent hover:border-slate-300 transition-all">
            <GlobeAltIcon className="h-4 w-4 text-slate-500" />
            <select
              title="Sélectionner la langue"
              value={currentLang}
              onChange={(e) => changeLang(e.target.value as any)}
              className="bg-transparent border-none text-xs font-medium focus:outline-none text-slate-700 cursor-pointer appearance-none pr-6"
              style={{ backgroundImage: 'none' }}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-5 w-5 text-slate-500" />
            <select
              title="Sélectionner la devise"
              value={currentDevise}
              onChange={(e) => setCurrentDevise(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:outline-none text-slate-700"
            >
              <option value="DZD">DZD (دج)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="h-6 w-6 text-slate-500" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">{user?.nom}</span>
              <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
            <UserRoleBadge compact showIcon={false} />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Se déconnecter"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
