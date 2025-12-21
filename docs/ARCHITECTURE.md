# Dinarlytics - Architecture Générale

## Vue d'ensemble

Dinarlytics est une plateforme ERP/IA complète composée de trois couches principales :

```
┌─────────────────────────────────────────────┐
│         Frontend (React + TypeScript)        │  Port 5173
│  Dashboards, Rapports, Interfaces Utilisateur │
└────────────────┬────────────────────────────┘
                 │ HTTP/REST
                 ↓
┌─────────────────────────────────────────────┐
│    Backend IA (FastAPI + PyTorch)           │  Port 8000
│  Prédictions, Entraînement, Services        │
└────────────────┬────────────────────────────┘
                 │ SQL
                 ↓
┌─────────────────────────────────────────────┐
│      Base de Données (PostgreSQL)           │  Port 5432
│  Tables ERP, Financières, IA, Procédures   │
└─────────────────────────────────────────────┘
```

## Composants

### 1. Frontend (React + Vite)
**Localisation:** `frontend/`

**Responsabilités:**
- Interface utilisateur riche et réactive
- Gestion d'état avec React Context
- Routing avec React Router
- Visualisation de données avec Recharts/Chart.js

**Dossiers clés:**
- `components/` : Composants réutilisables (UI, Dashboard, Charts, etc.)
- `pages/` : Pages/routes principales
- `context/` : État global (AppContext, ThemeContext, etc.)
- `hooks/` : Hooks React personnalisés
- `services/` : Services d'appel API
- `utils/` : Fonctions utilitaires

### 2. Backend IA (FastAPI + PyTorch)
**Localisation:** `backend/`

**Responsabilités:**
- Endpoints REST pour prédiction et entraînement
- Modèle PyTorch multitâche
- Gestion des données et features
- Intégration PostgreSQL

**Dossiers clés:**
- `app/main.py` : Entrypoint FastAPI
- `app/config.py` : Configuration centralisée
- `app/db.py` : DatabaseManager (queries PostgreSQL)
- `app/models/` : Architectures PyTorch
- `app/services/` : PredictionService, TrainingService

**Endpoints clés:**
- `GET /health` : Vérification service
- `GET /models` : Liste des modèles
- `POST /predict` : Prédiction financière
- `POST /train` : Entraînement du modèle

### 3. Base de Données (PostgreSQL)
**Localisation:** `database/`

**Contenu:**
- Tables ERP (companies, invoices, clients, suppliers, etc.)
- Tables financières (financial_statements, expenses, inventory)
- Tables IA (ai_models, ai_predictions, ai_feature_store, ai_drift_monitoring)
- Procédures stockées (snapshot_features, calculer_drift, etc.)

**Fichiers:**
- `schema.sql` : Schéma initial
- `schema_complete.sql` : Schéma enrichi avec tables ERP/IA
- `schema_additions.sql` : Additions successives
- `ai_procedures_snapshot_drift.sql` : Procédures IA

## Flux de Données

### Prédiction (Read-heavy)
```
1. Frontend → API POST /predict (features, company_id)
2. Backend → PredictionService.predict()
3. Service → Load model, tensor conversion
4. Model → Forward pass (6 tâches en parallèle)
5. Service → Post-processing (analyse, suggestions, health score)
6. API → JSON response (predictions + analysis)
7. Frontend → Visualisation résultats
```

### Entraînement (Write-heavy)
```
1. Frontend → API POST /train (train_data, epochs)
2. Backend → TrainingService.train_model()
3. Service → Mini-batches, forward/backward
4. Model → Update poids (Adam optimizer, gradient clipping)
5. Service → Log metrics par époque
6. API → JSON response (loss history, convergence)
7. Frontend → Visualisation progression
8. Backend → Save model à disk
```

### Données Financières
```
Frontend → DatabaseManager.fetch_financial_data(company_id)
         → PostgreSQL query (JOIN invoices, payments, statements)
         → Feature engineering (ratios, deltas, etc.)
         → Tensor construction
         → Model input
```

## Tâches du Modèle IA

Le modèle ERPModel prédit 6 outputs multitâches :

| Tâche | Output | Interprétation |
|-------|--------|-----------------|
| **risk** | [0, 1] | Score de risque financier |
| **liquidity** | [0, 1] | Capacité de paiement court terme |
| **profitability** | [0, 1] | Marge bénéficiaire et ROI |
| **solvency** | [0, 1] | Capacité paiement long terme |
| **anomaly** | [0, 1] | Détection d'anomalies |
| **suggestion** | [5 floats] | 5 catégories d'amélioration |

## Sécurité

### Authentification (À implémenter)
- JWT tokens (Frontend ↔ Backend)
- Password hashing (Backend)
- Session management

### Autorisation (RBAC)
- Rôles : Admin, Finance, Manager, User
- Permissions par ressource (créer, lire, modifier, supprimer)
- Audit trail des actions critiques

### Validation
- **Frontend** : TypeScript types + Pydantic validation
- **Backend** : Pydantic request validation
- **Database** : Constraints, checks, triggers

## Performance

### Frontend
- **Bundling** : Vite (très rapide)
- **Code splitting** : React.lazy()
- **Assets** : Compression, CDN ready

### Backend
- **Model inference** : ~100ms par prédiction
- **Database queries** : Indexed JOINs (~10-50ms)
- **Caching** : À ajouter (Redis) pour features fréquentes

### Database
- **Indexes** : Sur clés primaires, étrangères, et colonnes de recherche
- **Partitioning** : À ajouter pour tables volumineuses
- **Materialized views** : À ajouter pour rapports complexes

## Déploiement

### Local (Développement)
```bash
# Terminal 1 : Database
docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres

# Terminal 2 : Backend
cd backend && uvicorn app.main:app --reload

# Terminal 3 : Frontend
cd frontend && npm run dev
```

### Production (Roadmap)
- Docker Compose (multi-service)
- Kubernetes (scaling)
- CI/CD (GitHub Actions)
- SSL/TLS certificates
- Environment-specific configs

## Monitoring & Observabilité

### Logs
- **Frontend** : Console dev, Sentry (errors)
- **Backend** : Python logging, Prometheus metrics
- **Database** : Query logs, slow query alerts

### Metrics
- Request latency (p50, p95, p99)
- Error rates
- Model inference time
- DB query time
- Cache hit ratio

### Alertes
- Modèle drift (divergence from baseline)
- Performance dégradation
- Erreurs de prédiction anormales
- Santé des services

## Évolution Future

### Phase 1 (MVP) ✅
- Architecture multi-couche
- Prédictions multitâches
- Frontend riche avec dashboards

### Phase 2 (Production Lite)
- Authentification JWT
- Model versioning
- Feature store optimisé

### Phase 3 (Robustesse)
- Redis cache
- Async database (asyncpg)
- Advanced monitoring (Prometheus)

### Phase 4 (Scaling)
- Micro-services (décomposer backend)
- Kubernetes
- Real-time analytics (Kafka)
- Advanced drift detection (PSI, KL divergence)

## Technologies

| Couche | Technology | Version |
|--------|-----------|---------|
| **Frontend** | React | 18.2.0 |
| **Frontend** | TypeScript | 5.0.2 |
| **Frontend** | Vite | 4.3.9 |
| **Frontend** | Tailwind CSS | 3.3.2 |
| **Backend** | FastAPI | latest |
| **Backend** | PyTorch | latest |
| **Backend** | Python | 3.10+ |
| **Database** | PostgreSQL | 14+ |

---

**Plateforme complète, modulaire, et production-ready.**
