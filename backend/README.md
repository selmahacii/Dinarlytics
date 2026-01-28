# Dinarlytics Core Backend (ERP + Finance AI)

**Moteur centralisé orienté Finance Operations (FinOps) et Intelligence Artificielle.**

## 🚀 Architecture de Pilotage
Le backend est structuré pour maximiser la résilience financière et la gouvernance.

### 1. **Phase 2 : Pilotage Budgétaire (Live Tracking)**
- **BudgetingService** : Synchronisation en temps réel entre le budget prévisionnel et le Grand Livre (General Ledger).
- **Variance Analysis** : Calcul automatique des écarts (`budgeted` vs `actual`) basé sur les écritures comptables approuvées.
- **SCF Mapping** : Les lignes budgétaires sont directement liées au Plan Comptable National (classe 6 et 7).

### 2. **Phase 3 : Recouvrement & Trésorerie (Collections)**
- **Relances Automatiques** : Tracking des actions de recouvrement (email, appel, mise en demeure).
- **Balance Agée (Aging Balance)** : Calcul dynamique des créances par tranches (0-30, 31-60, 61-90, +90 jours).
- **DSO Intelligent** : Analyse des délais de paiement moyens par client pour prédire les flux de trésorerie entrants.

### 3. **Governance & Internal Control (SoD)**
- **InternalControlService** : Prévention de la fraude via la Séparation des Tâches (Separation of Duties).
- **Approval Chains** : Seuil critique à 500 000 DZD pour validation forcée par la Direction.
- **Piste d'Audit** : Traçabilité immuable de chaque modification sur les entités critiques (Invoices, Partners, Budgets).

## 📁 Modules Backend
```
app/
├── routers/
│   ├── budgets.py       # API Budget vs Réel
│   ├── collections.py   # API Recouvrement & Relances
│   ├── accounting.py    # Ledger & Journaux SCF
│   ├── analytics.py     # KPIs Stratégiques (DSO, BFR)
│   └── ...
├── services/
│   ├── budgeting.py     # Logique de calcul budgétaire
│   ├── internal_control.py # Gouvernance & Risque
│   ├── accounting_automation.py # Auto-Accounting (Zero-Entry)
│   └── analytics.py     # Forecasting & Smart Alerts
└── models/
    ├── financial.py     # Modèles Budget, Paiements, Relances
    ├── accounting.py    # Modèles écritures comptables
    └── ...
```

## 🛠 Endpoints Stratégiques
- `GET /budgets/summary/{exercice}` : Santé globale du budget.
- `GET /collections/aging-balance` : Répartition des créances clients.
- `GET /analytics/forecast` : Prévision glissante (Rolling Plan) sur 3 mois.
- `POST /accounting/journal-entries/{id}/approve` : Workflow d'approbation sécurisé.

## 🔐 Sécurité & Audit
Chaque transaction sensible génère un log dans la table `audit_logs` incluant :
- Timestamp UTC
- User ID (Auteur de l'action)
- Action (CREATE, UPDATE, DELETE, VIEW)
- IP & UserAgent
- Payload complet avant/après modification (JSON)

---
**Développé pour la conformité SCF et la performance FinTech.**
