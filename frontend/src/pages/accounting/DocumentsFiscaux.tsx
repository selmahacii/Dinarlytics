import React, { useState } from 'react';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useApp } from "@core/context/AppContext";
import { FiscalDocument, Country, getDocumentEquivalent } from '@shared/utils/fiscalDocuments';
import Modal from '@shared/components/UI/Modal';
import Card from '@shared/components/UI/Card';
import { usePermission } from '@shared/hooks/usePermission';
import apiClient from '@/services/apiClient';

const DocumentsFiscaux: React.FC = () => {
  const { t } = useTranslation();
  const { 
    user, 
    currentDevise, 
    currentCountry, 
    fiscalDocuments, 
    formatCurrency,
    setCurrentDevise 
  } = useApp();
  const { has } = usePermission();

  const [selectedDocument, setSelectedDocument] = useState<FiscalDocument | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [documentData, setDocumentData] = useState<Record<string, any>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFrequency, setFilterFrequency] = useState<string>('all');

  // États pour les documents créés
  const [createdDocuments, setCreatedDocuments] = useState<Array<{
    id: string;
    documentId: string;
    document: FiscalDocument;
    data: Record<string, any>;
    dateCreation: string;
    statut: 'brouillon' | 'soumis' | 'valide' | 'rejete';
  }>>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadDeclarations = async () => {
      try {
        const response = await apiClient.get<any[]>('/fiscality/declarations');
        const mapped = (response.data || [])
          .map((d: any) => {
            const document = fiscalDocuments.find(fd => fd.id === d.document_id);
            if (!document) return null;
            return {
              id: d.id,
              documentId: d.document_id,
              document,
              data: d.data || {},
              dateCreation: d.created_at,
              statut: d.status as 'brouillon' | 'soumis' | 'valide' | 'rejete'
            };
          })
          .filter((d): d is NonNullable<typeof d> => d !== null);
        setCreatedDocuments(mapped);
      } catch (err) {
        console.error('Failed to load fiscal declarations', err);
      }
    };
    loadDeclarations();
  }, [fiscalDocuments]);

  const handleCreateDocument = (document: FiscalDocument) => {
    setSelectedDocument(document);
    setDocumentData({});
    setIsCreateModalOpen(true);
  };

  const handleViewDocument = (doc: typeof createdDocuments[0]) => {
    setSelectedDocument(doc.document);
    setDocumentData(doc.data);
    setIsViewModalOpen(true);
  };

  const handleSubmitDocument = async () => {
    if (!selectedDocument) return;
    setSubmitError(null);

    try {
      const response = await apiClient.post<{ id: string; created_at: string }>('/fiscality/declarations', {
        document_id: selectedDocument.id,
        country: currentCountry,
        data: documentData
      });
      const newDoc = {
        id: response.data.id,
        documentId: selectedDocument.id,
        document: selectedDocument,
        data: { ...documentData },
        dateCreation: response.data.created_at,
        statut: 'brouillon' as const
      };
      setCreatedDocuments([newDoc, ...createdDocuments]);
      setIsCreateModalOpen(false);
      setSelectedDocument(null);
      setDocumentData({});
    } catch (err: any) {
      setSubmitError(err?.response?.data?.detail || 'Erreur lors de la sauvegarde');
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'valide': return 'bg-green-100 text-green-800';
      case 'soumis': return 'bg-blue-100 text-blue-800';
      case 'brouillon': return 'bg-gray-100 text-gray-800';
      case 'rejete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'declaration': return DocumentTextIcon;
      case 'attestation': return CheckCircleIcon;
      case 'bilan': return BuildingOfficeIcon;
      case 'formulaire': return DocumentTextIcon;
      case 'certificat': return CheckCircleIcon;
      default: return DocumentTextIcon;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'mensuel': return t('fiscal.documents.frequencies.mensuel');
      case 'trimestriel': return t('fiscal.documents.frequencies.trimestriel');
      case 'annuel': return t('fiscal.documents.frequencies.annuel');
      case 'ponctuel': return t('fiscal.documents.frequencies.ponctuel');
      default: return frequency;
    }
  };

  const filteredDocuments = fiscalDocuments.filter(doc => {
    const matchCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchFrequency = filterFrequency === 'all' || doc.frequency === filterFrequency;
    return matchCategory && matchFrequency;
  });

  const countryNames: Record<Country, string> = {
    DZ: t('common.countries.algeria'),
    FR: t('common.countries.france'),
    DE: t('common.countries.germany'),
    IT: t('common.countries.italy'),
    US: t('common.countries.usa'),
    EU: t('common.countries.eu')
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white rounded-lg shadow-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <DocumentTextIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('fiscal.documents.title')}</h1>
              <p className="text-slate-200 text-sm mt-1">
                {t('fiscal.documents.subtitle', { country: countryNames[currentCountry] })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
              <GlobeAltIcon className="h-5 w-5 text-white" />
              <select
                value={currentDevise}
                onChange={(e) => setCurrentDevise(e.target.value as any)}
                className="bg-transparent border-none text-white text-sm focus:outline-none"
              >
                <option value="DZD" className="text-slate-900">DZD - Algérie</option>
                <option value="EUR" className="text-slate-900">EUR - Europe</option>
                <option value="USD" className="text-slate-900">USD - États-Unis</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('fiscal.documents.filters.category')}</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('fiscal.documents.filters.all_categories')}</option>
              <option value="declaration">{t('fiscal.documents.categories.declaration')}</option>
              <option value="attestation">{t('fiscal.documents.categories.attestation')}</option>
              <option value="bilan">{t('fiscal.documents.categories.bilan')}</option>
              <option value="formulaire">{t('fiscal.documents.categories.formulaire')}</option>
              <option value="certificat">{t('fiscal.documents.categories.certificat')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('fiscal.documents.filters.frequency')}</label>
            <select
              value={filterFrequency}
              onChange={(e) => setFilterFrequency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('fiscal.documents.filters.all_frequencies')}</option>
              <option value="mensuel">{t('fiscal.documents.frequencies.mensuel')}</option>
              <option value="trimestriel">{t('fiscal.documents.frequencies.trimestriel')}</option>
              <option value="annuel">{t('fiscal.documents.frequencies.annuel')}</option>
              <option value="ponctuel">{t('fiscal.documents.frequencies.ponctuel')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('fiscal.documents.filters.country')}</label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
              <span className="text-sm font-medium text-gray-900">{countryNames[currentCountry]}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des documents disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => {
          const Icon = getCategoryIcon(document.category);
          const equivalent = document.equivalent?.[currentCountry];
          
          return (
            <Card key={document.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    document.category === 'declaration' ? 'bg-blue-100' :
                    document.category === 'attestation' ? 'bg-green-100' :
                    document.category === 'bilan' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      document.category === 'declaration' ? 'text-blue-600' :
                      document.category === 'attestation' ? 'text-green-600' :
                      document.category === 'bilan' ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{document.code}</h3>
                    {document.nameLocal && (
                      <p className="text-xs text-gray-500">{document.nameLocal}</p>
                    )}
                  </div>
                </div>
                {document.required && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                    {t('fiscal.documents.details.required')}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">{document.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {getFrequencyLabel(document.frequency)}
                </span>
                {document.deadline && (
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {t('fiscal.documents.details.deadline')}: {document.deadline}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {document.forEntity === 'both' ? t('fiscal.documents.details.business_type.both') :
                   document.forEntity === 'entreprise' ? t('fiscal.documents.details.business_type.entreprise') : t('fiscal.documents.details.business_type.particulier')}
                </span>
                <button
                  onClick={() => handleCreateDocument(document)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {t('fiscal.documents.actions.create')}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Documents créés */}
      {createdDocuments.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('fiscal.documents.table.created_title')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('fiscal.documents.table.document')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('fiscal.documents.table.date')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('fiscal.documents.table.statut')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('fiscal.documents.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {createdDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{doc.document.code}</div>
                      <div className="text-sm text-gray-500">{doc.document.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.statut)}`}>
                        {t(`fiscal.documents.status.${doc.statut}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([JSON.stringify({ document: doc.document.name, data: doc.data, statut: doc.statut, dateCreation: doc.dateCreation }, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${doc.document.id}-${doc.id}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title={t('common.download', { defaultValue: 'Télécharger' }) as string}
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Création de document */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedDocument(null);
          setDocumentData({});
        }}
        title={selectedDocument ? `Créer ${selectedDocument.code} - ${selectedDocument.name}` : 'Créer un document'}
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">{selectedDocument.description}</p>
              {selectedDocument.deadline && (
                <p className="text-xs text-blue-600 mt-2">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  {t('fiscal.documents.details.deadline')}: {selectedDocument.deadline}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {selectedDocument.fields?.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={documentData[field.id] || ''}
                      onChange={(e) => setDocumentData({ ...documentData, [field.id]: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={field.required}
                    >
                      <option value="">Sélectionner...</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={documentData[field.id] || ''}
                      onChange={(e) => setDocumentData({ ...documentData, [field.id]: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={documentData[field.id] || ''}
                      onChange={(e) => setDocumentData({ ...documentData, [field.id]: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{submitError}</div>
            )}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedDocument(null);
                  setDocumentData({});
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {t('fiscal.documents.actions.cancel')}
              </button>
              <button
                onClick={handleSubmitDocument}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('fiscal.documents.actions.submit')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Visualisation */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDocument(null);
          setDocumentData({});
        }}
        title={selectedDocument ? `${selectedDocument.code} - ${selectedDocument.name}` : 'Détails du document'}
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{selectedDocument.description}</p>
            </div>
            <div className="space-y-2">
              {Object.entries(documentData).map(([key, value]) => {
                const field = selectedDocument.fields?.find(f => f.id === key);
                return (
                  <div key={key} className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-700">{field?.label || key}:</span>
                    <span className="text-sm text-gray-900">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentsFiscaux;




