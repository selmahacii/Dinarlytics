import React, { useState } from 'react';
import { DocumentSignature, DocumentQRMetadata } from '../../types/index';
import Modal from './Modal';
import SignaturePad from './SignaturePad';
import QRCodeDisplay from './QRCodeDisplay';
import { CheckCircleIcon, XMarkIcon, DocumentCheckIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface ElectronicSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureComplete: (signature: DocumentSignature, qrData: string) => void;
  documentType: 'facture' | 'bon-commande' | 'bon-livraison' | 'devis';
  documentId: string;
  documentNumber: string;
  currentUser: {
    email: string;
    nom: string;
    role: string;
  };
  qrMetadata?: DocumentQRMetadata;
}

const ElectronicSignatureModal: React.FC<ElectronicSignatureModalProps> = ({
  isOpen,
  onClose,
  onSignatureComplete,
  documentType,
  documentId,
  documentNumber,
  currentUser,
  qrMetadata
}) => {
  const [signatureStep, setSignatureStep] = useState<'prepare' | 'sign' | 'preview' | 'confirm'>('prepare');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Métadonnées QR pour ce document
  const qrData: DocumentQRMetadata = qrMetadata || {
    documentType,
    documentId,
    numero: documentNumber,
    date: new Date().toISOString(),
    montantTotal: 0,
    qrVersion: 'v1.0'
  };

  const handleSignatureSaved = (dataUrl: string) => {
    setSignatureData(dataUrl);
    setSignatureStep('preview');
  };

  const handleConfirmSignature = async () => {
    if (!signatureData || !acceptedTerms) return;

    setIsProcessing(true);
    try {
      // Simuler la validation et l'enregistrement
      await new Promise(resolve => setTimeout(resolve, 500));

      const signature: DocumentSignature = {
        id: `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        documentType,
        documentId,
        signatureData,
        signedBy: currentUser.email,
        nom: currentUser.nom,
        role: currentUser.role,
        signedDate: new Date().toISOString(),
        timestamp: Date.now(),
        digest: generateDocumentHash(documentNumber),
        metadata: {
          deviceInfo: `${navigator.platform} - ${navigator.userAgent.substring(0, 50)}`,
          ipAddress: 'Client-side (IP non disponible)',
          userAgent: navigator.userAgent
        }
      };

      // Générer un QR encodant la signature
      const qrDataWithSignature: DocumentQRMetadata = {
        ...qrData,
        signatureId: signature.id
      };

      const qrCode = generateQRCodeSVG(JSON.stringify(qrDataWithSignature));

      onSignatureComplete(signature, qrCode);
      setSignatureStep('confirm');

      // Fermer après 2 secondes
      setTimeout(() => {
        resetModal();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erreur signature:', error);
      alert('Erreur lors de la signature. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSignature = () => {
    setSignatureData(null);
    setSignatureStep('sign');
  };

  const resetModal = () => {
    setSignatureStep('prepare');
    setSignatureData(null);
    setShowQRPreview(false);
    setAcceptedTerms(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Fonction pour générer un hash du document (simplifié)
  const generateDocumentHash = (docNumber: string): string => {
    const str = `${docNumber}${new Date().toISOString()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `SHA256_${Math.abs(hash).toString(16)}`;
  };

  // Fonction pour générer un QR en SVG
  const generateQRCodeSVG = (data: string): string => {
    // Implémentation simplifiée - retourner un identifiant
    return `data:image/svg+xml;base64,${btoa(`<svg><text>QR:${Date.now()}</text></svg>`)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Signature Électronique" size="lg">
      <div className="space-y-4">
        {/* STEP 1: PREPARE */}
        {signatureStep === 'prepare' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Préparation à la signature</h3>
              <p className="text-sm text-blue-800 mb-3">
                Vous êtes sur le point de signer électroniquement le document suivant:
              </p>
              <div className="bg-white rounded p-3 space-y-1 text-sm">
                <p><strong>Type:</strong> {documentType.replace('-', ' ').toUpperCase()}</p>
                <p><strong>Numéro:</strong> {documentNumber}</p>
                <p><strong>Signataire:</strong> {currentUser.nom} ({currentUser.role})</p>
                <p><strong>Date/Heure:</strong> {new Date().toLocaleString('fr-DZ')}</p>
              </div>
            </div>

            {/* Aperçu QR */}
            {showQRPreview && qrMetadata && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <QrCodeIcon className="w-5 h-5" />
                  Aperçu du Code QR
                </h4>
                <QRCodeDisplay
                  metadata={qrData}
                  size={120}
                  includeMetadata={true}
                  className="mb-4"
                />
                <p className="text-xs text-gray-600 text-center">
                  Ce QR code contient les métadonnées du document et l'ID de signature
                </p>
              </div>
            )}

            {/* Conditions */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 rounded"
                />
                <span className="text-sm text-gray-700">
                  J'accepte que cette signature électronique est ma signature légale et
                  reconnais l'intégrité du document.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQRPreview}
                  onChange={(e) => setShowQRPreview(e.target.checked)}
                  className="mt-1 rounded"
                />
                <span className="text-sm text-gray-700">
                  Générer et inclure un code QR avec la signature
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => setSignatureStep('sign')}
                disabled={!acceptedTerms}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Continuer à la signature
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SIGN */}
        {signatureStep === 'sign' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              Tracez votre signature dans le champ ci-dessous
            </div>

            <SignaturePad
              onSave={handleSignatureSaved}
              onCancel={handleCancelSignature}
              className="mb-4"
            />
          </div>
        )}

        {/* STEP 3: PREVIEW */}
        {signatureStep === 'preview' && signatureData && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                Aperçu de la signature
              </h3>

              {/* Affiche la signature */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4">
                <img
                  src={signatureData}
                  alt="Aperçu signature"
                  className="w-full h-32 object-contain"
                />
              </div>

              {/* QR Preview si activé */}
              {showQRPreview && qrMetadata && (
                <div className="mb-4">
                  <QRCodeDisplay
                    metadata={qrData}
                    size={100}
                    includeMetadata={true}
                  />
                </div>
              )}

              {/* Détails signature */}
              <div className="bg-gray-50 rounded p-3 text-sm space-y-1 mb-4">
                <p><strong>Signataire:</strong> {currentUser.nom}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Rôle:</strong> {currentUser.role}</p>
                <p><strong>Date:</strong> {new Date().toLocaleString('fr-DZ')}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelSignature}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Refaire
                </button>
                <button
                  onClick={handleConfirmSignature}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <DocumentCheckIcon className="w-4 h-4" />
                  {isProcessing ? 'Signature...' : 'Confirmer la signature'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRM */}
        {signatureStep === 'confirm' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-green-900 text-lg mb-2">Signature confirmée!</h3>
            <p className="text-green-800 text-sm">
              Le document a été signé électroniquement avec succès.
            </p>
            <p className="text-green-700 text-xs mt-3">
              ID Signature: <code className="font-mono text-green-600">SIG-{Date.now()}</code>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ElectronicSignatureModal;
