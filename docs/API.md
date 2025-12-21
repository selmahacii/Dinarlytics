# Documentation API - Dinarlytics AI Service

## Base URL
```
http://localhost:8000
```

## Authentication
Actuellement sans authentification. JWT tokens à ajouter en production.

---

## Endpoints

### 1. Health Check

#### `GET /health`
Vérification de l'état du service.

**Response:**
```json
{
  "status": "ok",
  "service": "Dinarlytics AI Service",
  "version": "1.0.0"
}
```

---

### 2. List Models

#### `GET /models`
Liste les modèles disponibles.

**Response:**
```json
["erp_multitask_v1"]
```

---

### 3. Financial Prediction

#### `POST /predict`
Prédiction et analyse financière complète.

**Request:**
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
    "inventory_value": 100000,
    "accounts_receivable": 80000,
    "accounts_payable": 120000,
    "debt_long_term": 100000,
    "equity": 300000,
    "operating_cash_flow": 150000,
    "free_cash_flow": 100000,
    "growth_rate": 0.15,
    "expense_ratio": 0.75,
    "debt_to_equity": 0.33,
    "current_ratio": 1.5,
    "quick_ratio": 1.2,
    "inventory_turnover": 8,
    "receivables_turnover": 12,
    "payables_turnover": 6
  },
  "company_id": 123
}
```

**Parameters:**
- `model_name` (str, required) : Nom du modèle ("erp_multitask_v1")
- `features` (dict, required) : Features d'entrée (20 floats pour v1)
- `company_id` (int, optional) : ID entreprise pour traçabilité

**Response:**
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
    "Optimiser la gestion de trésorerie (ex: anticiper les flux, négocier délais fournisseurs, automatiser rapprochements bancaires)": [0.8, "🔴 CRITIQUE"],
    "Optimiser la gestion des stocks (ex: ajuster seuils, détecter surstocks/ruptures, synchroniser achats/ventes)": [0.6, "🟡 IMPORTANT"],
    "Réduire les coûts opérationnels (ex: analyser dépenses, mutualiser achats, revoir contrats fournisseurs)": [0.45, "🟡 IMPORTANT"],
    "Améliorer l'efficacité des relances clients (ex: automatiser relances, scoring risque client, suivi des litiges)": [0.3, "🟢 À EXPLORER"],
    "Renforcer la conformité et la veille réglementaire (ex: automatiser contrôles fiscaux, suivre évolutions légales, générer alertes)": [0.2, "🟢 À EXPLORER"]
  },
  "risk_level": "ÉLEVÉ",
  "health_score": 71.5
}
```

**Status Codes:**
- `200` : Prédiction réussie
- `404` : Modèle non trouvé
- `500` : Erreur serveur

**Example cURL:**
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "erp_multitask_v1",
    "features": {
      "revenue": 1000000,
      ...
    },
    "company_id": 123
  }'
```

---

### 4. Model Training

#### `POST /train`
Entraîne le modèle avec des données d'entraînement.

**Request:**
```json
{
  "model_name": "erp_multitask_v1",
  "train_data": [
    {
      "features": {
        "revenue": 1000000,
        ...
      },
      "targets": {
        "risk": 0.3,
        "liquidity": 0.7,
        "profitability": 0.6,
        "solvency": 0.8,
        "anomaly": 0.1,
        "suggestion": [0.5, 0.4, 0.3, 0.6, 0.2]
      }
    },
    {
      "features": {...},
      "targets": {...}
    }
  ],
  "epochs": 20,
  "learning_rate": 1e-3,
  "batch_size": 8
}
```

**Parameters:**
- `model_name` (str, required) : Nom du modèle
- `train_data` (list, required) : Données d'entraînement [{features, targets}, ...]
- `epochs` (int, optional) : Nombre d'epochs (default: 10)
- `learning_rate` (float, optional) : Learning rate (default: 1e-3)
- `batch_size` (int, optional) : Taille des batches (default: 8)

**Response:**
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

**Status Codes:**
- `200` : Entraînement réussi
- `404` : Modèle non trouvé
- `500` : Erreur serveur

**Example Python:**
```python
import requests

url = "http://localhost:8000/train"
payload = {
    "model_name": "erp_multitask_v1",
    "train_data": [
        {"features": {...}, "targets": {...}},
        ...
    ],
    "epochs": 20,
    "learning_rate": 1e-3,
    "batch_size": 8
}

response = requests.post(url, json=payload)
print(response.json())
```

---

## Data Schemas

### Prédiction Request Schema
```typescript
interface PredictRequest {
  model_name: string;           // "erp_multitask_v1"
  features: Record<string, number>;  // 20 features
  company_id?: number;          // Optional company ID
}
```

### Prédiction Response Schema
```typescript
interface PredictResponse {
  model: string;
  predictions: {
    risk: number;              // 0-1
    liquidity: number;         // 0-1
    profitability: number;     // 0-1
    solvency: number;          // 0-1
    anomaly: number;           // 0-1
    suggestion: number[];      // 5 scores
  };
  financial_analysis: {
    risk: string;              // Texte d'analyse
    liquidity: string;
    profitability: string;
    solvency: string;
    anomaly: string;
  };
  suggestions: Record<string, [number, string]>;  // [score, priority]
  risk_level: "CRITIQUE" | "ÉLEVÉ" | "FAIBLE";
  health_score: number;        // 0-100
}
```

### Training Request Schema
```typescript
interface TrainRequest {
  model_name: string;
  train_data: Array<{
    features: Record<string, number>;
    targets: Record<string, number>;
  }>;
  epochs?: number;
  learning_rate?: number;
  batch_size?: number;
}
```

### Training Response Schema
```typescript
interface TrainResponse {
  model_name: string;
  status: string;
  total_epochs: number;
  final_loss: number | null;
  best_loss: number | null;
  convergence: string;
}
```

---

## Error Handling

### Error Response Format
```json
{
  "detail": "Error message"
}
```

### Common Errors

**404 - Model Not Found**
```json
{
  "detail": "Modèle inconnu: invalid_model"
}
```

**500 - Internal Server Error**
```json
{
  "detail": "Erreur interne du serveur"
}
```

---

## Rate Limiting
Actuellement sans rate limiting. À ajouter en production.

---

## Versioning
API version: `1.0.0`

Les changements breaking seront signalés.

---

## Examples

### Python Example - Prediction
```python
import requests
import json

url = "http://localhost:8000/predict"
headers = {"Content-Type": "application/json"}

data = {
    "model_name": "erp_multitask_v1",
    "features": {
        "revenue": 1000000,
        "expenses": 750000,
        "assets": 500000,
        "liabilities": 200000,
        "invoices_pending": 50000,
        "cash_balance": 75000,
        "inventory_value": 100000,
        "accounts_receivable": 80000,
        "accounts_payable": 120000,
        "debt_long_term": 100000,
        "equity": 300000,
        "operating_cash_flow": 150000,
        "free_cash_flow": 100000,
        "growth_rate": 0.15,
        "expense_ratio": 0.75,
        "debt_to_equity": 0.33,
        "current_ratio": 1.5,
        "quick_ratio": 1.2,
        "inventory_turnover": 8,
        "receivables_turnover": 12
    },
    "company_id": 123
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

print(f"Health Score: {result['health_score']}")
print(f"Risk Level: {result['risk_level']}")
print(f"Suggestions: {list(result['suggestions'].keys())}")
```

### JavaScript Example - Prediction
```javascript
const url = "http://localhost:8000/predict";
const data = {
  model_name: "erp_multitask_v1",
  features: {
    revenue: 1000000,
    expenses: 750000,
    // ... 18 other features
  },
  company_id: 123
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})
  .then(res => res.json())
  .then(json => {
    console.log(`Health Score: ${json.health_score}`);
    console.log(`Risk Level: ${json.risk_level}`);
  });
```

---

## Integration with Frontend

### React Hook Example
```typescript
import { useState } from 'react';

function usePrediction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const predict = async (features: Record<string, number>, companyId: number) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: 'erp_multitask_v1',
          features,
          company_id: companyId
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { predict, loading, result, error };
}
```

---

**Documentation complète et à jour. API ready for production.**
