import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  TruckIcon,
  HomeIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  EyeIcon,
  CubeIcon,
  CalendarIcon,
  ChartPieIcon,
  BellIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import { useApp } from '../../context/AppContext';
import { boutiqueElBarakaData } from '../../data/mockData';
// currency icon not used; keep imports minimal to avoid unused warnings

const BoutiqueDashboard: React.FC = () => {
  const { user, companyData } = useApp();
  const navigate = useNavigate();
  const { setUser } = useApp();

  if (!user || !companyData) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Informations de l'entreprise (automatiquement remplies)
  const entrepriseInfo = {
    nom: user?.nom || 'Boutique El Baraka',
    secteur: user?.secteur || 'Commerce de détail',
    adresse: user?.adresse || 'Rue, ville',
    anneeCreation: user?.anneeCreation || 2018,
    licenceCommerciale: user?.licenceCommerciale || '18/00123456',
    nif: user?.nif || '000016001234567',
    statut: user?.statut || 'Actif'
  };

  const formatCurrency = (amount: number) => AdaptiveDataGenerator.formatCurrency(amount);
  
  const caduMois = companyData.revenueMonth;
  const resultatNet = Math.round(caduMois * companyData.profitMargin / 100);
  const soldeTresorerie = companyData.cashBalance;
  const ventesAujourdhui = Math.round(caduMois / 30); // Estimation ventes journalières
  const articlesEnStock = 127; // Stock actuel
  const ventesHier = Math.round(ventesAujourdhui * 0.85); // Ventes d'hier
  const clientsDuJour = Math.floor(Math.random() * 25) + 15; // Clients du jour
  const panierMoyen = Math.round(ventesAujourdhui / clientsDuJour); // Panier moyen
  const produitPopulaire = "Parfum Oud Luxury"; // Produit le plus vendu
  const heuresPeak = "14h-17h"; // Heures de pointe
  
  // Initialisation automatique des informations de l'entreprise
  useEffect(() => {
    if (!user) return;
    
    // Vérifier si les informations doivent être mises à jour
    const needsUpdate = !user.nom || user.nom === 'Ma Boutique' || 
                       !user.adresse || user.adresse === 'Adresse non renseignée' ||
                       !user.licenceCommerciale || user.licenceCommerciale === 'N/A' ||
                       !user.nif || user.nif === 'N/A';
    
    if (needsUpdate) {
      const updated = {
        ...user,
        nom: user.nom || 'Boutique El Baraka',
        secteur: user.secteur || 'Commerce de détail',
        adresse: user.adresse || 'Rue, ville',
        anneeCreation: user.anneeCreation || 2018,
        licenceCommerciale: user.licenceCommerciale || '18/00123456',
        nif: user.nif || '000016001234567',
        statut: user.statut || 'Actif'
      };
      try {
        window.localStorage.setItem('app_user', JSON.stringify(updated));
      } catch {}
      setUser(updated);
    }
  }, [user, setUser]);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        
        {/* Header Professionnel avec Informations Légales - Texte Noir Visible */}
        <Card className="p-4 sm:p-6 lg:p-8 bg-white border-2 border-slate-300 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="p-3 sm:p-4 bg-slate-100 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0 border-2 border-slate-300">
                <BuildingOfficeIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-800" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 truncate text-black">{entrepriseInfo.nom}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center text-black text-xs sm:text-sm space-y-1 sm:space-y-0 sm:space-x-4 font-medium">
                  <span className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {entrepriseInfo.secteur}
                  </span>
                  <span className="hidden sm:inline-block text-black">•</span>
                  <span>Fondée en {entrepriseInfo.anneeCreation}</span>
                  <span className="hidden sm:inline-block text-black">•</span>
                  <span>{entrepriseInfo.adresse}</span>
                </div>
                <div className="mt-3 pt-3 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-black font-semibold">
                  <span className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <strong className="text-black">RC:</strong> <span className="text-black">{entrepriseInfo.licenceCommerciale}</span>
                  </span>
                  <span className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <strong className="text-black">NIF:</strong> <span className="text-black">{entrepriseInfo.nif}</span>
                  </span>
                  <span className="bg-green-50 p-2 rounded-lg border border-green-200 flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <strong className="text-black">Statut:</strong> <span className="text-green-700 font-bold ml-1">{entrepriseInfo.statut}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-slate-100 rounded-xl p-3 sm:p-4 border-2 border-slate-300 shadow-md">
                <p className="text-black text-xs sm:text-sm font-bold mb-1">Aujourd'hui</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-black">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* KPIs Principaux - Design Épuré */}
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* CA du Mois */}
          <Card className="p-4 sm:p-6 bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 sm:mb-4">
              <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:items-start">
                <div className="p-2.5 sm:p-3 bg-slate-700 rounded-xl shadow-lg flex-shrink-0">
                  <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <p className="text-xs font-bold text-black uppercase tracking-wide mb-1">CA du Mois</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-black truncate">{formatCurrency(caduMois)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t-2 border-slate-300">
              <span className="text-xs sm:text-sm text-black font-bold">Croissance</span>
              <div className="flex items-center space-x-1">
                <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                <span className="text-xs sm:text-sm font-bold text-black">+{companyData.revenueGrowth.toFixed(1)}%</span>
              </div>
            </div>
          </Card>

          {/* Ventes Aujourd'hui */}
          <Card className="p-4 sm:p-6 bg-white border-2 border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 sm:mb-4">
              <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:items-start">
                <div className="p-2.5 sm:p-3 bg-slate-600 rounded-xl shadow-lg flex-shrink-0">
                  <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <p className="text-xs font-bold text-black uppercase tracking-wide mb-1">Ventes Aujourd'hui</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-black truncate">{formatCurrency(ventesAujourdhui)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t-2 border-slate-300">
              <span className="text-xs sm:text-sm text-black font-bold">Objectif journalier</span>
              <span className="text-xs sm:text-sm font-bold text-black">85% atteint</span>
            </div>
          </Card>

          {/* Résultat Net */}
          <Card className="p-4 sm:p-6 bg-white border-2 border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 sm:mb-4">
              <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:items-start">
                <div className="p-2.5 sm:p-3 bg-slate-600 rounded-xl shadow-lg flex-shrink-0">
                  <ChartPieIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <p className="text-xs font-bold text-black uppercase tracking-wide mb-1">Bénéfice Net</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-black truncate">+{formatCurrency(resultatNet)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t-2 border-slate-300">
              <span className="text-xs sm:text-sm text-black font-bold">Marge bénéficiaire</span>
              <span className="text-xs sm:text-sm font-bold text-black">{companyData.profitMargin.toFixed(1)}%</span>
            </div>
          </Card>

          {/* Trésorerie */}
          <Card className="p-4 sm:p-6 bg-white border-2 border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 sm:mb-4">
              <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:items-start">
                <div className="p-2.5 sm:p-3 bg-slate-600 rounded-xl shadow-lg flex-shrink-0">
                  <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <p className="text-xs font-bold text-black uppercase tracking-wide mb-1">Trésorerie</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-black truncate">+{formatCurrency(soldeTresorerie)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-slate-300">
              <span className="text-xs sm:text-sm text-black font-bold">Situation financière</span>
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-black border border-slate-300">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                Excellente
              </span>
            </div>
          </Card>
        </div>

        {/* Actions Rapides - Design Épuré */}
  <Card className="p-3 sm:p-5 lg:p-6 bg-white border border-slate-200">
          <div className="flex items-center mb-6 sm:mb-8">
            <div className="p-2 bg-emerald-100 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
              <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Actions Rapides</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { 
                titre: 'Nouvelle Vente', 
                description: 'Enregistrer une transaction',
                icon: ShoppingCartIcon, 
                path: '/factures-vente', 
                bgColor: 'bg-slate-600',
                hoverColor: 'hover:bg-emerald-600',
                stats: '+12 aujourd\'hui'
              },
              { 
                titre: 'Gestion Stock', 
                description: 'Consulter l\'inventaire',
                icon: CubeIcon, 
                path: '/inventaire', 
                bgColor: 'bg-slate-700',
                hoverColor: 'hover:bg-blue-600',
                stats: `${articlesEnStock} articles`
              },
              { 
                titre: 'Ventes & Clients', 
                description: 'Vue mensuelle détaillée',
                icon: ChartBarIcon, 
                path: '/ventes-clients-boutique', 
                bgColor: 'bg-slate-600',
                hoverColor: 'hover:bg-slate-700',
                stats: 'Analyse complète'
              }
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <button 
                  key={idx} 
                  onClick={() => navigate(action.path)}
                  className="group p-3 sm:p-5 bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-xl hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className="flex flex-col space-y-3 sm:space-y-4">
                    <div className={`p-3 ${action.bgColor} ${action.hoverColor} rounded-xl shadow-md w-fit transition-colors`}>
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">{action.titre}</h3>
                      <p className="text-slate-600 text-xs sm:text-sm">{action.description}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{action.stats}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Section Alertes & Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Alertes */}
          <Card className="p-3 sm:p-5 bg-white border border-slate-200">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="p-2 bg-red-100 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Alertes & Notifications</h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  icon: ClockIcon,
                  titre: 'Factures impayées',
                  description: `${companyData.pendingInvoices} factures en retard > 30 jours`,
                  action: () => navigate('/factures'),
                  urgent: true,
                  montant: '45,200 DA'
                },
                {
                  icon: CubeIcon,
                  titre: 'Stock critique',
                  description: '3 articles nécessitent un réapprovisionnement immédiat',
                  action: () => navigate('/inventaire'),
                  urgent: false,
                  montant: 'Urgent'
                },
                {
                  icon: DocumentTextIcon,
                  titre: 'Déclaration TVA',
                  description: 'Échéance de déclaration le 20 novembre',
                  action: () => navigate('/rapports/fiscalite-declarations'),
                  urgent: true,
                  montant: '8 jours'
                }
              ].map((alerte, idx) => {
                const Icon = alerte.icon;
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all space-y-2 sm:space-y-0">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${alerte.urgent ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${alerte.urgent ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-4">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{alerte.titre}</h3>
                            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">{alerte.description}</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end space-x-3 mt-2 sm:mt-0 flex-shrink-0">
                            <span className={`text-xs sm:text-sm font-semibold ${alerte.urgent ? 'text-red-600' : 'text-blue-600'}`}>
                              {alerte.montant}
                            </span>
                            <button 
                              onClick={alerte.action}
                              className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0"
                            >
                              Voir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Menu Navigation */}
          <Card className="p-3 sm:p-5 bg-white border border-slate-200">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="p-2 bg-slate-100 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Navigation Rapide</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: 'Rapports', icon: ChartBarIcon, path: '/rapports-analytics', info: '6 sections disponibles', color: 'bg-slate-700', stats: 'Nouveau' },
                { label: 'Clients', icon: UsersIcon, path: '/clients', info: `${companyData.clientsCount} clients actifs`, color: 'bg-slate-600', stats: '+2 ce mois' },
                { label: 'Comptabilité', icon: BanknotesIcon, path: '/gestion-comptable', info: 'Écritures & journaux', color: 'bg-slate-600', stats: 'À jour' },
                { label: 'Paramètres', icon: CreditCardIcon, path: '/parametres', info: 'Configuration boutique', color: 'bg-purple-500', stats: 'Complet' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={idx}
                    onClick={() => navigate(item.path)}
                    className="group p-2.5 sm:p-3.5 bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl hover:shadow-md transition-all text-left"
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <div className={`p-2 ${item.color} rounded-lg w-fit transition-transform group-hover:scale-105`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-[11px] sm:text-sm">{item.label}</h3>
                          <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                            {item.stats}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{item.info}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Accès Rapide Ventes & Clients */}
  <Card className="p-3 sm:p-5 bg-white border-2 border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-300">
                <ChartBarIcon className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black">Analyse Ventes & Clients</h2>
                <p className="text-xs sm:text-sm text-black">Vue mensuelle complète • Comportements • Tendances</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/ventes-clients-boutique')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>Voir l'analyse</span>
              <ChartBarIcon className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-50 p-2.5 rounded-lg border text-center">
              <div className="text-base font-bold text-black">{formatCurrency(companyData.averageInvoice)}</div>
              <div className="text-xs text-black font-medium">Panier moyen (mensuel)</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border text-center">
              <div className="text-base font-bold text-black">{companyData.invoicesCount}</div>
              <div className="text-xs text-black font-medium">Factures ce mois</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border text-center">
              <div className="text-base font-bold text-black">{companyData.clientsActive}</div>
              <div className="text-xs text-black font-medium">Clients actifs</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border text-center">
              <div className="text-base font-bold text-black">{companyData.invoicesCount > 0 ? Math.round((companyData.pendingInvoices / companyData.invoicesCount) * 100) : 0}%</div>
              <div className="text-xs text-black font-medium">Taux d'impayés</div>
            </div>
          </div>
        </Card>

        {/* Statistiques Complémentaires */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-5 bg-white border border-slate-200 text-center">
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">{articlesEnStock}</div>
              <div className="text-slate-600 text-sm font-medium">Articles en stock</div>
              <div className="text-xs text-emerald-600 font-semibold">Stock optimal</div>
            </div>
          </Card>
          
          <Card className="p-3 sm:p-5 bg-white border border-slate-200 text-center">
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">{companyData.clientsCount}</div>
              <div className="text-slate-600 text-sm font-medium">Clients fidèles</div>
              <div className="text-xs text-blue-600 font-semibold">+2 ce mois</div>
            </div>
          </Card>
          
          <Card className="p-3 sm:p-5 bg-white border border-slate-200 text-center">
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">98%</div>
              <div className="text-slate-600 text-sm font-medium">Satisfaction client</div>
              <div className="text-xs text-emerald-600 font-semibold">Excellent</div>
            </div>
          </Card>
          
          <Card className="p-3 sm:p-5 bg-white border border-slate-200 text-center">
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">15min</div>
              <div className="text-slate-600 text-sm font-medium">Temps moyen de service</div>
              <div className="text-xs text-slate-600 font-semibold">Efficace</div>
            </div>
          </Card>
        </div>
        
        {/* Insights Boutique - Métriques Avancées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Card className="p-3 sm:p-5 bg-white border border-slate-200">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="p-2 bg-blue-100 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                <ChartPieIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Analyse des Ventes</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Clients servis aujourd'hui</p>
                  <p className="text-xs text-slate-500">Comparé à hier: {clientsDuJour} vs {Math.floor(clientsDuJour * 0.9)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">{clientsDuJour}</p>
                  <p className="text-xs text-emerald-600 font-semibold">+11%</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Panier moyen</p>
                  <p className="text-xs text-slate-500">Progression mensuelle</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(panierMoyen)}</p>
                  <p className="text-xs text-emerald-600 font-semibold">+5.2%</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Produit star du jour</p>
                  <p className="text-xs text-slate-500">7 unités vendues</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{produitPopulaire}</p>
                  <p className="text-xs text-blue-600 font-semibold">En hausse</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 sm:p-5 bg-white border border-slate-200">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="p-2 bg-purple-100 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Performance Opérationnelle</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Heures de pointe</p>
                  <p className="text-xs text-slate-500">Affluence maximale</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900">{heuresPeak}</p>
                  <p className="text-xs text-purple-600 font-semibold">65% du CA</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Rotation stock</p>
                  <p className="text-xs text-slate-500">Vitesse de vente</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900">12 jours</p>
                  <p className="text-xs text-emerald-600 font-semibold">Optimal</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Taux de fidélisation</p>
                  <p className="text-xs text-slate-500">Clients réguliers</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900">78%</p>
                  <p className="text-xs text-emerald-600 font-semibold">Excellent</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Informations de la boutique */}
        <Card className="p-3 sm:p-5 bg-slate-800 text-white">
          <div className="text-center space-y-2">
            <h3 className="text-base sm:text-lg font-bold">{entrepriseInfo.nom}</h3>
            <p className="text-slate-300 text-xs sm:text-sm">{entrepriseInfo.secteur} • Fondée en {entrepriseInfo.anneeCreation} • {entrepriseInfo.adresse}</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm mt-4">
              <span className="px-2.5 py-1 bg-slate-700 rounded-full">RC: {entrepriseInfo.licenceCommerciale}</span>
              <span className="px-2.5 py-1 bg-slate-700 rounded-full">NIF: {entrepriseInfo.nif}</span>
              <span className="px-2.5 py-1 bg-emerald-600 rounded-full">Statut: {entrepriseInfo.statut}</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default BoutiqueDashboard;