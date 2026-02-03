from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.models import Supplier
from app.core.security import TokenData

class InternalControlService:
    """
    Enforces governance, risk management, and separation of duties (SoD).
    """

    APPROVAL_THRESHOLD = 500000 # 500,000 DZD

    @staticmethod
    def validate_payment_sod(db: Session, current_user: TokenData, supplier_id: str):
        """
        Rule: Separation of Duties (SoD).
        The person who created the supplier cannot approve/execute payments to them.
        """
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            return # Let the router handle 404

        # In a real app, Supplier should have a 'created_by' field.
        # Assuming Supplier model has it or similar tracking.
        if hasattr(supplier, 'created_by') and supplier.created_by == current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Violation de la S????paration des T????ches (SoD) : Vous ne pouvez pas valider de paiements pour un fournisseur que vous avez vous-m????me cr????????."
            )

    @staticmethod
    def check_approval_requirement(amount: float) -> bool:
        """
        Checks if an operation requires higher-level approval.
        """
        return amount >= InternalControlService.APPROVAL_THRESHOLD

    @staticmethod
    def mask_sensitive_data(data: dict, user_role: str):
        """
        Standard Data Masking for Junior users.
        """
        if user_role in ["employee", "junior_accountant"]:
            # Mask fields like salary, net margin, etc.
            sensitive_fields = ["net_income", "salary", "profit_margin"]
            for field in sensitive_fields:
                if field in data:
                    data[field] = "*** (Confidentiel)"
        return data
