import React from 'react';
import { formatCurrency } from '../../utils/format';
import QrCode from './QrCode';
import Code128 from './Code128';

interface InvoiceItem {
  id?: number | string;
  nom?: string;
  description?: string;
  prixUnitaire?: number;
  quantite?: number;
  remise?: number; // %
  total?: number;
}

interface InvoiceData {
  numero?: string;
  client?: string;
  date?: string;
  dateEcheance?: string;
  conditionsPaiement?: string;
  reference?: string;
  notes?: string;
  articles?: InvoiceItem[];
  montantHT?: number;
  tva?: number;
  total?: number;
  signature?: string; // data URL
  statutPaiement?: 'payee' | 'non-payee' | 'partielle';
}

interface Props {
  invoice: InvoiceData;
}

const InvoicePrintView: React.FC<Props> = ({ invoice }) => {
  const dateStr = invoice.date ? new Date(invoice.date).toLocaleDateString('fr-FR') : '';
  const statut = invoice.statutPaiement || 'non-payee';
  const watermarkText = statut === 'payee' ? 'PAYÉE' : (statut === 'partielle' ? 'PAIEMENT PARTIEL' : 'IMPAYÉE');

  return (
    <div className="print-area relative bg-white text-slate-900 max-w-5xl mx-auto p-6">
      {/* Watermark impression */}
      <div aria-hidden="true" className="print-watermark select-none">{watermarkText}</div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 border-b-2 border-slate-700 pb-4">
        <div>
          <div className="text-2xl font-extrabold text-slate-800">DINARLYTIC SOLUTIONS</div>
          <div className="text-slate-500 mt-1">Solutions Financières Intelligentes</div>
          <div className="text-slate-500 mt-1">123 Avenue de la République, Alger 16000</div>
          <div className="text-slate-500">+213 21 12 34 56 | contact@dinarlytic.dz</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">FACTURE</div>
          <div className="text-slate-500 mt-1">N° {invoice.numero}</div>
          <div className="text-slate-500">Date: {dateStr}</div>
        </div>
      </div>

      {/* Client + infos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-4">
          <div className="font-semibold text-slate-800 mb-2">Client</div>
          <div>{invoice.client}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between text-slate-600 mb-1">
            <span>Date d'échéance</span>
            <span className="text-slate-800">{invoice.dateEcheance || '-'}</span>
          </div>
          <div className="flex justify-between text-slate-600 mb-1">
            <span>Conditions</span>
            <span className="text-slate-800">{invoice.conditionsPaiement || '-'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Référence</span>
            <span className="text-slate-800">{invoice.reference || '-'}</span>
          </div>
        </div>
      </div>

  {/* QR & Code-barres (scannables, sans dépendances) */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-blue-900">Codes de Traçabilité</h3>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-slate-600">
          <div className="flex items-center gap-3">
            <QrCode value={invoice.numero || ''} size={96} quietZoneModules={4} title={`QR Facture ${invoice.numero}`} />
            <div className="text-xs">
              <p className="font-medium text-slate-700 mb-1">QR Code</p>
              <p>Scannable pour validation et traçabilité</p>
              <p className="text-slate-500 mt-1">N° {invoice.numero}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Code128 value={invoice.numero || ''} height={40} scale={2} quietZoneModules={10} showText title={`Code128 Facture ${invoice.numero}`} />
            <div className="text-xs">
              <p className="font-medium text-slate-700 mb-1">Code-barres Code128</p>
              <p>Compatible scanners standards</p>
              <p className="text-slate-500 mt-1">N° {invoice.numero}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3 italic">
          💡 Ces codes permettent la validation et la traçabilité électronique de la facture selon les normes algériennes.
        </p>
      </div>

      {/* Articles */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-800 text-white text-sm font-medium">
          <div className="col-span-5 p-3">Article/Service</div>
          <div className="col-span-2 p-3 text-right">Prix Unit.</div>
          <div className="col-span-2 p-3 text-center">Qté</div>
          <div className="col-span-1 p-3 text-center">Rem.</div>
          <div className="col-span-2 p-3 text-right">Total</div>
        </div>
        {(invoice.articles || []).map((a, idx) => (
          <div key={a.id ?? idx} className="grid grid-cols-12 border-t border-slate-200 text-sm">
            <div className="col-span-5 p-3">
              <div className="font-medium text-slate-800">{a.nom}</div>
              {a.description && (
                <div className="text-slate-500 text-xs mt-1 whitespace-pre-wrap">{a.description}</div>
              )}
            </div>
            <div className="col-span-2 p-3 text-right">{formatCurrency(a.prixUnitaire ?? 0)}</div>
            <div className="col-span-2 p-3 text-center">{a.quantite ?? 0}</div>
            <div className="col-span-1 p-3 text-center">{a.remise ?? 0}%</div>
            <div className="col-span-2 p-3 text-right font-semibold">{formatCurrency(a.total ?? 0)}</div>
          </div>
        ))}
      </div>

      {/* Totaux + Signature + Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="md:col-span-2">
          {invoice.signature && (
            <div className="mb-4">
              <div className="text-slate-800 font-semibold mb-2">Signature du client</div>
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <img src={invoice.signature} alt="Signature du client" className="h-20 object-contain" />
              </div>
            </div>
          )}
          {invoice.notes && (
            <div>
              <div className="text-slate-800 font-semibold mb-2">Notes</div>
              <div className="text-slate-600 whitespace-pre-wrap">{invoice.notes}</div>
            </div>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between text-slate-700 mb-2">
            <span>Montant HT</span>
            <span className="font-semibold">{formatCurrency(invoice.montantHT ?? 0)}</span>
          </div>
          <div className="flex justify-between text-slate-700 mb-2">
            <span>TVA (19%)</span>
            <span className="font-semibold">{formatCurrency(invoice.tva ?? 0)}</span>
          </div>
          <div className="border-t border-slate-200 my-2" />
          <div className="flex justify-between text-slate-900 text-lg font-extrabold">
            <span>Total TTC</span>
            <span className="text-emerald-600">{formatCurrency(invoice.total ?? 0)}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-slate-500 text-xs mt-8">
        Document de démonstration statique — {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR')}
      </div>

      {/* Print helpers */}
      <style>
        {`
        @media print {
          body { margin: 0; }
          @page { size: A4; margin: 14mm; }
          .print-area { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-area svg { shape-rendering: crispEdges; }
          .no-break { break-inside: avoid; page-break-inside: avoid; }
          .page-break { break-after: page; page-break-after: always; }
          .print-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-20deg);
            font-size: 120px;
            font-weight: 900;
            letter-spacing: 4px;
            color: #0f172a;
            opacity: 0.06;
            z-index: 0;
            white-space: nowrap;
            pointer-events: none;
          }
          .print-area > *:not(.print-watermark) { position: relative; z-index: 1; }
        }
        `}
      </style>
    </div>
  );
};

export default InvoicePrintView;
