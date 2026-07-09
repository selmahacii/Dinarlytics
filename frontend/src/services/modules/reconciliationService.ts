import apiClient from '../apiClient';
import type { ReleveBancaire, EcritureComptable } from '@/types';

const reconciliationService = {
    getStatements: async (compte_id?: string): Promise<ReleveBancaire[]> => {
        const response = await apiClient.get('/reconciliation/statements', {
            params: compte_id ? { compte_id } : {}
        });
        return response.data;
    },

    importStatement: async (data: {
        compteBancaireId: string;
        numeroReleve: string;
        dateDebut: string;
        dateFin: string;
        soldeDebut: number;
        soldeFin: number;
        formatFichier: string;
        lignes: any[];
    }): Promise<ReleveBancaire> => {
        const response = await apiClient.post('/reconciliation/statements/import', data);
        return response.data;
    },

    autoMatch: async (statement_id: string, tolerance_days: number = 5): Promise<{ matched_lines_count: number }> => {
        const response = await apiClient.post(`/reconciliation/statements/${statement_id}/auto-match`, null, {
            params: { tolerance_days }
        });
        return response.data;
    },

    match: async (ligneReleveId: string, ecritureId: string): Promise<{ status: string }> => {
        const response = await apiClient.post('/reconciliation/match', { ligneReleveId, ecritureId });
        return response.data;
    },

    unmatch: async (line_id: string): Promise<{ status: string }> => {
        const response = await apiClient.post(`/reconciliation/unmatch/${line_id}`);
        return response.data;
    }
};

export default reconciliationService;
