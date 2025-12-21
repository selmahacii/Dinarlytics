# Dinarlytics Database Schema - Complete Features Summary

## 🔐 Electronic Signatures (Signatures Électroniques)

### Multiple Signature Methods
- **Draw**: Signature dessinée digitalement
- **Digital Certificate**: Signature avec certificat numérique (X.509, PEM)
- **Typed**: Signature typée/signée par texte
- **Biometric**: Signature biométrique (empreinte, reconnaissance faciale)

### Signature Features
- `signatures` table with full lifecycle tracking
- `signature_audit_trail` for compliance and traceability
- IP address and user-agent logging
- Certificate information storage (JSONB)
- Signature validity date tracking
- Integration with all document types:
  - Invoices (Factures)
  - Delivery Notes (Bons de Livraison)
  - Purchase Orders (Bons de Commande)
  - Purchase Notes (Bons d'Achat)
  - Financial Statements
  - Journal Entries

### Signature Audit Trail
- Lifecycle tracking: created → verified → validated → revoked
- Actor and timestamp tracking
- Compliance and legal evidence trail
- Full audit trail of signature actions

---

## 👥 User Access Rights & Document Permissions

### Role-Based Access Control (RBAC)
- **users** table: User accounts with authentication
- **roles** table: Role definitions (admin, comptable, analyste_financier, manager, etc.)
- **permissions** table: Granular permission codes
- **user_roles**: Many-to-many user-role mapping
- **role_permissions**: Many-to-many role-permission mapping

### Document-Level Access Control
- `document_access_permissions`: Role-based permissions per document type
- `user_document_access`: Individual user access overrides
- Temporary access with expiration dates
- Justification tracking for access grants
- Actions controlled: view, create, edit, delete, sign, export

### Document Types Controlled
- invoice
- delivery_note
- purchase_order
- purchase_note
- financial_statement
- journal_entry
- chart_of_accounts

### User Activity Tracking
- `user_activity_log`: Comprehensive activity logging
- Tracked activities: login, logout, view, create, edit, delete, export, sign
- IP address and user-agent tracking
- Success/failure status tracking
- Failure reason documentation

### Permission Audit Trail
- `permission_audits`: All grants and revokes logged
- Actor, target user, and timestamp tracking
- Full compliance audit trail

---

## 📄 All Document Types Implemented

### 1. **Factures (Invoices)**
- Sales invoices issued to customers
- Multiple line items with quantity, price, discount
- Electronic signature support
- QR code and barcode support
- Status tracking: brouillon → validée → envoyée → payée → annulée
- Payment tracking
- Customer linkage

### 2. **Bons de Livraison (Delivery Notes)**
- Delivery tracking for both customer and supplier shipments
- Link to invoices or purchase orders
- Delivery address and date
- Item-level barcode tracking
- Electronic signature support
- Line items with barcode conformity

### 3. **Bons de Commande (Purchase Orders)**
- Purchase orders issued to suppliers
- Supplier linkage
- Expected delivery date
- Multiple line items with discounts
- Status tracking: brouillon → confirmée → livrée → facturée → annulée
- Electronic signature support
- Document lifecycle management

### 4. **Bons d'Achat (Purchase Notes/Receipts)**
- Receiving notes from suppliers
- Link to purchase orders
- Reception date and conformity tracking
- Quantity received vs. commanded
- Conformity status: ok, défaut, manquant
- Electronic signature support
- Integration with inventory system

### 5. **Financial Statements**
- Balance sheet data (assets, liabilities, equity)
- Income statement data (revenue, expenses)
- Support for KPI calculations
- Period-based archival

### 6. **Journal Entries**
- Accounting journal entries
- Debit/credit line items
- Balance verification
- Status: draft → posted
- Link to chart of accounts
- Audit trail

---

## 🏷️ Codes-Barres (Barcodes) & QR Codes

### Article Barcodes
- Auto-generated unique barcode per article (64-char)
- Auto-generated unique QR code per article
- Barcode format: UUID without hyphens
- QR code format: qr://[UUID]
- UNIQUE constraints to prevent duplicates

### Supplier/Vendor Barcodes
- Auto-generated unique barcode per supplier
- Auto-generated unique QR code per supplier
- Same format and uniqueness constraints
- Integrated with purchase orders and purchase notes

### Barcode Usage
- Delivery note items: barcode reference
- Purchase note items: barcode conformity tracking
- Invoice items: article barcode linkage
- Inventory tracking and control
- Stock rotation monitoring

### Implementation
```sql
barcode VARCHAR(64) NOT NULL DEFAULT REPLACE(gen_random_uuid()::text,'-','')
qr_code_url TEXT NOT NULL DEFAULT CONCAT('qr://', gen_random_uuid())
UNIQUE(barcode)
UNIQUE(qr_code_url)
```

---

## 📊 Plan Comptable (Chart of Accounts)

### Complete Accounting Structure
- **Class 1-2**: Assets (Immobilisations, Actif Courant)
- **Class 3-4**: Liabilities (Dettes fournisseurs, TVA, Dettes financières)
- **Class 1**: Equity (Capital, Réserves)
- **Class 7**: Revenue (Ventes, Services, Produits financiers)
- **Class 6**: Expenses (Achats, Charges d'exploitation, Charges financières)

### Standard Accounts Pre-populated
- Immobilisations incorporelles (10)
- Immobilisations corporelles (11)
- Stocks de matières premières (20)
- Créances clients (30)
- Comptes courants (40)
- Disponibilités/Cash (51)
- Dettes fournisseurs (40)
- TVA (41)
- Salaires (42)
- Emprunts (50)
- Ventes de marchandises (70)
- Achats (60)
- Charges de personnel (64)
- Impôts et taxes (67)
- And many more...

### Chart of Accounts Features
- Hierarchical structure with parent-child relationships
- Account type classification (asset, liability, equity, revenue, expense)
- Account category and sub-category
- Active/inactive status
- Company-specific charts

### Journal Entries Integration
- Direct linkage to chart of accounts
- Debit/credit line items per account
- Balance verification
- Period-based accounting
- Account balance snapshots

### Account Balances
- `account_balances` table: Period snapshots
- Opening balance → Debits/Credits → Closing balance
- Monthly or periodic tracking
- Financial statement support
- Audit-ready format

---

## 🔗 Clients & Fournisseurs (Customers & Suppliers)

### Clients Table
- Customer contact information
- Email and phone
- Delivery address
- Group classification
- Tax number (NIF)
- Unique constraint: company + name
- Indexed for fast lookups

### Fournisseurs (Suppliers) Table
- Supplier contact information
- Auto-generated unique barcode
- Auto-generated unique QR code
- Email and phone
- Address
- Tax number
- UNIQUE constraints on barcode and QR code
- Indexed for fast lookups
- Integrated with purchase orders and purchase notes

### Relationships
- Clients linked to invoices
- Suppliers linked to purchase orders and expenses
- Support for multi-vendor sourcing
- Payment tracking per supplier
- Supplier reliability features for ML

---

## 📈 Financial Management Features

### KPI & Ratio Calculations
- EBITDA: Earnings Before Interest, Taxes, Depreciation, Amortization
- ROE: Return on Equity (%)
- ROA: Return on Assets (%)
- Gross Margin: (Revenue - COGS) / Revenue
- Net Margin: Net Income / Revenue
- DSO: Days Sales Outstanding (collection period)
- DPO: Days Payable Outstanding (payment period)
- Stock Rotation: COGS / Average Inventory

### Budget Management
- Budget definitions per company and fiscal year
- Budget line items with categories
- Variance tracking (actual vs. budget)
- Budget forecasting

### Bank Reconciliation
- Bank account management
- Statement reconciliation
- Transaction matching
- Discrepancy tracking

---

## 🛡️ Security & Compliance Features

### Audit Trail
- `audit_trail`: All critical actions logged
- `audit_logs`: Action-level logging with metadata
- `permission_audits`: Permission change tracking
- `signature_audit_trail`: Signature lifecycle tracking
- `user_activity_log`: User activity with IP/user-agent

### Data Protection
- User password hashing (bcrypt)
- MFA support via user_sessions
- Session management with expiration
- Activity logging for compliance
- Signature validation and verification

### Compliance Ready
- GDPR-compliant activity tracking
- Full audit trail for tax compliance
- Electronic signature legal validity
- Document versioning and history
- Data retention policies support

---

## 📋 Database Statistics

- **Total Tables**: 35+
- **Total Indexes**: 50+
- **Total Functions/Procedures**: 20+
- **Total Triggers**: 5+
- **Custom Types (ENUMs)**: 8+
- **Total SQL Lines**: 1600+

---

## 🚀 Technology Stack

- **Database Engine**: PostgreSQL 13+
- **Language**: PL/pgSQL
- **UUID Generation**: gen_random_uuid()
- **Password Hashing**: pgcrypto (bcrypt)
- **JSON Support**: JSONB columns
- **Signature Methods**: 
  - Digital certificates (X.509, PEM)
  - Drawn signatures (base64)
  - Typed signatures
  - Biometric data

---

## ✅ Implementation Checklist

- [x] Electronic signatures with multiple methods
- [x] Signature audit trail and lifecycle
- [x] Role-based access control
- [x] Document-level permissions
- [x] User activity logging
- [x] All document types (invoices, delivery notes, purchase orders, purchase notes)
- [x] Auto-generated barcodes and QR codes
- [x] Complete chart of accounts
- [x] Journal entries and balance tracking
- [x] Financial KPIs and ratios
- [x] Audit trail and compliance
- [x] Bank reconciliation
- [x] Budget management
- [x] AI/ML integration (feature store, drift monitoring)
- [x] Comprehensive documentation

---

## 📝 Notes

All features are fully integrated and production-ready. The schema supports:
- Multi-tenant architecture (company isolation)
- Scalable to thousands of transactions
- Optimized indexes for common queries
- Compliance with international accounting standards
- Electronic signature legal validity
- Complete audit trail for regulatory compliance

For deployment, ensure to:
1. Set proper password hashes before production
2. Configure backup procedures
3. Set up monitoring and alerting
4. Configure email notifications
5. Test all signature verification procedures
6. Set up access control policies
