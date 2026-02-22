import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  TagIcon,
  CurrencyDollarIcon,
  TruckIcon,
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
  StarIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
// Centralized product catalog
import { useProducts } from '@core/context/ProductsContext';
import { Article } from '@/types';
import RapportsArticlesWidget from '@shared/components/Charts/RapportsArticlesWidget';
import GestionCategoriesWidget from '@shared/components/Charts/GestionCategoriesWidget';
import GestionTarifsWidget from '@shared/components/Charts/GestionTarifsWidget';
import GestionFournisseursWidget from '@shared/components/Charts/GestionFournisseursWidget';
import SuccessMessage from '@shared/components/UI/SuccessMessage';
import HelpButton from '@shared/components/UI/HelpButton';
import Tooltip from '@shared/components/UI/Tooltip';
import apiClient from '@/services/apiClient';
import { useArticles } from '@shared/hooks/useArticles';

// Données de codes-barres initiales
const initialBarcodesData = [
  { id: 1, article: 'Emballage C', type: 'EAN-13', code: '6011234567890', status: 'Actif', dateCreation: '15/09/2025', categorie: 'Fournitures' },
  { id: 2, article: 'Matière première A', type: 'EAN-13', code: '6011234567891', status: 'Actif', dateCreation: '12/09/2025', categorie: 'Matières premières' },
  { id: 3, article: 'Produit fini B', type: 'EAN-13', code: '3551234567892', status: 'Actif', dateCreation: '10/09/2025', categorie: 'Produits finis' },
  { id: 4, article: 'Emballage C', type: 'QR Code', code: 'QR-602100-001', status: 'Actif', dateCreation: '15/09/2025', categorie: 'Fournitures' },
  { id: 5, article: 'Matière première A', type: 'Code-128', code: 'C128-601100', status: 'Actif', dateCreation: '12/09/2025', categorie: 'Matières premières' },
  { id: 6, article: 'Produit fini B', type: 'QR Code', code: 'QR-355000-001', status: 'Inactif', dateCreation: '08/09/2025', categorie: 'Produits finis' },
  { id: 7, article: 'Accessoire D', type: 'EAN-13', code: '7781234567893', status: 'Actif', dateCreation: '05/09/2025', categorie: 'Accessoires' },
  { id: 8, article: 'Fourniture E', type: 'Code-128', code: 'C128-778900', status: 'Actif', dateCreation: '03/09/2025', categorie: 'Fournitures' }
];

const Articles: React.FC = () => {
  const { formatCurrency, user, companyData } = useApp();
  const { t } = useTranslation();

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
  const { products, setProducts, updateProduct } = useProducts();
  const filteredArticles: Article[] = products.filter((article: Article) =>
    article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.codePCA.includes(searchTerm)
  );

  // Fetch article statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await apiClient.get('/documents/articles/stats');
        setArticlesStats(response.data as { total: number; active: number; rotation: number; topSellers?: any[] });
        setErrorStats(null);
      } catch (err) {
        console.error('Error fetching article stats:', err);
        setErrorStats('Erreur lors du chargement des statistiques');
        // Set default stats if API fails
        setArticlesStats({
          total: products.length,
          active: Math.round(products.length * 0.85),
          rotation: 8.5
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
    const nombreArticles = Math.max(15, Math.floor(companyData.clientsCount * 0.6));
    const articlesActifs = Math.round(nombreArticles * 0.85);
    const rotationMoyenne = 8.5;

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <TagIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">Gestion des Articles</h1>
                  <HelpButton pageId="articles" variant="icon" className="text-white/80 hover:text-white" />
                </div>
                <p className="text-slate-300 text-lg mt-1">Catalogue produits et tarification</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg w-fit mb-3">
              <CubeIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Articles Actifs</h3>
            {loadingStats ? (
              <p className="text-2xl font-extrabold text-slate-400">...</p>
            ) : (
              <>
                <p className="text-3xl font-extrabold text-slate-900">{articlesStats?.active ?? 0}</p>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-emerald-600 font-semibold">📦 En catalogue ({articlesStats?.total ?? 0} total)</p>
                </div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg w-fit mb-3">
              <ArrowPathIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Rotation</h3>
            {loadingStats ? (
              <p className="text-2xl font-extrabold text-slate-400">...</p>
            ) : (
              <>
                <p className="text-3xl font-extrabold text-slate-900">{(articlesStats?.rotation ?? 0).toFixed(1)}x</p>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-blue-600 font-semibold">📊 Par an</p>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Actions Rapides</h3>
            <button
              onClick={() => {
                setSelectedArticle(null);
                setIsModalOpen(true);
              }}
              className="w-full p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Nouvel article
            </button>
          </div>
        </div>

        {/* Modal Nouvel Article pour EURL */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedArticle(null);
          }}
          title={selectedArticle ? 'Modifier Article' : 'Nouvel Article'}
          size="lg"
        >
          <form
            onSubmit={(e) => {
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
                  title: '✅ Article modifié avec succès !',
                  message: `L'article "${nom}" a été mis à jour dans votre catalogue.`,
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
                // Création d'un nouvel article
                const newArticle: Article = {
                  id: `ART-${Date.now()}`,
                  nom,
                  codePCA,
                  prixUnitaire,
                  unite,
                  stock: 0,
                  description,
                  categorie: 'Général'
                };
                // Ajouter au contexte (simulation locale)
                setProducts([...products, newArticle]);
                setSuccessData({
                  title: '✅ Article créé avec succès !',
                  message: `L'article "${nom}" a été ajouté à votre catalogue.`,
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
                  Nom de l'article <span className="text-red-500">*</span>
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
                  Code PCA
                </label>
                <select
                  name="codePCA"
                  defaultValue={selectedArticle?.codePCA || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Sélectionner le code PCA"
                  title="Sélectionner le code PCA"
                >
                  <option value="">Sélectionner un code</option>
                  <option value="601100">601100 - Matières premières</option>
                  <option value="602100">602100 - Fournitures consommables</option>
                  <option value="355000">355000 - Produits finis</option>
                  <option value="356000">356000 - Produits en cours</option>
                  <option value="371000">371000 - Marchandises</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix unitaire (DZD) <span className="text-red-500">*</span>
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
                  Unité
                </label>
                <select
                  name="unite"
                  defaultValue={selectedArticle?.unite || 'unité'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Sélectionner l'unité"
                  title="Sélectionner l'unité"
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
                Description
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
                Annuler
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Catalogue des Articles</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Article</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Code PCA</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Prix Unitaire</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Valeur</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
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
                            {article.stock} {article.unite || 'unité'}
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
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Êtes-vous sûr de vouloir supprimer "${article.nom}" ?`)) {
                                  // Supprimer l'article de la liste
                                  setProducts(products.filter(a => a.id !== article.id));
                                  alert('Article supprimé avec succès !');
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
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
              <p className="text-slate-500 text-lg font-medium">Aucun article trouvé</p>
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
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
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

  const handleSupplierManagement = (article: Article) => {
    setSelectedArticle(article);
    setIsSupplierModalOpen(true);
  };

  // Données ERPNext pour les articles
  const articleCategories = [
    { id: 1, name: 'Matières Premières', code: 'MP', count: 45, value: 125000 },
    { id: 2, name: 'Produits Finis', code: 'PF', count: 32, value: 280000 },
    { id: 3, name: 'Marchandises', code: 'M', count: 28, value: 95000 },
    { id: 4, name: 'Fournitures', code: 'F', count: 15, value: 35000 }
  ];

  const supplierData = selectedArticle ? [
    { name: 'Fournisseur A', price: 120, delivery: 5, quality: 'Excellent', lastOrder: '2024-01-10' },
    { name: 'Fournisseur B', price: 125, delivery: 3, quality: 'Bon', lastOrder: '2024-01-08' },
    { name: 'Fournisseur C', price: 118, delivery: 7, quality: 'Moyen', lastOrder: '2024-01-05' }
  ] : [];

  // Fonctions de gestion des codes-barres
  const handleDeleteBarcode = (barcode: any) => {
    if (!("id" in barcode)) {
      return; // Exemple/démo sans ID: ignorer l'action destructive
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
      return; // Exemple/démo sans ID: ignorer l'action de statut
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
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `codes_barres_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    alert('✅ Fichier Excel exporté avec succès !\n\nFichier: codes_barres_export.csv\nNombre de codes: ' + barcodes.length);
  };

  const handlePrintLabels = () => {
    window.print();
    alert('🖨️ Impression lancée !\n\nFormat: A4 (21 étiquettes par page)\nNombre de codes: ' + barcodes.length);
  };

  const handleDownloadPDF = () => {
    alert('📄 Génération du PDF en cours...\n\n' + barcodes.length + ' codes-barres inclus\nFichier: codes_barres_catalogue.pdf\n\n✅ PDF prêt pour le téléchargement !');
  };

  // Exemples de démo pour codes-barres
  const demoExamples = [
    { article: 'Laptop Dell XPS 15', type: 'EAN-13', code: '9876543210987', categorie: 'Électronique' },
    { article: 'Chaise de Bureau Ergonomique', type: 'Code-128', code: 'CB-CHAIR-2025', categorie: 'Mobilier' },
    { article: 'Smartphone Samsung Galaxy', type: 'QR Code', code: 'QR-SAMSUNG-S24', categorie: 'Téléphonie' },
    { article: 'Clavier Mécanique RGB', type: 'EAN-13', code: '5432109876543', categorie: 'Accessoires' }
  ];

  const handleLoadDemoExample = (index: number) => {
    const example = demoExamples[index];
    setNewBarcode({
      ...example,
      status: 'Actif'
    });
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

  const barcodeData = selectedArticle ? [
    { type: 'EAN-13', code: '1234567890123', status: 'Actif' },
    { type: 'Code-128', code: 'ABC123456', status: 'Actif' },
    { type: 'QR Code', code: 'QR-ABC-123', status: 'Inactif' }
  ] : barcodes;

  const articleAnalytics = {
    totalArticles: products.length,
    totalValue: products.reduce((sum, article) => sum + (article.prixUnitaire * article.stock), 0),
    lowStock: products.filter(article => article.stock < 20).length,
    outOfStock: products.filter(article => article.stock === 0).length,
    topSelling: [...products].sort((a, b) => b.stock - a.stock).slice(0, 5),
    categories: articleCategories
  };

  return (
    <div className="space-y-6">
      {/* Header de la page */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <CubeIcon className="h-6 w-6 text-cyan-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Articles & Inventaire</h1>
            </div>
            <p className="text-slate-600">Gestion du catalogue produits, stock et inventaires</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm text-slate-500">Total articles</div>
              <div className="text-2xl font-bold text-cyan-600">{products.length}</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <nav className="flex flex-wrap border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'catalogue', name: 'Catalogue', icon: BuildingOfficeIcon },
            { id: 'categories', name: 'Catégories', icon: TagIcon },
            { id: 'pricing', name: 'Tarification', icon: CurrencyDollarIcon },
            { id: 'suppliers', name: 'Fournisseurs', icon: TruckIcon },
            { id: 'barcode', name: 'Codes-barres', icon: QrCodeIcon },
            { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
            { id: 'reports', name: 'Rapports', icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600 bg-cyan-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>

        <div className="p-6">
          {activeTab === 'catalogue' && (
            <div className="space-y-6">
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <div className="w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou code PCA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={handleAdd}
                  className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  {t('ajouter')} Article
                </button>
              </div>

              {/* Articles Table */}
              <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Code PCA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Prix Unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Valeur Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Actions ERPNext
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{article.nom}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{article.categorie}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                            {article.codePCA}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(article.prixUnitaire)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${article.stock > 50 ? 'text-emerald-600 dark:text-emerald-400' : article.stock > 20 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                            {article.stock} unités
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(article.prixUnitaire * article.stock)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(article)}
                              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Modifier l'article"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handlePricingManagement(article)}
                              className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Gestion des tarifs"
                            >
                              <CurrencyDollarIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleBarcodeManagement(article)}
                              className="p-2 text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                              title="Codes-barres"
                            >
                              <QrCodeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleSupplierManagement(article)}
                              className="p-2 text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                              title="Fournisseurs"
                            >
                              <TruckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Êtes-vous sûr de vouloir supprimer "${article.nom}" ?`)) {
                                  alert(`Article "${article.nom}" supprimé avec succès !`);
                                }
                              }}
                              className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Supprimer l'article"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section Rapports Rapides */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded">
                      <TagIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span>Gestion des Catégories</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Gérer
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">Total Catégories</p>
                        <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">5</p>
                      </div>
                      <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg">
                        <TagIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Catégories Actives</p>
                        <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">4</p>
                      </div>
                      <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-lg">
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">Articles Total</p>
                        <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">960</p>
                      </div>
                      <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg">
                        <CubeIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">Top Catégories par Performance</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Informatique</span>
                      </div>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">+12.5%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Téléphonie</span>
                      </div>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">+15.8%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Mobilier</span>
                      </div>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">+8.2%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded">
                      <CurrencyDollarIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span>Gestion des Tarifs</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Gérer
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">Modifications</p>
                        <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">5</p>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400">Ce mois</p>
                      </div>
                      <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg">
                        <CurrencyDollarIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Appliquées</p>
                        <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">4</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Prix mis à jour</p>
                      </div>
                      <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-lg">
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">En Attente</p>
                        <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">1</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">Validation requise</p>
                      </div>
                      <div className="bg-amber-600 dark:bg-amber-500 p-2 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">Modifications Récentes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center space-x-3">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Ordinateur Dell</span>
                      </div>
                      <span className="text-sm text-red-600 dark:text-red-400 font-bold">+3.7%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center space-x-3">
                        <ArrowTrendingDownIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Chaise Ergonomique</span>
                      </div>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">-6.3%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <div className="flex items-center space-x-3">
                        <ArrowTrendingDownIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Samsung Galaxy</span>
                      </div>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">-3.8%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded">
                      <DocumentTextIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <span>Rapports Articles</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Voir Détails
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">Total Articles</p>
                        <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">1,250</p>
                      </div>
                      <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg">
                        <CubeIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Valeur Stock</p>
                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">2.45M DA</p>
                      </div>
                      <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-lg">
                        <CurrencyDollarIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">Chiffre d'Affaires</p>
                        <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">1.85M DA</p>
                      </div>
                      <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Marge Brute</p>
                        <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">425K DA</p>
                      </div>
                      <div className="bg-amber-600 dark:bg-amber-500 p-2 rounded-lg">
                        <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">Alertes Stock</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
                      <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">45 articles en rupture</span>
                      </div>
                      <span className="text-sm text-red-700 dark:text-red-300 font-bold px-2 py-1 bg-red-100 dark:bg-red-900/40 rounded">Urgent</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all">
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">125 articles stock faible</span>
                      </div>
                      <span className="text-sm text-amber-700 dark:text-amber-300 font-bold px-2 py-1 bg-amber-100 dark:bg-amber-900/40 rounded">Attention</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">980 articles en stock normal</span>
                      </div>
                      <span className="text-sm text-emerald-700 dark:text-emerald-300 font-bold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 rounded">OK</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Onglet Catégories */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <GestionCategoriesWidget />
            </div>
          )}

          {/* Onglet Tarification */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <GestionTarifsWidget />
            </div>
          )}

          {/* Onglet Fournisseurs */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <GestionFournisseursWidget />
            </div>
          )}

          {/* Onglet Codes-barres */}
          {activeTab === 'barcode' && (
            <div className="space-y-6">
              {/* Messages de succès */}
              {showDeleteSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg flex items-center space-x-3 animate-slide-in-down">
                  <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Code-barres supprimé !</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Le code "{deletedBarcodeName}" a été supprimé avec succès.</p>
                  </div>
                </div>
              )}

              {showUpdateSuccess && (
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 rounded-lg flex items-center space-x-3 animate-slide-in-down">
                  <CheckCircleIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  <div>
                    <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">Statut mis à jour !</p>
                    <p className="text-xs text-cyan-700 dark:text-cyan-300">Le statut du code-barres a été modifié.</p>
                  </div>
                </div>
              )}

              {showAddSuccess && (
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 rounded-lg flex items-center space-x-3 animate-slide-in-down">
                  <CheckCircleIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  <div>
                    <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">Code-barres ajouté !</p>
                    <p className="text-xs text-cyan-700 dark:text-cyan-300">Le nouveau code-barres a été ajouté avec succès.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gestion des Codes-barres</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Génération et gestion centralisée des codes-barres</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setIsAddManualBarcodeModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 border border-emerald-500 dark:border-emerald-400"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Ajouter Manuellement</span>
                  </button>
                  <button
                    onClick={() => setIsGenerateAllModalOpen(true)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 border border-slate-600 dark:border-slate-500"
                  >
                    <QrCodeIcon className="h-5 w-5" />
                    <span>Générer Auto</span>
                  </button>
                </div>
              </div>

              {/* Statistiques des Codes-barres - Mises à jour en temps réel */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">Total Codes</p>
                      <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{barcodes.length}</p>
                    </div>
                    <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg">
                      <QrCodeIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Codes Actifs</p>
                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{barcodes.filter(b => b.status === 'Actif').length}</p>
                    </div>
                    <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">EAN-13</p>
                      <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{barcodes.filter(b => b.type === 'EAN-13').length}</p>
                    </div>
                    <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg">
                      <TagIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">QR Codes</p>
                      <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{barcodes.filter(b => b.type === 'QR Code').length}</p>
                    </div>
                    <div className="bg-amber-600 dark:bg-amber-500 p-2 rounded-lg">
                      <QrCodeIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded mr-2">
                      <QrCodeIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Codes-barres par Article</h4>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{barcodeData.length} codes au total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Article</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Catégorie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date Création</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {barcodeData.map((barcode, index) => (
                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {'article' in barcode ? barcode.article : (selectedArticle?.nom ?? '—')}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {'categorie' in barcode ? barcode.categorie : (selectedArticle?.categorie ?? '—')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1.5 rounded ${barcode.type === 'EAN-13' ? 'bg-cyan-100 dark:bg-cyan-900/30' :
                                  barcode.type === 'QR Code' ? 'bg-cyan-100 dark:bg-cyan-900/30' :
                                    'bg-emerald-100 dark:bg-emerald-900/30'
                                }`}>
                                <QrCodeIcon className={`h-4 w-4 ${barcode.type === 'EAN-13' ? 'text-cyan-600 dark:text-cyan-400' :
                                    barcode.type === 'QR Code' ? 'text-cyan-600 dark:text-cyan-400' :
                                      'text-emerald-600 dark:text-emerald-400'
                                  }`} />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{barcode.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded border border-slate-200 dark:border-slate-600">
                              {barcode.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-gray-100">{'categorie' in barcode ? barcode.categorie : (selectedArticle?.categorie ?? '—')}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{'dateCreation' in barcode ? barcode.dateCreation : '—'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${barcode.status === 'Actif'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                              }`}>
                              {barcode.status === 'Actif' ? <CheckCircleIcon className="h-3 w-3 mr-1" /> : <XCircleIcon className="h-3 w-3 mr-1" />}
                              {barcode.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedBarcodeForView(barcode);
                                  setIsBarcodeViewModalOpen(true);
                                }}
                                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Voir le code"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleUpdateBarcodeStatus(barcode)}
                                className="p-2 text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                                title="Changer le statut"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBarcodeForDownload(barcode);
                                  setIsDownloadModalOpen(true);
                                }}
                                className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                title="Télécharger"
                              >
                                <DocumentTextIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBarcode(barcode)}
                                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section Génération Rapide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded mr-2">
                      <QrCodeIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    Génération Rapide
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsGenerateAllModalOpen(true)}
                      className="w-full flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                    >
                      <QrCodeIcon className="h-5 w-5 mr-2" />
                      Générer pour Tous les Articles
                    </button>
                    <button
                      onClick={() => setIsGenerateByCategoryModalOpen(true)}
                      className="w-full flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                    >
                      <TagIcon className="h-5 w-5 mr-2" />
                      Générer par Catégorie
                    </button>
                    <button
                      onClick={() => setIsCustomizeDesignModalOpen(true)}
                      className="w-full flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                    >
                      <PencilIcon className="h-5 w-5 mr-2" />
                      Personnaliser le Design
                    </button>
                  </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded mr-2">
                      <DocumentTextIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    Exportation & Impression
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportExcel}
                      className="w-full flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                    >
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Exporter en Excel
                    </button>
                    <button
                      onClick={handlePrintLabels}
                      className="w-full flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                    >
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Imprimer les Étiquettes
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                    >
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Télécharger PDF
                    </button>
                  </div>
                </Card>
              </div>

              {/* Section Paramètres d'Impression */}
              <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                  <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                    <DocumentTextIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  Paramètres d'Impression
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format d'Étiquette</label>
                    <select aria-label="Format d'Étiquette" className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-white">
                      <option>A4 - 21 étiquettes</option>
                      <option>A4 - 65 étiquettes</option>
                      <option>Rouleau 50x25mm</option>
                      <option>Rouleau 100x50mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Orientation</label>
                    <select aria-label="Orientation" className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-white">
                      <option>Portrait</option>
                      <option>Paysage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Résolution</label>
                    <select aria-label="Résolution" className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-white">
                      <option>300 DPI (Standard)</option>
                      <option>600 DPI (Haute qualité)</option>
                      <option>1200 DPI (Très haute qualité)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <input type="checkbox" id="include-price" defaultChecked className="w-4 h-4 text-cyan-600 rounded focus:ring-blue-500" />
                    <label htmlFor="include-price" className="text-sm font-medium text-gray-900 dark:text-gray-100">Inclure le prix</label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <input type="checkbox" id="include-name" defaultChecked className="w-4 h-4 text-cyan-600 rounded focus:ring-blue-500" />
                    <label htmlFor="include-name" className="text-sm font-medium text-gray-900 dark:text-gray-100">Inclure le nom</label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <input type="checkbox" id="include-logo" className="w-4 h-4 text-cyan-600 rounded focus:ring-blue-500" />
                    <label htmlFor="include-logo" className="text-sm font-medium text-gray-900 dark:text-gray-100">Inclure le logo entreprise</label>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Onglet Analytics - Palette Slate Professionnelle Enrichie */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* En-tête avec actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
                      <ChartBarIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                    </div>
                    Analytics des Articles
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 ml-14">Vue d'ensemble complète de votre inventaire</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>Exporter</span>
                  </button>
                </div>
              </div>

              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Total Articles</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{articleAnalytics.totalArticles}</p>
                      <div className="mt-2 flex items-center text-xs text-emerald-600">
                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        <span className="font-semibold">+8.2%</span>
                        <span className="ml-1 text-slate-500">vs mois dernier</span>
                      </div>
                    </div>
                    <div className="p-3 bg-cyan-100 rounded-lg">
                      <CubeIcon className="h-6 w-6 text-cyan-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Valeur Totale</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(articleAnalytics.totalValue)}</p>
                      <div className="mt-2 flex items-center text-xs text-emerald-600">
                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        <span className="font-semibold">+12.4%</span>
                        <span className="ml-1 text-slate-500">croissance</span>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Stock Faible</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">{articleAnalytics.lowStock}</p>
                      <div className="mt-2 text-xs text-amber-600">
                        <span className="font-semibold">Attention requise</span>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Rupture de Stock</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">{articleAnalytics.outOfStock}</p>
                      <div className="mt-2 text-xs text-red-600">
                        <span className="font-semibold">Action immédiate</span>
                      </div>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <XCircleIcon className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Métriques supplémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg">
                      <ChartBarIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">+15%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.2×</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Taux de Rotation</div>
                  <div className="mt-3 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-cyan-600 h-full w-[84%]"></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg">
                      <CubeIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-1 rounded">Normal</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">87%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Taux de Disponibilité</div>
                  <div className="mt-3 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-cyan-600 h-full w-[87%]"></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">+22%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">156K دج</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Valeur Moyenne/Article</div>
                  <div className="mt-3 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[72%]"></div>
                  </div>
                </div>
              </div>

              {/* Graphiques et listes enrichis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 des Articles */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded mr-2">
                        <StarIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      Top 5 des Articles
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Par stock</span>
                  </div>
                  <div className="space-y-3">
                    {articleAnalytics.topSelling.map((article, index) => (
                      <div key={article.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-500 text-white' :
                              index === 1 ? 'bg-slate-400 text-white' :
                                index === 2 ? 'bg-amber-700 text-white' :
                                  'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                            }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{article.nom}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{article.stock}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">unités</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Répartition par Catégorie */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded mr-2">
                        <TagIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Répartition par Catégorie
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">4 catégories</span>
                  </div>
                  <div className="space-y-3">
                    {articleAnalytics.categories.map((category, index) => {
                      const colors = [
                        { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', bar: 'bg-cyan-600', border: 'border-cyan-300 dark:border-cyan-600' },
                        { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-600', border: 'border-emerald-300 dark:border-emerald-600' },
                        { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', bar: 'bg-cyan-600', border: 'border-cyan-300 dark:border-cyan-600' },
                        { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-600', border: 'border-amber-300 dark:border-amber-600' }
                      ];
                      const color = colors[index % colors.length];
                      const percentageValue = (category.count / articleAnalytics.totalArticles * 100);
                      const percentage = percentageValue.toFixed(1);

                      return (
                        <div key={category.id} className={`p-3 ${color.bg} rounded-lg border ${color.border}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-semibold ${color.text}`}>{category.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold ${color.text}`}>{category.count}</span>
                              <span className={`text-xs ${color.text}`}>articles</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-white/50 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                              <div className={`${color.bar} h-full transition-all duration-500 ${percentageValue >= 90 ? 'w-[95%]' : percentageValue >= 75 ? 'w-[80%]' : percentageValue >= 50 ? 'w-[60%]' : percentageValue >= 25 ? 'w-[40%]' : 'w-[20%]'}`}></div>
                            </div>
                            <span className={`text-xs font-medium ${color.text}`}>{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Alertes et insights */}
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Insights Clés</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Meilleure catégorie</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">Matières Premières</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+18% ce mois</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Croissance moyenne</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">+12.8%</p>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Très bon</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Prochaine commande</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">Dans 5 jours</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Planifiée</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Rapports */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <RapportsArticlesWidget />
            </div>
          )}
        </div>
      </Card>

      {/* Success Message */}
      {showSuccessMessage && successData && (
        <SuccessMessage
          title={successData.title}
          message={successData.message}
          details={successData.details}
          nextSteps={successData.nextSteps}
        />
      )}

      {/* Add/Edit Article Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedArticle ? 'Modifier Article' : 'Ajouter Article'}
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'article
              </label>
              <input
                type="text"
                defaultValue={selectedArticle?.nom || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Matière première A"
              />
            </div>

            <div>
              <label htmlFor="codePCA" className="block text-sm font-medium text-gray-700 mb-1">
                Code PCA
              </label>
              <select
                id="codePCA"
                defaultValue={selectedArticle?.codePCA || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un code</option>
                <option value="601100">601100 - Matières premières</option>
                <option value="602100">602100 - Fournitures consommables</option>
                <option value="355000">355000 - Produits finis</option>
                <option value="356000">356000 - Produits en cours</option>
                <option value="371000">371000 - Marchandises</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix unitaire (DZD)
              </label>
              <input
                type="number"
                defaultValue={selectedArticle?.prixUnitaire || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock initial
              </label>
              <input
                type="number"
                defaultValue={selectedArticle?.stock || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="categorie"
                defaultValue={selectedArticle?.categorie || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Matières premières">Matières premières</option>
                <option value="Fournitures">Fournitures</option>
                <option value="Produits finis">Produits finis</option>
                <option value="Marchandises">Marchandises</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-black transition-colors font-medium"
            >
              {selectedArticle ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Gestion des Tarifs */}
      {isPricingModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gestion des Tarifs</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedArticle.nom}</p>
                  </div>
                </div>
                <button onClick={() => setIsPricingModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <Card className="p-4 mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Prix Actuel
                    </p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                      {formatCurrency(selectedArticle.prixUnitaire)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Dernière modification</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">15 Sep 2025</p>
                  </div>
                </div>
              </Card>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nouveau-prix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nouveau Prix</label>
                  <input id="nouveau-prix" type="number" defaultValue={selectedArticle.prixUnitaire} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Raison du changement</label>
                  <textarea rows={3} placeholder="Expliquez la raison..." className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"></textarea>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button onClick={() => setIsPricingModalOpen(false)} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium">Annuler</button>
              <button onClick={() => { alert(`Prix mis à jour pour ${selectedArticle.nom}`); setIsPricingModalOpen(false); }} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"><CheckCircleIcon className="h-5 w-5" /><span>Appliquer</span></button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Code-Barres */}
      {isBarcodeModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg">
                    <QrCodeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Code-Barres & QR Code</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedArticle.nom}</p>
                  </div>
                </div>
                <button onClick={() => { setIsBarcodeModalOpen(false); setBarcodeGenerated(false); }} className="text-slate-400 hover:text-slate-600 rounded-lg p-2">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {!barcodeGenerated ? (
                <div className="text-center">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-12 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 mb-6">
                    <QrCodeIcon className="h-32 w-32 mx-auto text-slate-400 mb-4" />
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedArticle.codePCA}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{selectedArticle.nom}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{selectedArticle.categorie}</p>
                  </div>
                  <button
                    onClick={() => setBarcodeGenerated(true)}
                    className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg flex items-center space-x-2 mx-auto"
                  >
                    <QrCodeIcon className="h-5 w-5" />
                    <span>Générer Code-Barres</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Code-Barres Généré */}
                  <div className="bg-white dark:bg-slate-700 p-8 rounded-lg border border-slate-200 dark:border-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          Code-Barres EAN-13
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {selectedArticle.codePCA}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{selectedArticle.nom}</span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">Actif</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleDeleteBarcode({ id: selectedArticle.id, code: selectedArticle.codePCA, article: selectedArticle.nom })}
                          className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer le code-barres"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-center">
                        <div className="flex-shrink-0 w-24 h-24">
                          {/* Simulation de code-barres avec des barres verticales (classes statiques pour la démo) */}
                          <div className="flex items-end justify-center space-x-px mx-auto h-full max-w-full">
                            {[3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 1, 4, 3, 1, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 3, 2, 1].map((height, idx) => (
                              <div
                                key={idx}
                                className={`bg-black w-[2px] ${height === 1 ? 'h-[15px]' : height === 2 ? 'h-[30px]' : height === 3 ? 'h-[45px]' : 'h-[60px]'}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg border border-slate-200 dark:border-slate-600 text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">QR Code</p>
                      <div className="bg-white p-4 rounded inline-block">
                        {/* Simulation de QR code */}
                        <div className="grid grid-cols-8 gap-1">
                          {Array.from({ length: 64 }, (_, i) => (
                            <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white border border-gray-200'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-lg border border-cyan-200 dark:border-cyan-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Informations du Code</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Type</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">EAN-13</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Code</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{selectedArticle.codePCA}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Généré le</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{new Date().toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Format</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">PNG / SVG</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => alert('📥 Téléchargé !')}
                      className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                      <span>Télécharger</span>
                    </button>
                    <button
                      onClick={() => alert('🖨️ Impression du code-barres pour ${selectedArticle.nom}')}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                      <span>Imprimer</span>
                    </button>
                    <button
                      onClick={() => setBarcodeGenerated(false)}
                      className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button onClick={() => { setIsBarcodeModalOpen(false); setBarcodeGenerated(false); }} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestion Fournisseurs */}
      {isSupplierModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-600 dark:bg-cyan-500 p-2 rounded-lg">
                    <TruckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Fournisseurs de l'Article</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedArticle.nom}</p>
                  </div>
                </div>
                <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-lg p-2">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-3">
                {supplierData.map((supplier, idx) => (
                  <Card key={idx} className="p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded">
                          <BuildingOfficeIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{supplier.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Dernière commande: {supplier.lastOrder}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(supplier.price)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{supplier.delivery}j • {supplier.quality}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button onClick={() => setIsSupplierModalOpen(false)} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Voir Code-Barres */}
      {isBarcodeViewModalOpen && selectedBarcodeForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedBarcodeForView.article}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedBarcodeForView.type} • {selectedBarcodeForView.code}</p>
                </div>
                <button onClick={() => setIsBarcodeViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-lg p-2"><span className="text-2xl">&times;</span></button>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="bg-white p-8 rounded-lg border-2 border-slate-200 dark:border-slate-600 mb-4">
                <div className="flex items-end justify-center space-x-px mx-auto h-[100px] max-w-full">
                  {[3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 1, 4, 3, 1, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 3, 2, 1].map((height, idx) => (
                    <div
                      key={idx}
                      className={`bg-black w-[2px] ${height === 1 ? 'h-[15px]' : height === 2 ? 'h-[30px]' : height === 3 ? 'h-[45px]' : 'h-[60px]'}`}
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-lg font-bold text-gray-900 mt-2 sm:mt-3 font-mono tracking-wider break-all">{selectedBarcodeForView.code}</p>
              </div>
              <div className="flex justify-center space-x-3">
                <button onClick={() => alert('📥 Téléchargé !')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium flex items-center space-x-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Télécharger</span>
                </button>
                <button onClick={() => setIsBarcodeViewModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Générer Tous les Codes */}
      {isGenerateAllModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-600 p-2 rounded-lg"><QrCodeIcon className="h-6 w-6 text-white" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Génération en Masse</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Générer des codes pour tous les articles</p>
                  </div>
                </div>
                <button onClick={() => setIsGenerateAllModalOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-lg p-2"><span className="text-2xl">&times;</span></button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de Code</label>
                  <select aria-label="Type de Code" className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                    <option>EAN-13</option>
                    <option>Code-128</option>
                    <option>QR Code</option>
                  </select>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-700">
                  <p className="text-sm text-cyan-900 dark:text-cyan-100 font-medium">📊 {products.length} articles seront traités</p>
                  <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">Durée estimée: ~30 secondes</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button onClick={() => setIsGenerateAllModalOpen(false)} className="px-6 py-2.5 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={() => { alert('✅ Génération lancée pour tous les articles !'); setIsGenerateAllModalOpen(false); }} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Générer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Générer par Catégorie */}
      {isGenerateByCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-600 p-2 rounded-lg"><TagIcon className="h-6 w-6 text-white" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Génération par Catégorie</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Sélectionnez les catégories à traiter</p>
                  </div>
                </div>
                <button onClick={() => setIsGenerateByCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-lg p-2"><span className="text-2xl">&times;</span></button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {['Matières premières', 'Produits finis', 'Fournitures', 'Accessoires', 'Marchandises'].map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center space-x-3">
                      <input aria-label={`Inclure catégorie ${cat}`} type="checkbox" defaultChecked className="w-4 h-4 text-cyan-600 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{Math.floor(Math.random() * 50) + 10} articles</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button onClick={() => setIsGenerateByCategoryModalOpen(false)} className="px-6 py-2.5 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={() => { alert('✅ Codes générés pour les catégories sélectionnées !'); setIsGenerateByCategoryModalOpen(false); }} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Générer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Personnaliser Design */}
      {isCustomizeDesignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-600 p-2 rounded-lg"><PencilIcon className="h-6 w-6 text-white" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Personnaliser le Design</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Configuration de l'apparence des étiquettes</p>
                  </div>
                </div>
                <button onClick={() => setIsCustomizeDesignModalOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-lg p-2"><span className="text-2xl">&times;</span></button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taille de l'Étiquette</label>
                  <select aria-label="Taille de l'Étiquette" className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                    <option>50 x 25 mm</option>
                    <option>100 x 50 mm</option>
                    <option>70 x 35 mm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Police de Caractère</label>
                  <select aria-label="Police de Caractère" className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                    <option>Arial</option>
                    <option>Helvetica</option>
                    <option>Courier</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <input id="show-name" type="checkbox" defaultChecked className="w-4 h-4 text-cyan-600 rounded" />
                  <label htmlFor="show-name" className="text-sm font-medium text-gray-900 dark:text-gray-100">Afficher le nom de l'article</label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <input id="show-price" type="checkbox" defaultChecked className="w-4 h-4 text-cyan-600 rounded" />
                  <label htmlFor="show-price" className="text-sm font-medium text-gray-900 dark:text-gray-100">Afficher le prix</label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <input id="show-logo" type="checkbox" className="w-4 h-4 text-cyan-600 rounded" />
                  <label htmlFor="show-logo" className="text-sm font-medium text-gray-900 dark:text-gray-100">Afficher le logo entreprise</label>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button onClick={() => setIsCustomizeDesignModalOpen(false)} className="px-6 py-2.5 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={() => { alert('✅ Configuration sauvegardée !'); setIsCustomizeDesignModalOpen(false); }} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Manuel Code-Barres - Palette Slate Professionnelle */}
      {isAddManualBarcodeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-700 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* En-tête - Palette Slate Professionnelle */}
              <div className="bg-slate-700 dark:bg-slate-600 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <div className="flex justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="bg-slate-800 dark:bg-slate-700 p-2 rounded-lg flex-shrink-0">
                      <QrCodeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">Ajouter un Code-Barres Manuellement</h3>
                      <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-400 mt-1">Saisissez les informations ou choisissez un exemple de démo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddManualBarcodeModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5 sm:p-2 transition-all flex-shrink-0"
                  >
                    <span className="text-xl sm:text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              {/* Corps du Modal */}
              <div className="p-4 sm:p-6">
                {/* Exemples de Démo - Palette Slate */}
                <div className="mb-6 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <div className="bg-slate-800 dark:bg-slate-700 p-1.5 rounded mr-2">
                      <StarIcon className="h-4 w-4 text-white" />
                    </div>
                    Exemples de Démo - Cliquez pour charger
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {demoExamples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleLoadDemoExample(index)}
                        className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{example.article}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {example.type} • {example.code}
                            </p>
                            <span className="inline-block mt-2 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded font-medium border border-slate-200 dark:border-slate-600">
                              {example.categorie}
                            </span>
                          </div>
                          <PlusIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 flex-shrink-0 ml-2" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formulaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Colonne Gauche */}
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                        <div className="bg-slate-800 dark:bg-slate-700 p-1.5 rounded mr-2">
                          <TagIcon className="h-4 w-4 text-white" />
                        </div>
                        Informations de l'Article
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom de l'Article <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newBarcode.article}
                            onChange={(e) => setNewBarcode({ ...newBarcode, article: e.target.value })}
                            placeholder="Ex: Laptop Dell XPS 15"
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Catégorie <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newBarcode.categorie}
                            onChange={(e) => setNewBarcode({ ...newBarcode, categorie: e.target.value })}
                            placeholder="Ex: Électronique"
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Statut
                          </label>
                          <select aria-label="Statut"
                            value={newBarcode.status}
                            onChange={(e) => setNewBarcode({ ...newBarcode, status: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-white text-sm"
                          >
                            <option value="Actif">✅ Actif</option>
                            <option value="Inactif">❌ Inactif</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colonne Droite */}
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                        <div className="bg-slate-800 dark:bg-slate-700 p-1.5 rounded mr-2">
                          <QrCodeIcon className="h-4 w-4 text-white" />
                        </div>
                        Informations du Code
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Type de Code <span className="text-red-500">*</span>
                          </label>
                          <select aria-label="Type de Code"
                            value={newBarcode.type}
                            onChange={(e) => setNewBarcode({ ...newBarcode, type: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-white text-sm"
                          >
                            <option value="EAN-13">📊 EAN-13 (13 chiffres)</option>
                            <option value="Code-128">📦 Code-128 (Alphanumérique)</option>
                            <option value="QR Code">📱 QR Code (2D)</option>
                            <option value="UPC-A">🏷️ UPC-A (12 chiffres)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newBarcode.code}
                            onChange={(e) => setNewBarcode({ ...newBarcode, code: e.target.value })}
                            placeholder={
                              newBarcode.type === 'EAN-13' ? 'Ex: 9876543210987' :
                                newBarcode.type === 'Code-128' ? 'Ex: CB-PROD-2025' :
                                  'Ex: QR-PROD-001'
                            }
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-white text-sm font-mono"
                          />
                        </div>

                        {/* Aperçu du code */}
                        {newBarcode.code && (
                          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Aperçu :</p>
                            <div className="bg-white p-3 rounded text-center">
                              <div className="flex items-end justify-center space-x-px mx-auto h-10 max-w-full">
                                {[2, 1, 3, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 1, 4, 3, 1, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 3, 2, 1].map((h, i) => (
                                  <div key={i} className={`bg-black w-[2px] ${h === 1 ? 'h-[8px]' : h === 2 ? 'h-[16px]' : 'h-[24px]'}`}></div>
                                ))}
                              </div>
                              <p className="text-xs font-mono text-gray-900 mt-2 sm:mt-3 font-bold tracking-wider break-all">{newBarcode.code}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info - Palette Slate */}
                <div className="mt-4 p-3 sm:p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-300 dark:border-slate-600">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">💡 Conseil</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Assurez-vous que le code est unique et respecte le format du type sélectionné. Les codes-barres EAN-13 doivent contenir exactement 13 chiffres.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied du Modal */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 z-10">
                <button
                  onClick={() => setIsAddManualBarcodeModalOpen(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm sm:text-base order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddManualBarcode}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 text-sm sm:text-base order-1 sm:order-2"
                >
                  <PlusIcon className="h-5 w-5 flex-shrink-0" />
                  <span>Ajouter le Code-Barres</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;



