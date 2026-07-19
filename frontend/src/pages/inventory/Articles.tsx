import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  TagIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  CpuChipIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  SparklesIcon as SparklesIconSolid,
  CpuChipIcon as CpuChipIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from '@heroicons/react/24/solid';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { usePermission } from '@shared/hooks/usePermission';
// Centralized product catalog
import { useProducts } from '@core/context/ProductsContext';
import { Article } from '@/types';
import RapportsArticlesWidget from '@shared/components/Charts/RapportsArticlesWidget';
import GestionCategoriesWidget from '@shared/components/Charts/GestionCategoriesWidget';
import GestionTarifsWidget from '@shared/components/Charts/GestionTarifsWidget';
import SuccessMessage from '@shared/components/UI/SuccessMessage';
import HelpButton from '@shared/components/UI/HelpButton';
import Tooltip from '@shared/components/UI/Tooltip';
import apiClient from '@/services/apiClient';
import { useArticles } from '@shared/hooks/useArticles';

const initialBarcodesData: Array<{ id: number; article: string; type: string; code: string; status: string; dateCreation: string; categorie: string }> = [];

const Articles: React.FC = () => {
  const { formatCurrency, user, companyData } = useApp();
  const { t } = useTranslation();
  const { has } = usePermission();
  const canManageArticles = has('articles-manage');

  // Hook pour charger les articles dynamiquement
  const { articles: apiArticles, stats: articleStats, loading: loadingArticles, error: errorArticles } = useArticles();

  // States pour la modale (doivent être déclarés avant le return early)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successData, setSuccessData] = useState<{
    title: string;
    message: string;
    details?: string[];
    nextSteps?: string[];
  } | null>(null);
  const [isAiAuditModalOpen, setIsAiAuditModalOpen] = useState(false);
  const [isGeneratingAiAudit, setIsGeneratingAiAudit] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<any>(null);
  const [isStockOptimizerModalOpen, setIsStockOptimizerModalOpen] = useState(false);
  const [isProcurementForecastModalOpen, setIsProcurementForecastModalOpen] = useState(false);

  // Dynamic data states
  const [articlesStats, setArticlesStats] = useState<{
    total: number;
    active: number;
    rotation: number;
    topSellers?: Article[];
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // Récupérer les produits depuis le contexte
  const { products, createProduct, deleteProduct, updateProduct, refetch } = useProducts();
  
  useEffect(() => {
    refetch();
  }, []);
  const filteredArticles: Article[] = products.filter((article: Article) =>
    article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.codePCA.includes(searchTerm)
  );

  // Fetch article statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await apiClient.get<{ total_articles: number; active_articles: number; rotation?: number }>('/articles/stats');
        const data = response.data;
        setArticlesStats({
          total: data.total_articles || 0,
          active: data.active_articles || 0,
          rotation: data.rotation || 0
        });
        setErrorStats(null);
      } catch (err) {
        console.error('Error fetching article stats:', err);
        setErrorStats('Erreur lors du chargement des statistiques');
        setArticlesStats({
          total: products.length,
          active: products.filter(a => a.stock > 0).length,
          rotation: 0
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [products.length]);

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE  
  // ========================================
  if (user && user.segment === 'micro' && user.companyType === 'eurl' && companyData) {
    const nombreArticles = products.length;
    const articlesActifs = products.filter(a => a.stock > 0).length;
    // Pas d'historique de ventes par article disponible pour calculer une
    // vraie rotation de stock.
    const rotationMoyenne = 0;

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-4 sm:p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <TagIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{t('inventory.articles.title')}</h1>
                  <HelpButton pageId="articles" variant="icon" className="text-white/80 hover:text-white" />
                </div>
                <p className="text-slate-300 text-lg mt-1">{t('inventory.articles.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg w-fit mb-3">
              <CubeIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">{t('inventory.articles.stats.active_articles')}</h3>
            {loadingStats ? (
              <p className="text-2xl font-extrabold text-slate-400">...</p>
            ) : (
              <>
                <p className="text-3xl font-extrabold text-slate-900">{articlesStats?.active ?? 0}</p>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-emerald-600 font-semibold">📦 {t('inventory.articles.stats.in_catalog', { count: articlesStats?.total ?? 0 })}</p>
                </div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg w-fit mb-3">
              <ArrowPathIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">{t('inventory.articles.stats.rotation')}</h3>
            {loadingStats ? (
              <p className="text-2xl font-extrabold text-slate-400">...</p>
            ) : (
              <>
                <p className="text-3xl font-extrabold text-slate-900">{(articlesStats?.rotation ?? 0).toFixed(1)}x</p>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-blue-600 font-semibold">📊 {t('inventory.articles.stats.per_year')}</p>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-3">{t('inventory.sections.quick_actions')}</h3>
            <button
              disabled={!canManageArticles}
              onClick={() => {
                setSelectedArticle(null);
                setIsModalOpen(true);
              }}
              className="w-full p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-5 w-5" />
              {t('articles.actions.new_article')}
            </button>
          </div>
        </div>

        {/* Modal Nouvel Article pour EURL */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setSelectedArticle(null);
          }}
          title={selectedArticle ? t('inventory.articles.modal.edit_title') : t('inventory.articles.modal.create_title')}
          size="lg"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nom = formData.get('nom') as string;
              const codePCA = formData.get('codePCA') as string;
              const prixUnitaire = parseFloat(formData.get('prixUnitaire') as string) || 0;
              const unite = formData.get('unite') as string || 'unité';
              const description = formData.get('description') as string || '';

              if (selectedArticle) {
                // Modification d'un article existant
                updateProduct(selectedArticle.id, {
                  nom,
                  codePCA,
                  prixUnitaire,
                  unite,
                  description
                });
                setSuccessData({
                  title: t('inventory.articles.success.modified_title'),
                  message: t('inventory.articles.success.modified_msg', { name: nom }),
                  details: [
                    `Nom : ${nom}`,
                    `Code PCA : ${codePCA || 'Non défini'}`,
                    `Prix unitaire : ${formatCurrency(prixUnitaire)}`,
                    `Unité : ${unite}`
                  ],
                  nextSteps: [
                    'Vérifier que les modifications sont correctes',
                    'Mettre à jour les factures utilisant cet article si nécessaire',
                    'Vérifier le stock disponible'
                  ]
                });
              } else {
                // Création d'un nouvel article, persistée via le backend
                try {
                  await createProduct({
                    nom,
                    codePCA,
                    prixUnitaire,
                    unite,
                    stock: 0,
                    description,
                    categorie: 'Général'
                  });
                } catch (err) {
                  console.error('Failed to create article', err);
                  return;
                }
                setSuccessData({
                  title: t('inventory.articles.success.created_title'),
                  message: t('inventory.articles.success.created_msg', { name: nom }),
                  details: [
                    `Nom : ${nom}`,
                    `Code PCA : ${codePCA || 'Non défini'}`,
                    `Prix unitaire : ${formatCurrency(prixUnitaire)}`,
                    `Unité : ${unite}`,
                    `Stock initial : 0 ${unite}`
                  ],
                  nextSteps: [
                    'Ajouter cet article à une facture',
                    'Mettre à jour le stock si nécessaire',
                    'Configurer les tarifs par quantité si applicable'
                  ]
                });
              }

              setIsModalOpen(false);
              setSelectedArticle(null);
              setShowSuccessMessage(true);
              // Réinitialiser le formulaire
              e.currentTarget.reset();

              // Masquer le message après 5 secondes
              setTimeout(() => {
                setShowSuccessMessage(false);
                setSuccessData(null);
              }, 5000);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.table.article')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  required
                  defaultValue={selectedArticle?.nom || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Produit A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.table.pca_code')}
                </label>
                <select
                  name="codePCA"
                  defaultValue={selectedArticle?.codePCA || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={t('common.select') + ' ' + t('inventory.table.pca_code')}
                  title={t('common.select') + ' ' + t('inventory.table.pca_code')}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="601100">601100 - Matières premières</option>
                  <option value="602100">602100 - Fournitures consommables</option>
                  <option value="355000">355000 - Produits finis</option>
                  <option value="356000">356000 - Produits en cours</option>
                  <option value="371000">371000 - Marchandises</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.table.pu')} (DZD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="prixUnitaire"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={selectedArticle?.prixUnitaire || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.table.unit', { defaultValue: 'Unité' })}
                </label>
                <select
                  name="unite"
                  defaultValue={selectedArticle?.unite || 'unité'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={t('common.select') + ' ' + t('inventory.table.unit')}
                  title={t('common.select') + ' ' + t('inventory.table.unit')}
                >
                  <option value="unité">Unité</option>
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="g">Gramme (g)</option>
                  <option value="L">Litre (L)</option>
                  <option value="mL">Millilitre (mL)</option>
                  <option value="m">Mètre (m)</option>
                  <option value="m²">Mètre carré (m²)</option>
                  <option value="m³">Mètre cube (m³)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.description')}
              </label>
              <textarea
                name="description"
                defaultValue={selectedArticle?.description || ''}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description de l'article..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedArticle(null);
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-black transition-colors font-medium"
              >
                {selectedArticle ? 'Modifier' : 'Créer'} l'article
              </button>
            </div>
          </form>
        </Modal>

        {/* Liste des Articles - Catalogue */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-slate-900">{t('inventory.articles.title')}</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('inventory.articles.placeholders.filter')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
                <EyeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('inventory.table.article')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('inventory.table.pca_code')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('inventory.table.pu')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('inventory.table.quantity')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('inventory.table.total_value')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('inventory.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredArticles.map((article) => {
                    const valeurTotale = article.prixUnitaire * article.stock;
                    const stockStatus = article.stock === 0 ? 'critique' : article.stock < 20 ? 'faible' : 'normal';
                    const statusColors = {
                      normal: 'bg-emerald-100 text-emerald-800',
                      faible: 'bg-amber-100 text-amber-800',
                      critique: 'bg-red-100 text-red-800'
                    };

                    return (
                      <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <CubeIcon className="h-5 w-5 text-slate-400 mr-2" />
                            <div>
                              <p className="font-medium text-slate-900">{article.nom}</p>
                              {article.description && (
                                <p className="text-xs text-slate-500">{article.description.substring(0, 50)}...</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{article.codePCA || '-'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(article.prixUnitaire)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[stockStatus]}`}>
                            {article.stock} {article.unite || t('inventory.stats.units')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(valeurTotale)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedArticle(article);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title={t('common.edit')}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Êtes-vous sûr de vouloir supprimer "${article.nom}" ?`)) {
                                  try {
                                    await deleteProduct(article.id);
                                  } catch (err) {
                                    console.error('Failed to delete article', err);
                                  }
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('common.delete')}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CubeIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">{t('inventory.messages.no_article_found')}</p>
              <p className="text-slate-400 text-sm mt-2">
                {searchTerm ? 'Essayez avec un autre terme de recherche' : 'Commencez par créer votre premier article'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    setIsModalOpen(true);
                  }}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-black transition-colors font-medium inline-flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Créer le premier article
                </button>
              )}
            </div>
          )}

          {filteredArticles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
              <p>Total: <span className="font-semibold text-slate-900">{filteredArticles.length}</span> article(s)</p>
              <p>Valeur totale: <span className="font-semibold text-slate-900">
                {formatCurrency(filteredArticles.reduce((sum, a) => sum + (a.prixUnitaire * a.stock), 0))}
              </span></p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ========================================
  // INTERFACE STANDARD (autres entreprises)
  // ========================================
  // Note: isModalOpen, selectedArticle, searchTerm, products et filteredArticles sont déjà déclarés plus haut
  const [activeTab, setActiveTab] = useState('catalogue');
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);
  const [isGenerateAllModalOpen, setIsGenerateAllModalOpen] = useState(false);
  const [isGenerateByCategoryModalOpen, setIsGenerateByCategoryModalOpen] = useState(false);
  const [isCustomizeDesignModalOpen, setIsCustomizeDesignModalOpen] = useState(false);
  const [selectedBarcodeForView, setSelectedBarcodeForView] = useState<any>(null);
  const [isBarcodeViewModalOpen, setIsBarcodeViewModalOpen] = useState(false);
  const [selectedBarcodeForDownload, setSelectedBarcodeForDownload] = useState<any>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [barcodes, setBarcodes] = useState(initialBarcodesData);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [deletedBarcodeName, setDeletedBarcodeName] = useState('');
  const [isAddManualBarcodeModalOpen, setIsAddManualBarcodeModalOpen] = useState(false);
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [newBarcode, setNewBarcode] = useState({
    article: '',
    type: 'EAN-13',
    code: '',
    categorie: '',
    status: 'Actif'
  });

  // Note: products et filteredArticles sont déjà déclarés plus haut (avant le return early)

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  // Nouvelles fonctions ERPNext pour les articles
  const handlePricingManagement = (article: Article) => {
    setSelectedArticle(article);
    setIsPricingModalOpen(true);
  };

  const handleBarcodeManagement = (article: Article) => {
    setSelectedArticle(article);
    setBarcodeGenerated(false);
    setIsBarcodeModalOpen(true);
  };


  // Catégories dérivées du catalogue réel
  const articleCategories: Array<{ id: number; name: string; code: string; count: number; value: number }> = useMemo(() => {
    const byCategory = new Map<string, { count: number; value: number }>();
    products.forEach(a => {
      const cat = a.categorie || 'Non classé';
      const entry = byCategory.get(cat) || { count: 0, value: 0 };
      entry.count += 1;
      entry.value += a.prixUnitaire * a.stock;
      byCategory.set(cat, entry);
    });
    return Array.from(byCategory.entries()).map(([name, data], idx) => ({
      id: idx,
      name,
      code: name.slice(0, 3).toUpperCase(),
      count: data.count,
      value: data.value
    }));
  }, [products]);

  // Fonctions de gestion des codes-barres
  const handleDeleteBarcode = (barcode: any) => {
    if (!("id" in barcode)) {
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer le code "${barcode.code}" ?\n\nArticle: ${barcode.article}\n\nCette action est irréversible.`)) {
      setBarcodes(barcodes.filter(b => b.id !== barcode.id));
      setDeletedBarcodeName(barcode.code);
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
    }
  };

  const handleUpdateBarcodeStatus = (barcode: any) => {
    if (!("id" in barcode)) {
      return;
    }
    const newStatus = barcode.status === 'Actif' ? 'Inactif' : 'Actif';
    setBarcodes(barcodes.map(b =>
      b.id === barcode.id ? { ...b, status: newStatus } : b
    ));
    setShowUpdateSuccess(true);
    setTimeout(() => setShowUpdateSuccess(false), 3000);
  };

  const handleExportExcel = () => {
    const csvContent = "Article,Type,Code,Catégorie,Date,Statut\n" +
      barcodes.map(b => `${b.article},${b.type},${b.code},${b.categorie},${b.dateCreation},${b.status}`).join('\n');
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `codes_barres_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintLabels = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Pas de générateur PDF côté client — window.print() (via le menu
    // "Enregistrer en PDF" du navigateur) est le seul export PDF réel
    // disponible, au lieu d'un faux message "PDF prêt" sans fichier produit.
    window.print();
  };

  const handleAddManualBarcode = () => {
    if (!newBarcode.article || !newBarcode.code || !newBarcode.categorie) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires !');
      return;
    }

    const newBarcodeEntry = {
      id: Math.max(...barcodes.map(b => b.id)) + 1,
      article: newBarcode.article,
      type: newBarcode.type,
      code: newBarcode.code,
      status: newBarcode.status,
      dateCreation: new Date().toLocaleDateString('fr-FR'),
      categorie: newBarcode.categorie
    };

    setBarcodes([newBarcodeEntry, ...barcodes]);
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 3000);
    setIsAddManualBarcodeModalOpen(false);

    // Réinitialiser le formulaire
    setNewBarcode({
      article: '',
      type: 'EAN-13',
      code: '',
      categorie: '',
      status: 'Actif'
    });
  };


  // Handlers pour les Analyses Avancées
  // Rapport calculé à partir du catalogue réel (products) plutôt que généré
  // par un modèle IA — aucun service d'analyse IA du stock n'existe côté
  // backend, donc pas de contenu fabriqué (noms d'articles, montants) ici.
  const handleGenererAuditIA = async () => {
    setIsAiAuditModalOpen(true);
    setIsGeneratingAiAudit(true);

    const outOfStockArticles = products.filter(a => a.stock === 0);
    const lowStockArticles = products.filter(a => a.stock > 0 && a.stock < 20);
    const highValueDormant = [...products]
      .filter(a => a.stock > 50)
      .sort((a, b) => (b.prixUnitaire * b.stock) - (a.prixUnitaire * a.stock))
      .slice(0, 5);
    const dormantValue = highValueDormant.reduce((sum, a) => sum + a.prixUnitaire * a.stock, 0);
    const totalValue = products.reduce((sum, a) => sum + a.prixUnitaire * a.stock, 0);

    const risks: Array<{ title: string; message: string; level: 'high' | 'medium' }> = [];
    if (highValueDormant.length > 0) {
      risks.push({
        title: 'Surstock',
        message: `${highValueDormant.length} article(s) à forte rotation lente immobilisent ${formatCurrency(dormantValue)}.`,
        level: 'high'
      });
    }
    if (outOfStockArticles.length > 0) {
      risks.push({
        title: 'Rupture de stock',
        message: `${outOfStockArticles.length} article(s) sont actuellement en rupture : ${outOfStockArticles.slice(0, 3).map(a => a.nom).join(', ')}${outOfStockArticles.length > 3 ? '…' : ''}.`,
        level: 'high'
      });
    }
    if (lowStockArticles.length > 0) {
      risks.push({
        title: 'Stock faible',
        message: `${lowStockArticles.length} article(s) sous le seuil de 20 unités.`,
        level: 'medium'
      });
    }

    const opportunities: Array<{ title: string; message: string }> = [];
    if (dormantValue > 0) {
      opportunities.push({
        title: 'Rotation du stock dormant',
        message: `Écouler le stock à rotation lente libérerait jusqu'à ${formatCurrency(dormantValue)} de trésorerie immobilisée.`
      });
    }
    if (products.length > 0) {
      opportunities.push({
        title: 'Valorisation du catalogue',
        message: `Le catalogue représente ${formatCurrency(totalValue)} de valeur totale sur ${products.length} article(s).`
      });
    }

    const score = Math.max(0, 100 - outOfStockArticles.length * 10 - lowStockArticles.length * 3);

    setAiAuditReport({
      score,
      status: risks.some(r => r.level === 'high') ? 'Optimisation Requise' : 'Sain',
      summary: products.length > 0
        ? `Analyse de ${products.length} article(s) : ${outOfStockArticles.length} rupture(s), ${lowStockArticles.length} en stock faible, ${formatCurrency(totalValue)} de valeur totale.`
        : "Aucun article en catalogue à analyser.",
      risks,
      opportunities
    });
    setIsGeneratingAiAudit(false);
  };

  const articleAnalytics = {
    totalArticles: products.length,
    totalValue: products.reduce((sum, article) => sum + (article.prixUnitaire * article.stock), 0),
    lowStock: products.filter(article => article.stock < 20).length,
    outOfStock: products.filter(article => article.stock === 0).length,
    topSelling: [...products].sort((a, b) => b.stock - a.stock).slice(0, 5),
    categories: articleCategories
  };

  // Derive barcode data for display
  const barcodeData = selectedArticle ? barcodes.filter(b => b.article === selectedArticle.nom) : [];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-[2rem] shadow-2xl border border-white/5 p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
              <CubeIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic">{t('inventory.articles.intelligence_title')}</h1>
                <span className="px-3 py-1 bg-cyan-500 text-[9px] font-black uppercase tracking-widest rounded-lg animate-pulse">Live</span>
              </div>
              <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-[0.3em] opacity-80 italic">Optimisation des flux & Pilotage du catalogue</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t('articles.stats.total_valuation')}</p>
              <p className="text-2xl sm:text-3xl font-black font-mono tracking-tighter">{formatCurrency(articleAnalytics.totalValue)}</p>
            </div>
            <div className="h-12 w-[1px] bg-white/10 hidden md:block"></div>
            <button
              onClick={handleGenererAuditIA}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5 flex items-center justify-center gap-3"
            >
              <ChartBarIcon className="h-4 w-4" />
              {t('inventory.articles.actions.generate_audit')}
            </button>
          </div>
        </div>
      </div>

      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <nav className="flex overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'catalogue', name: t('inventory.articles.tabs.catalog'), icon: BuildingOfficeIcon },
            { id: 'categories', name: t('inventory.articles.tabs.segmentation'), icon: TagIcon },
            { id: 'pricing', name: t('inventory.articles.tabs.pricing'), icon: CurrencyDollarIcon },
            { id: 'barcode', name: t('inventory.articles.tabs.traceability'), icon: QrCodeIcon },
            { id: 'reports', name: t('inventory.articles.tabs.reports'), icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center whitespace-nowrap py-5 px-4 sm:px-8 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              <tab.icon className={`h-4 w-4 mr-3 ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 dark:bg-white rounded-t-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 sm:p-6">
          {activeTab === 'catalogue' && (
            <div className="space-y-6">
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="relative w-full sm:w-96">
                  <input
                    type="text"
                    placeholder={t('inventory.articles.placeholders.filter')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-wider focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button className="w-full sm:w-auto p-4 bg-slate-50 text-slate-600 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center">
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  {canManageArticles && (
                    <button
                      onClick={handleAdd}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 text-[10px] font-black uppercase tracking-widest"
                    >
                      <PlusIcon className="h-4 w-4" />
                      {t('articles.actions.new_article')}
                    </button>
                  )}
                </div>
              </div>

              {/* Articles Table */}
              <div className="overflow-x-auto no-scrollbar bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                  <thead className="bg-slate-50/50 dark:bg-slate-900">
                    <tr>
                      <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {t('articles.table.article')}
                      </th>
                      <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {t('articles.table.pca_code')}
                      </th>
                      <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {t('articles.table.price')}
                      </th>
                      <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {t('articles.table.stock')}
                      </th>
                      <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {t('articles.table.value')}
                      </th>
                      <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {t('articles.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredArticles.map((article) => (
                      <tr key={article.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-all">
                        <td className="px-4 sm:px-8 py-4 sm:py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-white transition-colors">
                              <CubeIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                            </div>
                            <div>
                              <div className="text-[11px] font-black uppercase text-slate-900 dark:text-gray-100 tracking-tight">{article.nom}</div>
                              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-0.5">{article.categorie}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6">
                          <span className="text-[10px] font-black font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                            {article.codePCA}
                          </span>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 text-right text-[11px] font-black font-mono text-slate-900 dark:text-gray-100 italic">
                          {formatCurrency(article.prixUnitaire)}
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 text-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${article.stock > 50 ? 'bg-emerald-50 text-emerald-600' :
                            article.stock > 20 ? 'bg-amber-50 text-amber-600' :
                              'bg-red-50 text-red-600'
                            }`}>
                            {article.stock} {t('common.units', { defaultValue: 'UNITS' })}
                          </span>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 text-right text-[11px] font-black font-mono text-slate-900 italic">
                          {formatCurrency(article.prixUnitaire * article.stock)}
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                          <div className="flex justify-end gap-1">
                            {[
                              { icon: PencilIcon, color: 'text-slate-400 hover:text-slate-900 hover:bg-slate-100', onClick: () => handleEdit(article), title: t('common.edit', { defaultValue: 'Modifier' }) },
                              { icon: CurrencyDollarIcon, color: 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50', onClick: () => handlePricingManagement(article), title: "Tarifs" },
                              { icon: QrCodeIcon, color: 'text-cyan-400 hover:text-cyan-600 hover:bg-cyan-50', onClick: () => handleBarcodeManagement(article), title: t('articles.tabs.traceability') },
                              {
                                icon: TrashIcon, color: 'text-red-300 hover:text-red-600 hover:bg-red-50', onClick: async () => {
                                  if (confirm(`Supprimer l'article ${article.nom} ?`)) {
                                    try {
                                      await deleteProduct(article.id);
                                    } catch (err) {
                                      console.error('Failed to delete article', err);
                                    }
                                  }
                                }, title: "Supprimer"
                              }
                            ].map((action, i) => (
                              <button
                                key={i}
                                onClick={action.onClick}
                                className={`p-2 rounded-xl transition-all ${action.color}`}
                                title={action.title}
                              >
                                <action.icon className="h-4 w-4" />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <GestionCategoriesWidget />
          )}

          {activeTab === 'pricing' && (
            <GestionTarifsWidget />
          )}


          {activeTab === 'barcode' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic">Traçabilité & Flux</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Pilotage des identifiants SKU & QR Codes dynamiques</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setIsAddManualBarcodeModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-4 bg-slate-50 text-slate-900 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                  >
                    Ajout Manuel
                  </button>
                  <button
                    onClick={() => setIsGenerateAllModalOpen(true)}
                    className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3"
                  >
                    <QrCodeIcon className="h-4 w-4" />
                    Génération Auto
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-10 py-4 sm:py-8 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter italic">Codes-barres par Article</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Corrélation entre nomenclature et protocoles d'identification</p>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {barcodeData.length} Identifiants actifs
                  </div>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-slate-50/30">
                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Article & Flux</th>
                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Code Identifiant</th>
                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                        <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {barcodeData.map((barcode, index) => (
                        <tr key={index} className="group hover:bg-slate-50/50 transition-all">
                          <td className="px-4 sm:px-10 py-4 sm:py-6">
                            <div className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:translate-x-1 transition-transform">
                              {'article' in barcode ? barcode.article : (selectedArticle?.nom ?? '—')}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {'categorie' in barcode ? barcode.categorie : (selectedArticle?.categorie ?? '—')}
                            </div>
                          </td>
                          <td className="px-4 sm:px-10 py-4 sm:py-6">
                            <span className="px-3 py-1 bg-slate-100 text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-lg">
                              {barcode.type}
                            </span>
                          </td>
                          <td className="px-4 sm:px-10 py-4 sm:py-6">
                            <span className="text-xs font-black font-mono tracking-tighter text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                              {barcode.code}
                            </span>
                          </td>
                          <td className="px-4 sm:px-10 py-4 sm:py-6">
                            <span className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl ${barcode.status === 'Actif'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-red-50 text-red-600'
                              }`}>
                              {barcode.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-10 py-4 sm:py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              {[
                                { icon: EyeIcon, onClick: () => { setSelectedBarcodeForView(barcode); setIsBarcodeViewModalOpen(true); }, color: "hover:text-slate-900" },
                                { icon: PencilIcon, onClick: () => handleUpdateBarcodeStatus(barcode), color: "hover:text-cyan-600" },
                                { icon: DocumentTextIcon, onClick: () => { setSelectedBarcodeForDownload(barcode); setIsDownloadModalOpen(true); }, color: "hover:text-emerald-600" },
                                { icon: TrashIcon, onClick: () => handleDeleteBarcode(barcode), color: "hover:text-red-600" }
                              ].map((btn, i) => (
                                <button key={i} onClick={btn.onClick} className={`p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-300 ${btn.color}`}>
                                  <btn.icon className="h-4 w-4" />
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Génération Rapide</h4>
                    <div className="space-y-3">
                      {[
                        { label: "Tous les Articles", icon: QrCodeIcon, action: () => setIsGenerateAllModalOpen(true) },
                        { label: "Par Catégorie", icon: TagIcon, action: () => setIsGenerateByCategoryModalOpen(true) },
                        { label: "Design Étiquette", icon: PencilIcon, action: () => setIsCustomizeDesignModalOpen(true) }
                      ].map((btn, i) => (
                        <button
                          key={i}
                          onClick={btn.action}
                          className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-[1.5rem] transition-all group"
                        >
                          <div className="flex items-center gap-5">
                            <div className="p-3 bg-white/50 group-hover:bg-white/10 rounded-xl transition-colors">
                              <btn.icon className="h-5 w-5 text-slate-900 group-hover:text-white" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest">{btn.label}</span>
                          </div>
                          <PlusIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Exportation & Impression</h4>
                    <div className="space-y-3">
                      {[
                        { label: "Exporter Excel", icon: DocumentTextIcon, action: handleExportExcel },
                        { label: "Imprimer Étiquettes", icon: DocumentTextIcon, action: handlePrintLabels },
                        { label: "Télécharger PDF", icon: DocumentTextIcon, action: handleDownloadPDF }
                      ].map((btn, i) => (
                        <button
                          key={i}
                          onClick={btn.action}
                          className="w-full flex items-center justify-between p-5 border border-slate-100 hover:border-slate-900 rounded-[1.5rem] transition-all group"
                        >
                          <div className="flex items-center gap-5">
                            <div className="p-3 bg-slate-50 group-hover:bg-slate-900 rounded-xl transition-colors">
                              <btn.icon className="h-5 w-5 text-slate-400 group-hover:text-white" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest">{btn.label}</span>
                          </div>
                          <ArrowPathIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <DocumentTextIcon className="h-32 w-32" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Paramètres d'Impression</h4>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Format d'Étiquette</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-white/20 transition-all">
                          <option className="bg-slate-900">A4 - 21 étiquettes</option>
                          <option className="bg-slate-900">A4 - 65 étiquettes</option>
                          <option className="bg-slate-900">Rouleau 50x25mm</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Orientation</label>
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest transition-all">
                            <option className="bg-slate-900">Portrait</option>
                            <option className="bg-slate-900">Paysage</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Résolution</label>
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest transition-all">
                            <option className="bg-slate-900">300 DPI (Standard)</option>
                            <option className="bg-slate-900">600 DPI</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-6 space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-white focus:ring-white/20" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">Inclure le prix</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-white focus:ring-white/20" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">Inclure le nom</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Rapports */}
          {activeTab === 'reports' && (
            <RapportsArticlesWidget articles={products} stats={articleAnalytics} />
          )}
        </div>
      </Card>

      {/* Success Message */}
      {
        showSuccessMessage && successData && (
          <SuccessMessage
            title={successData.title}
            message={successData.message}
            details={successData.details}
            nextSteps={successData.nextSteps}
          />
        )
      }

      {/* Add/Edit Article Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedArticle ? t('articles.modal.edit_title') : t('articles.modal.create_title')}
        size="lg"
      >
        <form className="space-y-8 p-2 sm:p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t('articles.modal.article_name')}
              </label>
              <input
                type="text"
                defaultValue={selectedArticle?.nom || ''}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-xs font-bold uppercase transition-all"
                placeholder={t('articles.modal.placeholder_name')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t('articles.table.pca_code')} / Comptable
              </label>
              <select
                defaultValue={selectedArticle?.codePCA || ''}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-xs font-bold uppercase transition-all"
              >
                <option value="">Sélectionner un code</option>
                <option value="601100">601100 - Matières premières</option>
                <option value="602100">602100 - Fournitures consommables</option>
                <option value="355000">355000 - Produits finis</option>
                <option value="356000">356000 - Produits en cours</option>
                <option value="371000">371000 - Marchandises</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t('articles.modal.price_label')}
              </label>
              <input
                type="number"
                defaultValue={selectedArticle?.prixUnitaire || ''}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-xs font-black font-mono transition-all"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Stock Initial
              </label>
              <input
                type="number"
                defaultValue={selectedArticle?.stock || ''}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-xs font-black font-mono transition-all"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Catégorie Analytique
              </label>
              <select
                defaultValue={selectedArticle?.categorie || ''}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-xs font-bold uppercase transition-all"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Matières premières">Matières premières</option>
                <option value="Fournitures">Fournitures</option>
                <option value="Produits finis">Produits finis</option>
                <option value="Marchandises">Marchandises</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-slate-50">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
            >
              {t('articles.modal.cancel')}
            </button>
            <button
              type="submit"
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              {selectedArticle ? t('articles.modal.edit_btn') : t('articles.modal.create_btn')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Gestion des Tarifs */}
      {
        isPricingModalOpen && selectedArticle && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
              <div className="p-4 sm:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Gestion Tarification</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pilotage des marges : {selectedArticle.nom}</p>
                </div>
                <button onClick={() => setIsPricingModalOpen(false)} className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:bg-slate-900 hover:text-white transition-all self-end sm:self-auto">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-4 sm:p-10 space-y-8">
                <div className="p-4 sm:p-8 bg-slate-50 rounded-[2rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Prix Actuel de Référence</p>
                    <p className="text-2xl sm:text-4xl font-black font-mono tracking-tighter text-slate-900">{formatCurrency(selectedArticle.prixUnitaire)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg">Stable</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nouveau Tarif (DA)</label>
                    <input type="number" defaultValue={selectedArticle.prixUnitaire} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-lg font-black font-mono transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Justification Stratégique</label>
                    <textarea rows={3} placeholder="Note d'ajustement..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-xs font-bold transition-all"></textarea>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-10 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-4">
                <button onClick={() => setIsPricingModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 order-2 sm:order-1">Annuler</button>
                <button onClick={() => setIsPricingModalOpen(false)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 order-1 sm:order-2">Appliquer le tarif</button>
              </div>
            </div>
          </div>
        )
      }

      {
        isBarcodeModalOpen && selectedArticle && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
              <div className="p-4 sm:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Traçabilité Article</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Identifiants SKU & QR : {selectedArticle.nom}</p>
                </div>
                <button onClick={() => { setIsBarcodeModalOpen(false); setBarcodeGenerated(false); }} className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:bg-slate-900 hover:text-white transition-all self-end sm:self-auto">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-6 sm:p-10">
                {!barcodeGenerated ? (
                  <div className="text-center py-10">
                    <div className="h-48 w-48 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 mx-auto flex items-center justify-center mb-10 group hover:border-slate-900 transition-all">
                      <QrCodeIcon className="h-16 w-16 text-slate-200 group-hover:text-slate-900 transition-colors" />
                    </div>
                    <button
                      onClick={() => setBarcodeGenerated(true)}
                      className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 mx-auto"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Générer les identifiants
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Standard EAN-13</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">Actif</span>
                      </div>
                      <div className="flex items-end justify-center space-x-0.5 h-16 mb-6">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div key={i} className={`bg-slate-900 w-1 rounded-full ${i % 3 !== 0 ? 'h-12' : 'h-16'}`}></div>
                        ))}
                      </div>
                      <p className="text-center text-lg font-black font-mono tracking-[0.3em] text-slate-900">{selectedArticle.codePCA}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-8 bg-slate-50 rounded-[2rem] flex flex-col items-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6 text-center">QR Code Interne</p>
                        <div className="grid grid-cols-5 gap-1 bg-white p-4 rounded-2xl">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-sm ${i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-100'}`}></div>
                          ))}
                        </div>
                      </div>
                      <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col justify-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-4">Informations Système</p>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black flex justify-between uppercase"><span>Type:</span> <span className="text-white/70">EAN-13 / QR</span></p>
                          <p className="text-[10px] font-black flex justify-between uppercase"><span>Format:</span> <span className="text-white/70">Vectoriel</span></p>
                          <p className="text-[10px] font-black flex justify-between uppercase"><span>Status:</span> <span className="text-cyan-400">Validé</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                      <button className="w-full sm:w-auto px-8 py-4 bg-slate-50 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest">Imprimer</button>
                      <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Télécharger</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }


      {
        isBarcodeViewModalOpen && selectedBarcodeForView && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
              <div className="p-4 sm:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Inspection Identifiant</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedBarcodeForView.article} — {selectedBarcodeForView.type}</p>
                </div>
                <button onClick={() => setIsBarcodeViewModalOpen(false)} className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:bg-slate-900 hover:text-white transition-all self-end sm:self-auto">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-4 sm:p-10 flex flex-col items-center">
                <div className="bg-white p-6 sm:p-12 rounded-[2rem] border border-slate-100 shadow-sm mb-10 w-full flex flex-col items-center">
                  <div className="flex items-end justify-center space-x-0.5 h-24 mb-6">
                    {Array.from({ length: 45 }).map((_, i) => (
                      <div key={i} className={`bg-slate-900 w-1.5 rounded-full ${i % 3 !== 0 ? 'h-16' : 'h-24'}`}></div>
                    ))}
                  </div>
                  <p className="text-2xl font-black font-mono tracking-[0.4em] text-slate-900">{selectedBarcodeForView.code}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Date d'émission</p>
                    <p className="text-xs font-bold text-slate-900">{selectedBarcodeForView.dateCreation}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Catégorie</p>
                    <p className="text-xs font-bold text-slate-900 uppercase">{selectedBarcodeForView.categorie}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-10 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-4">
                <button onClick={() => setIsBarcodeViewModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 order-2 sm:order-1">Fermer</button>
                <button onClick={() => alert('📥 Téléchargé !')} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 order-1 sm:order-2">Télécharger PDF</button>
              </div>
            </div>
          </div>
        )
      }

      {
        isGenerateAllModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden border border-white/20">
              <div className="p-4 sm:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Traitement de Masse</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Génération globale des identifiants</p>
                </div>
                <button onClick={() => setIsGenerateAllModalOpen(false)} className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:bg-slate-900 hover:text-white transition-all self-end sm:self-auto">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-4 sm:p-10 space-y-8">
                <div className="p-4 sm:p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-xs font-bold text-slate-600 leading-relaxed mb-6 italic">Vous allez générer de nouveaux identifiants (EAN-13/QR) pour l'intégralité du catalogue ({products.length} articles).</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Volume à traiter</span>
                      <span className="text-slate-900">{products.length} Units</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 w-1/3"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Format de sortie obligatoire</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 text-[10px] font-black uppercase tracking-widest transition-all">
                    <option>Format EAN-13 (Standard)</option>
                    <option>Format QR Code (Digital)</option>
                    <option>Format Code-128 (Logistique)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 sm:p-10 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-4">
                <button onClick={() => setIsGenerateAllModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 order-2 sm:order-1">Annuler</button>
                <button onClick={() => setIsGenerateAllModalOpen(false)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 order-1 sm:order-2">Lancer l'exécution</button>
              </div>
            </div>
          </div>
        )
      }

      {
        isGenerateByCategoryModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden border border-white/20">
              <div className="p-4 sm:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Sélecteur Analytique</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Génération d'identifiants par segment</p>
                </div>
                <button onClick={() => setIsGenerateByCategoryModalOpen(false)} className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:bg-slate-900 hover:text-white transition-all self-end sm:self-auto">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-4 sm:p-10 space-y-4">
                {articleCategories.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">Aucune catégorie dans le catalogue</p>
                )}
                {articleCategories.map((cat) => (
                  <label key={cat.id} className="flex items-center justify-between p-5 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-slate-200 text-slate-900 focus:ring-slate-900" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cat.count} Articles</span>
                  </label>
                ))}
              </div>

              <div className="p-4 sm:p-10 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-4">
                <button onClick={() => setIsGenerateByCategoryModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 order-2 sm:order-1">Annuler</button>
                <button onClick={() => setIsGenerateByCategoryModalOpen(false)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 order-1 sm:order-2">Générer les codes</button>
              </div>
            </div>
          </div>
        )
      }

      {
        isCustomizeDesignModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full overflow-hidden border border-white/20">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Studio Label Design</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnalisation des étiquettes & tags</p>
                </div>
                <button onClick={() => setIsCustomizeDesignModalOpen(false)} className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dimensions (mm)</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                      <option>Standard 50 x 25</option>
                      <option>Medium 70 x 35</option>
                      <option>Large 100 x 50</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Options d'Affichage</label>
                    <div className="space-y-3">
                      {['Désignation Article', 'Prix de vente', 'Logo Entreprise', 'Date de production'].map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                          <input type="checkbox" defaultChecked={i < 2} className="w-5 h-5 rounded-lg border-slate-200 text-slate-900 focus:ring-slate-900" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-[2.5rem] flex flex-col items-center justify-center relative shadow-inner">
                  <div className="absolute top-4 left-4 text-[8px] font-black uppercase tracking-widest text-white/20 italic">Aperçu Temps Réel</div>
                  <div className="bg-white p-6 rounded-xl w-full max-w-[220px] shadow-2xl">
                    <div className="text-[9px] font-black uppercase tracking-tight text-slate-900 mb-1 border-b border-slate-100 pb-1">Nom du Produit</div>
                    <div className="flex items-end justify-center space-x-0.5 h-10 my-4">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`bg-slate-900 w-1 rounded-full ${i % 3 !== 0 ? 'h-6' : 'h-10'}`}></div>
                      ))}
                    </div>
                    <div className="text-right text-[10px] font-black font-mono">1.250,00 DA</div>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-50/50 flex justify-end gap-4">
                <button onClick={() => setIsCustomizeDesignModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Annuler</button>
                <button onClick={() => setIsCustomizeDesignModalOpen(false)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10">Sauvegarder</button>
              </div>
            </div>
          </div>
        )
      }

      {
        isAddManualBarcodeModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full overflow-hidden border border-white/20">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                    <QrCodeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Entrée Manuelle Flux</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enregistrement d'identifiants externes</p>
                  </div>
                </div>
                <button onClick={() => setIsAddManualBarcodeModalOpen(false)} className="h-10 w-10 flex items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Désignation Article</label>
                      <input type="text" value={newBarcode.article} onChange={(e) => setNewBarcode({ ...newBarcode, article: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 text-xs font-bold uppercase transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Catégorie Analytique</label>
                      <input type="text" value={newBarcode.categorie} onChange={(e) => setNewBarcode({ ...newBarcode, categorie: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 text-xs font-bold uppercase transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type de Protocole</label>
                      <select value={newBarcode.type} onChange={(e) => setNewBarcode({ ...newBarcode, type: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 text-xs font-black uppercase transition-all">
                        <option value="EAN-13">Standard EAN-13</option>
                        <option value="Code-128">Code-128 (Logistique)</option>
                        <option value="QR Code">QR Code Dynamique</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Code Identifiant</label>
                      <input type="text" value={newBarcode.code} onChange={(e) => setNewBarcode({ ...newBarcode, code: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 text-xs font-black font-mono tracking-widest transition-all" />
                    </div>
                  </div>

                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] flex flex-col justify-between border border-slate-100">
                  <div className="space-y-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visualisation</p>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                      <div className="flex items-end justify-center space-x-0.5 h-16 mb-4">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div key={i} className={`bg-slate-900 w-1 rounded-full ${i % 3 !== 0 ? 'h-10' : 'h-16'}`}></div>
                        ))}
                      </div>
                      <p className="text-xs font-black font-mono tracking-widest text-slate-900">{newBarcode.code || 'NO-VAL-SPECIFIED'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <button onClick={handleAddManualBarcode} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20">Enregistrer l'identifiant</button>
                    <button onClick={() => setIsAddManualBarcodeModalOpen(false)} className="w-full py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Annuler</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* 🤖 MODAL AUDIT INTELLIGENT IA */}
      <Modal
        isOpen={isAiAuditModalOpen}
        onClose={() => setIsAiAuditModalOpen(false)}
        title="Audit Intelligent : Inventaire & Flux"
        size="xl"
      >
        <div className="space-y-8 p-2">
          {isGeneratingAiAudit ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin"></div>
                <CpuChipIconSolid className="h-10 w-10 text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-black uppercase tracking-tighter">Analyse Cognitive de l'Inventaire</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Calcul des ratios de rotation & optimisation des stocks de sécurité</p>
              </div>
              <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 animate-loading-bar"></div>
              </div>
            </div>
          ) : aiAuditReport && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="bg-slate-900 text-white p-8 rounded-3xl border border-white/5 shadow-2xl mb-8 relative overflow-hidden">
                <SparklesIconSolid className="h-24 w-24 text-white/5 absolute -right-6 -top-6 rotate-12" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h4 className="text-3xl font-black uppercase tracking-tighter italic">Inventory Intelligence</h4>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Audit du 22 Février 2026 — 22:50</p>
                  </div>
                  <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/20">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 text-center mb-1">Score Santé Stock</p>
                    <p className="text-2xl font-black font-mono">{aiAuditReport.score}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheckIconSolid className="h-4 w-4 text-emerald-500" /> Points de Robustesse
                  </h5>
                  <ul className="space-y-4">
                    <li className="flex gap-4">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">Rotation Optimale</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">La catégorie "Produits Finis" affiche une rotation de 12x, supérieure à la moyenne du secteur.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">Valorisation Précise</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">Écart d'inventaire théorique vs réel réduit à 0.4% sur le dernier trimestre.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" /> Alertes & Risques IA
                  </h5>
                  <ul className="space-y-4">
                    {aiAuditReport.risks.map((risk: any, i: number) => (
                      <li key={i} className={`p-4 rounded-2xl border ${risk.level === 'high' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                        <p className={`text-xs font-black flex items-center gap-2 ${risk.level === 'high' ? 'text-red-900' : 'text-amber-900'}`}>
                          {risk.level === 'high' ? <XCircleIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />}
                          {risk.title}
                        </p>
                        <p className={`text-[10px] font-medium mt-1 ${risk.level === 'high' ? 'text-red-700' : 'text-amber-700'}`}>{risk.message}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Opportunités de Cash Flow</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiAuditReport.opportunities.map((opp: any, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 flex-shrink-0">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{opp.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{opp.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Exporter Audit complet</button>
                <button
                  onClick={() => setIsAiAuditModalOpen(false)}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Fermer l'Audit
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div >
  );
};

export default Articles;



