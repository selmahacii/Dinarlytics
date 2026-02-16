import React from 'react';
import { financialCalc } from '@shared/utils/financialCalculations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface G50DocumentProps {
    month: number;
    year: number;
    salesHT: number;
    purchasesHT: number;
    companyInfo: {
        name: string;
        address: string;
        taxId: string;
        rc: string;
        ai: string;
    };
}

const G50OfficialDocument: React.FC<G50DocumentProps> = ({
    month,
    year,
    salesHT,
    purchasesHT,
    companyInfo
}) => {
    const tvaCollected = financialCalc.fromHT(salesHT, 0.19).tva;
    const tvaDeductible = financialCalc.fromHT(purchasesHT, 0.19).tva;
    const tap = financialCalc.fromHT(salesHT, 0.02).tva; // TAP logic
    const tvaToPay = Math.max(0, tvaCollected - tvaDeductible);

    const totalDue = tvaToPay + tap;

    return (
        <div className="p-12 bg-white text-slate-900 printable-g50 font-serif max-w-4xl mx-auto border shadow-sm">
            {/* Header Stamp */}
            <div className="text-center mb-10 border-2 border-double border-slate-800 p-4">
                <h1 className="text-xl font-bold uppercase underline">République Algérienne Démocratique et Populaire</h1>
                <h2 className="text-lg font-bold">Direction Générale des Impôts</h2>
                <p className="text-sm mt-2">DÉCLARATION DU CHIFFRE D'AFFAIRES ET DES RÉSULTATS (G N° 50)</p>
            </div>

            <div className="flex justify-between mb-8 text-sm">
                <div>
                    <p><strong>Raison Sociale:</strong> {companyInfo.name}</p>
                    <p><strong>Adresse:</strong> {companyInfo.address}</p>
                    <p><strong>NIF:</strong> {companyInfo.taxId}</p>
                </div>
                <div className="text-right">
                    <p><strong>Mois:</strong> {month.toString().padStart(2, '0')}</p>
                    <p><strong>Année:</strong> {year}</p>
                </div>
            </div>

            {/* Main Table */}
            <table className="w-full border-collapse border-2 border-slate-800 text-sm mb-10">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border border-slate-800 p-2 text-left">Nature de l'Impôt</th>
                        <th className="border border-slate-800 p-2 text-right">Chiffre d'Affaires HT</th>
                        <th className="border border-slate-800 p-2 text-right">Taux</th>
                        <th className="border border-slate-800 p-2 text-right">Droits Dus (DA)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-slate-800 p-2 font-bold">T.A.P (Taxe Activité Pro.)</td>
                        <td className="border border-slate-800 p-2 text-right">{financialCalc.formatDZD(salesHT)}</td>
                        <td className="border border-slate-800 p-2 text-right">2%</td>
                        <td className="border border-slate-800 p-2 text-right font-medium">{financialCalc.formatDZD(tap)}</td>
                    </tr>
                    <tr>
                        <td className="border border-slate-800 p-2 font-bold">T.V.A (Taxe Valeur Ajoutée)</td>
                        <td className="border border-slate-800 p-2 text-right">{financialCalc.formatDZD(salesHT)}</td>
                        <td className="border border-slate-800 p-2 text-right">19%</td>
                        <td className="border border-slate-800 p-2 text-right font-medium">{financialCalc.formatDZD(tvaCollected)}</td>
                    </tr>
                    <tr className="bg-slate-50 italic text-slate-500">
                        <td className="border border-slate-800 p-2" colSpan={3}>Moins TVA Déductible sur Achats</td>
                        <td className="border border-slate-800 p-2 text-right">({financialCalc.formatDZD(tvaDeductible)})</td>
                    </tr>
                    {/* Summary Row */}
                    <tr className="bg-slate-900 text-white font-bold">
                        <td className="border border-slate-800 p-3" colSpan={3}>TOTAL À VERSER AU TRÉSOR</td>
                        <td className="border border-slate-800 p-3 text-right text-lg">{financialCalc.formatDZD(totalDue)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Footer */}
            <div className="grid grid-cols-2 gap-20 text-sm mt-20">
                <div className="border-t border-slate-400 pt-2 text-center italic">
                    Réservé à l'Administration
                </div>
                <div className="text-right">
                    <p>Fait à ........................, le {format(new Date(), 'dd/MM/yyyy')}</p>
                    <div className="h-24 w-48 border border-slate-300 rounded mt-4 inline-block text-center pt-8 text-slate-300">
                        Cachet de l'Entreprise
                    </div>
                </div>
            </div>
        </div>
    );
};

export default G50OfficialDocument;

