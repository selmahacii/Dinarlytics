import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtime = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Determine WebSocket URL
        // In development loop, it's usually localhost:8000 for backend
        // Determine WebSocket URL dynamically
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        // Remove /api/v1 suffix if present and replace protocol
        const baseUrl = apiUrl.replace('/api/v1', '').replace(/\/$/, '');
        const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
        const wsUrl = `${baseUrl.replace(/^http(s)?/, wsProtocol)}/ws`;

        let ws: WebSocket | null = null;
        let reconnectTimer: any = null;

        const connect = () => {
            // Disable WS for Mock/Demo Mode to avoid console spam
            console.log('Realtime WS disabled for Demo/Mock mode');
            return;

            // ws = new WebSocket(wsUrl);

            // ws.onopen = () => {
            //     console.log('WebSocket Connected');
            // };
            // ... (rest of original logic commented out for now)
        };

        connect();

        return () => {
            if (ws) ws.close();
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };
    }, [queryClient]);
};
