import React from 'react';
import { financialCalc } from '@shared/utils/financialCalculations';

interface DocumentTemplateProps {
    title: string;
    documentNumber: string;
    date: string;
    partner: {
        name: string;
        address: string;
        taxId?: string;
    };
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
    }>;
    companyInfo: {
        name: string;
        address: string;
        taxId: string;
        rc: string;
        ai: string;
    };
}

const ProfessionalDocument: React.FC<DocumentTemplateProps> = ({
    title,
    documentNumber,
    date,
    partner,
    items,
    companyInfo
}) => {
    const totals = items.reduce((acc, item) => {
        const { ht, tva, ttc } = financialCalc.fromHT(item.quantity * item.unitPrice, item.taxRate || 0.19);
        return {
            ht: acc.ht + ht,
            tva: acc.tva + tva,
            ttc: acc.ttc + ttc
        };
    }, { ht: 0, tva: 0, ttc: 0 });

    return (
        <div className="p-10 bg-white font-sans text-slate-800 printable-document">
            {/* Header */}
            <div className="flex justify-between border-b pb-8 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{companyInfo.name}</h1>
                    <p className="text-sm">{companyInfo.address}</p>
                    <p className="text-sm">NIF: {companyInfo.taxId} | RC: {companyInfo.rc} | AI: {companyInfo.ai}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-700 uppercase">{title}</h2>
                    <p className="font-mono">N° {documentNumber}</p>
                    <p>Date: {date}</p>
                </div>
            </div>

            {/* Partner Info */}
            <div className="mb-10 grid grid-cols-2 gap-8">
                <div className="bg-slate-50 p-4 rounded border">
                    <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">Destinataire</h3>
                    <p className="font-bold">{partner.name}</p>
                    <p className="text-sm">{partner.address}</p>
                    {partner.taxId && <p className="text-sm">NIF: {partner.taxId}</p>}
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-10">
                <thead>
                    <tr className="bg-slate-100 text-left border-y">
                        <th className="py-2 px-3 text-sm">Désignation</th>
                        <th className="py-2 px-3 text-sm text-right">Qté</th>
                        <th className="py-2 px-3 text-sm text-right">P.U HT</th>
                        <th className="py-2 px-3 text-sm text-right">TVA</th>
                        <th className="py-2 px-3 text-sm text-right">Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                            <td className="py-3 px-3 text-sm font-medium">{item.description}</td>
                            <td className="py-3 px-3 text-sm text-right">{item.quantity}</td>
                            <td className="py-3 px-3 text-sm text-right">{financialCalc.formatDZD(item.unitPrice)}</td>
                            <td className="py-3 px-3 text-sm text-right">{(item.taxRate || 0.19) * 100}%</td>
                            <td className="py-3 px-3 text-sm text-right">{financialCalc.formatDZD(item.quantity * item.unitPrice)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Total Hors Taxe:</span>
                        <span className="font-medium">{financialCalc.formatDZD(totals.ht)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b pb-2">
                        <span>TVA (19%):</span>
                        <span className="font-medium">{financialCalc.formatDZD(totals.tva)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold bg-slate-900 text-white p-2 rounded">
                        <span>TOTAL TTC:</span>
                        <span>{financialCalc.formatDZD(totals.ttc)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-10 border-t text-center text-xs text-slate-500 italic">
                Arrêté le présent document à la somme de : ........................................................................
                <div className="grid grid-cols-3 mt-10 gap-20">
                    <div>Cachet & Signature</div>
                    <div>Accusé de réception</div>
                    <div>La Direction</div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalDocument;

