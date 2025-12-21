import psycopg2
import logging
from typing import List, Dict, Any, Optional
from app.config import DB_CONFIG

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Gère les connexions PostgreSQL et les opérations de base de données."""

    @staticmethod
    def get_connection():
        """Établit une connexion à la base de données."""
        try:
            return psycopg2.connect(**DB_CONFIG)
        except psycopg2.Error as e:
            logger.error(f"Erreur de connexion à la base de données: {e}")
            raise

    @staticmethod
    def fetch_feature_snapshot(table: str, company_id: Optional[int] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Récupère un snapshot des features depuis ai_feature_store ou vues d'extraction."""
        query = f"SELECT * FROM {table}"
        params = []
        if company_id:
            query += " WHERE company_id = %s"
            params.append(company_id)
        query += " ORDER BY created_at DESC LIMIT %s"
        params.append(limit)
        
        try:
            with DatabaseManager.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, params)
                    cols = [desc[0] for desc in cur.description]
                    return [dict(zip(cols, row)) for row in cur.fetchall()]
        except psycopg2.Error as e:
            logger.error(f"Erreur lors de la récupération des features: {e}")
            return []

    @staticmethod
    def fetch_financial_data(company_id: int) -> Dict[str, Any]:
        """Récupère les données financières complètes d'une entreprise."""
        query = """
        SELECT 
            f.id, f.company_id, f.period,
            f.revenue, f.expenses, f.net_income,
            f.total_assets, f.total_liabilities, f.equity,
            i.total_amount as invoices_total,
            p.total_amount as payments_total
        FROM financial_statements f
        LEFT JOIN (SELECT company_id, SUM(total_amount) as total_amount FROM invoices GROUP BY company_id) i 
            ON f.company_id = i.company_id
        LEFT JOIN (SELECT company_id, SUM(amount) as total_amount FROM payments GROUP BY company_id) p 
            ON f.company_id = p.company_id
        WHERE f.company_id = %s
        ORDER BY f.period DESC LIMIT 1
        """
        try:
            with DatabaseManager.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, (company_id,))
                    cols = [desc[0] for desc in cur.description]
                    result = cur.fetchone()
                    return dict(zip(cols, result)) if result else {}
        except psycopg2.Error as e:
            logger.error(f"Erreur lors de la récupération des données financières: {e}")
            return {}

    @staticmethod
    def save_prediction(company_id: int, model_name: str, prediction_data: Dict[str, Any]) -> bool:
        """Sauvegarde les résultats de prédiction dans la table ai_predictions."""
        query = """
        INSERT INTO ai_predictions (company_id, model_name, predictions, confidence_score, created_at)
        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
        """
        try:
            with DatabaseManager.get_connection() as conn:
                with conn.cursor() as cur:
                    import json
                    cur.execute(query, (company_id, model_name, json.dumps(prediction_data), 0.95))
                    conn.commit()
            return True
        except psycopg2.Error as e:
            logger.error(f"Erreur lors de la sauvegarde de la prédiction: {e}")
            return False
