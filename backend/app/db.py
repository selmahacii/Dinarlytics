import logging
import json
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func, insert, text
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import AIPrediction, FinancialStatement, Invoice, Payment, AIModel

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Gère les opérations de base de données en utilisant SQLAlchemy."""

    @staticmethod
    def fetch_feature_snapshot(table: str, company_id: Optional[Any] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Récupère un snapshot des features (en utilisant SQL bruts via l'engine pour la flexibilité des tables/vues)."""
        query = f"SELECT * FROM {table}"
        params = {}
        if company_id:
            query += " WHERE company_id = :company_id"
            params["company_id"] = company_id
        query += " ORDER BY created_at DESC LIMIT :limit"
        params["limit"] = limit
        
        try:
            with engine.connect() as conn:
                result = conn.execute(text(query), params)
                return [dict(row._mapping) for row in result]
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des features: {e}")
            return []

    @staticmethod
    def fetch_financial_data(company_id: Any) -> Dict[str, Any]:
        """Récupère les données financières complètes d'une entreprise via SQLAlchemy."""
        db: Session = SessionLocal()
        try:
            # Récupération du dernier état financier
            statement = db.query(FinancialStatement).filter(
                FinancialStatement.company_id == company_id
            ).order_by(FinancialStatement.exercice.desc()).first()
            
            if not statement:
                return {}
            
            # Agrégation des factures et paiements
            invoices_total = db.query(func.sum(Invoice.total_ttc)).filter(
                Invoice.company_id == company_id
            ).scalar() or 0
            
            payments_total = db.query(func.sum(Payment.amount)).filter(
                Payment.company_id == company_id
            ).scalar() or 0
            
            # Construction du résultat compatible avec l'ancien format
            return {
                "id": str(statement.id),
                "company_id": str(statement.company_id),
                "period": statement.exercice,
                "revenue": float(invoices_total), # Simulé par total factures si non présent
                "expenses": float(statement.operating_expenses or 0),
                "net_income": float(statement.net_income or 0),
                "total_assets": float(statement.total_assets or 0),
                "total_liabilities": float(statement.current_liabilities or 0),
                "equity": float(statement.equity or 0),
                "invoices_total": float(invoices_total),
                "payments_total": float(payments_total)
            }
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données financières: {e}")
            return {}
        finally:
            db.close()

    @staticmethod
    def save_prediction(company_id: Any, model_name: str, prediction_data: Dict[str, Any]) -> bool:
        """Sauvegarde les résultats de prédiction via SQLAlchemy."""
        db: Session = SessionLocal()
        try:
            # Trouver le model_id par son nom
            model = db.query(AIModel).filter(AIModel.name == model_name).first()
            model_id = model.id if model else None
            
            if not model_id:
                logger.warning(f"Modèle {model_name} non trouvé en base pour sauvegarde.")
                # Optionnel: créer le modèle s'il n'existe pas ou utiliser un ID générique
                return False

            prediction = AIPrediction(
                company_id=company_id,
                model_id=model_id,
                prediction=prediction_data,
                score=0.95, # Valeur par défaut ou extraite
                created_at=func.now()
            )
            db.add(prediction)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde de la prédiction: {e}")
            db.rollback()
            return False
        finally:
            db.close()
