import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ShieldCheckIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    TableCellsIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Modal from '../../components/UI/Modal';

interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_values: any;
    new_values: any;
    created_at: string;
}

const AuditExplorer: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [filter, setFilter] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/audit/logs');
            setLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch logs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-slate-800 flex items-center">
                        <ShieldCheckIcon className="h-8 w-8 mr-3 text-blue-600" />
                        Explorateur d'Audit & Traçabilité
                    </h1>
                    <p className="text-slate-500">Historique inviolable des modifications du système (Spans DB)</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
                >
                    <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Actualiser</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filtrer par action ou entité..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Date & Heure</th>
                            <th className="px-6 py-4">Utilisateur</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Entité</th>
                            <th className="px-6 py-4">ID Entité</th>
                            <th className="px-6 py-4 text-center">Détails</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-600">
                                    {format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss', { locale: fr })}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{log.user_id || 'Système'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.action === 'INSERT' ? 'bg-emerald-100 text-emerald-700' :
                                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-700'
                                        }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-700 uppercase tracking-tight">{log.entity_type}</td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-[120px]">{log.entity_id}</td>
                                <td className="px-6 py-4 text-center text-slate-400">
                                    <button onClick={() => setSelectedLog(log)} className="hover:text-blue-600">
                                        <EyeIcon className="h-5 w-5 mx-auto" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Détails du Log d'Audit"
                size="lg"
            >
                {selectedLog && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Ancienne Valeur</h4>
                                <pre className="text-[10px] overflow-auto max-h-60 bg-white p-2 border rounded">
                                    {JSON.stringify(selectedLog.old_values, null, 2)}
                                </pre>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Nouvelle Valeur</h4>
                                <pre className="text-[10px] overflow-auto max-h-60 bg-white p-2 border rounded">
                                    {JSON.stringify(selectedLog.new_values, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="pt-4 border-t flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AuditExplorer;
