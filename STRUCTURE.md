# Dinarlytics - Plateforme ERP/IA Intégrée

**Système complet d'analyse financière, budgétaire et prédictive pour entreprises.**

## Structure du Projet

```
Dinarlytics/
│
├── backend/                                # 🔧 Backend AI (PyTorch + FastAPI)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                         # FastAPI entrypoint
│   │   ├── config.py                       # Configuration centralisée
│   │   ├── db.py                           # DatabaseManager
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── erp_model.py                # PyTorch multitâche
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── prediction.py               # Service de prédiction
│   │   │   └── training.py                 # Service d'entraînement
│   ├── requirements.txt
│   ├── README.md
│   ├── ARCHITECTURE.md
│   └── .env.example
│
├── frontend/                               # 🎨 Frontend React + TypeScript
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── vite-env.d.ts
│   │   ├── Assets/                         # Images, icônes, médias
│   │   ├── components/                     # Composants réutilisables
│   │   │   ├── AI/                         # Composants IA/Chat
│   │   │   ├── Analytics/                  # Dashboards d'analyse
│   │   │   ├── Charts/                     # Graphiques
│   │   │   ├── Dashboard/                  # Dashboards principaux
│   │   │   ├── Factures/                   # Gestion factures
│   │   │   ├── Layout/                     # Layout, navbar, sidebar
│   │   │   ├── Metrics/                    # Métriques et KPI
│   │   │   ├── ReportEditor/               # Éditeur de rapports
│   │   │   ├── Security/                   # Composants de sécurité
│   │   │   ├── Theme/                      # Gestion du thème
│   │   │   ├── Treasury/                   # Gestion de trésorerie
│   │   │   ├── UI/                         # Composants UI génériques
│   │   │   ├── Filters/
│   │   │   ├── Effects/
│   │   │   ├── CompanyWizard.tsx
│   │   │   └── ConditionalRenderer.tsx
│   │   ├── context/                        # Contextes React (state global)
│   │   │   ├── AppContext.tsx
│   │   │   ├── ProductsContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/                          # Pages/routes principales
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AnalyseFinanciere.tsx
│   │   │   ├── AnalysesLIA.tsx
│   │   │   ├── Budget.tsx
│   │   │   ├── ChatbotLIA.tsx
│   │   │   ├── Clients.tsx
│   │   │   ├── FacturesVente.tsx
│   │   │   ├── Fournisseurs.tsx
│   │   │   ├── Inventaire.tsx
│   │   │   ├── GestionAcces.tsx
│   │   │   ├── GestionEntreprise.tsx
│   │   │   ├── Fiscalite.tsx
│   │   │   ├── Login.tsx
│   │   │   └── ... (autres pages)
│   │   ├── hooks/                          # Hooks React personnalisés
│   │   │   ├── useAccessPlan.ts
│   │   │   ├── useLIA.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useNotification.ts
│   │   │   ├── usePermission.ts
│   │   │   └── useTranslation.ts
│   │   ├── services/                       # Services d'API
│   │   │   └── (appels backend, localStorage, etc.)
│   │   ├── utils/                          # Utilitaires
│   │   ├── types/                          # Types TypeScript
│   │   ├── security/                       # Authentification, RBAC
│   │   └── data/                           # Data mock et generators
│   │       ├── adaptiveDataGenerator.ts
│   │       ├── demoUsersComplete.ts
│   │       ├── mockData.ts
│   │       └── ... (autres données demo)
│   ├── public/                             # Fichiers statiques
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── README.md
│   └── PATCHES.md                          # Patches de correction appliqués
│
├── database/                               # 📊 Schémas PostgreSQL
│   ├── schema.sql                          # Schéma de base initial
│   ├── schema_complete.sql                 # Schéma enrichi (ERP + IA)
│   ├── schema_additions.sql                # Additions au schéma
│   ├── ai_procedures_snapshot_drift.sql    # Procédures IA (snapshot, drift)
│   ├── STRUCTURE.md                        # Documentation des tables
│   └── README.md
│
├── docs/                                   # 📖 Documentation
│   ├── ARCHITECTURE.md                     # Architecture générale
│   ├── API.md                              # Documentation API
│   ├── DEPLOYMENT.md                       # Guide de déploiement
│   ├── CONTRIBUTING.md                     # Guide de contribution
│   └── README.md
│
├── .env.example                            # Exemple de variables d'environnement
├── .gitignore
├── README.md                               # README principal
└── STRUCTURE.md                            # Ce fichier

```

## Architecture Générale

### 🏗️ Couches

1. **Frontend (React + TypeScript)**
   - Interfaces utilisateur (dashboards, formulaires, rapports)
   - Gestion d'état local avec Context API
   - Intégration avec l'API backend

2. **Backend IA (PyTorch + FastAPI)**
   - Service indépendant de prédiction
   - Modèle multitâche (risque, liquidité, rentabilité, solvabilité, etc.)
   - Entraînement et évaluation des modèles

3. **Database (PostgreSQL)**
   - Tables ERP (entreprises, factures, clients, fournisseurs, etc.)
   - Tables financières (revenus, dépenses, bilan, etc.)
   - Tables IA (modèles, prédictions, features, drift monitoring)
   - Procédures stockées pour calculs complexes

### 🔄 Flux de Données

```
Frontend (React) 
  ↓
API Backend (FastAPI)
  ↓
Services (PredictionService, TrainingService)
  ↓
PyTorch Model
  ↓
Database (PostgreSQL)
  ↑
Features & Data
```

## Installation & Démarrage

### Prérequis
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### 1. Cloner le projet
```bash
git clone <repository>
cd Dinarlytics
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

### 3. Base de données
```bash
createdb dinarlytics
psql dinarlytics < database/schema_complete.sql
psql dinarlytics < database/ai_procedures_snapshot_drift.sql
```

### 4. Backend IA
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend sera accessible à `http://localhost:5173`  
Backend sera accessible à `http://localhost:8000`

## Endpoints API Principaux

### Health Check
```
GET /health
```

### Prédiction Financière
```
POST /predict
{
  "model_name": "erp_multitask_v1",
  "features": {...},
  "company_id": 123
}
```

Retourne: prédictions, analyse financière détaillée, suggestions priorisées, risk level, health score

### Entraînement du Modèle
```
POST /train
{
  "model_name": "erp_multitask_v1",
  "train_data": [...],
  "epochs": 20,
  "learning_rate": 1e-3
}
```

Retourne: métriques d'entraînement, loss history, convergence status

## Modules Principaux

### Frontend

#### Pages Principales
- **Dashboard** : Vue d'ensemble financière et opérationnelle
- **Analyse Financière** : Rapports détaillés, KPI, ratios
- **Analyses IA** : Prédictions et recommandations du modèle
- **Chatbot IA** : Interface conversationnelle pour questions métier
- **Budget** : Gestion et suivi budgétaire
- **Factures** : Gestion des factures de vente/achat
- **Clients/Fournisseurs** : Carnet d'adresses
- **Inventaire** : Gestion des stocks
- **Fiscalité** : Déclarations et conformité
- **Gestion d'Accès** : RBAC et permissions
- **Configuration** : Paramètres avancés

#### Composants Clés
- **AI** : Chatbot, prédictions, visualisations IA
- **Analytics** : Dashboards, graphiques, rapports
- **Dashboard** : Widget principaux, cartes, KPI
- **Layout** : Navigation, sidebar, navbar
- **Security** : Authentification, contrôle d'accès

### Backend IA

#### Services
- **PredictionService** : Prédictions + analyse financière + suggestions
- **TrainingService** : Entraînement multitâche avec early stopping
- **DatabaseManager** : Requêtes PostgreSQL optimisées

#### Modèle
- **ERPModel** : Multitâche (risque, liquidité, rentabilité, solvabilité, anomalies, suggestions)
- **ERPFeatureEncoder** : Encodeur de features tabulaires
- **MultiTaskHead** : Têtes spécialisées par tâche

### Database

#### Tables ERP
- `companies` : Entreprises
- `invoices`, `payments` : Factures et paiements
- `clients`, `suppliers` : Clients et fournisseurs
- `articles` : Catalogue produits
- `budgets`, `budget_lines` : Budgets
- `bank_accounts`, `bank_reconciliations` : Trésorerie

#### Tables Financières
- `financial_statements` : Bilans et comptes de résultat
- `expenses`, `expenses_payments` : Dépenses
- `inventory_movements`, `inventory_snapshot` : Stocks

#### Tables IA
- `ai_models` : Modèles disponibles
- `ai_predictions` : Historique prédictions
- `ai_training_logs` : Logs entraînement
- `ai_feature_store` : Features versionnées
- `ai_drift_monitoring` : Monitoring du drift

#### Procédures Stockées
- `snapshot_features()` : Capture versionnée des features
- `calculer_drift()` : Détection du drift
- `snapshot_all_features()` : Snapshot bulk

## Sécurité

- **Authentification** : JWT tokens (à implémenter)
- **RBAC** : Rôles et permissions dans la DB
- **Validation** : Pydantic (backend), TypeScript (frontend)
- **Chiffrement** : TLS/HTTPS en production
- **Rate Limiting** : À ajouter

## Performance

- **Frontend** : Vite pour bundling rapide, React.lazy pour code splitting
- **Backend** : Async ready (actuellement sync, migratable vers asyncpg)
- **Database** : Indexes sur clés de recherche, procédures pour calculs complexes
- **Caching** : À ajouter (Redis)

## Monitoring & Logging

- **Frontend** : Logging dans console dev
- **Backend** : Logging Python avec `logging` module
- **Database** : Query logs, slow query detection
- **IA** : Drift monitoring, model versioning

## Prochaines Étapes

### Phase 1 (MVP)
- ✅ Architecture complète
- Tests unitaires
- Documentation API

### Phase 2 (Production Lite)
- Feature extractor automatique
- Model versioning
- API security (JWT)

### Phase 3 (Robustesse)
- Redis cache
- Async DB
- Advanced monitoring

### Phase 4 (Scaling)
- Multi-region deployment
- Advanced A/B testing
- Real-time streaming

## Contribuer

Voir [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## License

Propriétaire - Voir [PROPRIETE_INTELLECTUELLE.md](docs/PROPRIETE_INTELLECTUELLE.md)

---

**Plateforme ERP/IA complète, production-ready, modulaire et extensible.**
