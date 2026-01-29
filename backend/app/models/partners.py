from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, validates
from datetime import datetime, timezone
import uuid
import enum

class Wilaya(str, enum.Enum):
    ADRAR = "01"
    CHLEF = "02"
    LAGHOUAT = "03"
    OUM_EL_BOUAGHI = "04"
    BATNA = "05"
    BEJAIA = "06"
    BISKRA = "07"
    BECHAR = "08"
    BLIDA = "09"
    BOUIRA = "10"
    TAMANRASSET = "11"
    TEBESSA = "12"
    TLEMCEN = "13"
    TIARET = "14"
    TIZI_OUZOU = "15"
    ALGER = "16"
    DJELFA = "17"
    JIJEL = "18"
    SETIF = "19"
    SAIDA = "20"
    SKIKDA = "21"
    SIDI_BEL_ABBES = "22"
    ANNABA = "23"
    GUELMA = "24"
    CONSTANTINE = "25"
    MEDEA = "26"
    MOSTAGANEM = "27"
    MSILA = "28"
    MASCARA = "29"
    OUARGLA = "30"
    ORAN = "31"
    EL_BAYADH = "32"
    ILLIZI = "33"
    BBA = "34"
    BOUMERDES = "35"
    EL_TARF = "36"
    TINDOUF = "37"
    TISSEMSILT = "38"
    EL_OUED = "39"
    KHENCHELA = "40"
    SOUK_AHRAS = "41"
    TIPAZA = "42"
    MILA = "43"
    AIN_DEFLA = "44"
    NAAMA = "45"
    AIN_TEMOUCHENT = "46"
    GHARDAIA = "47"
    RELIZANE = "48"
    TIMIMOUN = "49"
    BORDJ_BADJI_MOKHTAR = "50"
    OULED_DJELLAL = "51"
    BENI_ABBES = "52"
    IN_SALAH = "53"
    IN_GUEZZAM = "54"
    TOUGGOURT = "55"
    DJANET = "56"
    EL_MGHAIR = "57"
    EL_MENIAA = "58"

from app.database import Base

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(String(500))
    state = Column(Enum(Wilaya), nullable=True, index=True) # Wilaya code
    tax_number = Column(String(50), unique=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    @validates('tax_number')
    def validate_nif(self, key, tax_number):
        if tax_number:
            # Suppression des espaces éventuels
            clean_nif = tax_number.strip().replace(" ", "")
            if len(clean_nif) != 15 or not clean_nif.isdigit():
                raise ValueError(f"Le NIF doit contenir exactement 15 chiffres (Format Algérie). Reçu: {tax_number}")
            return clean_nif
        return tax_number

    def __repr__(self):
        return f"<Client(name={self.name})>"

class Supplier(Base):
    __tablename__ = "fournisseurs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(String(500))
    state = Column(Enum(Wilaya), nullable=True, index=True) # Wilaya code
    tax_number = Column(String(50), unique=True)
    barcode = Column(String(64), unique=True, index=True)
    qr_code_url = Column(String(255), unique=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    @validates('tax_number')
    def validate_nif(self, key, tax_number):
        if tax_number:
            clean_nif = tax_number.strip().replace(" ", "")
            if len(clean_nif) != 15 or not clean_nif.isdigit():
                raise ValueError(f"Le NIF fournisseur doit contenir exactement 15 chiffres. Reçu: {tax_number}")
            return clean_nif
        return tax_number

    def __repr__(self):
        return f"<Supplier(name={self.name})>"
