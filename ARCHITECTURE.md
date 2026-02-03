# Dinarlytics - Architecture Robuste

L'architecture a été restructurée pour assurer une scalabilité maximale et une séparation claire des responsabilités.

## Backend (FastAPI - Modular Monolith)

- **`app/core/`**: Infrastructure partagée (Config, DB, Securité, Permissions, Websockets, Modèles globaux).
- **`app/api/v1/`**: Point d'entrée des APIs, organisation par version.
- **`app/modules/`**: Cœur métier organisé par domaine fonctionnel.
  - `intelligence/` (LIA AI)
  - `finance/` (Comptabilité, Budgets)
  - `operations/` (Ventes, Achats, Stocks)
  - `auth/` (Utilisateurs, Rôles)
  - `system/` (Audit, Documents)

## Frontend (React - Feature-Based architecture)

- **`src/core/`**: Composants et logique transversale à l'application (Layout, Context, Auth).
- **`src/shared/`**: Composants UI réutilisables, hooks universels, utilitaires globaux.
- **`src/features/`**: Modules métier encapsulés.
  - Chaque feature contient ses propres `components/`, `pages/`, `services/`, `hooks/`, `utils/`.
  - Aliases disponibles : `@core`, `@shared`, `@features`.

## Recommandations
- Utilisez les ALIAS pour les imports : `import { ... } from '@features/finance/services/...'`.
- Gardez la logique métier dans les `services/` des modules correspondants.
