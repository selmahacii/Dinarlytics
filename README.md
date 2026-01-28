# Dinarlytics v1.1.0 🚀

**Plateforme ERP Intelligente & Analyse Financière Prédictive (Conformité Algérienne SCF)**

Dinarlytics transforme la gestion financière classique en un système décisionnel proactif grâce à l'incorporation de modèles PyTorch multitâches et une interface épurée inspirée d'ERPNext.

---

## 🛠️ Architecture & Stack Logicielle

- **Backend** : FastAPI (Python) - Haute performance, typage strict, architecture modulaire.
- **Frontend** : React 18 + TypeScript + Vite - Expérience fluide avec design system "Desk" (Inter font, minimalist UI).
- **IA** : PyTorch - Modèle propriétaire pour le scoring de risque, prévisions de cash-flow et détection d'anomalies.
- **Base de Données** : PostgreSQL 15 - Schéma unifié et optimisé pour le Big Data financier.
- **Queue de Tâches** : Celery + Redis - Traitement asynchrone des entraînements IA.

---

## ✨ Points Forts & UX

- **Intelligence Artificielle LIA** : Chatbot expert capable d'analyser vos états financiers en langage naturel.
- **Lutte contre le Overfitting** : Modèles IA stabilisés par BatchNorm et Dropout agressif pour une précision accrue.
- **Fiscalité DZ Native** : Génération et impression automatique des déclarations G50, IBS, TAP, et IRG.
- **Expérience Utilisateur** : Chargement fluide avec Skeleton Screens, menus hiérarchisés et design pro-comptable.
- **Sécurité RBAC** : Gestion fine des accès (Directeur, Comptable Senior, Analyste, Utilisateur).

---

## 🚀 Installation Rapide (Docker)

La plateforme est entièrement dockerisée pour un déploiement en une seule commande.

```bash
# 1. Cloner et entrer dans le dossier
git clone <url-repo>
cd Dinarlytics

# 2. Lancer toute l'infrastructure
docker-compose up --build
```

- **Dashboard** : [http://localhost:5173](http://localhost:5173)
- **API (Swagger)** : [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Structure du Code Nettoyée

```text
Dinarlytics/
├── backend/            # API FastAPI & Services IA
│   ├── app/
│   │   ├── models/     # Modèles SQLAlchemy (Splittés)
│   │   ├── services/   # Logique métier & Chatbot
│   │   └── tasks/      # Tâches Celery (Background)
├── frontend/           # Interface React TS
│   ├── src/
│   │   ├── components/ # Composants UI (Skeleton, Modal, etc.)
│   │   └── pages/      # Pages modulaires (LIA, Accounting, Sales)
├── database/           # Schéma SQL Unified & Migrations
└── docker-compose.yml  # Orchestration Full-Stack
```

---

## 📊 Roadmap

- [x] Unification du schéma de données SQL.
- [x] Modularisation de l'IA (Celery workers).
- [x] Design System "Professional Desk" (CSS).
- [ ] OCR Intelligent pour saisie de factures (Phase 2).
- [ ] Intégration bancaire automatisée (Phase 3).

---
**Dinarlytics** | Par Selma & l'équipe AI Expert.
*Propriétaire - Tous droits réservés.*
