import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtime = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Determine WebSocket URL
        // In development loop, it's usually localhost:8000 for backend
        const wsUrl = 'ws://localhost:8000/ws';

        let ws: WebSocket | null = null;
        let reconnectTimer: any = null;

        const connect = () => {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('WebSocket Connected');
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket Message:', message);

                    switch (message.type) {
                        case 'CLIENT_CREATED':
                        case 'CLIENT_UPDATED':
                        case 'CLIENT_DELETED':
                            queryClient.invalidateQueries({ queryKey: ['clients'] });
                            queryClient.invalidateQueries({ queryKey: ['clients', 'stats'] });
                            break;
                        case 'SUPPLIER_CREATED':
                        case 'SUPPLIER_UPDATED':
                        case 'SUPPLIER_DELETED':
                            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
                            break;
                        case 'ARTICLE_CREATED':
                        case 'ARTICLE_UPDATED':
                        case 'ARTICLE_DELETED':
                            queryClient.invalidateQueries({ queryKey: ['articles'] });
                            break;
                    }
                } catch (e) {
                    console.error('WebSocket message parse error', e);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket Disconnected. Reconnecting...');
                reconnectTimer = setTimeout(connect, 3000); // Reconnect after 3s
            };

            ws.onerror = (err) => {
                console.error('WebSocket Error:', err);
                ws?.close();
            };
        };

        connect();

        return () => {
            if (ws) ws.close();
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };
    }, [queryClient]);
};
