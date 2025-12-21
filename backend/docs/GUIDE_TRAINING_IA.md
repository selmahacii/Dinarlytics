# Guide d'entraînement d'un modèle IA sur Dinarlytics

Ce guide explique comment préparer, entraîner et déployer un modèle IA pour l'ERP Dinarlytics.

## 1. Préparation des données
- **Extraction** : Utilisez les endpoints API pour exporter les données comptables, documents, KPIs, etc.
- **Nettoyage** : Vérifiez la qualité, traitez les valeurs manquantes, supprimez les doublons.
- **Structuration** : Organisez les données en features (variables d'entrée) et targets (variables à prédire).
- **Exemples** :
  - Features : ratios financiers, historiques de factures, profils clients, etc.
  - Targets : risque, liquidité, rentabilité, anomalies, suggestions.

## 2. Pipeline d'entraînement
- **Script Python** : Utilisez `backend/app/services/training.py` comme base.
- **Modèle** : `ERPModel` (voir `backend/app/models/erp_model.py`).
- **Entraînement** :
  - Préparez vos données sous forme de liste de dictionnaires :
    ```python
    train_data = [
        {"features": {...}, "targets": {...}},
        ...
    ]
    ```
  - Appelez :
    ```python
    from app.services.training import TrainingService
    results = TrainingService.train_model(model, train_data, epochs=20, lr=1e-3)
    ```
- **Évaluation** :
  - Utilisez `TrainingService.evaluate_model(model, test_data)` pour mesurer la performance.

## 3. Sauvegarde et déploiement
- **Sauvegarde** :
  - `torch.save(model.state_dict(), 'chemin/model.pth')`
- **Chargement** :
  - Voir `PredictionService.get_model()` dans `prediction.py`.
- **Déploiement** :
  - Le modèle est utilisé via les endpoints de prédiction (à créer ou étendre).

## 4. Conseils pratiques
- **Validation croisée** : Séparez vos données en train/test/validation.
- **Early stopping** : Surveillez la convergence pour éviter l'overfitting.
- **Logs & audit** : Utilisez les endpoints d'audit pour tracer les entraînements et prédictions.
- **Sécurité** : Protégez l'accès aux données sensibles.

## 5. Aller plus loin
- **Personnalisation** : Modifiez `ERPModel` pour ajouter des tâches ou des features spécifiques.
- **AutoML** : Intégrez des outils comme Optuna pour optimiser les hyperparamètres.
- **Monitoring** : Ajoutez des dashboards pour suivre la performance du modèle en production.

---
Pour toute question, consultez les fichiers `training.py`, `prediction.py`, et la documentation FastAPI intégrée.
