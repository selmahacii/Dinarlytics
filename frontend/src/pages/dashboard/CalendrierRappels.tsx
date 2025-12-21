import React, { useState } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const CalendrierRappels: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [filter, setFilter] = useState('all');
  const [showNewReminderModal, setShowNewReminderModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'meeting',
    priority: 'medium',
    category: 'Équipe',
    amount: ''
  });

  const reminders = [
    {
      id: 1,
      title: 'Déclaration TVA',
      description: 'Déclaration TVA du mois de décembre - Échéance fiscale importante',
      date: new Date(2024, 11, 15), // 15 décembre
      time: '09:00',
      type: 'fiscal',
      priority: 'high',
      status: 'pending',
      amount: 45000,
      category: 'Fiscalité'
    },
    {
      id: 2,
      title: 'Relance client C123',
      description: 'Relancer le client C123 pour la facture impayée de 25,000 DZD',
      date: new Date(2024, 11, 18), // 18 décembre
      time: '14:00',
      type: 'commercial',
      priority: 'medium',
      status: 'pending',
      amount: 25000,
      category: 'Commercial'
    },
    {
      id: 3,
      title: 'Réunion équipe',
      description: 'Réunion hebdomadaire de l\'équipe - Bilan mensuel',
      date: new Date(2024, 11, 20), // 20 décembre
      time: '10:00',
      type: 'meeting',
      priority: 'low',
      status: 'pending',
      category: 'Équipe'
    },
    {
      id: 4,
      title: 'Sauvegarde système',
      description: 'Vérifier la sauvegarde automatique des données',
      date: new Date(2024, 11, 22), // 22 décembre
      time: '18:00',
      type: 'system',
      priority: 'medium',
      status: 'completed',
      category: 'Système'
    },
    {
      id: 5,
      title: 'Échéance paiement fournisseur',
      description: 'Paiement facture fournisseur F456 - 18,500 DZD',
      date: new Date(2024, 11, 25), // 25 décembre
      time: '11:00',
      type: 'payment',
      priority: 'high',
      status: 'pending',
      amount: 18500,
      category: 'Paiements'
    },
    {
      id: 6,
      title: 'Inventaire mensuel',
      description: 'Contrôle d\'inventaire complet - Tous les produits',
      date: new Date(2024, 11, 28), // 28 décembre
      time: '08:00',
      type: 'inventory',
      priority: 'medium',
      status: 'pending',
      category: 'Stock'
    },
    {
      id: 7,
      title: 'Clôture mensuelle',
      description: 'Clôture comptable du mois de décembre',
      date: new Date(2024, 11, 31), // 31 décembre
      time: '16:00',
      type: 'closing',
      priority: 'high',
      status: 'pending',
      category: 'Comptabilité'
    },
    {
      id: 8,
      title: 'Paiement salaires',
      description: 'Versement des salaires de décembre',
      date: new Date(2024, 11, 30), // 30 décembre
      time: '12:00',
      type: 'payment',
      priority: 'critical',
      status: 'pending',
      amount: 125000,
      category: 'Ressources Humaines'
    },
    {
      id: 9,
      title: 'Formation équipe',
      description: 'Formation sur le nouveau logiciel comptable',
      date: new Date(2024, 11, 16), // 16 décembre
      time: '14:30',
      type: 'training',
      priority: 'low',
      status: 'completed',
      category: 'Formation'
    },
    {
      id: 10,
      title: 'Audit externe',
      description: 'Préparation pour l\'audit externe annuel',
      date: new Date(2024, 11, 19), // 19 décembre
      time: '09:30',
      type: 'audit',
      priority: 'high',
      status: 'pending',
      category: 'Audit'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fiscal':
        return <DocumentTextIcon className="h-4 w-4 text-red-500" />;
      case 'commercial':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'meeting':
        return <UserGroupIcon className="h-4 w-4 text-green-500" />;
      case 'system':
        return <CheckCircleIcon className="h-4 w-4 text-purple-500" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-4 w-4 text-orange-500" />;
      case 'inventory':
        return <CubeIcon className="h-4 w-4 text-indigo-500" />;
      case 'closing':
        return <CalendarIcon className="h-4 w-4 text-emerald-500" />;
      case 'training':
        return <AcademicCapIcon className="h-4 w-4 text-cyan-500" />;
      case 'audit':
        return <ClipboardDocumentCheckIcon className="h-4 w-4 text-amber-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-slate-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-200 text-red-900 border-red-300 font-bold';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    if (filter === 'pending') return reminder.status === 'pending';
    if (filter === 'completed') return reminder.status === 'completed';
    if (filter === 'high') return reminder.priority === 'high';
    return true;
  });

  const upcomingReminders = reminders
    .filter(r => r.status === 'pending' && r.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  // Fonctions pour gérer le modal
  const handleNewReminder = () => {
    setShowNewReminderModal(true);
  };

  const handleCloseModal = () => {
    setShowNewReminderModal(false);
    setNewReminder({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'meeting',
      priority: 'medium',
      category: 'Équipe',
      amount: ''
    });
  };

  const handleSaveReminder = () => {
    // Ici on pourrait ajouter la logique pour sauvegarder le nouveau rappel
    console.log('Nouveau rappel:', newReminder);
    handleCloseModal();
  };

  const handleInputChange = (field: string, value: string) => {
    setNewReminder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calendrier & Rappels</h1>
            <p className="text-slate-600 mt-1">Gérez vos échéances et rappels importants</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleNewReminder}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau rappel
            </button>
          </div>
        </div>
      </div>

      {/* Contrôles de vue et filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Vue :</span>
          </div>
          <div className="flex space-x-2">
            {[
              { id: 'month', name: 'Mois' },
              { id: 'week', name: 'Semaine' },
              { id: 'day', name: 'Jour' }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === v.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm font-medium text-slate-700">Filtrer :</span>
            <div className="flex space-x-2">
              {[
                { id: 'all', name: 'Tous' },
                { id: 'pending', name: 'En attente' },
                { id: 'completed', name: 'Terminés' },
                { id: 'high', name: 'Priorité haute' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f.id
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier principal */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Aujourd'hui
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6);
              const dayReminders = reminders.filter(r => 
                r.date.toDateString() === date.toDateString()
              );
              
              return (
                <div
                  key={i}
                  className={`min-h-20 p-2 border border-slate-200 rounded-lg ${
                    date.getMonth() !== currentDate.getMonth() 
                      ? 'bg-slate-50 text-slate-400' 
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                  {dayReminders.slice(0, 2).map((reminder) => {
                    const getReminderColor = (priority: string) => {
                      switch (priority) {
                        case 'critical': return 'bg-red-200 text-red-900 font-bold';
                        case 'high': return 'bg-red-100 text-red-800';
                        case 'medium': return 'bg-yellow-100 text-yellow-800';
                        case 'low': return 'bg-green-100 text-green-800';
                        default: return 'bg-blue-100 text-blue-800';
                      }
                    };
                    
                    return (
                      <div
                        key={reminder.id}
                        className={`text-xs p-1 rounded mb-1 truncate hover:scale-105 transition-transform cursor-pointer ${getReminderColor(reminder.priority)}`}
                        title={`${reminder.title} - ${reminder.time}`}
                      >
                        {reminder.title}
                      </div>
                    );
                  })}
                  {dayReminders.length > 2 && (
                    <div className="text-xs text-slate-500">
                      +{dayReminders.length - 2} autres
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Liste des rappels */}
        <div className="space-y-6">
          {/* Rappels à venir */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Prochains rappels</h3>
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    {getTypeIcon(reminder.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 truncate">
                        {reminder.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {reminder.date.toLocaleDateString('fr-FR')} à {reminder.time}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reminder.status)}`}>
                          {reminder.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-slate-600">Rappels en attente</span>
                <span className="text-lg font-semibold text-blue-600">
                  {reminders.filter(r => r.status === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-slate-600">Terminés ce mois</span>
                <span className="text-lg font-semibold text-green-600">
                  {reminders.filter(r => r.status === 'completed').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-slate-600">Priorité haute</span>
                <span className="text-lg font-semibold text-red-600">
                  {reminders.filter(r => r.priority === 'high' || r.priority === 'critical').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-slate-600">Échéances critiques</span>
                <span className="text-lg font-semibold text-orange-600">
                  {reminders.filter(r => r.priority === 'critical').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-slate-600">Total rappels</span>
                <span className="text-lg font-semibold text-purple-600">
                  {reminders.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste détaillée des rappels */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tous les rappels</h3>
        <div className="space-y-3">
          {filteredReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {getTypeIcon(reminder.type)}
                <div>
                  <h4 className="font-medium text-slate-900">{reminder.title}</h4>
                  <p className="text-sm text-slate-600">{reminder.description}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                    <span>{reminder.date.toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>{reminder.time}</span>
                    <span>•</span>
                    <span className="capitalize">{reminder.category}</span>
                    {reminder.amount && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-slate-700">{reminder.amount.toLocaleString()} DZD</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                  {reminder.priority}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reminder.status)}`}>
                  {reminder.status}
                </span>
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                  Actions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nouveau Rappel */}
      {showNewReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête du modal */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Nouveau Rappel</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XCircleIcon className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              {/* Formulaire */}
              <div className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Titre du rappel *
                  </label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Déclaration TVA, Réunion équipe..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newReminder.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Détails du rappel..."
                  />
                </div>

                {/* Date et Heure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newReminder.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Heure *
                    </label>
                    <input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Type et Priorité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={newReminder.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="fiscal">Fiscal</option>
                      <option value="commercial">Commercial</option>
                      <option value="meeting">Réunion</option>
                      <option value="system">Système</option>
                      <option value="payment">Paiement</option>
                      <option value="inventory">Inventaire</option>
                      <option value="closing">Clôture</option>
                      <option value="training">Formation</option>
                      <option value="audit">Audit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priorité *
                    </label>
                    <select
                      value={newReminder.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="critical">Critique</option>
                    </select>
                  </div>
                </div>

                {/* Catégorie et Montant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={newReminder.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Fiscalité">Fiscalité</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Équipe">Équipe</option>
                      <option value="Système">Système</option>
                      <option value="Paiements">Paiements</option>
                      <option value="Stock">Stock</option>
                      <option value="Comptabilité">Comptabilité</option>
                      <option value="Ressources Humaines">Ressources Humaines</option>
                      <option value="Formation">Formation</option>
                      <option value="Audit">Audit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Montant (DZD)
                    </label>
                    <input
                      type="number"
                      value={newReminder.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Aperçu du rappel */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Aperçu du rappel</h4>
                  <div className="text-sm text-slate-600">
                    <p><strong>Titre:</strong> {newReminder.title || 'Non défini'}</p>
                    <p><strong>Date:</strong> {newReminder.date} à {newReminder.time}</p>
                    <p><strong>Type:</strong> {newReminder.type} | <strong>Priorité:</strong> {newReminder.priority}</p>
                    <p><strong>Catégorie:</strong> {newReminder.category}</p>
                    {newReminder.amount && <p><strong>Montant:</strong> {parseInt(newReminder.amount).toLocaleString()} DZD</p>}
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveReminder}
                  disabled={!newReminder.title || !newReminder.date || !newReminder.time}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Créer le rappel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendrierRappels;
