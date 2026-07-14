"""Tests de l'export e-invoicing UBL 2.1 — purs, sans base."""
from datetime import date
from decimal import Decimal
from types import SimpleNamespace
from xml.etree import ElementTree as ET

from app.modules.operations.service_einvoicing import generate_ubl_invoice

CBC = "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}"
CAC = "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}"


def _fixture():
    inv = SimpleNamespace(
        invoice_number="FACT/2026/00042", invoice_date=date(2026, 7, 12),
        due_date=date(2026, 8, 11), total_htt=Decimal("100000"),
        total_tva=Decimal("19000"), total_ttc=Decimal("120190"),
        currency_code="DZD",
    )
    items = [
        SimpleNamespace(description="Réfrigérateur 400L", quantity=Decimal("10"),
                        unit_price_htt=Decimal("10000"), tva_rate=Decimal("19")),
        SimpleNamespace(description="Droit de Timbre (Espèces)", quantity=Decimal("1"),
                        unit_price_htt=Decimal("1190"), tva_rate=Decimal("0")),
    ]
    company = SimpleNamespace(name="Électroménager Plus", address="Alger",
                              country="Algérie", tax_number="123456789012345",
                              currency_code="DZD")
    client = SimpleNamespace(name="Client & Fils <SARL>", address="Rue 5",
                             tax_number="998877665544332")
    return inv, items, company, client


class TestUBL:
    def test_xml_bien_forme(self):
        xml = generate_ubl_invoice(*_fixture())
        root = ET.fromstring(xml)  # lève si mal formé
        assert root.tag.endswith("Invoice")

    def test_echappement_xml(self):
        # Un nom de client contenant & < > ne doit jamais casser le document.
        xml = generate_ubl_invoice(*_fixture()).decode("utf-8")
        assert "Client &amp; Fils &lt;SARL&gt;" in xml

    def test_profil_peppol_bis_3(self):
        xml = generate_ubl_invoice(*_fixture()).decode("utf-8")
        assert "urn:fdc:peppol.eu:2017:poacc:billing:3.0" in xml

    def test_totaux_et_devise(self):
        root = ET.fromstring(generate_ubl_invoice(*_fixture()))
        monetary = root.find(f"{CAC}LegalMonetaryTotal")
        payable = monetary.find(f"{CBC}PayableAmount")
        assert payable.text == "120190.00"
        assert payable.get("currencyID") == "DZD"

    def test_nombre_de_lignes(self):
        root = ET.fromstring(generate_ubl_invoice(*_fixture()))
        lines = root.findall(f"{CAC}InvoiceLine")
        assert len(lines) == 2

    def test_categorie_tva_par_ligne(self):
        # Ligne taxée → catégorie S ; ligne timbre (0 %) → catégorie Z.
        root = ET.fromstring(generate_ubl_invoice(*_fixture()))
        cats = [
            line.find(f"{CAC}Item").find(f"{CAC}ClassifiedTaxCategory").find(f"{CBC}ID").text
            for line in root.findall(f"{CAC}InvoiceLine")
        ]
        assert cats == ["S", "Z"]

    def test_client_absent_tolere(self):
        inv, items, company, _ = _fixture()
        xml = generate_ubl_invoice(inv, items, company, None)
        assert ET.fromstring(xml) is not None
