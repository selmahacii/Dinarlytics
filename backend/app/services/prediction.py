import torch
import logging
from typing import Dict, Any, Tuple
from app.models.erp_model import ERPModel
from app.config import MODEL_CONFIG, IMPROVEMENT_CATEGORIES
from app.db import DatabaseManager

logger = logging.getLogger(__name__)

_loaded_models = {}

class PredictionService:
    """Service centralisé de prédiction avec analyse financière détaillée."""

    @staticmethod
    def get_model(model_name: str) -> ERPModel:
        """Charge le modèle avec caching."""
        if model_name not in MODEL_CONFIG:
            raise ValueError(f"Modèle inconnu: {model_name}")
        if model_name not in _loaded_models:
            cfg = MODEL_CONFIG[model_name]
            model = ERPModel(cfg["input_dim"], cfg["task_outputs"], cfg["hidden_dim"], cfg["n_layers"])
            if cfg["model_path"]:
                try:
                    model.load_state_dict(torch.load(cfg["model_path"]))
                except Exception as e:
                    logger.warning(f"Impossible de charger le modèle à {cfg['model_path']}: {e}")
            model.eval()
            _loaded_models[model_name] = model
        return _loaded_models[model_name]

    @staticmethod
    def predict(model_name: str, features: Dict[str, Any], company_id: int = None) -> Dict[str, Any]:
        """Prédit et analyse la situation financière complète."""
        model = PredictionService.get_model(model_name)
        
        # Convertir les features en tensor
        x = torch.tensor([list(features.values())], dtype=torch.float32)
        
        with torch.no_grad():
            outputs = model(x)
        
        # Convertir les sorties en Python
        result = {k: float(v.squeeze().item()) if v.numel() == 1 else v.squeeze().tolist() 
                  for k, v in outputs.items()}
        
        # Analyser et enrichir les prédictions
        financial_analysis = PredictionService._analyze_financial_situation(result)
        
        # Générer les suggestions détaillées
        suggestions = PredictionService._generate_suggestions(result)
        
        return {
            "model": model_name,
            "predictions": result,
            "financial_analysis": financial_analysis,
            "suggestions": suggestions,
            "risk_level": PredictionService._determine_risk_level(result),
            "health_score": PredictionService._calculate_health_score(result)
        }

    @staticmethod
    def _analyze_financial_situation(predictions: Dict[str, Any]) -> Dict[str, str]:
        """Analyse la situation financière basée sur les prédictions."""
        analysis = {}
        
        # Analyser le risque
        risk_score = predictions.get('risk', 0.5)
        if risk_score > 0.7:
            analysis['risk'] = "⚠️ RISQUE ÉLEVÉ - Intervention urgente recommandée"
        elif risk_score > 0.4:
            analysis['risk'] = "⚠️ RISQUE MODÉRÉ - Surveillance étroite requise"
        else:
            analysis['risk'] = "✅ RISQUE FAIBLE - Situation stable"
        
        # Analyser la liquidité
        liquidity = predictions.get('liquidity', 0.5)
        if liquidity < 0.3:
            analysis['liquidity'] = "🔴 LIQUIDITÉ CRITIQUE - Risque de trésorerie immédiate"
        elif liquidity < 0.6:
            analysis['liquidity'] = "🟡 LIQUIDITÉ FRAGILE - Attention à la gestion de trésorerie"
        else:
            analysis['liquidity'] = "🟢 LIQUIDITÉ CONFORTABLE - Bonne capacité de paiement"
        
        # Analyser la rentabilité
        profitability = predictions.get('profitability', 0.5)
        if profitability < 0.3:
            analysis['profitability'] = "📉 RENTABILITÉ FAIBLE - Réviser la stratégie tarifaire"
        elif profitability < 0.6:
            analysis['profitability'] = "📊 RENTABILITÉ MODÉRÉE - Optimisation des coûts requise"
        else:
            analysis['profitability'] = "📈 RENTABILITÉ SAINE - Marges satisfaisantes"
        
        # Analyser la solvabilité
        solvency = predictions.get('solvency', 0.5)
        if solvency < 0.3:
            analysis['solvency'] = "⛔ SOLVABILITÉ MAUVAISE - Risque de défaut"
        elif solvency < 0.6:
            analysis['solvency'] = "⚠️ SOLVABILITÉ FRAGILE - Réduire l'endettement"
        else:
            analysis['solvency'] = "✅ SOLVABILITÉ SOLIDE - Situation stable"
        
        # Détection d'anomalies
        anomaly = predictions.get('anomaly', 0)
        if anomaly > 0.5:
            analysis['anomaly'] = "🚨 ANOMALIE DÉTECTÉE - Vérifier les données de saisie"
        else:
            analysis['anomaly'] = "✓ Pas d'anomalie détectée"
        
        return analysis

    @staticmethod
    def _generate_suggestions(predictions: Dict[str, Any]) -> Dict[str, Tuple[float, str]]:
        """Génère les suggestions d'amélioration basées sur les scores."""
        suggestion_scores = predictions.get('suggestion', [0] * len(IMPROVEMENT_CATEGORIES))
        
        # Assurer que suggestion_scores est une liste
        if not isinstance(suggestion_scores, list):
            suggestion_scores = [suggestion_scores]
        
        # Créer un dictionnaire avec scores et descriptions
        suggestions = {}
        for i, (score, category) in enumerate(zip(suggestion_scores, IMPROVEMENT_CATEGORIES)):
            priority = "🔴 CRITIQUE" if score > 0.7 else "🟡 IMPORTANT" if score > 0.4 else "🟢 À EXPLORER"
            suggestions[category] = (float(score), priority)
        
        # Trier par score décroissant
        return dict(sorted(suggestions.items(), key=lambda x: x[1][0], reverse=True))

    @staticmethod
    def _determine_risk_level(predictions: Dict[str, Any]) -> str:
        """Détermine le niveau de risque global."""
        risk_score = predictions.get('risk', 0.5)
        anomaly_score = predictions.get('anomaly', 0)
        solvency_score = predictions.get('solvency', 0.5)
        
        global_risk = (risk_score + (1 - solvency_score) + anomaly_score) / 3
        
        if global_risk > 0.7:
            return "CRITIQUE"
        elif global_risk > 0.4:
            return "ÉLEVÉ"
        else:
            return "FAIBLE"

    @staticmethod
    def _calculate_health_score(predictions: Dict[str, Any]) -> float:
        """Calcule un score de santé financière global (0-100)."""
        weights = {
            'risk': -0.25,           # Moins le risque, mieux c'est
            'liquidity': 0.25,       # Plus de liquidité, mieux
            'profitability': 0.25,   # Plus de rentabilité, mieux
            'solvency': 0.25         # Plus de solvabilité, mieux
        }
        
        score = 100
        for metric, weight in weights.items():
            value = predictions.get(metric, 0.5)
            score += weight * 100 * (value - 0.5) * 2
        
        return max(0, min(100, score))

# La sortie 'suggestion' contient désormais des scores par catégorie d'amélioration ERP/finance.
