import React, { useState } from 'react';
import { 
  BookOpenIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CalculatorIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import { useApp } from '../../context/AppContext';

const PlanComptable: React.FC = () => {
  const { formatCurrency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  // Plan comptable simplifié
  const chartOfAccounts = [
    {
      id: '1',
      code: '20',
      name: 'IMMOBILISATIONS',
      type: 'Actif',
      subAccounts: [
        { code: '201', name: 'Terrains', balance: 150000 },
        { code: '211', name: 'Constructions', balance: 450000 },
        { code: '218', name: 'Autres immobilisations', balance: 125000 }
      ]
    },
    {
      id: '2',
      code: '40',
      name: 'CRÉANCES',
      type: 'Actif',
      subAccounts: [
        { code: '411', name: 'Clients', balance: 125000 },
        { code: '416', name: 'Clients douteux', balance: 5000 },
        { code: '421', name: 'Personnel', balance: 2500 }
      ]
    },
    {
      id: '3',
      code: '50',
      name: 'DISPOSITIONS FINANCIÈRES',
      type: 'Actif',
      subAccounts: [
        { code: '512', name: 'Banque', balance: 450000 },
        { code: '531', name: 'Caisse', balance: 5000 },
        { code: '542', name: 'Valeurs mobilières', balance: 75000 }
      ]
    },
    {
      id: '4',
      code: '10',
      name: 'CAPITAUX PROPRES',
      type: 'Passif',
      subAccounts: [
        { code: '101', name: 'Capital social', balance: 500000 },
        { code: '106', name: 'Réserves', balance: 125000 },
        { code: '120', name: 'Résultat exercice', balance: 85000 }
      ]
    },
    {
      id: '5',
      code: '40',
      name: 'DETTES',
      type: 'Passif',
      subAccounts: [
        { code: '401', name: 'Fournisseurs', balance: 85000 },
        { code: '421', name: 'Personnel', balance: 45000 },
        { code: '444', name: 'État', balance: 25000 }
      ]
    },
    {
      id: '6',
      code: '70',
      name: 'VENTES',
      type: 'Produit',
      subAccounts: [
        { code: '701', name: 'Ventes produits', balance: 2450000 },
        { code: '706', name: 'Services', balance: 125000 },
        { code: '707', name: 'Produits vendus', balance: 1800000 }
      ]
    },
    {
      id: '7',
      code: '60',
      name: 'ACHATS',
      type: 'Charge',
      subAccounts: [
        { code: '601', name: 'Achats matières', balance: 850000 },
        { code: '602', name: 'Achats fournitures', balance: 125000 },
        { code: '606', name: 'Services extérieurs', balance: 180000 }
      ]
    }
  ];

  // Statistiques
  const statistics = [
    {
      title: 'Total Actifs',
      value: formatCurrency(1250000),
      change: '+8.5%',
      icon: BuildingOfficeIcon,
      color: 'green'
    },
    {
      title: 'Total Passifs',
      value: formatCurrency(780000),
      change: '+5.2%',
      icon: BanknotesIcon,
      color: 'red'
    },
    {
      title: 'Total Produits',
      value: formatCurrency(2575000),
      change: '+12.4%',
      icon: ArrowTrendingUpIcon,
      color: 'blue'
    },
    {
      title: 'Total Charges',
      value: formatCurrency(1155000),
      change: '+7.8%',
      icon: ArrowTrendingDownIcon,
      color: 'orange'
    }
  ];

  const filteredAccounts = chartOfAccounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.includes(searchTerm) ||
                         account.subAccounts.some(sub => 
                           sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sub.code.includes(searchTerm)
                         );
    const matchesCategory = selectedCategory === 'all' || account.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Actif': return 'text-green-600 bg-green-50 border-green-200';
      case 'Passif': return 'text-red-600 bg-red-50 border-red-200';
      case 'Produit': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Charge': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan Comptable</h1>
          <p className="text-gray-600">Gestion du plan comptable général</p>
        </div>
        <button 
          onClick={() => setIsAddAccountModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nouveau Compte</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="text-sm font-medium text-green-600">
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un compte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="Actif">Actif</option>
              <option value="Passif">Passif</option>
              <option value="Produit">Produit</option>
              <option value="Charge">Charge</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Plan comptable */}
      <div className="space-y-4">
        {filteredAccounts.map((account) => (
          <Card key={account.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(account.type)}`}>
                  {account.type}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{account.code} - {account.name}</h3>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {account.subAccounts.map((subAccount) => (
                <div key={subAccount.code} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{subAccount.code}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{subAccount.name}</h4>
                  <div className="text-sm font-bold text-gray-900">{formatCurrency(subAccount.balance)}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        title="Nouveau Compte Comptable"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code du compte</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 411"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du compte</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Clients"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de compte</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="Actif">Actif</option>
              <option value="Passif">Passif</option>
              <option value="Produit">Produit</option>
              <option value="Charge">Charge</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAddAccountModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Créer le Compte
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlanComptable;
