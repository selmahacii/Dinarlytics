# Dinarlytics - README Principal

**Plateforme ERP/IA intégrée pour analyse financière prédictive et automatisation d'entreprise.**

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Git

### Installation (5 minutes)

```bash
# 1. Cloner le projet
git clone <repository>
cd Dinarlytics

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Base de données
createdb dinarlytics
psql dinarlytics < database/schema_complete.sql
psql dinarlytics < database/ai_procedures_snapshot_drift.sql

# 4. Backend (Terminal 1)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:8000  
**Backend Docs:** http://localhost:8000/docs

---

## 📁 Structure du Projet

```
Dinarlytics/
├── backend/                # Service IA (FastAPI + PyTorch)
├── frontend/               # Interface utilisateur (React + TypeScript)
├── database/               # Schémas PostgreSQL
├── docs/                   # Documentation
├── README.md               # Ce fichier
└── STRUCTURE.md            # Structure détaillée
```

Voir [STRUCTURE.md](STRUCTURE.md) pour la structure complète.

---

## ✨ Fonctionnalités Principales

### 🎯 Prédictions Financières
- **Analyse de risque** : Évaluation instantanée du risque financier
- **Liquidité** : Capacité de paiement à court/long terme
- **Rentabilité** : Marge bénéficiaire et ROI
- **Solvabilité** : Capacité à servir la dette
- **Détection d'anomalies** : Identification de données inhabituelles
- **Suggestions priorisées** : Recommandations d'amélioration actionnables

### 📊 Dashboards & Rapports
- Dashboard financier en temps réel
- Analyses multidimensionnelles
- Rapports personnalisables
- Export données (PDF, Excel)
- Visualisations avancées (graphiques, heatmaps)

### 💼 Gestion ERP Complète
- **Facturation** : Factures de vente/achat
- **Clients/Fournisseurs** : Gestion des partenaires
- **Budgets** : Planification et suivi budgétaire
- **Inventaire** : Gestion des stocks et mouvements
- **Trésorerie** : Suivi des flux de cash
- **Fiscalité** : Déclarations et conformité
- **Audit** : Traçabilité des opérations

### 🤖 Intelligence Artificielle
- Modèle PyTorch multitâche
- Entraînement continu
- Monitoring de drift
- Feature store versionnée
- Analyse prédictive avancée

### 🔐 Sécurité & Conformité
- Authentification et autorisation (RBAC)
- Chiffrement des données sensibles
- Audit trail complet
- RGPD compliant
- Conformité fiscale locale

---

## 🏗️ Architecture

### Couches
1. **Frontend** : React + TypeScript + Tailwind CSS
2. **Backend** : FastAPI + PyTorch + SQLAlchemy
3. **Database** : PostgreSQL avec 50+ tables + procédures

### Modèle IA
- **Architecture** : Encoder multitâche + 6 heads de sortie
- **Données d'entrée** : 20 features financières tabulaires
- **Sortie** : Prédictions multitâches + analyse enrichie + suggestions
- **Entraînement** : SGD multi-tâche avec early stopping

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [STRUCTURE.md](STRUCTURE.md) | Structure complète du projet |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture générale |
| [API.md](docs/API.md) | Documentation API complète |
| [Backend README](backend/README.md) | Guide backend IA |
| [Frontend README](frontend/README.md) | Guide frontend React |

---

## 🚀 Déploiement

### Local (Développement)
```bash
# Voir section Démarrage Rapide
```

### Docker Compose (À venir)
```bash
docker-compose up
```

### Kubernetes (À venir)
```bash
kubectl apply -f k8s/
```

### Production
Voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📊 API Endpoints Principaux

### Prédictions
```bash
POST /predict
{
  "model_name": "erp_multitask_v1",
  "features": {...},
  "company_id": 123
}
```

### Entraînement
```bash
POST /train
{
  "model_name": "erp_multitask_v1",
  "train_data": [...],
  "epochs": 20
}
```

Voir [docs/API.md](docs/API.md) pour tous les endpoints.

---

## 🛠️ Technologies

| Aspect | Technology |
|--------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | FastAPI, PyTorch, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL 14+ |
| **DevTools** | Docker, Git, npm, pip |

---

## 📈 Roadmap

### Phase 1 (MVP) ✅
- Architecture multi-couche
- Prédictions multitâches
- Dashboards principaux
- DB schéma complet

### Phase 2 (Production Lite)
- JWT authentication
- Model versioning
- Feature store optimisé
- Basic monitoring

### Phase 3 (Robustesse)
- Redis cache
- Async database
- Advanced monitoring (Prometheus)
- API security (rate limiting)

### Phase 4 (Scaling)
- Microservices
- Kubernetes
- Real-time analytics
- Advanced drift detection

---

## 👥 Contribution

### Signaler un bug
1. Ouvrir une issue avec description détaillée
2. Inclure steps to reproduce
3. Attacher logs/screenshots

### Proposer une feature
1. Discuter l'idée en issue/discussion
2. Forker le repo
3. Créer une branch `feature/xyz`
4. Commiter et proposer une PR

Voir [CONTRIBUTING.md](docs/CONTRIBUTING.md) pour les détails.

---

## 📝 License

**Propriétaire**. Voir [PROPRIETE_INTELLECTUELLE.md](PROPRIETE_INTELLECTUELLE.md)

---

## 📞 Support

- 📧 Email: support@dinarlytics.com
- 💬 Discussions: GitHub Issues
- 📖 Docs: https://dinarlytics.io/docs

---

## ⭐ Merci !

Si vous trouvez ce projet utile, n'hésitez pas à l'étoiler ⭐

---

**Dinarlytics v1.0.0** | Production Ready | MIT License  
Construit avec ❤️ pour les CFO et financiers modernes.
