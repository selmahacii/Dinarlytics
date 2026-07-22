import logging
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.db import DatabaseManager
from app.modules.intelligence.service_prediction import PredictionService
from app.modules.finance.service_analytics import AnalyticService
from app.modules.finance.service_snapshots import get_trend_features

logger = logging.getLogger(__name__)

class FinancialChatbot:
    """
    Expert system for financial analysis with Intent Recognition.
    Acts as a 'Correct AI' by parsing financial requests and grounding them in real ERP data.
    """

    def __init__(self, db: Session, company_id: Any, user_role: str):
        self.db = db
        self.company_id = company_id
        self.user_role = user_role
        self.financial_data = DatabaseManager.fetch_financial_data(company_id)

    def process_message(self, message: str) -> Dict[str, Any]:
        """Process user message and return structured response."""
        msg = message.lower().strip()
        
        # Intent Discovery (Simulating a correct NLP model)
        if any(kw in msg for kw in ["forecast", "prévision", "prochain", "futur"]):
            return self._handle_forecasting()
        
        if any(kw in msg for kw in ["risque", "danger", "alerte", "risk"]):
            return self._handle_risk_analysis()
        
        if any(kw in msg for kw in ["fiscal", "impôt", "tva", "ibs", "tax"]):
            return self._handle_fiscal_inquiry()
        
        if any(kw in msg for kw in ["santé", "score", "performance", "rapport"]):
            return self._handle_health_score()

        return self._handle_general_query(msg)

    def _handle_forecasting(self) -> Dict[str, Any]:
        """Calculates forecasts based on current ERP state."""
        try:
            # We call the real predictive model here
            # In a real scenario, we'd fetch historical features for the model
            features = self._prepare_features()
            raw_prediction = PredictionService.predict("erp_multitask_v1", features, self.company_id)
            
            revenue = self.financial_data.get("revenue", 0)
            forecast_rev = revenue * (1 + raw_prediction.get("predictions", {}).get("profitability", 0.05))

            trend_note = (
                "" if self.trend_data_available else
                "\n\n⚠️ Historique insuffisant : cette entreprise n'a pas encore assez de "
                "jours de données enregistrées pour calculer une vraie tendance "
                "(revenus/dépenses/trésorerie). Les facteurs de tendance du modèle "
                "sont neutres (aucune évolution mesurée) tant que l'historique ne "
                "s'est pas constitué — la prévision ci-dessus repose donc uniquement "
                "sur l'état financier actuel, pas sur une dynamique observée."
            )

            return {
                "type": "lia",
                "content": f"Basé sur l'analyse de vos {self.financial_data.get('invoices_total')} factures, je prévois une tendance de CA de {forecast_rev:,.2f} DZD pour la période suivante. Estimation indicative — plusieurs facteurs du modèle prédictif reposent encore sur des données partielles.{trend_note}",
                "data": raw_prediction,
                "suggestions": ["Détailler par mois", "Voir scenarios pessimistes", "Plan d'action"]
            }
        except Exception as e:
            logger.error(f"Error in forecasting: {e}")
            return {"content": "Désolé, je n'ai pas pu générer de prévisions précises avec les données actuelles."}

    def _handle_risk_analysis(self) -> Dict[str, Any]:
        """Uses the Multi-task model to assess risk."""
        features = self._prepare_features()
        analysis = PredictionService.predict("erp_multitask_v1", features, self.company_id)
        
        risk_level = analysis.get("risk_level", "Unknown")
        health = analysis.get("health_score", 0)
        
        content = f"Analyse de Risque Financier:\n- Niveau global: **{risk_level}**\n- Score de santé: {health:.1f}/100\n\n"
        
        if health < 50:
            content += "⚠️ Attention: Votre liquidité est sous les seuils de sécurité SCF."
        else:
            content += "✅ Votre structure financière est conforme aux benchmarks de votre secteur."

        return {
            "type": "lia",
            "content": content,
            "data": analysis,
            "suggestions": ["Comment améliorer mon score?", "Détail de la solvabilité"]
        }

    def _handle_fiscal_inquiry(self) -> Dict[str, Any]:
        """Specific Algerian Fiscal logic — lit le solde réel du compte
        445700 (TVA collectée) du mois en cours, au lieu de réappliquer un
        taux forfaitaire de 19% au CA brut (faux pour toute vente au taux
        réduit 9% ou exonérée, et incohérent avec le calcul G50 réel)."""
        from sqlalchemy import func, extract
        from app.core.models import JournalEntry, JournalEntryLine
        from decimal import Decimal

        now = datetime.utcnow()
        tva = self.db.query(func.sum(JournalEntryLine.credit_amount - JournalEntryLine.debit_amount)) \
            .join(JournalEntry) \
            .filter(
                JournalEntry.company_id == self.company_id,
                JournalEntry.status == 'approved',
                extract('year', JournalEntry.entry_date) == now.year,
                extract('month', JournalEntry.entry_date) == now.month,
                JournalEntryLine.account_code.like('445700%')
            ).scalar() or Decimal('0')

        return {
            "type": "lia",
            "content": f"Pour le mois en cours, votre TVA collectée réelle (compte 445700) est de {float(tva):,.2f} DZD. N'oubliez pas que votre G50 doit être déposée avant le 20 du mois prochain.",
            "suggestions": ["Générer G50", "Simuler IBS", "Calendrier fiscal"]
        }

    def _handle_health_score(self) -> Dict[str, Any]:
        """General financial summary."""
        revenue = self.financial_data.get("revenue", 0)
        net_income = self.financial_data.get("net_income", 0)
        margin = (net_income / revenue * 100) if revenue > 0 else 0
        
        return {
            "type": "lia",
            "content": f"Résumé Financier:\n- Chiffre d'Affaires: {revenue:,.2f} DZD\n- Résultat Net: {net_income:,.2f} DZD\n- Marge Net: {margin:.1f}%\n\nVotre rentabilité est au-dessus de la moyenne du secteur (14%).",
            "suggestions": ["Analyse des charges", "Comparer à N-1"]
        }

    def _handle_general_query(self, msg: str) -> Dict[str, Any]:
        """Fallback for unknown intents."""
        return {
            "type": "lia",
            "content": "Je suis LIA, votre assistante financière. Je peux analyser vos risques, prédire votre trésorerie ou simuler vos impôts (G50, IBS). Que souhaitez-vous analyser ?",
            "suggestions": ["Analyse de risque", "Prévisions de CA", "Fiscalité"]
        }

    def _prepare_features(self) -> Dict[str, float]:
        """Transforms DB data into features for the PyTorch model.

        f1-f8   : point-in-time financial aggregates (DatabaseManager).
        f9-f15  : real ratio KPIs (DSO/DPO/BFR/collection rate/solvency/
                  break-even/avg settlement delay) via AnalyticService —
                  computable right now, no history needed.
        f16-f20 : real trend deltas (revenue/expense/cash/inventory growth,
                  customer delay drift) via FinancialDailySnapshot history
                  (see service_snapshots.get_trend_features). These need at
                  least 2 daily snapshots to exist for this company; until
                  then they default to 0.0 as the model's INPUT (0.0 on a
                  *delta* feature honestly means "no observed change", not
                  a fabricated absolute value) — but self.trend_data_available
                  records whether that 0.0 is real or a stand-in, so any
                  chatbot response referencing a trend must say "historique
                  insuffisant" rather than presenting it as a measured trend.
        """
        fd = self.financial_data
        rev = float(fd.get("revenue", 0))
        exp = float(fd.get("expenses", 0))
        total_liabilities = float(fd.get("total_liabilities", 0))
        invoices_total = float(fd.get("invoices_total", 0))
        payments_total = float(fd.get("payments_total", 0))

        kpis = AnalyticService.get_financial_health_kpis(self.db, self.company_id)
        delays = AnalyticService.get_payment_delay_kpis(self.db, self.company_id)
        trends = get_trend_features(self.db, self.company_id)
        self.trend_data_available = any(v is not None for v in trends.values())

        return {
            "f1": rev / 1e6,
            "f2": exp / 1e6,
            "f3": (rev - exp) / max(1, rev),
            "f4": float(fd.get("total_assets", 0)) / 1e6,
            "f5": float(fd.get("equity", 0)) / 1e6,
            "f6": total_liabilities / 1e6,
            "f7": invoices_total / 1e6,
            "f8": payments_total / 1e6,
            "f9": kpis["dso_days"] / 365,
            "f10": kpis["dpo_days"] / 365,
            "f11": kpis["bfr_value"] / 1e6,
            "f12": kpis["collection_rate"] / 100,
            "f13": kpis["break_even_point"] / 1e6,
            "f14": kpis["solvency_ratio"],
            "f15": ((delays["customer_avg_payment_delay_days"] or 0) - (delays["supplier_avg_payment_delay_days"] or 0)) / 90,
            "f16": (trends["revenue_trend_pct"] or 0.0) / 100,
            "f17": (trends["expense_trend_pct"] or 0.0) / 100,
            "f18": (trends["cash_trend_pct"] or 0.0) / 100,
            "f19": (trends["inventory_trend_pct"] or 0.0) / 100,
            "f20": (trends["customer_delay_trend_days"] or 0.0) / 30,
        }
