from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from typing import List, Dict, Any
from app.core.models import Budget, BudgetItem, JournalEntry, JournalEntryLine

class BudgetingService:
    """
    Logic for Budget vs Actual tracking.
    Mappings can be based on 'category' string or 'account_code'.
    """

    @staticmethod
    def sync_actual_amounts(db: Session, budget_id: str):
        """
        Calculates the real spending/revenue from Journal entries for each budget item.
        """
        budget = db.query(Budget).filter(Budget.id == budget_id).first()
        if not budget:
            return None
            
        for item in budget.items:
            if not item.account_code:
                continue
                
            # Aggregate balance of the account during the budget's exercice year
            # Simple logic: account class 6/7 are expenses/revenues
            # Debit (Expense) or Credit (Revenue) balance
            actual = db.query(func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount))\
                .join(JournalEntry)\
                .filter(
                    JournalEntry.company_id == budget.company_id,
                    JournalEntry.status == 'approved',
                    JournalEntryLine.account_code.like(f"{item.account_code}%"),
                    func.extract('year', JournalEntry.entry_date) == int(budget.exercice)
                ).scalar() or Decimal('0')
            
            # For revenue accounts (class 7), we want the credit balance
            if item.account_code.startswith('7'):
                actual = abs(actual) # credit - debit typically negative in our model if credit > debit
            
            item.actual_amount = actual
            item.variance = item.budgeted_amount - item.actual_amount
            
        db.commit()
        return budget

    @staticmethod
    def get_summary(db: Session, company_id: Any, exercice: str) -> Dict[str, Any]:
        """Global budget health for the dashboard."""
        budgets = db.query(Budget).filter(
            Budget.company_id == company_id,
            Budget.exercice == exercice
        ).all()
        
        total_budgeted = sum([sum([i.budgeted_amount for i in b.items]) for b in budgets])
        total_actual = sum([sum([i.actual_amount for i in b.items]) for b in budgets])
        
        return {
            "total_budgeted": float(total_budgeted),
            "total_actual": float(total_actual),
            "variance": float(total_budgeted - total_actual),
            "usage_pct": float((total_actual / total_budgeted * 100) if total_budgeted > 0 else 0)
        }
