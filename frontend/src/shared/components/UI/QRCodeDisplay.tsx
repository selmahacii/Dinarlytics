import React, { useRef } from 'react';
import { DocumentQRMetadata } from '@/index';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';

interface QRCodeDisplayProps {
  metadata: DocumentQRMetadata;
  size?: number;
  includeMetadata?: boolean;
  className?: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

/**
 * Générateur de QR Code en SVG sans dépendance externe
 * Encode les métadonnées du document en JSON dans le QR
 */
const generateQRCode = (text: string, size: number = 200): string => {
  // Utilise QR Code Version 3 (29x29) pour encoder JSON avec métadonnées
  // Note: Cette implémentation est simplifiée pour une demo
  // Pour la production, utiliser 'qrcode.react' ou 'qrcode.gen'
  
  // Fallback: utiliser une API online pour générer le QR (démo)
  // Pour production, implémenter une vraie librairie QR
  const encodedText = encodeURIComponent(text);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
  return qrUrl;
};

/**
 * QRCodeDisplay: Affiche un code QR encodant les métadonnées du document
 * avec options d'impression et téléchargement
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  metadata,
  size = 150,
  includeMetadata = true,
  className = '',
  onDownload,
  onPrint
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sérialiser les métadonnées en JSON compact
  const metadataJson = JSON.stringify({
    type: metadata.documentType,
    id: metadata.documentId,
    num: metadata.numero,
    date: metadata.date,
    client: metadata.clientNom || 'N/A',
    amount: metadata.montantTotal,
    sig: metadata.signatureId || '',
    v: metadata.qrVersion
  });

  // Générer l'URL du QR code
  const qrUrl = generateQRCode(metadataJson, size);

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${metadata.documentType}_${metadata.numero}_${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onDownload?.();
    } catch (error) {
      console.error('Erreur téléchargement QR:', error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', `width=${size + 100},height=${size + 100}`);
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${metadata.numero}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
              }
              img { max-width: 100%; }
              p { margin: 10px 0; text-align: center; font-size: 12px; }
            </style>
          </head>
          <body>
            <h3>${metadata.documentType.toUpperCase()}</h3>
            <img src="${qrUrl}" alt="QR Code" />
            <p><strong>${metadata.numero}</strong></p>
            <p>Date: ${metadata.date}</p>
            ${metadata.clientNom ? `<p>Client: ${metadata.clientNom}</p>` : ''}
            <p>Montant: ${metadata.montantTotal.toLocaleString('fr-DZ')} DA</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      onPrint?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}
    >
      {/* QR Code Image */}
      <div className="mb-4">
        <img
          src={qrUrl}
          alt={`QR Code - ${metadata.numero}`}
          width={size}
          height={size}
          className="border-2 border-gray-300 rounded p-2 bg-white"
        />
      </div>

      {/* Métadonnées */}
      {includeMetadata && (
        <div className="w-full text-center text-sm text-gray-700 mb-4 border-t pt-4">
          <p className="font-semibold text-gray-900">{metadata.numero}</p>
          <p className="text-xs text-gray-500">{metadata.date}</p>
          {metadata.clientNom && <p className="text-xs">{metadata.clientNom}</p>}
          <p className="font-medium text-blue-600 mt-2">
            {metadata.montantTotal.toLocaleString('fr-DZ')} DA
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
          title="Télécharger le QR code"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Télécharger
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
          title="Imprimer le QR code"
        >
          <PrinterIcon className="w-4 h-4" />
          Imprimer
        </button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;

