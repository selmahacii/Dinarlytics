# Redesign Détaillé : Hiérarchie Entreprise, Droits d'Accès & KPI IA

## 1. Hiérarchie des Entreprises & Partitionnement

Nous définissons 3 niveaux d'entreprises avec des besoins et des complexités croissants. Chaque niveau hérite des capacités du précédent mais ajoute des couches de contrôle et d'analyse.

### **Niveau 1 : Micro-Entreprise / EURL (Indépendant)**
*   **Objectif** : Simplicité, Trésorerie, Facturation rapide.
*   **Structure** : 
    *   **Gérant (Propriétaire)** : Accès TOTAL. Doit voir sa trésorerie en temps réel et facturer.
    *   **Comptable Externe** (Invité) : Accès limité aux exports et journaux.
*   **Partitionnement** : Données isolées, mono-utilisateur (ou presque).

### **Niveau 2 : PME / SARL (Équipe structurée)**
*   **Objectif** : Gestion, Rentabilité, Collaboration.
*   **Structure** :
    *   **Gérant** : Pilotage global, Validation stratégique.
    *   **Commercial** : Gestion Clients, Devis, Commandes. (Vue limitée à ses clients ou équipe).
    *   **Comptable** : Saisie, Déclarations, Paie simple.
    *   **Responsable Stock** : Entrées/Sorties, Inventaire.
*   **Partitionnement** : 
    *   Le **Commercial** ne voit pas la Trésorerie globale ni les Salaires.
    *   Le **Comptable** ne modifie pas les Devis validés.

### **Niveau 3 : Grande Entreprise / SPA (Groupe, Audit, Décisionnel)**
*   **Objectif** : Contrôle interne, Audit, Prévisionnel, Consolidation.
*   **Structure** :
    *   **Direction Générale (DG)** : Tableaux de bord stratégiques, KPI IA.
    *   **DAF (Dir. Admin & Financier)** : Supervision comptable, Trésorerie complexe, Relations banques.
    *   **Contrôleur de Gestion** : Analytique, Budgets, Écarts.
    *   **Auditeur Interne** : Vérification conformité (Accès "Read-Only" transversale).
    *   **RH** : Paie complexe, Carrières.
*   **Partitionnement Strict** : Séparation des tâches (Segregation of Duties). Celui qui initie une dépense ne peut pas la payer.

---

## 2. Matrice des Droits & Modules (Détails par Acteur)

| Acteur / Rôle | Type Ent. | Modules Accessibles | Droits Spécifiques | Indicateurs Clés (Visibles) |
| :--- | :---: | :--- | :--- | :--- |
| **Gérant (EURL)** | EURL | Facturation, Banque, Dash. Simple | Tout faire (Créer, valider, payer) | Solde Banque, CA Mois, Impôts à payer |
| **Commercial** | SARL/SPA | CRM, Ventes, Catalogue | Créer Devis, Voir Stock (Lecture) | CA Personnel, Commissions, Pipeline |
| **Comptable** | Ttes | Compta, Fiscalité, Paie | Saisir Écritures, Lettrage, Déclarations | BFR, Balance Âgée, État TVA |
| **Resp. Stock** | SARL/SPA | Achats, Stock, Fournisseurs | Bon de Réception, Inventaire | Rotation Stock, Ruptures, Valeur Stock |
| **DAF** | SPA | Finance, Trésorerie, RH, Budgets | Valider Paiements > Seuil, Clôture | EBITDA, Cash Burn Rate, Dette |
| **Auditeur** | SPA | Audit, Logs, Compta (Lecture) | Lecture Seule (Tout), Export Preuves | Anomalies Détectées, Risques Fraude |
| **Admin IT** | Ttes | Paramètres, Utilisateurs, Sécurité | Créer comptes, Réinitialiser MDP | Logs Connexion, Performance Système |

---

## 3. Indicateurs de Performance IA (KPI Efficacité Prédictive)

L'IA ne doit pas être une "boîte noire". Nous devons mesurer son efficacité pour justifier son utilisation aux décideurs.

### **A. KPI de Précision (Accuracy)**
1.  **Fiabilité Prévision Trésorerie** : Écart entre le *Cash Flow Prédit* (à M-1) et le *Cash Flow Réel*.
    *   *Formule* : `1 - (|Réel - Prédit| / Réel)`
    *   *Cible* : > 90%
2.  **Taux de Succès Recouvrement** : Pourcentage de créances recouvrées suite aux *Actions Suggérées* par l'IA (ex: Relance automatique le mardi matin).

### **B. KPI d'Impact (Value)**
3.  **Économies Générées** : Somme des économies réalisées grâce à la détection d'anomalies (ex: Double paiement évité, Pénalité de retard évitée).
    *   *Affichage* : "L'IA vous a fait économiser 1.2M DA ce mois-ci."
4.  **Temps Gagné (Productivité)** : Estimation du temps humain économisé par l'automatisation (Saisie OCR, Lettrage auto).
    *   *Exemple* : "120 heures de saisie économisées en 2024."

### **C. KPI de Risque (Security)**
5.  **Score de Conformité Fiscale** : Probabilité que les écritures soient conformes aux règles fiscales (basé sur l'historique et les règles métier).
6.  **Détection Anomalies (Anomaly Score)** : Nombre d'écritures "suspectes" flaguées par rapport au volume total.

---

## 4. Implémentation Technique

*   **Frontend** : `PermissionManager` doit intégrer ces règles de partitionnement (ex: `canViewEmployeeSalaries` est faux pour un Manager simple).
*   **Backend** : Les endpoints de l'API doivent filtrer les données (Row Level Security) selon l'`enterprise_id` et le `department_id` de l'utilisateur.
