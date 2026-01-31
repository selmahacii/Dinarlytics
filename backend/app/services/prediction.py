import torch
import logging
from typing import Dict, Any, Tuple
from app.models.erp_model import ERPModel
from app.config import MODEL_CONFIG, IMPROVEMENT_CATEGORIES
from app.db import DatabaseManager

logger = logging.getLogger(__name__)

_loaded_models = {}

class PredictionService:
    """Service centralis???? de pr????diction avec analyse financi????re d????taill????e."""

    @staticmethod
    def get_model(model_name: str) -> ERPModel:
        """Charge le mod????le avec caching."""
        if model_name not in MODEL_CONFIG:
            raise ValueError(f"Mod????le inconnu: {model_name}")
        if model_name not in _loaded_models:
            cfg = MODEL_CONFIG[model_name]
            model = ERPModel(cfg["input_dim"], cfg["task_outputs"], cfg["hidden_dim"], cfg["n_layers"])
            if cfg["model_path"]:
                try:
                    model.load_state_dict(torch.load(cfg["model_path"]))
                except Exception as e:
                    logger.warning(f"Impossible de charger le mod????le ???? {cfg['model_path']}: {e}")
            model.eval()
            _loaded_models[model_name] = model
        return _loaded_models[model_name]

    @staticmethod
    def predict(model_name: str, features: Dict[str, Any], company_id: int = None) -> Dict[str, Any]:
        """Pr????dit et analyse la situation financi????re compl????te."""
        model = PredictionService.get_model(model_name)
        
        # Convertir les features en tensor
        x = torch.tensor([list(features.values())], dtype=torch.float32)
        
        with torch.no_grad():
            outputs = model(x)
        
        # Convertir les sorties en Python
        result = {k: float(v.squeeze().item()) if v.numel() == 1 else v.squeeze().tolist() 
                  for k, v in outputs.items()}
        
        # Analyser et enrichir les pr????dictions
        financial_analysis = PredictionService._analyze_financial_situation(result)
        
        # G????n????rer les suggestions d????taill????es
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
        """Analyse la situation financi????re bas????e sur les pr????dictions."""
        analysis = {}
        
        # Analyser le risque
        risk_score = predictions.get('risk', 0.5)
        if risk_score > 0.7:
            analysis['risk'] = "???????????? RISQUE ?????LEV????? - Intervention urgente recommand????e"
        elif risk_score > 0.4:
            analysis['risk'] = "???????????? RISQUE MOD?????R????? - Surveillance ????troite requise"
        else:
            analysis['risk'] = "??????? RISQUE FAIBLE - Situation stable"
        
        # Analyser la liquidit????
        liquidity = predictions.get('liquidity', 0.5)
        if liquidity < 0.3:
            analysis['liquidity'] = "????????? LIQUIDIT????? CRITIQUE - Risque de tr????sorerie imm????diate"
        elif liquidity < 0.6:
            analysis['liquidity'] = "???????? LIQUIDIT????? FRAGILE - Attention ???? la gestion de tr????sorerie"
        else:
            analysis['liquidity'] = "???????? LIQUIDIT????? CONFORTABLE - Bonne capacit???? de paiement"
        
        # Analyser la rentabilit????
        profitability = predictions.get('profitability', 0.5)
        if profitability < 0.3:
            analysis['profitability'] = "?????????? RENTABILIT????? FAIBLE - R????viser la strat????gie tarifaire"
        elif profitability < 0.6:
            analysis['profitability'] = "????????? RENTABILIT????? MOD?????R?????E - Optimisation des co????ts requise"
        else:
            analysis['profitability'] = "????????? RENTABILIT????? SAINE - Marges satisfaisantes"
        
        # Analyser la solvabilit????
        solvency = predictions.get('solvency', 0.5)
        if solvency < 0.3:
            analysis['solvency'] = "???????? SOLVABILIT????? MAUVAISE - Risque de d????faut"
        elif solvency < 0.6:
            analysis['solvency'] = "???????????? SOLVABILIT????? FRAGILE - R????duire l'endettement"
        else:
            analysis['solvency'] = "??????? SOLVABILIT????? SOLIDE - Situation stable"
        
        # D????tection d'anomalies
        anomaly = predictions.get('anomaly', 0)
        if anomaly > 0.5:
            analysis['anomaly'] = "???????? ANOMALIE D?????TECT?????E - V????rifier les donn????es de saisie"
        else:
            analysis['anomaly'] = "??????? Pas d'anomalie d????tect????e"
        
        return analysis

    @staticmethod
    def _generate_suggestions(predictions: Dict[str, Any]) -> Dict[str, Tuple[float, str]]:
        """G????n????re les suggestions d'am????lioration bas????es sur les scores."""
        suggestion_scores = predictions.get('suggestion', [0] * len(IMPROVEMENT_CATEGORIES))
        
        # Assurer que suggestion_scores est une liste
        if not isinstance(suggestion_scores, list):
            suggestion_scores = [suggestion_scores]
        
        # Cr????er un dictionnaire avec scores et descriptions
        suggestions = {}
        for i, (score, category) in enumerate(zip(suggestion_scores, IMPROVEMENT_CATEGORIES)):
            priority = "????????? CRITIQUE" if score > 0.7 else "???????? IMPORTANT" if score > 0.4 else "???????? ????? EXPLORER"
            suggestions[category] = (float(score), priority)
        
        # Trier par score d????croissant
        return dict(sorted(suggestions.items(), key=lambda x: x[1][0], reverse=True))

    @staticmethod
    def _determine_risk_level(predictions: Dict[str, Any]) -> str:
        """D????termine le niveau de risque global."""
        risk_score = predictions.get('risk', 0.5)
        anomaly_score = predictions.get('anomaly', 0)
        solvency_score = predictions.get('solvency', 0.5)
        
        global_risk = (risk_score + (1 - solvency_score) + anomaly_score) / 3
        
        if global_risk > 0.7:
            return "CRITIQUE"
        elif global_risk > 0.4:
            return "?????LEV?????"
        else:
            return "FAIBLE"

    @staticmethod
    def _calculate_health_score(predictions: Dict[str, Any]) -> float:
        """Calcule un score de sant???? financi????re global (0-100)."""
        weights = {
            'risk': -0.25,           # Moins le risque, mieux c'est
            'liquidity': 0.25,       # Plus de liquidit????, mieux
            'profitability': 0.25,   # Plus de rentabilit????, mieux
            'solvency': 0.25         # Plus de solvabilit????, mieux
        }
        
        score = 100
        for metric, weight in weights.items():
            value = predictions.get(metric, 0.5)
            score += weight * 100 * (value - 0.5) * 2
        
        return max(0, min(100, score))

# La sortie 'suggestion' contient d????sormais des scores par cat????gorie d'am????lioration ERP/finance.
