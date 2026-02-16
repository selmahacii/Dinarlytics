import React from 'react';
import { DocumentSignature } from '@/index';
import { CheckCircleIcon, UserCircleIcon, CalendarIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SignatureViewerProps {
  signatures: DocumentSignature[];
  className?: string;
  compact?: boolean;
  showDetails?: boolean;
}

const SignatureViewer: React.FC<SignatureViewerProps> = ({
  signatures,
  className = '',
  compact = false,
  showDetails = true
}) => {
  if (!signatures || signatures.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        Aucune signature
      </div>
    );
  }

  if (compact) {
    // Vue compacte pour impression
    return (
      <div className={`space-y-2 ${className}`}>
        {signatures.map((sig, idx) => (
          <div key={sig.id} className="flex items-center gap-3 text-xs border-b pb-2">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{sig.nom}</p>
              <p className="text-gray-600">{sig.role}</p>
            </div>
            {sig.signatureData && (
              <img
                src={sig.signatureData}
                alt={`Signature ${sig.nom}`}
                className="h-10 w-20 object-contain border-l pl-2"
              />
            )}
            <div className="text-right text-gray-500">
              <p className="whitespace-nowrap">{new Date(sig.signedDate).toLocaleDateString('fr-DZ')}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vue détaillée
  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-green-600" />
        Signatures électroniques ({signatures.length})
      </h4>

      <div className="space-y-3">
        {signatures.map((sig, idx) => (
          <div key={sig.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* En-tête signature */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <UserCircleIcon className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">{sig.nom}</p>
                  <p className="text-sm text-gray-600">{sig.role}</p>
                  <p className="text-xs text-gray-500">{sig.signedBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckIcon className="w-4 h-4" />
                Signé
              </div>
            </div>

            {/* Aperçu signature */}
            {sig.signatureData && (
              <div className="mb-3 p-3 bg-white border border-gray-300 rounded">
                <img
                  src={sig.signatureData}
                  alt={`Signature ${sig.nom}`}
                  className="w-full h-20 object-contain"
                />
              </div>
            )}

            {/* Détails */}
            {showDetails && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span>{new Date(sig.signedDate).toLocaleString('fr-DZ')}</span>
                </div>

                {sig.digest && (
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">Empreinte document:</p>
                    <p className="font-mono text-xs text-gray-600 break-all">{sig.digest}</p>
                  </div>
                )}

                {sig.metadata && (
                  <details className="cursor-pointer">
                    <summary className="text-xs font-medium text-gray-700 hover:text-gray-900">
                      Métadonnées de signature
                    </summary>
                    <div className="mt-2 space-y-1 text-xs text-gray-600 bg-white rounded p-2 border border-gray-200">
                      {sig.metadata.deviceInfo && (
                        <p><strong>Appareil:</strong> {sig.metadata.deviceInfo}</p>
                      )}
                      {sig.metadata.ipAddress && (
                        <p><strong>IP:</strong> {sig.metadata.ipAddress}</p>
                      )}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Légende de sécurité */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <p className="font-medium mb-1">🔒 Sécurité</p>
        <p>Les signatures électroniques incluent des métadonnées cryptographiques et
          des empreintes de document pour garantir l'intégrité.</p>
      </div>
    </div>
  );
};

export default SignatureViewer;

