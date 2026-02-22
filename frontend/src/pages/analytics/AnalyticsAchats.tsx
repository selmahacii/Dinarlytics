import React, { useState, useMemo, useEffect } from 'react';
import {
    DocumentTextIcon,
    PlusIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    BanknotesIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    TrashIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';
import { invoiceService, type Invoice, type InvoiceItem, type EntityDetails } from '../../services/modules/invoiceService';
import { suppliersService, type Supplier } from '../../services/modules/suppliersService';

import Modal from '@shared/components/UI/Modal';

const AnalyticsAchats: React.FC = () => {
    const { formatCurrency } = useApp();
    const { user } = usePermission();

    const [purchases, setPurchases] = useState<Invoice[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('tous');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<Invoice | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newPurchase, setNewPurchase] = useState<Partial<Invoice>>({
        type: 'purchase',
        factureId: '',
        client: '',
        date: new Date().toISOString().split('T')[0],
        echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        items: [{ desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 } as any],
        paymentMode: 'virement',
        statut: 'en_cours',
        totalHT: 0,
        totalTVA: 0,
        totalTTC: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const allInvoices = await invoiceService.getAll();
            setPurchases(allInvoices.filter(inv => inv.type === 'purchase'));
            const allSuppliers = await suppliersService.getAll();
            setSuppliers(allSuppliers);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = () => {
        setNewPurchase({
            ...newPurchase,
            items: [...(newPurchase.items || []), { desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 } as any]
        });
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const items = [...(newPurchase.items || [])];
        items[index] = { ...items[index], [field]: value };

        // Recalculate totals for this item
        const qty = items[index].qty || 0;
        const pu = items[index].pu || 0;
        const tvaRate = items[index].tva_rate || 19;

        items[index].line_total_ht = qty * pu;
        items[index].line_total_tva = items[index].line_total_ht * (tvaRate / 100);
        items[index].line_total_ttc = items[index].line_total_ht + items[index].line_total_tva;

        setNewPurchase({ ...newPurchase, items });
    };

    // Calculate overall totals
    useEffect(() => {
        const totalHT = newPurchase.items?.reduce((sum, item) => sum + (item.line_total_ht || 0), 0) || 0;
        const totalTVA = newPurchase.items?.reduce((sum, item) => sum + (item.line_total_tva || 0), 0) || 0;

        setNewPurchase(prev => ({
            ...prev,
            totalHT,
            totalTVA,
            totalTTC: totalHT + totalTVA
        }));
    }, [newPurchase.items]);

    const filteredPurchases = useMemo(() => {
        return purchases.filter(p => {
            const matchesSearch = p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.factureId.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'tous' || p.statut === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [purchases, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        const totalHT = filteredPurchases.reduce((acc, p) => acc + p.totalHT, 0);
        const totalTVA = filteredPurchases.reduce((acc, p) => acc + p.totalTVA, 0);
        const totalTTC = filteredPurchases.reduce((acc, p) => acc + p.totalTTC, 0);
        const pendingAmount = filteredPurchases
            .filter(p => p.statut !== 'payee' && p.statut !== 'annule')
            .reduce((acc, p) => acc + (p.totalTTC - (p.montantPaye || 0)), 0);

        return { totalHT, totalTVA, totalTTC, pendingAmount };
    }, [filteredPurchases]);

    const handleSavePurchase = async () => {
        if (!newPurchase.client || !newPurchase.factureId) {
            alert("Veuillez remplir le fournisseur et le numéro de facture.");
            return;
        }

        try {
            const saved = await invoiceService.create(newPurchase as Invoice);
            setPurchases(prev => [...prev, saved]);
            setIsCreateModalOpen(false);
            setNewPurchase({
                type: 'purchase',
                factureId: '',
                client: '',
                date: new Date().toISOString().split('T')[0],
                items: [{ desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 } as any],
                paymentMode: 'virement',
                statut: 'en_cours'
            });
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'enregistrement de l'achat.");
        }
    };

    return (
        <div className="space-y-8 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                            <BanknotesIcon className="h-8 w-8 text-rose-500 mr-3" />
                            Achats & Charges
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Gérez vos dépenses et dettes fournisseurs</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center shadow-xl shadow-slate-900/20"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" /> Saisir un Achat
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Achats HT</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(stats.totalHT)}</p>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 dark:bg-white w-2/3"></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">TVA Récupérable</p>
                    <p className="text-2xl font-black text-emerald-500 font-mono">{formatCurrency(stats.totalTVA)}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase">+12% vs M-1</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Dettes Fournisseurs</p>
                    <p className="text-2xl font-black text-rose-500 font-mono">{formatCurrency(stats.pendingAmount)}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Exigibilité moyenne 15j</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nombre d'Achats</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{filteredPurchases.length}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{purchases.length} total référencés</p>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un fournisseur ou une facture..."
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select aria-label="Statut"
                            className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="tous">Tous les statuts</option>
                            <option value="en_cours">En attente</option>
                            <option value="payee">Payée</option>
                            <option value="en_retard">En retard</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-700 text-left">
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Référence</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Fournisseur</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Date</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Montant TTC</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Statut</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {filteredPurchases.map((purchase) => (
                                <tr key={purchase.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-6 px-4 font-black text-slate-900 dark:text-white text-sm">{purchase.factureId}</td>
                                    <td className="py-6 px-4 text-sm font-bold border-l-4 border-transparent group-hover:border-rose-500 transition-all uppercase">{purchase.client}</td>
                                    <td className="py-6 px-4 text-sm font-medium text-slate-500">{new Date(purchase.date).toLocaleDateString()}</td>
                                    <td className="py-6 px-4 font-black text-slate-900 dark:text-white font-mono">{formatCurrency(purchase.totalTTC)}</td>
                                    <td className="py-6 px-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${purchase.statut === 'payee' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            purchase.statut === 'en_retard' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {purchase.statut.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedPurchase(purchase);
                                                setIsDetailModalOpen(true);
                                            }}
                                            className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Saisir un Achat */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Saisir un nouvel achat"
                size="xl"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fournisseur</label>
                            <select aria-label="Selectionner Fournisseur"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold"
                                value={newPurchase.client}
                                onChange={(e) => setNewPurchase({ ...newPurchase, client: e.target.value })}
                            >
                                <option value="">Sélectionner un fournisseur</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Numéro de Facture</label>
                            <input
                                type="text"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold"
                                placeholder="EX: FAC-2024-001"
                                value={newPurchase.factureId}
                                onChange={(e) => setNewPurchase({ ...newPurchase, factureId: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date Facture</label>
                            <input
                                type="date"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold"
                                value={newPurchase.date}
                                onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Échéance</label>
                            <input
                                type="date"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold"
                                value={newPurchase.echeance}
                                onChange={(e) => setNewPurchase({ ...newPurchase, echeance: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Articles / Services</h4>
                            <button
                                onClick={handleAddItem}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase rounded-lg hover:bg-slate-200"
                            >
                                + Ajouter une ligne
                            </button>
                        </div>
                        <div className="space-y-3">
                            {newPurchase.items?.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-6">
                                        <input
                                            type="text"
                                            placeholder="Description..."
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-medium"
                                            value={item.desc}
                                            onChange={(e) => handleUpdateItem(idx, 'desc', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            placeholder="Qté"
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold font-mono"
                                            value={item.qty}
                                            onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            placeholder="Prix U."
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold font-mono"
                                            value={item.pu}
                                            onChange={(e) => handleUpdateItem(idx, 'pu', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button
                                            onClick={() => {
                                                const items = [...(newPurchase.items || [])];
                                                items.splice(idx, 1);
                                                setNewPurchase({ ...newPurchase, items });
                                            }}
                                            className="text-slate-300 hover:text-rose-500"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="p-6 bg-slate-900 text-white rounded-[2rem] flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total à Régler (TTC)</p>
                            <p className="text-2xl font-black font-mono">{formatCurrency(newPurchase.totalTTC || 0)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dont TVA (19%)</p>
                            <p className="text-sm font-bold font-mono">{formatCurrency(newPurchase.totalTVA || 0)}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSavePurchase}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                        >
                            Enregistrer l'Achat
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal Détails Achat */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={`Détails Achat - ${selectedPurchase?.factureId}`}
                size="lg"
            >
                {selectedPurchase && (
                    <div className="space-y-6">
                        <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fournisseur</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase">{selectedPurchase.client}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Statut Paiement</p>
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedPurchase.statut === 'payee' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {selectedPurchase.statut}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Détail des lignes</h4>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900 text-left">
                                        <tr>
                                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Qté</th>
                                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Montant HT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                        {selectedPurchase.items?.map((item, i) => (
                                            <tr key={i}>
                                                <td className="p-4 text-xs font-bold text-slate-700 dark:text-slate-300">{item.desc}</td>
                                                <td className="p-4 text-xs font-mono text-right">{item.qty}</td>
                                                <td className="p-4 text-xs font-mono text-right font-black">{formatCurrency(item.line_total_ht)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total HT</p>
                                <p className="text-sm font-black font-mono">{formatCurrency(selectedPurchase.totalHT)}</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">TVA (19%)</p>
                                <p className="text-sm font-black font-mono">{formatCurrency(selectedPurchase.totalTVA)}</p>
                            </div>
                            <div className="p-6 bg-slate-900 text-white rounded-3xl">
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Total TTC</p>
                                <p className="text-lg font-black font-mono">{formatCurrency(selectedPurchase.totalTTC)}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-3">
                            <button className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Télécharger PDF
                            </button>
                            <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Fermer</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AnalyticsAchats;
