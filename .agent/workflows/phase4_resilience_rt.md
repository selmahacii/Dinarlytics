# Plan d'Implémentation - Phase 4 : Résilience et Temps Réel Avancé (RTX)

Ce plan vise à rendre Dinarlytics robuste face aux "situations exceptionnelles" (déconnexions, conflits de données) et à synchroniser l'ensemble des modules en temps réel.

## 1. Backend : Signal Hub & Broadcasting
- [ ] **Middleware de Signal** : Injecter le `ConnectionManager` dans les routers (Budgets, Factures, Comptabilité).
- [ ] **Broadcasting Automatique** : Chaque commit réussi sur une ressource critique doit émettre un signal WebSocket.
  - Exemple : `{"type": "BUDGET_UPDATED", "payload": {"id": "..."}}`
- [ ] **Router de Notifications IA** : Créer un flux dédié pour les alertes critiques (Dépassement budget imminent, risque de fraude).

## 2. Frontend : Couche de Résilience (Robustesse)
- [ ] **Hook `useRealTimeSync`** : Centraliser l'écoute du WebSocket et rafraîchir automatiquement les stores (ou déclencher des notifications).
- [ ] **Indicateur de Connectivité** : Afficher un badge "Live" ou "Reconnecte..." pour informer l'utilisateur de l'état réel de sa session.
- [ ] **Optimistic UI & Re-try Mechanism** : Implémenter des tentatives de reconnexion et de sauvegarde automatique pour les situations de micro-coupures.
- [ ] **Gestion des Conflits** : Avertir l'utilisateur si un document a été modifié par une autre source pendant son édition (Concurrency Control).

## 3. Gestion des Situations Exceptionnelles
- [ ] **Circuit Breaker UI** : Si le backend est lent ou en panne, l'interface doit passer en mode "Lecture Seule" gracieusement.
- [ ] **Journal de Santé Système** : Intégrer un dashboard d'audit technique (Temps de réponse, erreurs de sync, charge DB).
- [ ] **Vérification d'Intégrité en Temps Réel** : Un service IA qui vérifie la cohérence entre les écritures comptables et les documents (Factures) pour détecter les anomalies immédiatement.

## 4. Workflow Git (Correction Immédiate)
- [ ] Résoudre le conflit de push actuel via `git pull --rebase` pour aligner l'environnement local avec le distant.

---
Ce plan assure que Dinarlytics ne se contente pas d'afficher des données, mais qu'il réagit intelligemment aux changements et aux pannes.
