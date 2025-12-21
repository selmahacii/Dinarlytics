import React from 'react';
import SignatureButton from './SignatureButton';
import SignaturePreview from './SignaturePreview';
import { formatCurrency } from '../../utils/format';

interface InvoiceActionsProps {
  totalTTC: number;
  onCancel: () => void;
  onSaveDraft?: () => void;
  onCreate: () => void;
  onOpenSignature: () => void;
  signatureDataUrl?: string;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  totalTTC,
  onCancel,
  onSaveDraft,
  onCreate,
  onOpenSignature,
  signatureDataUrl,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="text-sm text-slate-600">
          <p className="mb-2">
            <span className="font-medium text-slate-700">💡 Astuce :</span> Vérifiez toutes les informations avant de créer la facture. 
            La signature électronique génère automatiquement un QR code pour la traçabilité.
          </p>
          <p className="font-semibold text-slate-800 text-lg">Total: {formatCurrency(totalTTC)}</p>
          {signatureDataUrl && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Signature électronique enregistrée avec QR code
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
          <SignatureButton onClick={onOpenSignature} />
          <SignaturePreview dataUrl={signatureDataUrl} />
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-sm flex items-center justify-center disabled:opacity-50"
            disabled={!onSaveDraft}
            title={onSaveDraft ? 'Sauvegarder Brouillon' : 'Indisponible (démo)'}
          >
            {/* Icon intentionally omitted to keep component generic */}
            <span className="hidden sm:inline">Sauvegarder Brouillon</span>
            <span className="sm:hidden">Brouillon</span>
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <span className="hidden sm:inline">Créer la Facture</span>
            <span className="sm:hidden">Créer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceActions;
