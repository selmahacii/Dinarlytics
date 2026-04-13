import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, BuildingOfficeIcon, BanknotesIcon, ChartBarIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { clientsService } from '@/services/modules/clientsService';
import GroupesClientsChart from '@shared/components/Charts/GroupesClientsChart';
import MetricsDashboard from '@shared/components/Charts/MetricsDashboard';

interface GroupeClient {
  id: string;
  nom: string;
  description: string;
  type: 'secteur' | 'taille' | 'risque' | 'geographique';
  couleur: string;
  nombreClients: number;
  chiffreAffaires: number;
  soldeMoyen: number;
  clients: Array<{
    id: string;
    nom: string;
    secteur: string;
    chiffreAffaires: number;
    solde: number;
    risque: 'faible' | 'moyen' | 'élevé';
  }>;
}

const GroupesClients: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupe, setSelectedGroupe] = useState<GroupeClient | null>(null);
  const [activeTab, setActiveTab] = useState<'groupes' | 'clients' | 'analytics'>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [groupesData, setGroupesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await clientsService.getGroups();
        setGroupesData(data);
      } catch (error) {
        console.error("Error fetching client groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Map backend groups to frontend GroupeClient interface
  const groupesClients: GroupeClient[] = React.useMemo(() => {
    if (!groupesData) return [];

    const result: GroupeClient[] = [];

    // Secteurs
    groupesData.secteurs?.forEach((s: any, idx: number) => {
      result.push({
        id: `secteur-${idx}`,
        nom: s.name,
        description: `Groupe sectoriel: ${s.name}`,
        type: 'secteur',
        couleur: ['blue', 'indigo', 'purple', 'green', 'indigo'][idx % 5],
        nombreClients: s.count,
        chiffreAffaires: 0,
        soldeMoyen: 0,
        clients: []
      });
    });

    // Tailles
    groupesData.tailles?.forEach((s: any, idx: number) => {
      result.push({
        id: `taille-${idx}`,
        nom: s.name,
        description: `Taille d'entreprise: ${s.name}`,
        type: 'taille',
        couleur: ['green', 'blue', 'purple', 'indigo'][idx % 4],
        nombreClients: s.count,
        chiffreAffaires: 0,
        soldeMoyen: 0,
        clients: []
      });
    });

    // Risques (matching enum risque: 'faible' | 'moyen' | 'élevé')
    groupesData.risques?.forEach((s: any, idx: number) => {
      result.push({
        id: `risque-${idx}`,
        nom: s.name.charAt(0).toUpperCase() + s.name.slice(1),
        description: `Niveau de risque: ${s.name}`,
        type: 'risque',
        couleur: s.name === 'élevé' ? 'red' : s.name === 'moyen' ? 'orange' : 'green',
        nombreClients: s.count,
        chiffreAffaires: 0,
        soldeMoyen: 0,
        clients: []
      });
    });

    return result;
  }, [groupesData]);

  // Filtrage des groupes
  const filteredGroupes = groupesClients.filter((groupe: GroupeClient) => {
    const matchesSearch = groupe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      groupe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || groupe.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Récupération des clients (placeholder for now as the endpoint doesn't return full lists)
  const allClients: any[] = [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'secteur': return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'taille': return <UserGroupIcon className="h-5 w-5" />;
      case 'risque': return <ChartBarIcon className="h-5 w-5" />;
      case 'geographique': return <BanknotesIcon className="h-5 w-5" />;
      default: return <UserGroupIcon className="h-5 w-5" />;
    }
  };

  const getCouleurClasses = (couleur: string) => {
    const classes = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return classes[couleur as keyof typeof classes] || classes.blue;
  };

  const handleEdit = (groupe: GroupeClient) => {
    setSelectedGroupe(groupe);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedGroupe(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <p className="text-yellow-800 text-sm font-medium">
          {t('disclaimer')}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {/* Header avec onglets */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('crm.groups.title')}</h1>
              <p className="text-gray-600 mt-1">{t('crm.groups.subtitle')}</p>
            </div>

            <div className="flex space-x-2 mt-4 sm:mt-0">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                📊 {t('crm.groups.tabs.analytics')}
              </button>
              <button
                onClick={() => setActiveTab('groupes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'groupes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                🏷️ {t('crm.groups.tabs.groupes')}
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'clients'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                👥 {t('crm.groups.tabs.clients')}
              </button>
            </div>
          </div>

          {activeTab === 'analytics' ? (
            <>
              {/* Dashboard des métriques */}
              <MetricsDashboard groupes={groupesClients} />

              {/* Graphiques de regroupement */}
              <GroupesClientsChart groupes={groupesClients} />
            </>
          ) : activeTab === 'groupes' ? (
            <>
              {/* Statistiques des groupes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{groupesClients.length}</div>
                    <div className="text-gray-600">{t('crm.groups.stats.active_groups')}</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {groupesClients.reduce((total: number, groupe: GroupeClient) => total + groupe.nombreClients, 0)}
                    </div>
                    <div className="text-gray-600">{t('crm.groups.stats.total_clients')}</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(groupesClients.reduce((total: number, groupe: GroupeClient) => total + groupe.chiffreAffaires, 0))}
                    </div>
                    <div className="text-gray-600">{t('crm.groups.stats.total_revenue')}</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(groupesClients.reduce((total: number, groupe: GroupeClient) => total + groupe.soldeMoyen, 0) / groupesClients.length)}
                    </div>
                    <div className="text-gray-600">{t('crm.groups.stats.average_balance')}</div>
                  </div>
                </Card>
              </div>

              {/* Liste des groupes */}
              <Card title={t('crm.groups.tabs.groupes')}>
                {/* Barre de recherche et filtres */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    {/* Barre de recherche */}
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('crm.groups.placeholders.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                      />
                    </div>

                    {/* Filtre par type */}
                    <div className="relative">
                      <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="all">{t('crm.groups.placeholders.filter_type')}</option>
                        <option value="secteur">{t('crm.groups.placeholders.type_sector')}</option>
                        <option value="taille">{t('crm.groups.placeholders.type_size')}</option>
                        <option value="risque">{t('crm.groups.placeholders.type_risk')}</option>
                        <option value="geographique">{t('crm.groups.placeholders.type_geo')}</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    {t('crm.groups.actions.new_group')}
                  </button>
                </div>

                {filteredGroupes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroupes.map((groupe: GroupeClient) => (
                      <div key={groupe.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getCouleurClasses(groupe.couleur)}`}>
                              {getTypeIcon(groupe.type)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{groupe.nom}</h3>
                              <p className="text-sm text-gray-500">{groupe.description}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(groupe)}
                              className="text-slate-600 hover:text-slate-800"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Clients:</span>
                            <span className="font-medium">{groupe.nombreClients}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">CA:</span>
                            <span className="font-medium text-green-600">{formatCurrency(groupe.chiffreAffaires)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Solde moyen:</span>
                            <span className={`font-medium ${groupe.soldeMoyen >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(groupe.soldeMoyen)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <button
                            onClick={() => setActiveTab('clients')}
                            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {t('crm.groups.actions.see_clients')} →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <FunnelIcon className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('crm.placeholders.no_clients')}</h3>
                    <p className="text-gray-500">
                      Aucun groupe ne correspond à vos critères de recherche.
                      <br />
                      Essayez de modifier vos filtres ou votre recherche.
                    </p>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <>
              {/* Filtres par groupe */}
              <Card title={t('crm.groups.tabs.clients')}>
                <div className="flex flex-wrap gap-2 mb-6">
                  {groupesClients.map((groupe: GroupeClient) => (
                    <button
                      key={groupe.id}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getCouleurClasses(groupe.couleur)
                        }`}
                    >
                      {groupe.nom} ({groupe.nombreClients})
                    </button>
                  ))}
                </div>

                {/* Tableau des clients par groupe */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {t('crm.groups.table.client')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {t('crm.groups.table.group')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {t('crm.groups.table.sector')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {t('crm.groups.table.revenue')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {t('crm.groups.table.balance')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {t('crm.groups.table.risk')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupesClients.flatMap((groupe: GroupeClient) =>
                        groupe.clients.map((client: GroupeClient['clients'][number]) => (
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{client.nom}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCouleurClasses(groupe.couleur)}`}>
                                {groupe.nom}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{client.secteur}</td>
                            <td className="px-6 py-4 text-sm font-medium text-green-600">
                              {formatCurrency(client.chiffreAffaires)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm font-medium ${client.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(client.solde)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.risque === 'faible' ? 'bg-green-100 text-green-800' :
                                client.risque === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {client.risque}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* Modal pour ajouter/modifier un groupe */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={selectedGroupe ? t('crm.groups.modals.edit_title') : t('crm.groups.modals.create_title')}
            size="lg"
          >
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('crm.groups.modals.name')}
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedGroupe?.nom || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: PME Industrielles"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('crm.groups.modals.type')}
                  </label>
                  <select
                    defaultValue={selectedGroupe?.type || 'secteur'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="secteur">{t('crm.groups.placeholders.type_sector')}</option>
                    <option value="taille">{t('crm.groups.placeholders.type_size')}</option>
                    <option value="risque">{t('crm.groups.placeholders.type_risk')}</option>
                    <option value="geographique">{t('crm.groups.placeholders.type_geo')}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('crm.groups.modals.description')}
                  </label>
                  <textarea
                    defaultValue={selectedGroupe?.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description détaillée du groupe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('crm.groups.modals.color')}
                  </label>
                  <select
                    defaultValue={selectedGroupe?.couleur || 'blue'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="blue">{t('crm.groups.colors.blue')}</option>
                    <option value="purple">{t('crm.groups.colors.purple')}</option>
                    <option value="green">{t('crm.groups.colors.green')}</option>
                    <option value="red">{t('crm.groups.colors.red')}</option>
                    <option value="indigo">{t('crm.groups.colors.indigo')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedGroupe ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default GroupesClients;



