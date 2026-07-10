import apiClient from '../apiClient';

export interface AuditLog {
    id: string;
    user_id?: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'VALIDATE';
    entity_type: string;
    entity_id: string;
    old_values: any;
    new_values: any;
    ip_address?: string | null;
    created_at: string;
}

/**
 * Audit Service - System Traceability
 */
export const auditService = {
    /**
     * Fetches real DB traces with JSON diffs
     */
    getLogs: async (limit: number = 50, entityType?: string) => {
        const response = await apiClient.get<AuditLog[]>('/audit/logs', {
            params: { limit, entity_type: entityType }
        });
        return response.data;
    },

    /**
     * Deep link to specific entity history
     */
    getEntityHistory: async (entityType: string, entityId: string) => {
        const response = await apiClient.get<AuditLog[]>('/audit/logs', {
            params: { entity_type: entityType, entity_id: entityId }
        });
        return response.data;
    }
};
