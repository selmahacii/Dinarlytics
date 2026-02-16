import React, { useState } from 'react';
import { DocumentSignature, DocumentQRMetadata } from '@/index';
import DocumentWithSignatureDisplay from '../UI/DocumentWithSignatureDisplay';
import { 
  ClipboardDocumentListIcon, 
  TruckIcon, 
  PrinterIcon, 
  ShareIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface BonDocumentProps {
  type: 'bon-commande' | 'bon-livraison';
  numero: string;
  date: string;
  reference?: string;
  fournisseur?: {
    nom: string;
    adresse: string;
    contact?: string;
  };
  client?: {
    nom: string;
    adresse: string;
    contact?: string;
  };
  articles: Array<{
    nom: string;
    quantite: number;
    unite: string;
    prixUnitaire?: number;
    total?: number;
  }>;
  montantTotal: number;
  statut: 'brouillon' | 'en_cours' | 'complete' | 'livree' | 'annulee';
  signatures?: DocumentSignature[];
  qrMetadata?: DocumentQRMetadata;
  currentUser: {
    email: string;
    nom: string;
    role: string;
  };
  onSignatureAdded?: (signature: DocumentSignature, qrData: string) => void;
  onPrint?: () => void;
  onExport?: () => void;
}

/**
 * Composant pour afficher un Bon de Commande ou Bon de Livraison
 * avec signatures électroniques et code QR
 */
const BonDocument: React.FC<BonDocumentProps> = ({
  type,
  numero,
  date,
  reference,
  fournisseur,
  client,
  articles,
  montantTotal,
  statut,
  signatures = [],
  qrMetadata,
  currentUser,
  onSignatureAdded,
  onPrint,
  onExport
}) => {
  const isBonCommande = type === 'bon-commande';
  const isBonLivraison = type === 'bon-livraison';

  const title = isBonCommande ? 'BON DE COMMANDE' : 'BON DE LIVRAISON';
  const icon = isBonCommande ? ClipboardDocumentListIcon : TruckIcon;
  const IconComponent = icon;

  const statusColors: Record<string, string> = {
    brouillon: 'bg-gray-100 text-gray-800',
    en_cours: 'bg-blue-100 text-blue-800',
    complete: 'bg-green-100 text-green-800',
    livree: 'bg-green-100 text-green-800',
    annulee: 'bg-red-100 text-red-800'
  };

  const defaultQRMetadata: DocumentQRMetadata = qrMetadata || {
    documentType: type,
    documentId: numero,
    numero,
    date,
    clientNom: client?.nom,
    montantTotal,
    qrVersion: 'v1.0'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 print:bg-gray-100 print:text-black">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconComponent className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-sm opacity-90">{numero}</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[statut]}`}>
            {statut.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Infos document */}
        <div className="grid md:grid-cols-2 gap-6 border-b pb-6">
          {/* Émetteur (Fournisseur pour commande, Client pour livraison) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              {isBonCommande ? 'FOURNISSEUR' : 'CLIENT'}
            </h3>
            {isBonCommande && fournisseur ? (
              <div className="text-sm">
                <p className="font-medium text-gray-900">{fournisseur.nom}</p>
                <p className="text-gray-700">{fournisseur.adresse}</p>
                {fournisseur.contact && <p className="text-gray-600">{fournisseur.contact}</p>}
              </div>
            ) : client ? (
              <div className="text-sm">
                <p className="font-medium text-gray-900">{client.nom}</p>
                <p className="text-gray-700">{client.adresse}</p>
                {client.contact && <p className="text-gray-600">{client.contact}</p>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Information non disponible</p>
            )}
          </div>

          {/* Infos document */}
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-600">Date:</p>
              <p className="font-medium text-gray-900">{new Date(date).toLocaleDateString('fr-DZ')}</p>
            </div>
            {reference && (
              <div>
                <p className="text-gray-600">Référence:</p>
                <p className="font-medium text-gray-900">{reference}</p>
              </div>
            )}
          </div>
        </div>

        {/* Articles */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">ARTICLES</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Désignation</th>
                  <th className="px-4 py-2 text-right font-semibold">Quantité</th>
                  <th className="px-4 py-2 text-center font-semibold">Unité</th>
                  {!isBonLivraison && (
                    <>
                      <th className="px-4 py-2 text-right font-semibold">P.U.</th>
                      <th className="px-4 py-2 text-right font-semibold">Total</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {articles.map((article, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">{article.nom}</td>
                    <td className="px-4 py-3 text-right">{article.quantite}</td>
                    <td className="px-4 py-3 text-center">{article.unite}</td>
                    {!isBonLivraison && (
                      <>
                        <td className="px-4 py-3 text-right">
                          {article.prixUnitaire?.toLocaleString('fr-DZ')} DA
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {article.total?.toLocaleString('fr-DZ')} DA
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux (si commande) */}
        {!isBonLivraison && (
          <div className="flex justify-end">
            <div className="w-64 space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Sous-total:</span>
                <span className="font-medium">{montantTotal.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-lg text-blue-600">{montantTotal.toLocaleString('fr-DZ')} DA</span>
              </div>
            </div>
          </div>
        )}

        {/* Indicateurs de Performance */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-6 border-2 border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-slate-600" />
            Indicateurs de Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Délai de traitement */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase">Délai Traitement</span>
                <ClockIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {(() => {
                  const dateCommande = new Date(date);
                  const joursEcoules = Math.floor((Date.now() - dateCommande.getTime()) / (1000 * 60 * 60 * 24));
                  return joursEcoules;
                })()}j
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {statut === 'complete' || statut === 'livree' ? 'Terminé' : 'En cours'}
              </div>
            </div>

            {/* Taux de complétion */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase">Complétion</span>
                <ChartBarIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {(() => {
                  const taux = statut === 'complete' || statut === 'livree' ? 100 : 
                               statut === 'en_cours' ? 75 : 
                               statut === 'brouillon' ? 25 : 0;
                  return taux;
                })()}%
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    statut === 'complete' || statut === 'livree' ? 'bg-emerald-500' :
                    statut === 'en_cours' ? 'bg-blue-500' :
                    'bg-amber-500'
                  }`}
                  style={{ 
                    width: `${(() => {
                      const taux = statut === 'complete' || statut === 'livree' ? 100 : 
                                   statut === 'en_cours' ? 75 : 
                                   statut === 'brouillon' ? 25 : 0;
                      return taux;
                    })()}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Valeur moyenne par article */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase">Valeur/Article</span>
                <CurrencyDollarIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {Math.round(montantTotal / Math.max(articles.length, 1)).toLocaleString('fr-DZ')} DA
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {articles.length} article{articles.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Score de performance */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase">Score Performance</span>
                <SparklesIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {(() => {
                  let score = 0;
                  if (statut === 'complete' || statut === 'livree') score += 40;
                  if (statut === 'en_cours') score += 30;
                  const joursEcoules = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
                  if (joursEcoules <= 7) score += 30;
                  else if (joursEcoules <= 14) score += 20;
                  else score += 10;
                  if (articles.length >= 3) score += 20;
                  else if (articles.length >= 1) score += 10;
                  return Math.min(100, score);
                })()}/100
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center">
                {(() => {
                  const score = (() => {
                    let s = 0;
                    if (statut === 'complete' || statut === 'livree') s += 40;
                    if (statut === 'en_cours') s += 30;
                    const joursEcoules = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
                    if (joursEcoules <= 7) s += 30;
                    else if (joursEcoules <= 14) s += 20;
                    else s += 10;
                    if (articles.length >= 3) s += 20;
                    else if (articles.length >= 1) s += 10;
                    return Math.min(100, s);
                  })();
                  return score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : score >= 40 ? 'Moyen' : 'À améliorer';
                })()}
              </div>
            </div>
          </div>

          {/* Métriques supplémentaires */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Quantité totale</span>
                <span className="text-sm font-bold text-slate-900">
                  {articles.reduce((sum, a) => sum + a.quantite, 0)} {articles[0]?.unite || 'unités'}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Date création</span>
                <span className="text-sm font-bold text-slate-900">
                  {new Date(date).toLocaleDateString('fr-DZ')}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Statut</span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  statut === 'complete' || statut === 'livree' ? 'bg-emerald-100 text-emerald-800' :
                  statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                  statut === 'annulee' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {statut.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures et QR */}
        <DocumentWithSignatureDisplay
          documentId={numero}
          documentNumber={numero}
          documentType={type}
          signatures={signatures}
          qrMetadata={defaultQRMetadata}
          currentUser={currentUser}
          onSignatureAdded={onSignatureAdded}
          readOnly={false}
          showQR={true}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <PrinterIcon className="w-4 h-4" />
              Imprimer
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <ShareIcon className="w-4 h-4" />
              Exporter
            </button>
          )}
        </div>
      </div>

      {/* Pied de page impression */}
      <div className="hidden print:block bg-gray-50 border-t text-center text-xs text-gray-600 p-4">
        <p>Document généré le {new Date().toLocaleString('fr-DZ')}</p>
        <p>Avec signatures électroniques et code QR d'authentification</p>
      </div>
    </div>
  );
};

export default BonDocument;

