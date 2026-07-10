import { useState, useEffect, useCallback } from 'react';
import { quotesService, Devis, DevisStatus, CreateDevisPayload } from '@/services/modules/quotesService';

export const useDevis = () => {
    const [devis, setDevis] = useState<Devis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await quotesService.getAll();
            setDevis(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load quotes');
            console.error('Devis loading error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const createDevis = async (data: CreateDevisPayload) => {
        const created = await quotesService.create(data);
        setDevis(prev => [created, ...prev]);
        return created;
    };

    const updateStatus = async (id: string, status: DevisStatus) => {
        const updated = await quotesService.updateStatus(id, status);
        setDevis(prev => prev.map(d => (d.id === id ? updated : d)));
        return updated;
    };

    const convertToInvoice = async (id: string) => {
        const result = await quotesService.convertToInvoice(id);
        await load();
        return result;
    };

    const deleteDevis = async (id: string) => {
        await quotesService.delete(id);
        setDevis(prev => prev.filter(d => d.id !== id));
    };

    return {
        devis,
        loading,
        error,
        refresh: load,
        createDevis,
        updateStatus,
        convertToInvoice,
        deleteDevis,
    };
};
