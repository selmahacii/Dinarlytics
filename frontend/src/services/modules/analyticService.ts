import apiClient from '../apiClient';

export interface FinancialKPIs {
    total_sales: number;
    accounts_receivable: number;
    collection_rate: number;
    margin_net_pct: number;
    dso_days: number;
    bfr_value: number;
    break_even_point: number;
    solvency_ratio: number;
    currency: string;
}

export interface RollingForecast {
    predicted_revenue_next_month: number;
    average_monthly: number;
    trend_direction: 'up' | 'down';
    rolling_forecast: Array<{ month: string, predicted_value: number }>;
    confidence_score: number;
}

export interface ChartPoint {
    period: string;
    value: number;
}

export interface SmartAlert {
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    code: string;
}

/**
 * Analytic Service - Business Intelligence Data
 */
export const analyticService = {
    /**
     * High-level financial KPIs calculated using backend logic
     */
    getHealthKPIs: async () => {
        // MOCK IMPLEMENTATION
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
            total_sales: 5200000,
            accounts_receivable: 1250000,
            collection_rate: 88.5,
            margin_net_pct: 12.1,
            dso_days: 35,
            bfr_value: 1300000,
            break_even_point: 4200000,
            solvency_ratio: 2.1,
            currency: 'DZD'
        } as FinancialKPIs;
    },

    /**
     * Revenue history for main dashboard charts
     */
    getRevenueChart: async (periods: number = 6) => {
        // MOCK IMPLEMENTATION
        // const response = await apiClient.get<ChartPoint[]>('/analytics/revenue-chart', {
        //     params: { periods }
        // });
        // return response.data;
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { period: 'Jan', value: 1500000 },
            { period: 'Fev', value: 1800000 },
            { period: 'Mar', value: 1600000 },
            { period: 'Aur', value: 2100000 },
            { period: 'Mai', value: 2300000 },
            { period: 'Juin', value: 2500000 }
        ] as ChartPoint[];
    },

    /**
     * Real-time smart alerts (AI & Rule based)
     */
    getAlerts: async () => {
        // MOCK IMPLEMENTATION
        // const response = await apiClient.get<SmartAlert[]>('/analytics/alerts');
        // return response.data;
        await new Promise(resolve => setTimeout(resolve, 400));
        return [
            { type: 'danger', title: 'Trésorerie tendue', message: 'Le BFR dépasse 15% du CA mensuel.', code: 'CASH_FLOW_WARN' },
            { type: 'warning', title: 'Stock bas', message: 'Article ART002 sous le seuil de sécurité.', code: 'STOCK_LOW' },
            { type: 'info', title: 'Opportunité', message: 'Augmentation des ventes de 10% prévue.', code: 'SALES_OPP' }
        ] as SmartAlert[];
    },

    /**
     * AI Rolling Plan Forecast
     */
    getForecast: async () => {
        // MOCK IMPLEMENTATION
        // const response = await apiClient.get<RollingForecast>('/analytics/forecast');
        // return response.data;
        await new Promise(resolve => setTimeout(resolve, 700));
        return {
            predicted_revenue_next_month: 2700000,
            average_monthly: 2000000,
            trend_direction: 'up',
            rolling_forecast: [
                { month: 'Juil', predicted_value: 2600000 },
                { month: 'Aout', predicted_value: 2750000 },
                { month: 'Sept', predicted_value: 2900000 }
            ],
            confidence_score: 0.89
        } as RollingForecast;
    },

    /**
     * NOUVEAUX KPIS IA : Efficacité & ROI
     * Mesure la valeur ajoutée concrète de l'IA (Design Hierarchie & Droits)
     */
    getAIEfficiencyMetrics: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            accuracy: {
                cash_flow_prediction: 92.5, // % de précision
                recovery_success_rate: 68.0 // % succès recouvrement auto
            },
            impact: {
                total_savings_amount: 1250000, // 1.25M DA économisés
                time_saved_hours: 145, // Heures humaines économisées
                anomalies_detected_count: 12
            },
            risk: {
                fiscal_compliance_score: 98, // Score conformité fiscale / 100
                fraud_risk_level: 'low' // 'low' | 'medium' | 'high'
            }
        };
    },

    /**
     * Get KPIs specific to a business sector for Professional Dashboard
     */
    getSectorMetrics: async (sector: 'retail' | 'services' | 'industry') => {
        await new Promise(resolve => setTimeout(resolve, 600));

        const common = {
            revenue_trend: [120, 132, 101, 134, 190, 230],
            expenses: 850000,
            net_profit: 350000
        };

        if (sector === 'retail') {
            return {
                ...common,
                kpis: {
                    avg_basket: { value: 7500, unit: 'DZD', label: 'Panier Moyen', trend: 5.4 },
                    inventory_turnover: { value: 6.2, unit: 'x/an', label: 'Rotation Stock', trend: 1.2 },
                    return_rate: { value: 2.1, unit: '%', label: 'Tx Retours', trend: -0.5 },
                    cust_acquisition: { value: 1200, unit: 'DZD', label: 'Coût Acq.', trend: -10 }
                },
                charts: {
                    main: { title: 'Ventes par Catégorie', data: [{ label: 'Élec', value: 45 }, { label: 'Maison', value: 30 }, { label: 'Mode', value: 25 }], type: 'doughnut' },
                    secondary: { title: 'Flux de Stock', data: [100, 95, 80, 120, 110, 105], type: 'line' }
                }
            };
        } else if (sector === 'services') {
            return {
                ...common,
                kpis: {
                    billable_rate: { value: 85, unit: '%', label: 'Taux Facturation', trend: 3.2 },
                    avg_daily_rate: { value: 35000, unit: 'DZD', label: 'TJM Moyen', trend: 2.1 },
                    pipeline_value: { value: 12.5, unit: 'M DZD', label: 'Pipeline Comm.', trend: 15 },
                    churn_rate: { value: 4.2, unit: '%', label: 'Attrition', trend: -1.1 }
                },
                charts: {
                    main: { title: 'Revenus par Pôle', data: [{ label: 'Consulting', value: 60 }, { label: 'Audit', value: 25 }, { label: 'Formation', value: 15 }], type: 'doughnut' },
                    secondary: { title: 'Taux d\'Occupation', data: [75, 80, 82, 85, 84, 88], type: 'line' }
                }
            };
        } else { // Industry
            return {
                ...common,
                kpis: {
                    oee: { value: 78.5, unit: '%', label: 'Taux Rendement (TRS)', trend: 1.5 },
                    unit_cost: { value: 1250, unit: 'DZD', label: 'Coût Unitaire', trend: -2.4 },
                    defect_rate: { value: 1.2, unit: '%', label: 'Taux Rebuts', trend: -0.3 },
                    uptime: { value: 98.2, unit: '%', label: 'Disponibilité', trend: 0.1 }
                },
                charts: {
                    main: { title: 'Production vs Capacité', data: [{ label: 'Prod', value: 80 }, { label: 'Capacité', value: 100 }], type: 'bar' },
                    secondary: { title: 'Coûts de Maintenance', data: [50, 45, 60, 40, 35, 30], type: 'line' }
                }
            };
        }
    },

    /**
     * Get Comprehensive Accounting KPIs for Statistiques page
     */
    getKPIs: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            metriques: {
                ventesTotal: 5200000,
                croissanceCA: 7.2,
                margeBrute: 16.2,
                rotationStock: 5.4,
                nombreClients: 85,
                nouveauxClients: 8,
                tauxFidelisation: 94
            },
            ecrituresComptables: {
                total: 850,
                validees: 820,
                enAttente: 30,
                evolution: 4.5,
                parJour: 12
            },
            tva: {
                aVerser: 399000,
                collectee: 988000,
                deductible: 589000,
                taux: 19,
                evolution: 3.2
            },
            bilans: {
                actif: 4943000,
                passif: 4943000,
                capitauxPropres: 1629000,
                evolution: 6.8,
                dateDernier: '31/12/2025'
            },
            ratios: [
                { nom: 'Liquidité Générale', valeur: '1.4', couleur: 'green' },
                { nom: 'Solvabilité', valeur: '40%', couleur: 'blue' },
                { nom: 'Rentabilité Nette', valeur: '12%', couleur: 'green' },
                { nom: 'Dette / Équité', valeur: '0.8', couleur: 'orange' }
            ],
            journaux: [
                { nom: 'Journal des Achats', statut: 'Validé', entries: 450, lastUpdate: 'Aujourd\'hui' },
                { nom: 'Journal des Ventes', statut: 'Validé', entries: 620, lastUpdate: 'Aujourd\'hui' },
                { nom: 'Journal de Banque', statut: 'En cours', entries: 120, lastUpdate: 'Hier' },
                { nom: 'Opérations Diverses', statut: 'En cours', entries: 60, lastUpdate: 'Hier' }
            ]
        };
    },

    /**
     * Get Financial KPIs adapted to Company Size strictly following the design document
     */
    getCompanySizeMetrics: async (size: 'micro' | 'sme' | 'mid') => {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (size === 'micro') {
            // Focus: Cash & Survival + AI (Runway & Late Payment)
            return {
                summary: 'Priorité Trésorerie & Survie',
                kpis: {
                    cash_balance: { value: 850000, unit: 'DZD', label: 'Solde Trésorerie', trend: -5, desc: 'Disponible Immédiat' },
                    net_cash_flow: { value: 120000, unit: 'DZD', label: 'Net Cash Flow', trend: 15, desc: 'Entrées vs Sorties' },
                    cash_runway: { value: 45, unit: 'Jours', label: 'Cash Runway', trend: -2, desc: 'Jours de survie' },
                    pending_invoices: { value: 350000, unit: 'DZD', label: 'Factures Attente', trend: 10, desc: 'À relancer' }
                },
                charts: {
                    main: {
                        title: 'Flux de Trésorerie (30 Jours)',
                        type: 'bar',
                        data: [
                            { label: 'Entrées', value: 850000, color: '#10b981' },
                            { label: 'Sorties', value: 730000, color: '#ef4444' }
                        ]
                    },
                    secondary: {
                        title: 'Top Factures Retard',
                        type: 'list', // Will need specific handling
                        data: [
                            { label: 'Client A', value: 150000 },
                            { label: 'Client B', value: 120000 },
                            { label: 'Client C', value: 80000 }
                        ]
                    }
                },
                alerts: [
                    { type: 'warning', message: 'Runway < 60 jours. Prudence sur les dépenses.' }
                ],
                ai_insights: {
                    prediction: 'Cash Runway Warning (CRW)', // Model 1.1
                    value: '45 Jours restants',
                    confidence: 92,
                    details: 'Basé sur la moyenne des dépenses (25k/jour). Risque de rupture le 14 Avril.',
                    action: 'Retarder paiement fournisseur X de 5 jours.',
                    full_report: `RAPPORT PRÉDICTIF DE TRÉSORERIE (Runway Analysis)
Profil: TPE/Micro • Modèle: CRW-v2 • Horizon: 30 Jours

────────────────────────────────────────────────────────────
1. ANALYSE DU RUNWAY (SURVIE)
• Solde Actuel:      850,000 DZD
• Burn Rate Moyen:   ~18,900 DZD/jour (↑ 12% vs M-1)
• Point de Rupture:  Est. 14 Avril 2026 (Dans 45 jours)
• Tendance:          [DANGEREUSE] - Accélération des dépenses

2. PROJECTIONS HEBDOMADAIRES
[Semaine 1 - 18 Fév]
  Solde: 850k → 717k DZD | Sorties prévues: Loyers, Fournisseur A
  Risque: FAIBLE

[Semaine 2 - 25 Fév]
  Solde: 717k → 585k DZD | Sorties prévues: Salaires (Partiel)
  Risque: MODÉRÉ (Pression sur BFR)

[Semaine 3 - 04 Mar]
  Solde: 585k → 400k DZD | Sorties prévues: Stocks, TVA
  Risque: ÉLEVÉ - Seuil d'alerte approché

3. RECOMMANDATIONS IA (ACTION IMMÉDIATE)
[P1] 🔴 URGENT: Décaler le règlement "Fournisseur X" (150k) au 15 Mars.
[P2] 🟡 Négocier un acompte de 30% sur le devis "Client Y" validé hier.
[P3] 🟢 Réduire les frais de marketing digital (-20%) temporairement.

4. SCORE DE VIABILITÉ: 42/100 (FRAGILE)
────────────────────────────────────────────────────────────`
                }
            };
        } else if (size === 'sme') {
            // Focus: Growth, Profitability, BFR + AI (Prophet Revenue & Anomaly)
            return {
                summary: 'Rentabilité & Gestion BFR',
                kpis: {
                    gross_margin: { value: 32.5, unit: '%', label: 'Marge Brute', trend: 2.1, desc: 'Efficacité Prod.' },
                    ebitda: { value: 4200000, unit: 'DZD', label: 'EBITDA', trend: 8.5, desc: 'Profit. Opérationnelle' },
                    dso: { value: 52, unit: 'Jours', label: 'DSO Moyen', trend: -3, desc: 'Délai Paiement Client' },
                    dependency: { value: 18, unit: '%', label: 'Dépendance Client', trend: 0, desc: 'Part Top 1 Client' }
                },
                charts: {
                    main: {
                        title: 'Prévision CA (Prophet AI)', // Model 2.1
                        type: 'line',
                        data: [
                            { label: 'Jan', value: 12 }, { label: 'Fev', value: 15 }, { label: 'Mar', value: 13 },
                            { label: 'Avr', value: 18 }, { label: 'Mai', value: 22 }, { label: 'Juin (Prévu)', value: 25, color: '#475569', is_prediction: true }
                        ]
                    },
                    secondary: {
                        title: 'Structure des Coûts',
                        type: 'doughnut',
                        data: [
                            { label: 'COGS', value: 65 },
                            { label: 'Exploitation', value: 20 },
                            { label: 'Admin', value: 15 }
                        ]
                    }
                },
                alerts: [
                    { type: 'success', message: 'DSO en amélioration (-3 jours vs N-1).' },
                    { type: 'info', message: 'Marge brute stable.' }
                ],
                ai_insights: {
                    prediction: 'Détection Anomalie Dépense (EAD)', // Model 2.2
                    value: '1 Anomalie Critique',
                    confidence: 88,
                    details: 'Facture IT de 450k DZD hors norme (> 3x moyenne). Fournisseur: TechSolutions.',
                    action: 'Auditer la facture #INV-2024-98.',
                    full_report: `RAPPORT D'AUDIT & DÉTECTION D'ANOMALIES
Profil: PME • Modèle: EAD-IsolationForest • Analyse: Temps Réel

────────────────────────────────────────────────────────────
1. SYNTHÈSE DES FLUX
• Revenus (Projetés): +8.5% vs N-1 (Excellent)
• Dépenses Opérat.:   +14.2% (Alerte: Divergence vs Revenus)
• Marge Nette:        Stable (22.4%) mais sous pression

2. ANOMALIE DÉTECTÉE [Niveau: CRITIQUE]
• ID Transaction:  #INV-2024-98
• Fournisseur:     TechSolutions SARL
• Catégorie:       Services IT / Maintenance
• Montant:         450,000 DZD
------------------------------------------------------------
• Analyse IA:      Ce montant est 3.4x supérieur à la moyenne
                   mensuelle (132k) pour ce fournisseur.
                   Aucun bon de commande lié trouvé dans l'ERP.
• Probabilité:     88% s'agit d'une erreur ou doublon.

3. PRÉVISION DE CA (PROPHET MODEL)
• M+1 (Mars):      16.5M DZD (± 1.2M) - Forte Saisonnalité
• Tendance:        HAUSSIÈRE (Drivers: Nouveaux produits)

4. ACTIONS RECOMMANDÉES
[P1] Bloquer le paiement #INV-2024-98 immédiatement.
[P2] Vérifier le contrat de maintenance IT (Renouvellement tacite ?).
[P3] Lancer une campagne de relance client (DSO 52j → Objectif 45j).
────────────────────────────────────────────────────────────`
                }
            };
        } else { // Mid-sized (ETI)
            // Focus: Control & Prediction + AI (Liquidity Stress & Churn)
            return {
                summary: 'Contrôle & Prédictif',
                kpis: {
                    mcv: { value: 45.2, unit: '%', label: 'Marge s/ Coût Var.', trend: 1.1, desc: 'Contrib. Frais Fixes' },
                    roe: { value: 38.6, unit: '%', label: 'ROE', trend: 0.5, desc: 'Retour s/ Capitaux' },
                    labor_efficiency: { value: 3.2, unit: 'x', label: 'Efficacité MO', trend: 0.1, desc: 'Marge / Salaires' },
                    budget_variance: { value: -2.1, unit: '%', label: 'Écart Budget', trend: -0.5, desc: 'Réel vs Plan' }
                },
                charts: {
                    main: {
                        title: 'Stress Test Liquidité (Monte Carlo)', // Model 3.1
                        type: 'area', // Predictive area chart
                        data: [
                            { label: 'M1', value: 100 }, { label: 'M2', value: 110 }, { label: 'M3', value: 105 },
                            { label: 'M4 (Pessimiste)', value: 90, color: '#94a3b8' },
                            { label: 'M4 (Réaliste)', value: 115, color: '#64748b' },
                            { label: 'M4 (Optimiste)', value: 135, color: '#1e293b' }
                        ]
                    },
                    secondary: {
                        title: 'Performance par BU',
                        type: 'bar',
                        data: [
                            { label: 'Nord', value: 120 },
                            { label: 'Sud', value: 95 },
                            { label: 'Est', value: 110 },
                            { label: 'Ouest', value: 85 }
                        ]
                    }
                },
                alerts: [
                    { type: 'danger', message: 'Écart budget > 2% sur BU Ouest.' },
                    { type: 'info', message: 'Prévision de cash flow positive.' }
                ],
                ai_insights: {
                    prediction: 'Risque Attrition Client (PCP)', // Model 3.2
                    value: '3 Comptes Stratégiques',
                    confidence: 76,
                    details: 'Client "SARL Bâtiment" probability de churn 85%. Cause: Délais livraison.',
                    action: 'Activer le protocole "Rétention Premium".',
                    full_report: `SIMULATION DE RISQUE & SCÉNARIOS (Monte Carlo)
Profil: ETI • Modèle: Risk-Ensemble-v4 • Itérations: 10,000

────────────────────────────────────────────────────────────
1. RISQUE CLIENT (CHURN PREDICTION)
• Volume à Risque:   12.5M DZD (CA Annuel)
• Clients Critiques: 3 Identifiés
  1. SARL Bâtiment (Prob. 85%) - Impact: ÉLEVÉ
     Cause: Retards livraison récurrents (> 5 jours).
     Signal faible: Baisse fréquence commandes (-20%).
  2. Groupe Industriel Z (Prob. 62%) - Impact: MOYEN
     Cause: Changement de direction achats.

2. STRESS TEST DE LIQUIDITÉ (Horizon 6 Mois)
Scénario PESSIMISTE (Prob. 15%):
• Hypothèse: Baisse CA -10% + Retard Paiement Clients +15j
• Résultat:  Tension trésorerie M+4 (Besoin financement 5M DZD).

Scénario RÉALISTE (Prob. 60%):
• Hypothèse: Croissance stable +2%
• Résultat:  Excédent de trésorerie disponible pour CapEx.

3. OPTIMISATION DU BFR
• Stock: Rotation faible sur BU "Ouest" (Immobilisation 12M DZD).
• Fournisseurs: Opportunité escompte 2% chez Fournisseur A.

4. STRATÉGIE PROPOSÉE
[RETENTION] Visite commerciale immédiate chez SARL Bâtiment.
[LIQUIDITE] Sécuriser ligne de crédit court terme (couverture risque M+4).
[STOCK]     Déstockage promotionnel sur gamme "Ouest".
────────────────────────────────────────────────────────────`
                }
            };
        }
    }
};

