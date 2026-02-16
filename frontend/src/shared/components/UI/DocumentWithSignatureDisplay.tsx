import React, { useState } from 'react';
import { DocumentSignature, DocumentQRMetadata } from '@/index';
import QRCodeDisplay from './QRCodeDisplay';
import SignatureViewer from './SignatureViewer';
import ElectronicSignatureModal from './ElectronicSignatureModal';
import SignatureButton from '../Factures/SignatureButton';
import { DocumentCheckIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface DocumentWithSignatureDisplayProps {
  documentId: string;
  documentNumber: string;
  documentType: 'facture' | 'bon-commande' | 'bon-livraison' | 'devis';
  signatures: DocumentSignature[];
  qrMetadata?: DocumentQRMetadata;
  currentUser: {
    email: string;
    nom: string;
    role: string;
  };
  onSignatureAdded?: (signature: DocumentSignature, qrData: string) => void;
  readOnly?: boolean;
  compact?: boolean;
  showQR?: boolean;
}

/**
 * Composant réutilisable pour afficher les signatures et QR d'un document
 * Peut être intégré dans les factures, bons de commande, bons de livraison, devis
 */
const DocumentWithSignatureDisplay: React.FC<DocumentWithSignatureDisplayProps> = ({
  documentId,
  documentNumber,
  documentType,
  signatures = [],
  qrMetadata,
  currentUser,
  onSignatureAdded,
  readOnly = false,
  compact = false,
  showQR = true
}) => {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [documentSignatures, setDocumentSignatures] = useState<DocumentSignature[]>(signatures);
  const [qrCode, setQrCode] = useState<string | undefined>();

  const handleSignatureComplete = (signature: DocumentSignature, qrData: string) => {
    setDocumentSignatures(prev => [...prev, signature]);
    setQrCode(qrData);
    onSignatureAdded?.(signature, qrData);
  };

  // Vérifier si l'utilisateur a déjà signé
  const hasUserSigned = documentSignatures.some(sig => sig.signedBy === currentUser.email);

  if (compact) {
    // Vue compacte pour listes/aperçus
    return (
      <div className="flex items-center gap-3 text-sm">
        {documentSignatures.length > 0 && (
          <>
            <DocumentCheckIcon className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">{documentSignatures.length} signature(s)</span>
          </>
        )}
        {qrMetadata && showQR && (
          <div className="flex items-center gap-1 text-blue-600">
            <QrCodeIcon className="w-4 h-4" />
            <span className="text-xs">QR</span>
          </div>
        )}
      </div>
    );
  }

  // Vue complète
  return (
    <div className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
      {/* Bandeau statut signatures */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <DocumentCheckIcon className="w-5 h-5 text-blue-600" />
            Signatures et Authentification
          </h3>
          {documentSignatures.length > 0 && (
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              ✓ {documentSignatures.length} signature(s)
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {!readOnly && !hasUserSigned && (
            <button
              onClick={() => setIsSignatureModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <DocumentCheckIcon className="w-4 h-4" />
              Signer électroniquement
            </button>
          )}
          {hasUserSigned && (
            <div className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded-lg flex items-center gap-2">
              <DocumentCheckIcon className="w-4 h-4" />
              Vous avez signé ce document
            </div>
          )}
        </div>
      </div>

      {/* Affichage des signatures */}
      {documentSignatures.length > 0 && (
        <div>
          <SignatureViewer
            signatures={documentSignatures}
            showDetails={true}
            compact={false}
          />
        </div>
      )}

      {/* Affichage du QR Code */}
      {qrMetadata && showQR && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5 text-blue-600" />
              Code QR d'authentification
            </h4>
            <span className="text-xs text-gray-500">v1.0</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div>
              <QRCodeDisplay
                metadata={qrMetadata}
                size={150}
                includeMetadata={true}
              />
            </div>

            {/* Infos QR */}
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                <strong>Fonction:</strong> Ce code QR contient les métadonnées du document
                et peut être utilisé pour vérifier son authenticité.
              </p>

              <div className="bg-blue-50 rounded p-3 text-sm space-y-2">
                <p className="font-medium text-blue-900">Contenu du QR:</p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Type: {documentType}</li>
                  <li>Numéro: {documentNumber}</li>
                  <li>Date: {qrMetadata.date}</li>
                  {qrMetadata.clientNom && <li>Client: {qrMetadata.clientNom}</li>}
                  <li>Montant: {qrMetadata.montantTotal.toLocaleString('fr-DZ')} DA</li>
                  {qrMetadata.signatureId && <li>Signature ID: {qrMetadata.signatureId}</li>}
                </ul>
              </div>

              <p className="text-xs text-gray-600">
                💡 Conseil: Scannez ce code QR pour vérifier l'authenticité et les
                détails du document en temps réel.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Infos légales */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
        <p className="font-medium mb-1">⚖️ Statut légal</p>
        <p>
          Les signatures électroniques apposées sur ce document sont réputées valides en Algérie
          conformément à la législation sur les transactions électroniques.
        </p>
      </div>

      {/* Modale signature */}
      {!readOnly && (
        <ElectronicSignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSignatureComplete={handleSignatureComplete}
          documentType={documentType}
          documentId={documentId}
          documentNumber={documentNumber}
          currentUser={currentUser}
          qrMetadata={qrMetadata}
        />
      )}
    </div>
  );
};

export default DocumentWithSignatureDisplay;

