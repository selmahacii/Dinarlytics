import React from 'react';
import { financialCalc } from '@shared/utils/financialCalculations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface G29DocumentProps {
    exercice: string;
    beneficiaires: Array<{
        nom: string;
        nif: string;
        adresse: string;
        nature: string;
        montantBrut: number;
        retenue: number;
        montantNet: number;
    }>;
    companyInfo: {
        name: string;
        address: string;
        taxId: string;
        rc: string;
        ai: string;
    };
}

const G29OfficialDocument: React.FC<G29DocumentProps> = ({
    exercice,
    beneficiaires,
    companyInfo
}) => {
    const totalBrut = beneficiaires.reduce((sum, b) => sum + b.montantBrut, 0);
    const totalRetenu = beneficiaires.reduce((sum, b) => sum + b.retenue, 0);

    return (
        <div className="p-12 bg-white text-slate-900 printable-g29 font-serif max-w-5xl mx-auto border shadow-sm">
            {/* Header Stamp */}
            <div className="text-center mb-10 border-2 border-double border-slate-800 p-4">
                <h1 className="text-xl font-bold uppercase underline">République Algérienne Démocratique et Populaire</h1>
                <h2 className="text-lg font-bold uppercase">Direction Générale des Impôts</h2>
                <p className="text-sm mt-2 font-bold uppercase">ÉTAT RÉCAPITULATIF DES HONORAIRES, COMMISSIONS, COURTAGES (SÉRIE G N° 29)</p>
            </div>

            <div className="flex justify-between mb-8 text-sm">
                <div>
                    <p><strong>DÉCLARANT :</strong> {companyInfo.name}</p>
                    <p><strong>ADRESSE :</strong> {companyInfo.address}</p>
                    <p><strong>NIF :</strong> {companyInfo.taxId}</p>
                    <p><strong>RC :</strong> {companyInfo.rc}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg"><strong>EXERCICE :</strong> {exercice}</p>
                </div>
            </div>

            {/* Main Table */}
            <table className="w-full border-collapse border border-slate-800 text-[10px] mb-10">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border border-slate-800 p-2 text-left">Bénéficiaire (Nom, Prénom ou Raison Sociale)</th>
                        <th className="border border-slate-800 p-2 text-center">NIF / Adresse</th>
                        <th className="border border-slate-800 p-2 text-left">Nature de l'acte</th>
                        <th className="border border-slate-800 p-2 text-right">Montant Brut (DA)</th>
                        <th className="border border-slate-800 p-2 text-right">Retenue RAS (DA)</th>
                        <th className="border border-slate-800 p-2 text-right">Montant Net (DA)</th>
                    </tr>
                </thead>
                <tbody>
                    {beneficiaires.length > 0 ? beneficiaires.map((b, idx) => (
                        <tr key={idx}>
                            <td className="border border-slate-800 p-2 font-bold">{b.nom}</td>
                            <td className="border border-slate-800 p-2 text-center">
                                {b.nif}<br />
                                <span className="text-[8px] text-slate-500">{b.adresse}</span>
                            </td>
                            <td className="border border-slate-800 p-2">{b.nature}</td>
                            <td className="border border-slate-800 p-2 text-right font-mono">{financialCalc.formatDZD(b.montantBrut)}</td>
                            <td className="border border-slate-800 p-2 text-right font-mono text-red-600">{financialCalc.formatDZD(b.retenue)}</td>
                            <td className="border border-slate-800 p-2 text-right font-mono font-bold">{financialCalc.formatDZD(b.montantNet)}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td className="border border-slate-800 p-8 text-center italic text-slate-400" colSpan={6}>
                                Aucune donnée d'honoraire enregistrée pour cet exercice.
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className="bg-slate-900 text-white font-bold uppercase">
                        <td className="border border-slate-800 p-3" colSpan={3}>TOTAUX GÉNÉRAUX</td>
                        <td className="border border-slate-800 p-3 text-right">{financialCalc.formatDZD(totalBrut)}</td>
                        <td className="border border-slate-800 p-3 text-right">{financialCalc.formatDZD(totalRetenu)}</td>
                        <td className="border border-slate-800 p-3 text-right">{financialCalc.formatDZD(totalBrut - totalRetenu)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Footer */}
            <div className="grid grid-cols-2 gap-20 text-sm mt-16">
                <div>
                    <h3 className="font-bold underline mb-4">REQUÊTE DU DÉCLARANT</h3>
                    <p className="text-[10px] italic leading-tight">
                        Je soussigné, certifie que le présent état est conforme aux écritures de l'entreprise
                        et que les montants mentionnés correspondent aux paiements effectifs.
                    </p>
                </div>
                <div className="text-right">
                    <p>Fait à ........................, le {format(new Date(), 'dd/MM/yyyy')}</p>
                    <div className="h-24 w-48 border border-slate-500 rounded mt-4 border-dashed inline-block text-center pt-8 text-slate-400">
                        Signature et Cachet
                    </div>
                </div>
            </div>

            <div className="mt-12 text-[8px] text-slate-400 text-center uppercase tracking-widest border-t pt-2">
                Document généré par Dinarlytics AI • Conformité Direction Générale des Impôts (Algérie)
            </div>
        </div>
    );
};

export default G29OfficialDocument;
