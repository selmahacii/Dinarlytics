import React, { useMemo } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'inflow' | 'outflow';
  amount: number;
  status: 'pending' | 'cleared' | 'reconciled';
  bank?: string;
  reference?: string;
}

interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

interface ForecastDay {
  date: string;
  projected: number;
  inflows: number;
  outflows: number;
  confidence: 'high' | 'medium' | 'low';
}

interface CashFlowForecastProps {
  bankAccounts: BankAccount[];
  transactions: Transaction[];
}

  const { formatCurrency } = useApp();

  const currentBalance = useMemo(
    () => bankAccounts.reduce((sum, acc) => sum + acc.balance, 0),
    [bankAccounts]
  );

  // Générer prévisions pour les 30 prochains jours
  const forecast = useMemo(() => {
    const forecast: ForecastDay[] = [];
    const today = new Date();
    let runningBalance = currentBalance;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Simulation de flux (pattern réaliste)
      let inflows = 0;
      let outflows = 0;

      // Jour 5 & 20 : Grands paiements clients
      if (i % 15 === 5 || i % 15 === 20) {
        inflows = Math.random() * 5000000 + 3000000;
      }
      // Jour 10 & 25 : Paiements fournisseurs
      if (i % 15 === 10 || i % 15 === 25) {
        outflows = Math.random() * 3000000 + 2000000;
      }
      // Petits mouvements quotidiens
      if (i > 0) {
        inflows += Math.random() * 500000;
        outflows += Math.random() * 300000;
      }

      const net = inflows - outflows;
      runningBalance += net;

      forecast.push({
        date: dateStr,
        projected: Math.max(0, runningBalance), // Pas de négatif
        inflows,
        outflows,
        confidence: i < 5 ? 'high' : i < 15 ? 'medium' : 'low'
      });
    }

    return forecast;
  }, [currentBalance]);

  // Stats clés
  const stats = useMemo(() => {
    const totalInflows = forecast.reduce((sum, d) => sum + d.inflows, 0);
    const totalOutflows = forecast.reduce((sum, d) => sum + d.outflows, 0);
    const minBalance = Math.min(...forecast.map(d => d.projected));
    const maxBalance = Math.max(...forecast.map(d => d.projected));
    const riskFlag = minBalance < 5000000; // Alerte si < 5M DA

    return { totalInflows, totalOutflows, minBalance, maxBalance, riskFlag };
  }, [forecast]);

  // Normaliser pour le graphique (échelle)
  const scale = stats.maxBalance / 100;
  const heightUnit = scale / 2;

  return (
    <div className="space-y-6">
      {/* Alertes */}
      {stats.riskFlag && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">⚠️ Attention : Risque de Liquidité</h3>
            <p className="text-sm text-red-700 mt-1">
              Le solde pourrait descendre à {formatCurrency(stats.minBalance)} dans les 30 prochains jours.
              Envisagez un refinancement ou l'optimisation des sorties de trésorerie.
            </p>
          </div>
        </div>
      )}

      {/* KPIs Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-600 uppercase">Inflows Prévus (30j)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(stats.totalInflows)}</p>
          <p className="text-xs text-slate-500 mt-1">Moyennes</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-600 uppercase">Outflows Prévus (30j)</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats.totalOutflows)}</p>
          <p className="text-xs text-slate-500 mt-1">Moyennes</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-600 uppercase">Solde Min</p>
          <p className={`text-2xl font-bold mt-2 ${stats.minBalance < 5000000 ? 'text-red-600' : 'text-slate-900'}`}>
            {formatCurrency(stats.minBalance)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Point critique</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-600 uppercase">Solde Max</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(stats.maxBalance)}</p>
          <p className="text-xs text-slate-500 mt-1">Pic attendu</p>
        </div>
      </div>

      {/* Graphique Flux */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">📈 Prévisions de Cash Flow (30 jours)</h2>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex items-end justify-between h-48 space-x-1 min-w-full" style={{ minWidth: '1200px' }}>
            {forecast.map((day, idx) => {
              const height = (day.projected / stats.maxBalance) * 140;
              const isRisk = day.projected < 5000000;
              const color = isRisk ? 'bg-red-500' : day.confidence === 'high' ? 'bg-blue-600' : day.confidence === 'medium' ? 'bg-blue-400' : 'bg-blue-300';

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex justify-center" style={{ height: '140px' }}>
                    <div
                      className={`${color} rounded-t w-6 transition-all hover:shadow-lg`}
                      style={{ height: `${Math.max(10, height)}px` }}
                      title={`${day.date}: ${formatCurrency(day.projected)}`}
                    />
                  </div>
                  <div className="text-xs text-slate-600 mt-2 text-center">{day.date.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-slate-600">Confiance haute</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span className="text-slate-600">Confiance moyenne</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded"></div>
            <span className="text-slate-600">Confiance basse</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-slate-600">Risque liquidité</span>
          </div>
        </div>
      </div>

      {/* Tableau Détaillé */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Détail Quotidien</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-slate-600 font-semibold">Date</th>
                <th className="px-4 py-3 text-right text-slate-600 font-semibold">Entrées</th>
                <th className="px-4 py-3 text-right text-slate-600 font-semibold">Sorties</th>
                <th className="px-4 py-3 text-right text-slate-600 font-semibold">Solde Projeté</th>
                <th className="px-4 py-3 text-center text-slate-600 font-semibold">Confiance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {forecast.slice(0, 15).map((day) => (
                <tr key={day.date} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 font-medium">{day.date}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-semibold">
                    {day.inflows > 0 ? '+' : ''}{formatCurrency(day.inflows)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">
                    -{formatCurrency(day.outflows)}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${day.projected < 5000000 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatCurrency(day.projected)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {day.confidence === 'high' && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        ✓ Haute
                      </span>
                    )}
                    {day.confidence === 'medium' && (
                      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        ⚠ Moyenne
                      </span>
                    )}
                    {day.confidence === 'low' && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                        ❓ Basse
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Recommandations</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Soldes projetés stables pour les 15 premiers jours</li>
          <li>✓ Pic de rentrées attendu à J+5 et J+20</li>
          <li>⚠ Maintenir une réserve {`>`} 5M DA pour les urgences</li>
        </ul>
      </div>
    </div>
  );
};

export default CashFlowForecast;
