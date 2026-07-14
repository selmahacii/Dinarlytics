"""
E-invoicing : génération UBL 2.1 (structure Peppol BIS Billing 3.0).

Produit un document XML normé et interopérable à partir d'une facture
réelle — le socle des obligations de facturation électronique (Peppol en
Europe/international). Construit avec xml.etree (stdlib) : contenu
entièrement échappé, pas de gabarit texte injectable.
"""
from decimal import Decimal
from xml.etree import ElementTree as ET

NSMAP = {
    "": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    "cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    "cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
}

CBC = "{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}"
CAC = "{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}"
INV = "{urn:oasis:names:specification:ubl:schema:xsd:Invoice-2}"


def _text(parent, tag: str, value, **attrs):
    el = ET.SubElement(parent, tag, {k: str(v) for k, v in attrs.items()})
    el.text = str(value)
    return el


def _money(parent, tag: str, amount: Decimal, currency: str):
    return _text(parent, tag, f"{Decimal(amount or 0):.2f}", currencyID=currency)


def generate_ubl_invoice(invoice, items: list, company, client) -> bytes:
    """
    Génère le XML UBL 2.1 d'une facture.
    - invoice : modèle Invoice (totaux en devise de base)
    - items   : lignes InvoiceItem
    - company : émetteur (Company)
    - client  : destinataire (Client)
    """
    for prefix, uri in NSMAP.items():
        ET.register_namespace(prefix, uri)

    currency = invoice.currency_code or company.currency_code or "DZD"

    root = ET.Element(f"{INV}Invoice")

    # En-tête BIS Billing 3.0
    _text(root, f"{CBC}CustomizationID", "urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0")
    _text(root, f"{CBC}ProfileID", "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0")
    _text(root, f"{CBC}ID", invoice.invoice_number)
    _text(root, f"{CBC}IssueDate", invoice.invoice_date.isoformat())
    if invoice.due_date:
        _text(root, f"{CBC}DueDate", invoice.due_date.isoformat())
    _text(root, f"{CBC}InvoiceTypeCode", "380")  # facture commerciale
    _text(root, f"{CBC}DocumentCurrencyCode", currency)

    # Fournisseur (émetteur)
    supplier = ET.SubElement(root, f"{CAC}AccountingSupplierParty")
    sp = ET.SubElement(supplier, f"{CAC}Party")
    sp_name = ET.SubElement(sp, f"{CAC}PartyName")
    _text(sp_name, f"{CBC}Name", company.name)
    sp_addr = ET.SubElement(sp, f"{CAC}PostalAddress")
    if company.address:
        _text(sp_addr, f"{CBC}StreetName", company.address)
    addr_country = ET.SubElement(sp_addr, f"{CAC}Country")
    _text(addr_country, f"{CBC}IdentificationCode", (company.country or "DZ")[:2].upper())
    if company.tax_number:
        sp_tax = ET.SubElement(sp, f"{CAC}PartyTaxScheme")
        _text(sp_tax, f"{CBC}CompanyID", company.tax_number)
        scheme = ET.SubElement(sp_tax, f"{CAC}TaxScheme")
        _text(scheme, f"{CBC}ID", "VAT")

    # Client (destinataire)
    customer = ET.SubElement(root, f"{CAC}AccountingCustomerParty")
    cp = ET.SubElement(customer, f"{CAC}Party")
    cp_name = ET.SubElement(cp, f"{CAC}PartyName")
    _text(cp_name, f"{CBC}Name", client.name if client else "N/A")
    cp_addr = ET.SubElement(cp, f"{CAC}PostalAddress")
    if client is not None and getattr(client, "address", None):
        _text(cp_addr, f"{CBC}StreetName", client.address)
    cp_country = ET.SubElement(cp_addr, f"{CAC}Country")
    _text(cp_country, f"{CBC}IdentificationCode", "DZ")
    if client is not None and getattr(client, "tax_number", None):
        cp_tax = ET.SubElement(cp, f"{CAC}PartyTaxScheme")
        _text(cp_tax, f"{CBC}CompanyID", client.tax_number)
        scheme = ET.SubElement(cp_tax, f"{CAC}TaxScheme")
        _text(scheme, f"{CBC}ID", "VAT")

    # Total des taxes (TVA globale)
    tax_total = ET.SubElement(root, f"{CAC}TaxTotal")
    _money(tax_total, f"{CBC}TaxAmount", invoice.total_tva or Decimal("0"), currency)

    # Totaux monétaires
    monetary = ET.SubElement(root, f"{CAC}LegalMonetaryTotal")
    _money(monetary, f"{CBC}LineExtensionAmount", invoice.total_htt or Decimal("0"), currency)
    _money(monetary, f"{CBC}TaxExclusiveAmount", invoice.total_htt or Decimal("0"), currency)
    _money(monetary, f"{CBC}TaxInclusiveAmount", invoice.total_ttc or Decimal("0"), currency)
    _money(monetary, f"{CBC}PayableAmount", invoice.total_ttc or Decimal("0"), currency)

    # Lignes
    for idx, item in enumerate(items, start=1):
        line = ET.SubElement(root, f"{CAC}InvoiceLine")
        _text(line, f"{CBC}ID", idx)
        _text(line, f"{CBC}InvoicedQuantity", f"{Decimal(item.quantity or 0):.3f}", unitCode="C62")
        line_ht = (item.unit_price_htt or Decimal("0")) * (item.quantity or Decimal("0"))
        _money(line, f"{CBC}LineExtensionAmount", line_ht, currency)

        item_el = ET.SubElement(line, f"{CAC}Item")
        _text(item_el, f"{CBC}Name", (item.description or "Article")[:100])
        tax_cat = ET.SubElement(item_el, f"{CAC}ClassifiedTaxCategory")
        _text(tax_cat, f"{CBC}ID", "S" if (item.tva_rate or 0) > 0 else "Z")
        _text(tax_cat, f"{CBC}Percent", f"{Decimal(item.tva_rate or 0):.2f}")
        scheme = ET.SubElement(tax_cat, f"{CAC}TaxScheme")
        _text(scheme, f"{CBC}ID", "VAT")

        price = ET.SubElement(line, f"{CAC}Price")
        _money(price, f"{CBC}PriceAmount", item.unit_price_htt or Decimal("0"), currency)

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)
