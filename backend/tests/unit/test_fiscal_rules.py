import pytest
from decimal import Decimal
from app.core.validators import FiscalValidator

def test_validate_tva_correct():
    ht = Decimal('100.00')
    tva = Decimal('19.00')
    rate = Decimal('19.0')
    assert FiscalValidator.validate_tva(ht, tva, rate) is True

def test_validate_tva_incorrect():
    ht = Decimal('100.00')
    tva = Decimal('20.00') # Wrong
    rate = Decimal('19.0')
    assert FiscalValidator.validate_tva(ht, tva, rate) is False

def test_timbre_calculation_cash():
    total = Decimal('10000.00')
    timbre = FiscalValidator.calculate_timbre(total, 'cash')
    assert timbre > 0 # Should have timbre

def test_timbre_calculation_bank():
    total = Decimal('10000.00')
    timbre = FiscalValidator.calculate_timbre(total, 'bank_transfer')
    assert timbre == 0

def test_journal_balance():
    assert FiscalValidator.validate_journal_entry_balance(Decimal('100'), Decimal('100')) is True
    assert FiscalValidator.validate_journal_entry_balance(Decimal('100'), Decimal('101')) is False
