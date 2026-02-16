import { useState, useEffect } from 'react';
import { invoiceService, Invoice } from '@/services/modules/invoiceService';

/**
 * Custom Hook for Real-Time Invoice Management
 * Replaces static data with live backend queries
 */
export const useInvoices = (type?: 'sale' | 'purchase') => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadInvoices = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await invoiceService.getAll(type);
            setInvoices(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load invoices');
            console.error('Invoice loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, [type]);

    const createInvoice = async (data: Partial<Invoice>) => {
        try {
            const newInvoice = await invoiceService.create(data);
            setInvoices(prev => [newInvoice, ...prev]);
            return newInvoice;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const validateInvoice = async (id: string) => {
        try {
            const updated = await invoiceService.validate(id);
            setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
            return updated;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const cancelInvoice = async (id: string) => {
        try {
            await invoiceService.cancel(id);
            setInvoices(prev => prev.map(inv =>
                inv.id === id ? { ...inv, statut: 'cancelled' as const } : inv
            ));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return {
        invoices,
        loading,
        error,
        refresh: loadInvoices,
        createInvoice,
        validateInvoice,
        cancelInvoice
    };
};

