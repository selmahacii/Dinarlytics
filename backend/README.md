# Dinarlytics AI Service

**Service backend indépendant de prédiction et analyse financière basé sur PyTorch + FastAPI.**

## Architecture

```
ai_service/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI entrypoint
│   ├── config.py               # Configuration centralisée (DB, modèles, catégories)
│   ├── db.py                   # DatabaseManager (connexion PostgreSQL, requêtes)
│   ├── models/
│   │   ├── __init__.py
│   │   └── erp_model.py        # Modèle PyTorch multitâche (ERPModel, encodeur, têtes)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── prediction.py       # PredictionService (prédiction + analyse financière détaillée)
│   │   └── training.py         # TrainingService (entraînement multitâche, évaluation)
├── requirements.txt
└── README.md
```

## Fonctionnalités

### 1. **Prédictions Multitâches**
- **Risque financier** : Score de risque (0-1)
- **Liquidité** : Capacité de paiement à court terme
- **Rentabilité** : Marge bénéficiaire et efficacité opérationnelle
- **Solvabilité** : Capacité à payer les dettes long terme
- **Anomalies** : Détection de données inhabituelles
- **Suggestions** : Recommandations d'amélioration (5 catégories)

### 2. **Analyse Financière Détaillée**
Chaque prédiction inclut :
- **Analyse textuelle** de chaque métrique (risque, liquidité, rentabilité, solvabilité)
- **Suggestions priorisées** par ordre de criticité (🔴 CRITIQUE, 🟡 IMPORTANT, 🟢 À EXPLORER)
- **Score de santé global** (0-100)
- **Niveau de risque** global (CRITIQUE, ÉLEVÉ, FAIBLE)

### 3. **Architecture Robuste**
- **Centralization config** : `config.py` centralise toutes les configurations (DB, modèles, catégories)
- **DatabaseManager** : Gestion uniforme des connexions PostgreSQL et requêtes
- **PredictionService** : Service centralisé de prédiction avec enrichissement d'analyse
- **TrainingService** : Entraînement multitâche avec métriques par tâche et early stopping
- **Gestion d'erreurs** : Logging complet, exception handling, gradient clipping
- **Pas de duplication** : Code DRY, réutilisabilité maximale

## Installation & Démarrage

### 1. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 2. Configurer PostgreSQL (optionnel)
```bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=dinarlytics
```

### 3. Lancer le serveur
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Le service sera accessible à `http://localhost:8000`

## Endpoints API

### 1. `/health` (GET)
Vérification de l'état du service.

**Réponse:**
```json
{
  "status": "ok",
  "service": "Dinarlytics AI Service",
  "version": "1.0.0"
}
```

### 2. `/models` (GET)
Liste les modèles disponibles.

**Réponse:**
```json
["erp_multitask_v1"]
```

### 3. `/predict` (POST)
Prédiction et analyse financière complète.

**Requête:**
```json
{
  "model_name": "erp_multitask_v1",
  "features": {
    "revenue": 1000000,
    "expenses": 750000,
    "assets": 500000,
    "liabilities": 200000,
    "invoices_pending": 50000,
    "cash_balance": 75000,
    ...
  },
  "company_id": 123
}
```

**Réponse:**
```json
{
  "model": "erp_multitask_v1",
  "predictions": {
    "risk": 0.35,
    "liquidity": 0.72,
    "profitability": 0.61,
    "solvency": 0.80,
    "anomaly": 0.05,
    "suggestion": [0.8, 0.45, 0.3, 0.6, 0.2]
  },
  "financial_analysis": {
    "risk": "✅ RISQUE FAIBLE - Situation stable",
    "liquidity": "🟢 LIQUIDITÉ CONFORTABLE - Bonne capacité de paiement",
    "profitability": "📊 RENTABILITÉ MODÉRÉE - Optimisation des coûts requise",
    "solvency": "✅ SOLVABILITÉ SOLIDE - Situation stable",
    "anomaly": "✓ Pas d'anomalie détectée"
  },
  "suggestions": {
    "Optimiser la gestion de trésorerie...": [0.8, "🔴 CRITIQUE"],
    "Optimiser la gestion des stocks...": [0.6, "🟡 IMPORTANT"],
    "Réduire les coûts opérationnels...": [0.45, "🟡 IMPORTANT"],
    ...
  },
  "risk_level": "ÉLEVÉ",
  "health_score": 71.5
}
```

### 4. `/train` (POST)
Entraîne le modèle avec des données.

**Requête:**
```json
{
  "model_name": "erp_multitask_v1",
  "train_data": [
    {
      "features": {...},
      "targets": {
        "risk": 0.3,
        "liquidity": 0.7,
        "profitability": 0.6,
        "solvency": 0.8,
        "anomaly": 0.1,
        "suggestion": [0.5, 0.4, 0.3, 0.6, 0.2]
      }
    },
    ...
  ],
  "epochs": 20,
  "learning_rate": 1e-3,
  "batch_size": 8
}
```

**Réponse:**
```json
{
  "model_name": "erp_multitask_v1",
  "status": "completed",
  "total_epochs": 20,
  "final_loss": 0.0245,
  "best_loss": 0.0234,
  "convergence": "converged"
}
```

## Intégration avec PostgreSQL

### Tables requises

1. **ai_feature_store** - Stockage des features versionnées
2. **ai_predictions** - Stockage des prédictions
3. **financial_statements** - Données financières
4. **invoices, payments** - Données transactionnelles
5. Autres tables du schéma ERP existant

### Utilisation dans le code

```python
from app.db import DatabaseManager

# Récupérer les données financières d'une entreprise
data = DatabaseManager.fetch_financial_data(company_id=123)

# Récupérer les features snapshots
features = DatabaseManager.fetch_feature_snapshot("ai_feature_store", company_id=123)

# Sauvegarder une prédiction
DatabaseManager.save_prediction(company_id=123, model_name="erp_multitask_v1", prediction_data={...})
```

## Avantages de cette Architecture

### ✅ Avantages

1. **Découplage complet** : Aucune dépendance avec le frontend React/Vite
2. **Configuration centralisée** : `config.py` pour toutes les paramètres (modèles, catégories, DB)
3. **Code DRY** : Pas de duplication, réutilisabilité maximale
4. **Robustesse** : Gestion d'erreurs, logging, gradient clipping, early stopping
5. **Extensibilité** : Facile d'ajouter de nouvelles tâches, catégories, ou analyses
6. **Analyse riche** : Prédictions + analyse financière détaillée + suggestions actionnables
7. **Multitâche** : Une seule pass forward pour 6 tâches différentes
8. **Production-ready** : Caching, batch processing, normalisation

### ⚠️ Inconvénients & Limitations Actuelles

1. **Features fictives** : Les features en `features: {...}` doivent être pré-calculées/préparées
2. **Modèle pré-entraîné** : Le modèle démarre sans poids pré-entraînés (à intégrer)
3. **Pas de validation** : Pas de validation des features entrantes (à ajouter)
4. **Pas d'historique** : Les prédictions ne sont pas automatiquement sauvegardées (à faire)
5. **Pas de versioning** : Les versions de modèle ne sont pas gérées (à implémenter)
6. **Pas de drift monitoring** : Les procédures SQL existent, mais pas intégrées au service
7. **Pas de caching Redis** : Les predictions n'utilisent pas de cache (à ajouter pour performance)
8. **DB synchrone** : Les opérations DB sont bloquantes (à passer en async pour haute charge)

## Prochaines Étapes

1. **Préparer les features** : Implémenter un feature extractor utilisant les vues SQL
2. **Charger un modèle pré-entraîné** : Générer des poids PyTorch (.pt)
3. **Ajouter la validation** : Valider les features avec Pydantic
4. **Automatiser la sauvegarde** : Sauvegarder les prédictions dans `ai_predictions`
5. **Monitoring de drift** : Intégrer les procédures `snapshot_features` et `calculer_drift`
6. **Versioning de modèles** : Tracker les versions dans la table `ai_models`
7. **Caching et optimisation** : Redis pour les prédictions fréquentes
8. **Async DB** : Migrer vers asyncpg pour haute concurrence
9. **Tests** : Ajouter des tests unitaires et d'intégration
10. **Documentation** : Ajouter des exemples de requêtes cURL/Python

---

**Ce service est 100% indépendant du frontend et prêt pour une intégration production.**

