# Dinarlytics Frontend

**Interface utilisateur React + TypeScript pour plateforme ERP/IA.**

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Lint & Type Check
npm run lint
```

Frontend sera accessible à `http://localhost:5173`

---

## 📁 Structure

```
src/
├── App.tsx                     # Composant racine
├── main.tsx                    # Entrypoint
├── index.css                   # Styles globaux
├── vite-env.d.ts              # Types Vite
├── Assets/                     # Images, icônes
├── components/                 # Composants réutilisables
│   ├── AI/                    # Chatbot, prédictions IA
│   ├── Analytics/             # Dashboards d'analyse
│   ├── Charts/                # Graphiques
│   ├── Dashboard/             # Widgets principaux
│   ├── Factures/              # Gestion factures
│   ├── Layout/                # Navigation, sidebar
│   ├── Metrics/               # KPI et métriques
│   ├── ReportEditor/          # Éditeur de rapports
│   ├── Security/              # Auth, permissions
│   ├── Theme/                 # Gestion thème
│   ├── Treasury/              # Trésorerie
│   ├── UI/                    # Composants génériques
│   ├── Filters/               # Filtrage de données
│   ├── Effects/               # Animations, transitions
│   ├── CompanyWizard.tsx      # Wizard configuration
│   └── ConditionalRenderer.tsx # Rendu conditionnel
├── context/                    # État global (Context API)
│   ├── AppContext.tsx         # État application
│   ├── ProductsContext.tsx    # État produits
│   └── ThemeContext.tsx       # État thème
├── pages/                      # Pages/routes
│   ├── Dashboard.tsx          # Tableau de bord
│   ├── AnalyseFinanciere.tsx  # Analyses financières
│   ├── AnalysesLIA.tsx        # Analyses IA
│   ├── Budget.tsx             # Gestion budgets
│   ├── ChatbotLIA.tsx         # Chatbot IA
│   ├── Clients.tsx            # Gestion clients
│   ├── FacturesVente.tsx      # Factures de vente
│   ├── Fournisseurs.tsx       # Gestion fournisseurs
│   ├── Inventaire.tsx         # Gestion stocks
│   ├── GestionAcces.tsx       # Gestion accès
│   ├── GestionEntreprise.tsx  # Config entreprise
│   ├── Fiscalite.tsx          # Déclarations fiscales
│   ├── Login.tsx              # Authentification
│   └── ... (autres pages)
├── hooks/                      # Hooks personnalisés
│   ├── useAccessPlan.ts       # Gestion plans d'accès
│   ├── useLIA.ts              # Intégration IA
│   ├── useLocalStorage.ts     # Persistence locale
│   ├── useNotification.ts     # Notifications toast
│   ├── usePermission.ts       # Vérification permissions
│   └── useTranslation.ts      # Localisation
├── services/                   # Services API
│   └── (appels backend, localStorage, etc.)
├── types/                      # Types TypeScript
├── utils/                      # Utilitaires
└── security/                   # Auth, RBAC, encryption
```

---

## 🎨 Components Principaux

### Layout
- **Navbar** : Navigation principale
- **Sidebar** : Menu latéral avec routes
- **Footer** : Pied de page
- **Layout** : Wrapper principal

### Dashboard
- **DashboardSelector** : Choix du dashboard
- **Dashboard** : Dashboard principal avec widgets
- **AnalyticsCard** : Card statistique
- **MetricChart** : Graphique métrique

### AI
- **ChatbotLIA** : Interface chatbot
- **PredictionViewer** : Visualisation prédictions
- **AnalysisPanel** : Panneau d'analyse IA

### Analytics
- **AnalyseFinanciere** : Rapports financiers
- **AnalysesLIA** : Rapports IA
- **Charts** : Graphiques Chart.js/Recharts

---

## 🔗 Intégration Backend

### Services API
```typescript
// src/services/api.ts
const API_BASE = 'http://localhost:8000';

export async function predictFinancial(features: Record<string, number>) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model_name: 'erp_multitask_v1',
      features,
      company_id: 123
    })
  });
  return response.json();
}
```

### Hook Personnalisé
```typescript
// src/hooks/useLIA.ts
import { useState, useEffect } from 'react';

export function usePrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async (features) => {
    setLoading(true);
    try {
      const result = await predictFinancial(features);
      setPrediction(result);
    } finally {
      setLoading(false);
    }
  };

  return { predict, prediction, loading };
}
```

### Utilisation dans Composant
```typescript
// src/components/AI/PredictionPanel.tsx
function PredictionPanel() {
  const { predict, prediction, loading } = usePrediction();

  return (
    <div>
      <button onClick={() => predict(mockFeatures)}>
        Prédire
      </button>
      {loading && <p>Chargement...</p>}
      {prediction && (
        <>
          <p>Health Score: {prediction.health_score}</p>
          <p>Risk Level: {prediction.risk_level}</p>
        </>
      )}
    </div>
  );
}
```

---

## 🎯 Pages Principales

### Dashboard
Vue d'ensemble avec KPI, graphiques, widgets interactifs.

### Analyses Financières
- Ratios financiers
- Tendances revenue/expenses
- Analyse de rentabilité
- Prévisions de cash flow

### Analyses IA
- Prédictions du modèle
- Suggestions d'amélioration
- Anomalies détectées
- Health score trend

### Gestion Factures
- Listing factures
- Création/modification
- Suivi paiements
- Relances automatiques

### Gestion Clients
- Fiche client
- Historique transactions
- Scoring risque
- Suivi contrats

---

## 🛠️ Développement

### Ajouter une Page
```typescript
// src/pages/NewPage.tsx
export default function NewPage() {
  return <div>Contenu page</div>;
}

// Ajouter la route dans App.tsx ou routing config
```

### Ajouter un Composant
```typescript
// src/components/Feature/MyComponent.tsx
export default function MyComponent({ prop1, prop2 }) {
  return <div>{prop1}</div>;
}
```

### Ajouter un Hook
```typescript
// src/hooks/useMyHook.ts
export function useMyHook(initialValue) {
  const [state, setState] = useState(initialValue);
  // ...
  return { state, setState };
}
```

---

## 🎨 Styling

### Tailwind CSS
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Contenu
</div>
```

### CSS Modules (optionnel)
```typescript
import styles from './Component.module.css';

export default function Component() {
  return <div className={styles.container}>Contenu</div>;
}
```

---

## 🔐 Authentification

### Login Flow
```typescript
// src/pages/Login.tsx
async function handleLogin(email, password) {
  const response = await fetch('http://localhost:8000/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const { token } = await response.json();
  localStorage.setItem('auth_token', token);
}
```

### Protected Routes
```typescript
// src/components/ProtectedRoute.tsx
function ProtectedRoute({ component: Component, requiredRole }) {
  const { user } = useContext(AppContext);
  
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }
  return <Component />;
}
```

---

## 📦 Dependencies

### Runtime
- `react` : Framework UI
- `react-dom` : DOM rendering
- `react-router-dom` : Routing
- `tailwindcss` : Styling
- `recharts` : Graphiques
- `chart.js` : Charts avancés
- `framer-motion` : Animations
- `lucide-react` : Icônes

### DevDependencies
- `typescript` : Type checking
- `vite` : Build tool
- `eslint` : Linting
- `@vitejs/plugin-react` : Vite plugin

---

## 🚀 Build & Deployment

### Build Production
```bash
npm run build
```

Génère `dist/` prêt pour deployment.

### Preview Local
```bash
npm run preview
```

### Deploy sur Vercel
```bash
vercel
```

### Deploy sur Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 📊 Performance

- **Code Splitting** : React.lazy() pour routes
- **Image Optimization** : Compression, lazy loading
- **Bundle Analysis** : `npm run build -- --analyze`
- **Metrics** : Lighthouse, Web Vitals

---

## 🔍 Debugging

### React DevTools
Extension Chrome pour debug React components.

### Vite Debug
```bash
npm run dev -- --debug
```

### API Requests
Utiliser `fetch` avec `console.log()` ou outils dev.

---

## ✅ Checklist Développement

- [ ] TypeScript compile sans erreurs
- [ ] Linting passe (`npm run lint`)
- [ ] Composants testés dans navigateur
- [ ] API backend accessible
- [ ] Data persiste correctement
- [ ] Responsive design OK
- [ ] Performance acceptable

---

## 📚 Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)

---

**Frontend prêt pour développement et production.**
