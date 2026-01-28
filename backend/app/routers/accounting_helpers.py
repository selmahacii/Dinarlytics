def _format_journal_entry(entry: JournalEntry) -> JournalEntryResponse:
    """Format journal entry for response"""
    return JournalEntryResponse(
        id=str(entry.id),
        entry_number=entry.entry_number,
        entry_date=entry.entry_date,
        description=entry.description,
        status=entry.status,
        total_debit=entry.total_debit,
        total_credit=entry.total_credit,
        lines=[
            JournalEntryLineResponse(
                id=str(line.id),
                account_code=line.account_code,
                debit_amount=line.debit_amount,
                credit_amount=line.credit_amount,
                description=line.description
            )
            for line in entry.lines
        ],
        created_at=entry.created_at
    )

def _create_approval_notification(db: Session, user_id: str, company_id: str, subject: str, message: str):
    """Use centralized service instead of local implementation."""
    from app.services.notifications import NotificationService
    NotificationService.create_notification(
        db, 
        user_id=user_id, 
        title=subject, 
        message=message, 
        priority="high",
        category="accounting"
    )
