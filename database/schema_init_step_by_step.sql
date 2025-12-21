-- =====================================================================
-- DINARLYTICS: COMPLETE DATABASE SCHEMA - STEP BY STEP INITIALIZATION
-- =====================================================================
-- Comprehensive PostgreSQL database schema for ERP + AI predictive analytics
-- Installation process: Execute in order, section by section
-- Version: 1.0
-- Last updated: December 2025
-- =====================================================================

-- =====================================================================
-- STEP 1: RESET & CLEANUP (Optional - uncomment if needed)
-- =====================================================================
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;

-- =====================================================================
-- STEP 2: CREATE EXTENSIONS
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- STEP 3: DEFINE CUSTOM TYPES (ENUMS)
-- =====================================================================

-- Invoice status
CREATE TYPE IF NOT EXISTS invoice_status AS ENUM (
  'brouillon',
  'validee',
  'envoyee',
  'payee',
  'annulee'
);

-- Payment status
CREATE TYPE IF NOT EXISTS payment_status AS ENUM (
  'en_attente',
  'paye',
  'en_retard'
);

-- Payment mode
CREATE TYPE IF NOT EXISTS payment_mode AS ENUM (
  'virement',
  'cheque',
  'especes',
  'carte'
);

-- Fiscal declaration types
CREATE TYPE IF NOT EXISTS declaration_type AS ENUM (
  'g50',
  'ibs',
  'irg',
  'tap'
);

-- Declaration status
CREATE TYPE IF NOT EXISTS declaration_status AS ENUM (
  'en_cours',
  'teledeclaree',
  'validee',
  'rejetee'
);

-- Access request status
CREATE TYPE IF NOT EXISTS access_request_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Fiscal document category
CREATE TYPE IF NOT EXISTS document_category AS ENUM (
  'declaration',
  'attestation',
  'bilan',
  'certificat',
  'formulaire'
);

-- Document frequency
CREATE TYPE IF NOT EXISTS document_frequency AS ENUM (
  'mensuel',
  'trimestriel',
  'annuel',
  'ponctuel'
);

-- Fiscal calendar status
CREATE TYPE IF NOT EXISTS echeance_statut AS ENUM (
  'a_venir',
  'proche',
  'en_cours',
  'en_retard'
);

-- Priority level
CREATE TYPE IF NOT EXISTS echeance_priorite AS ENUM (
  'basse',
  'moyenne',
  'haute',
  'critique'
);

-- =====================================================================
-- STEP 4: CREATE CORE SECURITY & IDENTITY TABLES
-- =====================================================================

-- Users table (authentication & accounts)
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  company_id      UUID,
  segment         VARCHAR(50),
  company_type    VARCHAR(50),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS 'User accounts for Dinarlytics platform authentication and profile management.';
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company_id);

-- Roles table (role definitions)
CREATE TABLE IF NOT EXISTS roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE roles IS 'Role definitions (admin, comptable, analyste_financier, etc.).';
CREATE INDEX idx_roles_name ON roles(name);

-- Permissions table (granular access control)
CREATE TABLE IF NOT EXISTS permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(150) UNIQUE NOT NULL,
  description TEXT
);
COMMENT ON TABLE permissions IS 'Fine-grained permissions for role-based access control.';
CREATE INDEX idx_permissions_code ON permissions(code);

-- User-Role mapping table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
COMMENT ON TABLE user_roles IS 'Links users to roles (many-to-many relationship).';

-- Role-Permission mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
COMMENT ON TABLE role_permissions IS 'Links roles to permissions (many-to-many relationship).';

-- Access requests workflow (request for elevated permissions)
CREATE TABLE IF NOT EXISTS access_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_code VARCHAR(150) NOT NULL,
  justification   TEXT,
  status          access_request_status NOT NULL DEFAULT 'pending',
  decided_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  decided_at      TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE access_requests IS 'Workflow for requesting elevated access/permissions.';
CREATE INDEX idx_access_requests_status ON access_requests(status, created_at);

-- User sessions (MFA, temporary access)
CREATE TABLE IF NOT EXISTS user_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token   VARCHAR(255) NOT NULL UNIQUE,
  mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_validated   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMP
);
COMMENT ON TABLE user_sessions IS 'User session management with MFA support.';
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);

-- =====================================================================
-- STEP 5: CREATE COMPANIES & ORGANIZATIONAL STRUCTURE
-- =====================================================================

-- Companies table (tenant data)
CREATE TABLE IF NOT EXISTS companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL UNIQUE,
  country_code    VARCHAR(2) NOT NULL,
  currency_code   VARCHAR(3) NOT NULL,
  segment         VARCHAR(50) NOT NULL DEFAULT 'micro',
  company_type    VARCHAR(50) NOT NULL DEFAULT 'eurl',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE companies IS 'Companies/tenants with ERP data.';
CREATE INDEX idx_companies_country ON companies(country_code);

-- Add company_id foreign key constraint to users (deferred until companies exists)
ALTER TABLE users
  ADD CONSTRAINT fk_users_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- =====================================================================
-- STEP 6: CREATE CLIENTS & SUPPLIERS
-- =====================================================================

-- Clients table (AR - Accounts Receivable)
CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(50),
  address         TEXT,
  group_name      VARCHAR(100),
  tax_number      VARCHAR(50),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE clients IS 'Customer accounts with contact and classification info.';
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_clients_name ON clients(company_id, name);
ALTER TABLE clients
  ADD CONSTRAINT unique_client_per_company_name
  UNIQUE (company_id, name);

-- Suppliers/Vendors table (AP - Accounts Payable)
CREATE TABLE IF NOT EXISTS fournisseurs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(50),
  address         TEXT,
  tax_number      VARCHAR(50),
  qr_code_url     TEXT NOT NULL DEFAULT CONCAT('qr://', gen_random_uuid()),
  barcode         VARCHAR(64) NOT NULL DEFAULT REPLACE(gen_random_uuid()::text,'-',''),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE fournisseurs IS 'Supplier/vendor accounts with auto-generated QR code and barcode.';
CREATE INDEX idx_fournisseurs_company ON fournisseurs(company_id);
ALTER TABLE fournisseurs
  ADD CONSTRAINT unique_fournisseur_per_company_name
  UNIQUE (company_id, name);
ALTER TABLE fournisseurs
  ADD CONSTRAINT unique_fournisseur_qr_code
  UNIQUE (qr_code_url);
ALTER TABLE fournisseurs
  ADD CONSTRAINT unique_fournisseur_barcode
  UNIQUE (barcode);

-- Expense vendors (can be same as fournisseurs but separated for AP tracking)
CREATE TABLE IF NOT EXISTS expenses_vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  tax_number      VARCHAR(50),
  email           VARCHAR(255),
  phone           VARCHAR(50),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE expenses_vendors IS 'Vendors for expense/AP management.';
CREATE INDEX idx_expenses_vendors_company ON expenses_vendors(company_id);

-- =====================================================================
-- STEP 7: CREATE ARTICLES & INVENTORY CATALOG
-- =====================================================================

-- Articles catalog
CREATE TABLE IF NOT EXISTS articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code            VARCHAR(100) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  unit            VARCHAR(20) DEFAULT 'unite',
  unit_price      NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,2) DEFAULT 0,
  qr_code_url     TEXT NOT NULL DEFAULT CONCAT('qr://', gen_random_uuid()),
  barcode         VARCHAR(64) NOT NULL DEFAULT REPLACE(gen_random_uuid()::text,'-',''),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE articles IS 'Product/article catalog with auto-generated QR code and barcode.';
CREATE INDEX idx_articles_company ON articles(company_id);
ALTER TABLE articles
  ADD CONSTRAINT unique_article_per_company_code
  UNIQUE (company_id, code);
ALTER TABLE articles
  ADD CONSTRAINT unique_article_qr_code
  UNIQUE (qr_code_url);
ALTER TABLE articles
  ADD CONSTRAINT unique_article_barcode
  UNIQUE (barcode);

-- Inventory movements (stock transactions)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  article_code    VARCHAR(100),
  quantity        NUMERIC(18,2) NOT NULL,
  unit_cost       NUMERIC(18,2) NOT NULL,
  movement_type   VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjust'
  movement_date   DATE NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE inventory_movements IS 'Stock movements (in/out) for inventory tracking and rotation calculations.';
CREATE INDEX idx_inventory_movements_company ON inventory_movements(company_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(movement_date);

-- Inventory snapshot (period average)
CREATE TABLE IF NOT EXISTS inventory_snapshot (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exercice        VARCHAR(10) NOT NULL,
  avg_inventory_value NUMERIC(18,2),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE inventory_snapshot IS 'Period-end average inventory value for financial analysis.';
ALTER TABLE inventory_snapshot
  ADD CONSTRAINT unique_inventory_snapshot
  UNIQUE(company_id, exercice);

-- =====================================================================
-- STEP 8: CREATE INVOICES & INVOICE ITEMS (AR)
-- =====================================================================

-- Invoices table (sales invoices)
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  numero          VARCHAR(50) UNIQUE NOT NULL,
  date_emission   DATE NOT NULL,
  date_echeance   DATE,
  conditions_paiement INTEGER,
  montant_ht      NUMERIC(18,2) NOT NULL DEFAULT 0,
  tva             NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_ttc       NUMERIC(18,2) NOT NULL DEFAULT 0,
  statut          invoice_status NOT NULL DEFAULT 'brouillon',
  reference       VARCHAR(100),
  notes           TEXT,
  signature_url   TEXT,
  qr_code_url     TEXT,
  signed_at       TIMESTAMP,
  signed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE invoices IS 'Sales invoices issued by the company.';
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_date ON invoices(date_emission);
CREATE INDEX idx_invoices_status ON invoices(statut);
ALTER TABLE invoices
  ADD CONSTRAINT unique_invoice_per_company_numero
  UNIQUE (company_id, numero);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  article_id      UUID REFERENCES articles(id) ON DELETE SET NULL,
  article_code    VARCHAR(100),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  quantity        NUMERIC(18,2) NOT NULL DEFAULT 1,
  unit_price      NUMERIC(18,2) NOT NULL DEFAULT 0,
  remise_pct      NUMERIC(5,2) DEFAULT 0,
  line_total      NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,2) DEFAULT 0
);
COMMENT ON TABLE invoice_items IS 'Line items in sales invoices with product and pricing info.';
Create INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- =====================================================================
-- STEP 9: CREATE PAYMENTS (AR & AP)
-- =====================================================================

-- Customer payments (receipts)
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  numero          VARCHAR(50) UNIQUE,
  date_paiement   DATE NOT NULL,
  mode            payment_mode NOT NULL,
  montant         NUMERIC(18,2) NOT NULL,
  statut          payment_status NOT NULL DEFAULT 'en_attente',
  couleur_tag     VARCHAR(30),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE payments IS 'Customer payments received for sales invoices.';
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(date_paiement);
ALTER TABLE payments
  ADD CONSTRAINT montant_positif
  CHECK (montant >= 0);

-- Expense invoices (vendor invoices)
CREATE TABLE IF NOT EXISTS expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vendor_id       UUID REFERENCES expenses_vendors(id) ON DELETE SET NULL,
  numero          VARCHAR(50),
  date_emission   DATE NOT NULL,
  date_echeance   DATE,
  montant_ht      NUMERIC(18,2) NOT NULL DEFAULT 0,
  tva             NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_ttc       NUMERIC(18,2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(18,2) NOT NULL DEFAULT 0,
  statut          VARCHAR(20) NOT NULL DEFAULT 'en_cours',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE expenses IS 'Vendor invoices (AP) received by the company.';
CREATE INDEX idx_expenses_company ON expenses(company_id);
CREATE INDEX idx_expenses_date ON expenses(date_emission);

-- Expense payments (vendor payments)
CREATE TABLE IF NOT EXISTS expenses_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id      UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  date_paiement   DATE NOT NULL,
  montant         NUMERIC(18,2) NOT NULL,
  mode            VARCHAR(30) DEFAULT 'virement',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE expenses_payments IS 'Payments made to vendors.';
CREATE INDEX idx_expenses_payments_expense ON expenses_payments(expense_id);

-- Bank accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  bank_name       VARCHAR(100) NOT NULL,
  iban            VARCHAR(34) NOT NULL,
  bic             VARCHAR(11),
  currency        VARCHAR(3) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE bank_accounts IS 'Company bank accounts.';
CREATE INDEX idx_bank_accounts_company ON bank_accounts(company_id);

-- Bank reconciliations
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  statement_date  DATE NOT NULL,
  statement_balance NUMERIC(18,2) NOT NULL,
  matched         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE bank_reconciliations IS 'Bank statement reconciliations.';
CREATE INDEX idx_bank_reconciliations_account ON bank_reconciliations(bank_account_id);

-- =====================================================================
-- STEP 9b: CREATE PURCHASE ORDERS, DELIVERY NOTES, PURCHASE NOTES
-- =====================================================================

-- Purchase Orders (Bons de Commande)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  fournisseur_id  UUID NOT NULL REFERENCES fournisseurs(id) ON DELETE RESTRICT,
  numero          VARCHAR(50) UNIQUE NOT NULL,
  date_commande   DATE NOT NULL,
  date_livraison_prevue DATE,
  montant_ht      NUMERIC(18,2) NOT NULL DEFAULT 0,
  tva             NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_ttc       NUMERIC(18,2) NOT NULL DEFAULT 0,
  statut          VARCHAR(20) NOT NULL DEFAULT 'brouillon', -- brouillon, confirmee, livree, facturee, annulee
  notes           TEXT,
  signature_url   TEXT,
  signed_at       TIMESTAMP,
  signed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE purchase_orders IS 'Purchase orders (Bons de Commande) issued to suppliers.';
CREATE INDEX idx_purchase_orders_company ON purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_fournisseur ON purchase_orders(fournisseur_id);
CREATE INDEX idx_purchase_orders_date ON purchase_orders(date_commande);

-- Purchase order line items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  article_id      UUID REFERENCES articles(id) ON DELETE SET NULL,
  article_code    VARCHAR(100),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  quantity        NUMERIC(18,2) NOT NULL DEFAULT 1,
  unit_price      NUMERIC(18,2) NOT NULL DEFAULT 0,
  remise_pct      NUMERIC(5,2) DEFAULT 0,
  line_total      NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,2) DEFAULT 0
);
COMMENT ON TABLE purchase_order_items IS 'Line items in purchase orders.';
CREATE INDEX idx_purchase_order_items_po ON purchase_order_items(purchase_order_id);

-- Delivery Notes (Bons de Livraison)
CREATE TABLE IF NOT EXISTS delivery_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id      UUID REFERENCES invoices(id) ON DELETE SET NULL,
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  client_id       UUID REFERENCES clients(id) ON DELETE RESTRICT,
  fournisseur_id  UUID REFERENCES fournisseurs(id) ON DELETE RESTRICT,
  numero          VARCHAR(50) UNIQUE NOT NULL,
  date_livraison  DATE NOT NULL,
  type            VARCHAR(20) NOT NULL DEFAULT 'client', -- 'client' or 'fournisseur'
  adresse_livraison TEXT,
  notes           TEXT,
  signature_url   TEXT,
  signed_at       TIMESTAMP,
  signed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE delivery_notes IS 'Delivery notes (Bons de Livraison) for tracking goods delivery.';
CREATE INDEX idx_delivery_notes_company ON delivery_notes(company_id);
CREATE INDEX idx_delivery_notes_client ON delivery_notes(client_id);
CREATE INDEX idx_delivery_notes_fournisseur ON delivery_notes(fournisseur_id);
CREATE INDEX idx_delivery_notes_date ON delivery_notes(date_livraison);
CREATE INDEX idx_delivery_notes_invoice ON delivery_notes(invoice_id);

-- Delivery note line items
CREATE TABLE IF NOT EXISTS delivery_note_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_note_id UUID NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
  article_id      UUID REFERENCES articles(id) ON DELETE SET NULL,
  article_code    VARCHAR(100),
  name            VARCHAR(255) NOT NULL,
  quantity        NUMERIC(18,2) NOT NULL DEFAULT 1,
  unit_price      NUMERIC(18,2),
  barcode         VARCHAR(64)
);
COMMENT ON TABLE delivery_note_items IS 'Line items in delivery notes with quantity and barcode tracking.';
CREATE INDEX idx_delivery_note_items_dn ON delivery_note_items(delivery_note_id);

-- Purchase Notes (Bons d'Achat / Purchase Receipts)
CREATE TABLE IF NOT EXISTS purchase_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  fournisseur_id  UUID NOT NULL REFERENCES fournisseurs(id) ON DELETE RESTRICT,
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  numero          VARCHAR(50) UNIQUE NOT NULL,
  date_reception  DATE NOT NULL,
  montant_ht      NUMERIC(18,2) NOT NULL DEFAULT 0,
  tva             NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_ttc       NUMERIC(18,2) NOT NULL DEFAULT 0,
  statut          VARCHAR(20) NOT NULL DEFAULT 'recu', -- recu, controlé, integre, facture
  observations    TEXT,
  signature_url   TEXT,
  signed_at       TIMESTAMP,
  signed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE purchase_notes IS 'Purchase receiving notes (Bons d''Achat) from suppliers.';
CREATE INDEX idx_purchase_notes_company ON purchase_notes(company_id);
CREATE INDEX idx_purchase_notes_fournisseur ON purchase_notes(fournisseur_id);
CREATE INDEX idx_purchase_notes_date ON purchase_notes(date_reception);

-- Purchase note line items
CREATE TABLE IF NOT EXISTS purchase_note_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_note_id UUID NOT NULL REFERENCES purchase_notes(id) ON DELETE CASCADE,
  article_id      UUID REFERENCES articles(id) ON DELETE SET NULL,
  article_code    VARCHAR(100),
  name            VARCHAR(255) NOT NULL,
  quantity_commanded NUMERIC(18,2),
  quantity_received NUMERIC(18,2) NOT NULL DEFAULT 0,
  unit_price      NUMERIC(18,2),
  barcode         VARCHAR(64),
  conformity_status VARCHAR(20) DEFAULT 'ok' -- ok, defaut, manquant
);
COMMENT ON TABLE purchase_note_items IS 'Line items in purchase notes with receipt quantity and conformity tracking.';
CREATE INDEX idx_purchase_note_items_pn ON purchase_note_items(purchase_note_id);

-- =====================================================================
-- STEP 10: CREATE ELECTRONIC SIGNATURES
-- =====================================================================

CREATE TABLE IF NOT EXISTS signatures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     VARCHAR(50) NOT NULL,  -- 'invoice', 'delivery_note', 'purchase_order', 'purchase_note', 'document'
  entity_id       UUID NOT NULL,
  signer_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  signature_url   TEXT NOT NULL,
  method          VARCHAR(50) NOT NULL DEFAULT 'draw', -- 'draw', 'digital_cert', 'typed', 'biometric'
  certificate_info JSONB,  -- for digital certificates
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  signature_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  signature_validity_date DATE,
  signed_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE signatures IS 'Electronic signatures with multiple methods (draw, digital, typed, biometric) and compliance tracking.';
CREATE INDEX idx_signatures_entity ON signatures(entity_type, entity_id);
CREATE INDEX idx_signatures_signer ON signatures(signer_id);
CREATE INDEX idx_signatures_date ON signatures(signed_at);

-- Signature audit trail (compliance & traceability)
CREATE TABLE IF NOT EXISTS signature_audit_trail (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_id    UUID NOT NULL REFERENCES signatures(id) ON DELETE CASCADE,
  action          VARCHAR(50) NOT NULL, -- 'created', 'verified', 'rejected', 'revoked'
  actor_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp       TIMESTAMP NOT NULL DEFAULT NOW(),
  notes           TEXT
);
COMMENT ON TABLE signature_audit_trail IS 'Audit trail for signature lifecycle (creation, verification, revocation).';
CREATE INDEX idx_signature_audit_signature ON signature_audit_trail(signature_id);

-- =====================================================================
-- STEP 11: CREATE CHART OF ACCOUNTS (PLAN COMPTABLE)
-- =====================================================================

-- Chart of Accounts (Standard & customizable)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  account_code    VARCHAR(20) NOT NULL,
  account_label   VARCHAR(255) NOT NULL,
  account_type    VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense', 'cost_of_goods'
  category        VARCHAR(50), -- 'current_asset', 'fixed_asset', 'current_liability', etc.
  sub_category    VARCHAR(50),
  parent_account_code VARCHAR(20),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE chart_of_accounts IS 'Chart of accounts with hierarchy and accounting classification.';
ALTER TABLE chart_of_accounts
  ADD CONSTRAINT unique_account_code_per_company
  UNIQUE(company_id, account_code);
CREATE INDEX idx_chart_of_accounts_company ON chart_of_accounts(company_id);
CREATE INDEX idx_chart_of_accounts_type ON chart_of_accounts(account_type);

-- Journal Entries (Transactions)
CREATE TABLE IF NOT EXISTS journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  journal_code    VARCHAR(10) NOT NULL, -- 'AC', 'VE', 'AC', 'OD', etc.
  entry_date      DATE NOT NULL,
  entry_number    VARCHAR(50),
  description     TEXT,
  total_debit     NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_credit    NUMERIC(18,2) NOT NULL DEFAULT 0,
  is_balanced     BOOLEAN,
  is_posted       BOOLEAN NOT NULL DEFAULT FALSE,
  posted_at       TIMESTAMP,
  posted_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE journal_entries IS 'Accounting journal entries with debit/credit balance.';
CREATE INDEX idx_journal_entries_company ON journal_entries(company_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_journal ON journal_entries(journal_code);

-- Journal Entry Lines (Debit/Credit)
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_code    VARCHAR(20) NOT NULL,
  description     TEXT,
  debit           NUMERIC(18,2) DEFAULT 0,
  credit          NUMERIC(18,2) DEFAULT 0,
  line_number     INTEGER NOT NULL
);
COMMENT ON TABLE journal_entry_lines IS 'Individual debit/credit lines in journal entries.';
CREATE INDEX idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account ON journal_entry_lines(account_code);

-- Account Balances (snapshot per period)
CREATE TABLE IF NOT EXISTS account_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  account_code    VARCHAR(20) NOT NULL,
  period          VARCHAR(10) NOT NULL, -- YYYY-MM format
  opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  debit_total     NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit_total    NUMERIC(18,2) NOT NULL DEFAULT 0,
  closing_balance NUMERIC(18,2) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE account_balances IS 'Account balance snapshots by period for financial reporting.';
ALTER TABLE account_balances
  ADD CONSTRAINT unique_account_period
  UNIQUE(company_id, account_code, period);
CREATE INDEX idx_account_balances_company ON account_balances(company_id);
CREATE INDEX idx_account_balances_period ON account_balances(period);

-- =====================================================================
-- STEP 12: ENHANCED AUDIT & COMPLIANCE TABLES
-- =====================================================================

-- Fiscal declarations
CREATE TABLE IF NOT EXISTS fiscal_declarations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type                    declaration_type NOT NULL,
  exercice                VARCHAR(10),
  periode                 VARCHAR(10),
  numero                  VARCHAR(50),
  date_declaration        DATE,
  statut                  declaration_status NOT NULL DEFAULT 'en_cours',
  montant_verse           NUMERIC(18,2) DEFAULT 0,
  date_versement          DATE,
  observations            TEXT,
  chiffre_affaires_ht     NUMERIC(18,2),
  tva_collectee           NUMERIC(18,2),
  tva_deductible          NUMERIC(18,2),
  tva_a_verser            NUMERIC(18,2),
  charges_deductibles     NUMERIC(18,2),
  amortissements          NUMERIC(18,2),
  provisions              NUMERIC(18,2),
  revenus_bruts           NUMERIC(18,2),
  abattements             NUMERIC(18,2),
  taux_tap                NUMERIC(6,4),
  score_conformite        NUMERIC(5,2),
  delai_declaration_j     NUMERIC(6,2),
  created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE fiscal_declarations IS 'Tax declarations (VAT, IBS, IRG, TAP).';
CREATE INDEX idx_declarations_company ON fiscal_declarations(company_id);
CREATE INDEX idx_declarations_type_period ON fiscal_declarations(type, exercice, periode);

-- Fiscal calendar (reminders & deadlines)
CREATE TABLE IF NOT EXISTS fiscal_calendar (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type            declaration_type NOT NULL,
  libelle         VARCHAR(150) NOT NULL,
  frequence       document_frequency NOT NULL,
  date_echeance   DATE NOT NULL,
  jours_avant     INTEGER NOT NULL,
  statut          echeance_statut NOT NULL,
  priorite        echeance_priorite NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE fiscal_calendar IS 'Tax calendar with scheduled deadlines and reminders.';
CREATE INDEX idx_calendar_company_date ON fiscal_calendar(company_id, date_echeance);

-- General reminders
CREATE TABLE IF NOT EXISTS reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  title           VARCHAR(200) NOT NULL,
  message         TEXT,
  due_at          TIMESTAMP NOT NULL,
  related_type    VARCHAR(50),
  related_id      UUID,
  sent_at         TIMESTAMP,
  channel         VARCHAR(30) DEFAULT 'inapp',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE reminders IS 'Reminders and alerts for critical deadlines.';
CREATE INDEX idx_reminders_due ON reminders(company_id, due_at);

-- Fiscal documents catalog
CREATE TABLE IF NOT EXISTS fiscal_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(50) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  category        document_category NOT NULL,
  frequency       document_frequency NOT NULL,
  description     TEXT,
  country_code    VARCHAR(2) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE fiscal_documents IS 'Catalog of fiscal documents by country and type.';

-- Created fiscal documents (instances)
CREATE TABLE IF NOT EXISTS created_fiscal_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_id     UUID NOT NULL REFERENCES fiscal_documents(id) ON DELETE RESTRICT,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft',
  period          VARCHAR(10),
  amount          NUMERIC(18,2),
  pdf_url         TEXT,
  signature_id    UUID REFERENCES signatures(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  submitted_at    TIMESTAMP,
  validated_at    TIMESTAMP
);
COMMENT ON TABLE created_fiscal_documents IS 'Instances of fiscal documents created by company.';
CREATE INDEX idx_created_docs_company ON created_fiscal_documents(company_id);

-- =====================================================================
-- STEP 12: CREATE ACCOUNTING & FINANCIAL TABLES
-- =====================================================================

-- Financial statements (balance sheet, income statement)
CREATE TABLE IF NOT EXISTS financial_statements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exercice        VARCHAR(10) NOT NULL,
  total_assets    NUMERIC(18,2),
  current_assets  NUMERIC(18,2),
  current_liabilities NUMERIC(18,2),
  equity          NUMERIC(18,2),
  operating_expenses NUMERIC(18,2),
  depreciation    NUMERIC(18,2),
  amortization    NUMERIC(18,2),
  interest_expense NUMERIC(18,2),
  taxes_expense   NUMERIC(18,2),
  net_income      NUMERIC(18,2),
  current_inventory NUMERIC(18,2),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE financial_statements IS 'Annual financial statements (balance sheet, P&L).';
ALTER TABLE financial_statements
  ADD CONSTRAINT unique_fs_company_exercice
  UNIQUE (company_id, exercice);

-- Financial KPIs (ratios computed and stored)
CREATE TABLE IF NOT EXISTS financial_kpis (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exercice        VARCHAR(10) NOT NULL,
  periode         VARCHAR(10),
  kpi_code        VARCHAR(50) NOT NULL,
  kpi_label       VARCHAR(100) NOT NULL,
  value           NUMERIC(18,4) NOT NULL,
  calculated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON TABLE financial_kpis IS 'Computed financial ratios and KPIs (margins, ROE, DSO, etc.).';
ALTER TABLE financial_kpis
  ADD CONSTRAINT uq_financial_kpis
  UNIQUE (company_id, exercice, periode, kpi_code);
CREATE INDEX idx_financial_kpis_company ON financial_kpis(company_id);

-- Fiscal rates (tax rates by country and period)
CREATE TABLE IF NOT EXISTS fiscal_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code    VARCHAR(2) NOT NULL,
  tva_normal      NUMERIC(6,4) NOT NULL,
  tva_reduit      NUMERIC(6,4) NOT NULL,
  ibs_rate        NUMERIC(6,4) NOT NULL,
  tap_rate        NUMERIC(6,4) NOT NULL,
  effective_from  DATE NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE fiscal_rates IS 'Tax rates by country and period.';
CREATE INDEX idx_fiscal_rates_country ON fiscal_rates(country_code);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  exercice        VARCHAR(10) NOT NULL,
  total_amount    NUMERIC(18,2) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE budgets IS 'Budget definitions.';

-- Budget lines
CREATE TABLE IF NOT EXISTS budget_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id       UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  label           VARCHAR(100) NOT NULL,
  amount          NUMERIC(18,2) NOT NULL,
  category        VARCHAR(50),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE budget_lines IS 'Detailed budget line items.';

-- =====================================================================
-- STEP 13: CREATE AUDIT & COMPLIANCE TABLES
-- =====================================================================

-- Audit trail (all actions logged)
CREATE TABLE IF NOT EXISTS audit_trail (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(100),
  entity_id       UUID,
  details         JSONB,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE audit_trail IS 'Complete audit log of all critical actions.';
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_trail_date ON audit_trail(created_at);

-- Audit logs (action tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  action          VARCHAR(150) NOT NULL,
  entity_type     VARCHAR(100) NOT NULL,
  entity_id       UUID,
  metadata        JSONB,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE audit_logs IS 'Audit logs with action metadata.';
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Permission audits (access changes logged)
CREATE TABLE IF NOT EXISTS permission_audits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user     UUID REFERENCES users(id) ON DELETE CASCADE,
  permission      VARCHAR(150) NOT NULL,
  action          VARCHAR(20) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE permission_audits IS 'Audit log for permission grants and revokes.';
CREATE INDEX idx_permission_audits_target ON permission_audits(target_user);

-- =====================================================================
-- ENHANCED: DOCUMENT-LEVEL ACCESS CONTROL & USER ACTIVITY TRACKING
-- =====================================================================

-- Document-specific permissions (granular access by document type)
CREATE TABLE IF NOT EXISTS document_access_permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  document_type   VARCHAR(50) NOT NULL, -- 'invoice', 'delivery_note', 'purchase_order', 'purchase_note', 'financial_statement'
  action          VARCHAR(20) NOT NULL, -- 'view', 'create', 'edit', 'delete', 'sign', 'export'
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE document_access_permissions IS 'Role-based access control for specific document types and actions.';
ALTER TABLE document_access_permissions
  ADD CONSTRAINT unique_role_document_action
  UNIQUE(role_id, document_type, action);
CREATE INDEX idx_document_access_role ON document_access_permissions(role_id);
CREATE INDEX idx_document_access_type ON document_access_permissions(document_type);

-- User document access (override or special permissions)
CREATE TABLE IF NOT EXISTS user_document_access (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type   VARCHAR(50) NOT NULL,
  action          VARCHAR(20) NOT NULL,
  granted_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMP,
  justification   TEXT
);
COMMENT ON TABLE user_document_access IS 'Individual user access to documents (overrides or special permissions).';
CREATE INDEX idx_user_document_access_user ON user_document_access(user_id);
CREATE INDEX idx_user_document_access_expires ON user_document_access(expires_at);

-- User activity log (who accessed what, when)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type   VARCHAR(50) NOT NULL, -- 'login', 'logout', 'view', 'create', 'edit', 'delete', 'export', 'sign'
  entity_type     VARCHAR(50),
  entity_id       UUID,
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'success', -- 'success', 'failure', 'denied'
  failure_reason  TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE user_activity_log IS 'Comprehensive user activity tracking for security and compliance.';
CREATE INDEX idx_user_activity_user ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_date ON user_activity_log(created_at);
CREATE INDEX idx_user_activity_type ON user_activity_log(activity_type);

-- =====================================================================
-- STEP 14: CREATE DOCUMENT MANAGEMENT TABLES
-- =====================================================================

-- Documents (file attachments)
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type     VARCHAR(50),
  entity_id       UUID,
  file_name       VARCHAR(255) NOT NULL,
  file_url        TEXT NOT NULL,
  mime_type       VARCHAR(100),
  version         INTEGER NOT NULL DEFAULT 1,
  uploaded_at     TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE documents IS 'File storage with versioning.';
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_company ON documents(company_id);

-- Document templates
CREATE TABLE IF NOT EXISTS document_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  template_type   VARCHAR(50) NOT NULL,
  file_url        TEXT NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE document_templates IS 'Customizable document templates (invoices, proposals, etc.).';

-- =====================================================================
-- STEP 15: CREATE NOTIFICATIONS & PREFERENCES
-- =====================================================================

-- Notifications (in-app, email, SMS)
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  channel         VARCHAR(20) NOT NULL DEFAULT 'inapp',
  title           VARCHAR(200) NOT NULL,
  message         TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at         TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notifications IS 'User notifications (in-app, email, SMS).';
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- Global settings
CREATE TABLE IF NOT EXISTS settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  key             VARCHAR(100) NOT NULL,
  value           TEXT,
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE settings IS 'Global ERP settings per company.';
ALTER TABLE settings
  ADD CONSTRAINT unique_company_key
  UNIQUE(company_id, key);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key             VARCHAR(100) NOT NULL,
  value           TEXT,
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE user_preferences IS 'User-specific preferences (dashboard, notifications).';
ALTER TABLE user_preferences
  ADD CONSTRAINT unique_user_key
  UNIQUE(user_id, key);

-- =====================================================================
-- STEP 16: CREATE WORKFLOW & APPROVAL TABLES
-- =====================================================================

-- Approval requests
CREATE TABLE IF NOT EXISTS approval_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requester_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type     VARCHAR(50),
  entity_id       UUID,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE approval_requests IS 'Approval workflow for purchases, payments, modifications.';

-- Approval steps (workflow stages)
CREATE TABLE IF NOT EXISTS approval_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  approver_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  step_order      INTEGER NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  decided_at      TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE approval_steps IS 'Individual steps in approval workflow.';

-- =====================================================================
-- STEP 17: CREATE AI/ML TABLES
-- =====================================================================

-- AI Models registry
CREATE TABLE IF NOT EXISTS ai_models (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  type            VARCHAR(50) NOT NULL, -- 'forecast', 'scoring', 'nlp', 'anomaly'
  version         VARCHAR(20),
  description     TEXT,
  file_url        TEXT,
  framework       VARCHAR(30) DEFAULT 'pytorch', -- pytorch, sklearn, tensorflow
  input_schema    JSONB,
  output_schema   JSONB,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE ai_models IS 'Catalog of AI models used for forecasting and analysis.';
CREATE INDEX idx_ai_models_type ON ai_models(type);

-- AI Predictions history
CREATE TABLE IF NOT EXISTS ai_predictions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id        UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  entity_type     VARCHAR(50),
  entity_id       UUID,
  input_data      JSONB,
  prediction      JSONB,
  score           NUMERIC(10,6),
  scores          JSONB,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE ai_predictions IS 'History of AI predictions for tracking and analysis.';
CREATE INDEX idx_ai_predictions_model ON ai_predictions(model_id);
CREATE INDEX idx_ai_predictions_entity ON ai_predictions(entity_type, entity_id);
CREATE INDEX idx_ai_predictions_date ON ai_predictions(created_at);

-- AI Training logs
CREATE TABLE IF NOT EXISTS ai_training_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id        UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  started_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMP,
  status          VARCHAR(20) NOT NULL DEFAULT 'running',
  metrics         JSONB,
  config          JSONB,
  trained_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  notes           TEXT
);
COMMENT ON TABLE ai_training_logs IS 'Training history and performance metrics for AI models.';
CREATE INDEX idx_ai_training_logs_model ON ai_training_logs(model_id);

-- Feature store (versioned features for ML)
CREATE TABLE IF NOT EXISTS ai_feature_store (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id        UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  feature_set_name VARCHAR(100) NOT NULL,
  version         VARCHAR(20) NOT NULL,
  features        JSONB NOT NULL,
  source_tables   TEXT,
  hash            VARCHAR(64),
  generated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE ai_feature_store IS 'Versioned feature sets for ML training and prediction.';
ALTER TABLE ai_feature_store
  ADD CONSTRAINT unique_feature_set_version
  UNIQUE(feature_set_name, version, company_id);
CREATE INDEX idx_ai_feature_store_company ON ai_feature_store(company_id);

-- Drift monitoring (data quality tracking)
CREATE TABLE IF NOT EXISTS ai_drift_monitoring (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id        UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  feature_set_name VARCHAR(100) NOT NULL,
  feature_name    VARCHAR(100) NOT NULL,
  window_start    TIMESTAMP NOT NULL,
  window_end      TIMESTAMP NOT NULL,
  ref_distribution JSONB,
  current_distribution JSONB,
  drift_metric    NUMERIC(12,6),
  threshold       NUMERIC(12,6),
  drift_detected  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE ai_drift_monitoring IS 'Data drift detection and monitoring.';
CREATE INDEX idx_ai_drift_feature ON ai_drift_monitoring(feature_set_name, feature_name);

-- =====================================================================
-- STEP 18: CREATE TRIGGERS
-- =====================================================================

-- Trigger: Update invoice item line total before insert/update
CREATE OR REPLACE FUNCTION update_invoice_item_line_total() RETURNS TRIGGER AS $$
BEGIN
  NEW.line_total := ROUND(NEW.quantity * NEW.unit_price * (1 - COALESCE(NEW.remise_pct,0)/100), 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_line_total ON invoice_items;
CREATE TRIGGER trg_update_line_total
  BEFORE INSERT OR UPDATE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_invoice_item_line_total();

COMMENT ON TRIGGER trg_update_line_total ON invoice_items IS 'Auto-calculates line_total from quantity, unit_price, and discount.';

-- Trigger: Update purchase order item line total before insert/update
CREATE OR REPLACE FUNCTION update_purchase_order_item_line_total() RETURNS TRIGGER AS $$
BEGIN
  NEW.line_total := ROUND(NEW.quantity * NEW.unit_price * (1 - COALESCE(NEW.remise_pct,0)/100), 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_po_line_total ON purchase_order_items;
CREATE TRIGGER trg_update_po_line_total
  BEFORE INSERT OR UPDATE ON purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION update_purchase_order_item_line_total();

COMMENT ON TRIGGER trg_update_po_line_total ON purchase_order_items IS 'Auto-calculates line_total in purchase orders.';

-- Trigger: Audit purchase order changes
CREATE OR REPLACE FUNCTION audit_purchase_order_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_trail(user_id, action, entity_type, entity_id, details)
    VALUES (NEW.created_by, TG_OP, 'purchase_order', NEW.id, row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_purchase_order ON purchase_orders;
CREATE TRIGGER trg_audit_purchase_order
  AFTER UPDATE OR DELETE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION audit_purchase_order_change();

COMMENT ON TRIGGER trg_audit_purchase_order ON purchase_orders IS 'Logs all purchase order updates and deletions.';

-- Trigger: Auto-generate barcode for delivery notes if not provided
CREATE OR REPLACE FUNCTION auto_generate_delivery_note_barcode() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.signature_url IS NULL THEN
    NEW.signature_url := 'UNSIGNED-' || NEW.numero;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delivery_note_defaults ON delivery_notes;
CREATE TRIGGER trg_delivery_note_defaults
  BEFORE INSERT ON delivery_notes
  FOR EACH ROW EXECUTE FUNCTION auto_generate_delivery_note_barcode();

COMMENT ON TRIGGER trg_delivery_note_defaults ON delivery_notes IS 'Ensures delivery notes have proper defaults.';

-- Trigger: Log user access to documents
CREATE OR REPLACE FUNCTION log_user_activity() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log(user_id, activity_type, entity_type, entity_id)
    VALUES (CURRENT_USER::UUID, 'view', NEW.entity_type, NEW.entity_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_user_activity IS 'Logs document access for compliance and security.';

-- =====================================================================
-- STEP 19: CREATE STORED PROCEDURES FOR KPI CALCULATIONS
-- =====================================================================

-- =====================================================================
-- STEP 20: PURCHASE & DELIVERY DOCUMENT PROCEDURES
-- =====================================================================

-- Function: Create delivery note from purchase order or invoice
CREATE OR REPLACE FUNCTION creer_bon_livraison(
  p_company_id UUID,
  p_numero VARCHAR,
  p_type VARCHAR,
  p_client_id UUID DEFAULT NULL,
  p_fournisseur_id UUID DEFAULT NULL,
  p_invoice_id UUID DEFAULT NULL,
  p_purchase_order_id UUID DEFAULT NULL,
  p_adresse_livraison TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  dn_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO delivery_notes(
    id, company_id, numero, type, client_id, fournisseur_id, invoice_id, purchase_order_id,
    date_livraison, adresse_livraison, created_by, created_at
  ) VALUES (
    dn_id, p_company_id, p_numero, p_type, p_client_id, p_fournisseur_id, p_invoice_id, p_purchase_order_id,
    CURRENT_DATE, p_adresse_livraison, p_created_by, NOW()
  );
  
  RETURN dn_id;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION creer_bon_livraison IS 'Creates a delivery note (bon de livraison) linked to invoice or purchase order.';

-- Function: Create purchase note from purchase order
CREATE OR REPLACE FUNCTION creer_bon_achat(
  p_company_id UUID,
  p_fournisseur_id UUID,
  p_numero VARCHAR,
  p_purchase_order_id UUID DEFAULT NULL,
  p_montant_ht NUMERIC DEFAULT 0,
  p_tva NUMERIC DEFAULT 0,
  p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  pn_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO purchase_notes(
    id, company_id, fournisseur_id, numero, purchase_order_id,
    date_reception, montant_ht, tva, total_ttc, created_by, created_at
  ) VALUES (
    pn_id, p_company_id, p_fournisseur_id, p_numero, p_purchase_order_id,
    CURRENT_DATE, p_montant_ht, p_tva, p_montant_ht + p_tva, p_created_by, NOW()
  );
  
  RETURN pn_id;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION creer_bon_achat IS 'Creates a purchase note (bon d''achat) from a purchase order.';

-- Function: Create purchase order
CREATE OR REPLACE FUNCTION creer_bon_commande(
  p_company_id UUID,
  p_fournisseur_id UUID,
  p_numero VARCHAR,
  p_date_livraison_prevue DATE DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  po_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO purchase_orders(
    id, company_id, fournisseur_id, numero, date_commande, date_livraison_prevue,
    created_by, created_at
  ) VALUES (
    po_id, p_company_id, p_fournisseur_id, p_numero, CURRENT_DATE, p_date_livraison_prevue,
    p_created_by, NOW()
  );
  
  RETURN po_id;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION creer_bon_commande IS 'Creates a purchase order (bon de commande) for a supplier.';

-- Function: Check document access for user
CREATE OR REPLACE FUNCTION has_document_access(
  p_user_id UUID,
  p_document_type VARCHAR,
  p_action VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN := FALSE;
  user_role_id UUID;
BEGIN
  -- Check if user has role-based permission
  SELECT DISTINCT dp.id INTO has_access
  FROM document_access_permissions dp
  JOIN user_roles ur ON ur.role_id = dp.role_id
  WHERE ur.user_id = p_user_id
    AND dp.document_type = p_document_type
    AND dp.action = p_action
  LIMIT 1;
  
  -- If not, check for direct user permission
  IF NOT has_access THEN
    SELECT TRUE INTO has_access
    FROM user_document_access uda
    WHERE uda.user_id = p_user_id
      AND uda.document_type = p_document_type
      AND uda.action = p_action
      AND (uda.expires_at IS NULL OR uda.expires_at > NOW());
  END IF;
  
  RETURN COALESCE(has_access, FALSE);
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION has_document_access IS 'Checks if a user has permission to perform an action on a document type.';

-- Function: Grant document access to user
CREATE OR REPLACE FUNCTION grant_document_access(
  p_user_id UUID,
  p_document_type VARCHAR,
  p_action VARCHAR,
  p_granted_by UUID,
  p_expires_at TIMESTAMP DEFAULT NULL,
  p_justification TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  access_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO user_document_access(
    id, user_id, document_type, action, granted_by, granted_at, expires_at, justification
  ) VALUES (
    access_id, p_user_id, p_document_type, p_action, p_granted_by, NOW(), p_expires_at, p_justification
  );
  
  INSERT INTO audit_trail(user_id, action, entity_type, entity_id, details)
    VALUES (p_granted_by, 'GRANT', 'user_document_access', access_id, 
            jsonb_build_object('document_type', p_document_type, 'action', p_action));
  
  RETURN access_id;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION grant_document_access IS 'Grants document access to a user with optional expiration.';

-- Function: Calculate EBITDA
CREATE OR REPLACE FUNCTION calculer_ebitda(
  p_company UUID,
  p_exercice_annee TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  ebitda NUMERIC;
BEGIN
  SELECT COALESCE(net_income,0) + COALESCE(interest_expense,0) + COALESCE(taxes_expense,0)
         + COALESCE(amortization,0) + COALESCE(depreciation,0)
    INTO ebitda
  FROM financial_statements
  WHERE company_id = p_company AND exercice = p_exercice_annee;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (p_company, p_exercice_annee, 'global', 'ebitda', 'EBITDA', ebitda, p_user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculer_ebitda IS 'Calculates EBITDA from financial statements.';

-- Function: Calculate ROE (Return on Equity)
CREATE OR REPLACE FUNCTION calculer_roe(
  p_company UUID,
  p_exercice_annee TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  roe NUMERIC;
  ni NUMERIC;
  eq NUMERIC;
BEGIN
  SELECT net_income, equity INTO ni, eq FROM financial_statements
  WHERE company_id = p_company AND exercice = p_exercice_annee;
  
  IF COALESCE(eq,0) > 0 THEN
    roe := ROUND(100 * COALESCE(ni,0) / eq, 2);
  ELSE
    roe := NULL;
  END IF;
  
  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (p_company, p_exercice_annee, 'global', 'roe', 'ROE (%)', roe, p_user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculer_roe IS 'Calculates ROE (Return on Equity) percentage.';

-- Function: Calculate ROA (Return on Assets)
CREATE OR REPLACE FUNCTION calculer_roa(
  p_company UUID,
  p_exercice_annee TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  roa NUMERIC;
  ni NUMERIC;
  ta NUMERIC;
BEGIN
  SELECT net_income, total_assets INTO ni, ta FROM financial_statements
  WHERE company_id = p_company AND exercice = p_exercice_annee;
  
  IF COALESCE(ta,0) > 0 THEN
    roa := ROUND(100 * COALESCE(ni,0) / ta, 2);
  ELSE
    roa := NULL;
  END IF;
  
  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (p_company, p_exercice_annee, 'global', 'roa', 'ROA (%)', roa, p_user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculer_roa IS 'Calculates ROA (Return on Assets) percentage.';

-- Function: Calculate Gross Margin %
CREATE OR REPLACE FUNCTION calculer_marge_brute(
  p_company UUID,
  p_exercice_annee TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  ca NUMERIC;
  cout_achats NUMERIC;
  marge NUMERIC;
BEGIN
  SELECT COALESCE(SUM(montant_ht),0) INTO ca FROM invoices
    WHERE company_id = p_company AND EXTRACT(YEAR FROM date_emission)::TEXT = p_exercice_annee 
    AND statut IN ('validee','payee');

  SELECT COALESCE(SUM(ii.line_total),0) INTO cout_achats FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.company_id = p_company AND EXTRACT(YEAR FROM i.date_emission)::TEXT = p_exercice_annee 
    AND ii.name ILIKE '%achat%';

  IF ca > 0 THEN
    marge := ROUND(100 * (ca - cout_achats) / ca, 2);
  ELSE
    marge := NULL;
  END IF;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (p_company, p_exercice_annee, 'global', 'marge_brute', 'Marge brute (%)', marge, p_user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculer_marge_brute IS 'Calculates gross margin percentage.';

-- Function: Calculate DSO (Days Sales Outstanding)
CREATE OR REPLACE FUNCTION calculer_dso(
  p_company UUID,
  p_exercice_annee TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  ca NUMERIC;
  creances NUMERIC;
  dso NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_ttc),0) INTO ca FROM invoices
    WHERE company_id = p_company AND EXTRACT(YEAR FROM date_emission)::TEXT = p_exercice_annee 
    AND statut IN ('validee','payee');

  SELECT COALESCE(SUM(i.total_ttc) - SUM(p.montant),0) INTO creances
    FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
    WHERE i.company_id = p_company AND EXTRACT(YEAR FROM i.date_emission)::TEXT = p_exercice_annee 
    AND i.statut IN ('validee','payee');

  IF ca > 0 THEN
    dso := ROUND((creances / (ca/365)), 2);
  ELSE
    dso := NULL;
  END IF;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (p_company, p_exercice_annee, 'global', 'dso', 'DSO (jours)', dso, p_user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculer_dso IS 'Calculates Days Sales Outstanding (collection period).';

-- Function: Calculate DPO (Days Payable Outstanding)
CREATE OR REPLACE FUNCTION calculer_dpo(
  p_company UUID,
  p_exercice_annee TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  achats NUMERIC;
  dettes NUMERIC;
  dpo NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_ttc),0) INTO achats FROM expenses
    WHERE company_id = p_company AND EXTRACT(YEAR FROM date_emission)::TEXT = p_exercice_annee;

  SELECT COALESCE(SUM(e.total_ttc) - COALESCE(SUM(ep.montant),0),0) INTO dettes
    FROM expenses e LEFT JOIN expenses_payments ep ON ep.expense_id = e.id
    WHERE e.company_id = p_company AND EXTRACT(YEAR FROM e.date_emission)::TEXT = p_exercice_annee;

  IF COALESCE(achats,0) > 0 THEN
    dpo := ROUND(dettes / (achats/365), 2);
  ELSE
    dpo := NULL;
  END IF;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (p_company, p_exercice_annee, 'global', 'dpo', 'DPO (jours)', dpo, p_user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculer_dpo IS 'Calculates Days Payable Outstanding (payment period).';

-- Function: Calculate Net Margin %
CREATE OR REPLACE FUNCTION calculer_marge_nette(
  p_company UUID,
  p_exercice_annee TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  ca NUMERIC;
  net NUMERIC;
  marge NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_ttc),0) INTO ca FROM invoices
    WHERE company_id = p_company AND EXTRACT(YEAR FROM date_emission)::TEXT = p_exercice_annee 
    AND statut IN ('validee','payee');

  SELECT COALESCE(net_income,0) INTO net FROM financial_statements
    WHERE company_id = p_company AND exercice = p_exercice_annee;

  IF COALESCE(ca,0) > 0 THEN
    marge := ROUND(100 * net / ca, 2);
  ELSE
    marge := NULL;
  END IF;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (p_company, p_exercice_annee, 'global', 'marge_nette', 'Marge nette (%)', marge, p_user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculer_marge_nette IS 'Calculates net margin percentage.';

-- Function: Add AI Prediction record
CREATE OR REPLACE FUNCTION ajouter_prediction_ia(
  p_model_id UUID,
  p_user_id UUID,
  p_company_id UUID,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_input_data JSONB,
  p_prediction JSONB,
  p_score NUMERIC,
  p_scores JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO ai_predictions(id, model_id, user_id, company_id, entity_type, entity_id, input_data, prediction, score, scores, created_at)
  VALUES (new_id, p_model_id, p_user_id, p_company_id, p_entity_type, p_entity_id, p_input_data, p_prediction, p_score, p_scores, NOW());
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION ajouter_prediction_ia IS 'Records an AI prediction in the history.';

-- Function: Finalize training log
CREATE OR REPLACE FUNCTION finaliser_training_ia(
  p_log_id UUID,
  p_status VARCHAR,
  p_metrics JSONB
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_training_logs SET ended_at = NOW(), status = p_status, metrics = p_metrics WHERE id = p_log_id;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION finaliser_training_ia IS 'Finalizes an AI training log with metrics.';

-- =====================================================================
-- STEP 20: CREATE VIEWS FOR FEATURE EXTRACTION
-- =====================================================================

-- View: Client risk features
CREATE OR REPLACE VIEW vw_client_risk_features AS
SELECT c.id AS client_id,
       c.company_id,
       COUNT(i.id) AS total_invoices,
       COALESCE(SUM(i.total_ttc),0) AS total_invoiced,
       COALESCE(SUM(CASE WHEN p.id IS NULL THEN i.total_ttc ELSE 0 END),0) AS outstanding_amount,
       AVG(GREATEST(0, (CURRENT_DATE - i.date_echeance))) FILTER (WHERE i.date_echeance IS NOT NULL) AS avg_days_past_due,
       COUNT(DISTINCT DATE_TRUNC('month', i.date_emission)) AS active_months,
       ROUND(COALESCE(SUM(i.total_ttc) / NULLIF(COUNT(i.id),0),0),2) AS avg_invoice_value
FROM clients c
LEFT JOIN invoices i ON i.client_id = c.id AND i.statut IN ('validee','payee','envoyee')
LEFT JOIN payments p ON p.invoice_id = i.id
GROUP BY c.id, c.company_id;
COMMENT ON VIEW vw_client_risk_features IS 'Client risk features for ML models.';

-- View: Supplier reliability features
CREATE OR REPLACE VIEW vw_supplier_reliability_features AS
SELECT f.id AS fournisseur_id,
       f.company_id,
       COUNT(e.id) AS total_expenses,
       COALESCE(SUM(e.total_ttc),0) AS total_purchased,
       COALESCE(SUM(CASE WHEN ep.id IS NULL THEN e.total_ttc ELSE 0 END),0) AS unpaid_amount,
       AVG(GREATEST(0,(CURRENT_DATE - e.date_echeance))) FILTER (WHERE e.date_echeance IS NOT NULL) AS avg_days_late,
       ROUND(COALESCE(SUM(e.total_ttc) / NULLIF(COUNT(e.id),0),0),2) AS avg_expense_value
FROM fournisseurs f
LEFT JOIN expenses e ON e.vendor_id = f.id
LEFT JOIN expenses_payments ep ON ep.expense_id = e.id
GROUP BY f.id, f.company_id;
COMMENT ON VIEW vw_supplier_reliability_features IS 'Supplier reliability features for ML models.';

-- View: Invoice summary features
CREATE OR REPLACE VIEW vw_invoice_summary_features AS
SELECT company_id,
       DATE_TRUNC('month', date_emission) AS month,
       COUNT(*) AS invoice_count,
       SUM(total_ttc) AS total_monthly_sales,
       SUM(CASE WHEN statut = 'payee' THEN total_ttc ELSE 0 END) AS paid_amount,
       SUM(CASE WHEN statut <> 'payee' THEN total_ttc ELSE 0 END) AS unpaid_amount
FROM invoices
GROUP BY company_id, DATE_TRUNC('month', date_emission);
COMMENT ON VIEW vw_invoice_summary_features IS 'Monthly invoice summary features.';

-- View: Inventory features
CREATE OR REPLACE VIEW vw_inventory_features AS
SELECT company_id,
       DATE_TRUNC('month', movement_date) AS month,
       SUM(CASE WHEN movement_type='in' THEN quantity*unit_cost ELSE 0 END) AS value_in,
       SUM(CASE WHEN movement_type='out' THEN quantity*unit_cost ELSE 0 END) AS value_out,
       COUNT(*) AS movements_count
FROM inventory_movements
GROUP BY company_id, DATE_TRUNC('month', movement_date);
COMMENT ON VIEW vw_inventory_features IS 'Inventory movement features by month.';

-- View: Financial performance features
CREATE OR REPLACE VIEW vw_financial_performance_features AS
SELECT fs.company_id,
       fs.exercice,
       fs.total_assets,
       fs.current_assets,
       fs.current_liabilities,
       fs.equity,
       fs.net_income,
       (SELECT COALESCE(SUM(total_ttc),0) FROM invoices i 
        WHERE i.company_id = fs.company_id AND EXTRACT(YEAR FROM i.date_emission)::text = fs.exercice) AS total_sales,
       (SELECT COALESCE(SUM(total_ttc),0) FROM expenses e 
        WHERE e.company_id = fs.company_id AND EXTRACT(YEAR FROM e.date_emission)::text = fs.exercice) AS total_purchases
FROM financial_statements fs;
COMMENT ON VIEW vw_financial_performance_features IS 'Financial performance features by fiscal year.';

-- =====================================================================
-- STEP 21: INSERT SEED DATA
-- =====================================================================

-- Insert roles
INSERT INTO roles(name, description) VALUES
  ('admin','Administrator with full access'),
  ('comptable','Accountant for transaction processing'),
  ('utilisateur','Standard user access'),
  ('analyste_financier','Full financial analysis and ratio access'),
  ('controleur_gestion','Budget management and forecasting'),
  ('auditeur','Read-only audit access'),
  ('manager','Dashboard and strategic alerts access')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions
INSERT INTO permissions(code, description) VALUES
  ('admin','Administrator role'),
  ('fiscalite-declarations','Access fiscal declarations'),
  ('rapports-basic','Access basic reports'),
  ('comptabilite-read','Read accounting data'),
  ('analyse-financiere-full','Full financial analysis access'),
  ('analyse-ratios','Calculate and view financial ratios'),
  ('analyse-budgets','Access budgets and forecasts'),
  ('audit-read','Read logs and history'),
  ('dashboard-manager','Dashboard and summary access')
ON CONFLICT (code) DO NOTHING;

-- Assign permissions to roles (simplified example)
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('analyse-financiere-full','analyse-ratios','rapports-basic') 
WHERE r.name = 'analyste_financier'
ON CONFLICT DO NOTHING;

-- Insert default admin user (IMPORTANT: Replace password hash before production!)
INSERT INTO users(email, password_hash, first_name, last_name, is_active)
VALUES ('admin@dinarlytics.com', '$2b$10$REPLACE_WITH_BCRYPT_HASH_BEFORE_PRODUCTION', 'Admin', 'User', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert demo company
INSERT INTO companies(name, country_code, currency_code, segment, company_type)
VALUES ('Demo Company', 'DZ', 'DZD', 'micro', 'eurl')
ON CONFLICT (name) DO NOTHING;

-- Assign admin role to admin user
INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'admin@dinarlytics.com' AND r.name = 'admin'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- INSERT DOCUMENT ACCESS PERMISSIONS BY ROLE
-- =====================================================================

-- Admin: full access to all documents
INSERT INTO document_access_permissions(role_id, document_type, action)
SELECT r.id, dt.doc_type, action
FROM roles r
CROSS JOIN (
  VALUES ('invoice'), ('delivery_note'), ('purchase_order'), ('purchase_note'), 
         ('financial_statement'), ('journal_entry'), ('chart_of_accounts')
) dt(doc_type)
CROSS JOIN (
  VALUES ('view'), ('create'), ('edit'), ('delete'), ('sign'), ('export')
) a(action)
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Comptable: manage invoices, purchase notes, journal entries
INSERT INTO document_access_permissions(role_id, document_type, action)
SELECT r.id, doc_type, action
FROM roles r
CROSS JOIN (
  VALUES ('invoice'), ('purchase_note'), ('journal_entry')
) dt(doc_type)
CROSS JOIN (
  VALUES ('view'), ('create'), ('edit'), ('sign')
) a(action)
WHERE r.name = 'comptable'
ON CONFLICT DO NOTHING;

-- Analyste financier: view-only access to financial documents
INSERT INTO document_access_permissions(role_id, document_type, action)
SELECT r.id, doc_type, 'view'
FROM roles r
CROSS JOIN (
  VALUES ('invoice'), ('purchase_note'), ('delivery_note'), 
         ('financial_statement'), ('journal_entry')
) dt(doc_type)
WHERE r.name = 'analyste_financier'
ON CONFLICT DO NOTHING;

-- Manager: view invoices, delivery notes, financial statements
INSERT INTO document_access_permissions(role_id, document_type, action)
SELECT r.id, doc_type, 'view'
FROM roles r
CROSS JOIN (
  VALUES ('invoice'), ('delivery_note'), ('financial_statement')
) dt(doc_type)
WHERE r.name = 'manager'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- INSERT SEED CHART OF ACCOUNTS (Algerian standard)
-- =====================================================================

-- Assets (classes 1-2)
INSERT INTO chart_of_accounts(company_id, account_code, account_label, account_type, category, parent_account_code)
SELECT c.id, code, label, 'asset', category, parent
FROM companies c
CROSS JOIN (
  VALUES 
    ('10', 'Immobilisations incorporelles', 'fixed_asset', NULL),
    ('11', 'Immobilisations corporelles', 'fixed_asset', NULL),
    ('12', 'Dépréciations des immobilisations', 'fixed_asset', NULL),
    ('20', 'Stocks de matières premières', 'current_asset', NULL),
    ('21', 'Stocks de produits finis', 'current_asset', NULL),
    ('30', 'Créances clients', 'current_asset', NULL),
    ('31', 'Créances douteuses', 'current_asset', NULL),
    ('40', 'Comptes courants', 'current_asset', NULL),
    ('50', 'Valeurs mobilières', 'current_asset', NULL),
    ('51', 'Disponibilités', 'current_asset', NULL)
) t(code, label, category, parent)
ON CONFLICT (company_id, account_code) DO NOTHING;

-- Liabilities (classes 3-4)
INSERT INTO chart_of_accounts(company_id, account_code, account_label, account_type, category, parent_account_code)
SELECT c.id, code, label, 'liability', category, parent
FROM companies c
CROSS JOIN (
  VALUES 
    ('40', 'Dettes envers les fournisseurs', 'current_liability', NULL),
    ('41', 'Dettes fiscales (TVA, impôts)', 'current_liability', NULL),
    ('42', 'Dettes envers le personnel', 'current_liability', NULL),
    ('44', 'Dettes diverses', 'current_liability', NULL),
    ('50', 'Emprunts et dettes financières', 'long_term_liability', NULL)
) t(code, label, category, parent)
ON CONFLICT (company_id, account_code) DO NOTHING;

-- Equity (class 1)
INSERT INTO chart_of_accounts(company_id, account_code, account_label, account_type, category, parent_account_code)
SELECT c.id, code, label, 'equity', 'equity', parent
FROM companies c
CROSS JOIN (
  VALUES 
    ('10', 'Capital social', NULL),
    ('11', 'Primes et réserves', NULL),
    ('13', 'Report à nouveau', NULL)
) t(code, label, parent)
ON CONFLICT (company_id, account_code) DO NOTHING;

-- Revenue (class 7)
INSERT INTO chart_of_accounts(company_id, account_code, account_label, account_type, category, parent_account_code)
SELECT c.id, code, label, 'revenue', 'revenue', parent
FROM companies c
CROSS JOIN (
  VALUES 
    ('70', 'Ventes de marchandises', NULL),
    ('71', 'Ventes de services', NULL),
    ('72', 'Sous-traitance', NULL),
    ('75', 'Autres produits d''exploitation', NULL),
    ('76', 'Produits financiers', NULL),
    ('78', 'Produits exceptionnels', NULL)
) t(code, label, parent)
ON CONFLICT (company_id, account_code) DO NOTHING;

-- Expenses (class 6)
INSERT INTO chart_of_accounts(company_id, account_code, account_label, account_type, category, parent_account_code)
SELECT c.id, code, label, 'expense', 'expense', parent
FROM companies c
CROSS JOIN (
  VALUES 
    ('60', 'Achats de marchandises', NULL),
    ('61', 'Matières premières et fournitures', NULL),
    ('62', 'Autres approvisionnements', NULL),
    ('63', 'Transport', NULL),
    ('64', 'Frais de personnel', NULL),
    ('65', 'Autres charges d''exploitation', NULL),
    ('66', 'Charges financières', NULL),
    ('67', 'Impôts et taxes', NULL),
    ('68', 'Charges exceptionnelles', NULL)
) t(code, label, parent)
ON CONFLICT (company_id, account_code) DO NOTHING;

-- =====================================================================
-- STEP 22: FINAL VERIFICATION & STATISTICS
-- =====================================================================

-- Display table count summary
SELECT 
  'Database schema initialization complete!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') AS total_tables,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') AS total_columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') AS total_indexes;

-- =====================================================================
-- NOTES FOR DEPLOYMENT
-- =====================================================================
/*
COMPLETENESS CHECKLIST - ALL REQUIREMENTS MET:

✅ ELECTRONIC SIGNATURES (STEP 10 & ENHANCED)
   - Multiple signature methods: draw, digital_cert, typed, biometric
   - Certificate information storage for digital signatures
   - IP and user agent tracking for security
   - Signature audit trail with lifecycle tracking (created, verified, rejected, revoked)
   - Integration with all documents: invoices, purchase orders, delivery notes, purchase notes

✅ USER ACCESS RIGHTS & PERMISSIONS (STEPS 4 & 13)
   - Role-based access control (RBAC) with users, roles, permissions
   - Document-level access permissions by document type and action
   - User-specific document access with temporary expiration
   - Activity logging for all user actions (login, view, create, edit, delete, sign, export)
   - Permission audit trail tracking all grants/revokes

✅ DOCUMENTS COMPLETE:
   - Factures (Invoices) with signature support
   - Bons de Livraison (Delivery Notes) with barcode tracking
   - Bons d'Achat (Purchase Notes) with conformity status
   - Bons de Commande (Purchase Orders) with supplier link
   
✅ CODES-BARRES (BARCODES)
   - Auto-generated unique barcodes for articles
   - Auto-generated unique barcodes for suppliers/fournisseurs
   - QR codes for all products and suppliers
   - Barcode tracking in delivery note items
   - Barcode conformity status in purchase note items

✅ PLAN COMPTABLE (CHART OF ACCOUNTS) - STEP 11
   - Full accounting chart of accounts with hierarchy
   - Classes 1-7: Assets, Liabilities, Equity, Revenue, Expenses
   - Journal entries with debit/credit tracking
   - Journal entry lines linked to chart of accounts
   - Account balance snapshots by period for reporting
   - Accounting transaction processing

✅ CLIENTS & FOURNISSEURS (CUSTOMERS & SUPPLIERS)
   - Clients table with contact and classification info
   - Fournisseurs table with auto-generated barcodes and QR codes
   - Expense vendors for AP management
   - Complete relationship tracking with invoices and purchase orders

ADDITIONAL FEATURES IMPLEMENTED:
   - Comprehensive audit trail for compliance (GDPR, regulatory)
   - User activity log with IP and user-agent tracking
   - Automatic calculation of invoice line totals
   - Feature store for ML models
   - Drift monitoring for data quality
   - Financial KPIs and ratios storage
   - Budget management with line items
   - Bank reconciliation tracking
   - Document templates and versioning
   - Workflow and approval management
   - Notifications system

BEFORE GOING TO PRODUCTION:
1. Replace all placeholder password hashes with actual bcrypt hashes
2. Configure proper index strategies based on query patterns
3. Set up automated backups
4. Configure replication/failover if needed
5. Run VACUUM ANALYZE to optimize query plans
6. Test data import procedures
7. Set up monitoring and alerting
8. Document any customizations made
9. Create users and assign roles appropriately
10. Configure data retention policies
11. Test signature verification procedures
12. Configure barcode/QR code generation service
13. Set up email notifications
14. Test document access controls

DATABASE STATISTICS:
- Total Tables: 35+ (with documents, signatures, access control, accounting)
- Total Indexes: 50+ (optimized for common queries)
- Total Functions/Procedures: 20+ (KPI calculations, document creation, access control)
- Total Triggers: 5+ (automatic calculations and audit trails)
- Custom Types (ENUMs): 8+ (status, modes, access levels)

TECHNOLOGY STACK:
- Database: PostgreSQL (13+)
- Language: PL/pgSQL
- UUID Generation: gen_random_uuid()
- Encryption: pgcrypto for password hashing
- Signature Methods: Digital certificates (PEM), drawn signatures, biometric support

*/

-- =====================================================================
-- STEP 23: JOURNAL ENTRIES ACCESS CONTROL & AUDIT
-- =====================================================================

-- Enhanced Journal Entries with Access Control per Company & Actor
CREATE TABLE IF NOT EXISTS journal_entry_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- Comptable, Directeur, Auditeur, Directeur Général
  access_level VARCHAR(50) NOT NULL, -- view, create, modify, approve, delete, export
  can_approve BOOLEAN DEFAULT FALSE, -- Permission to approve entries
  approval_signature BYTEA, -- Digital signature of approval
  approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  UNIQUE(company_id, journal_entry_id, user_id, access_level)
);
CREATE INDEX idx_jea_company ON journal_entry_access_control(company_id);
CREATE INDEX idx_jea_entry ON journal_entry_access_control(journal_entry_id);
CREATE INDEX idx_jea_user ON journal_entry_access_control(user_id);

-- Detailed Audit Trail for Journal Entries
CREATE TABLE IF NOT EXISTS journal_entry_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES users(id),
  actor_name VARCHAR(255),
  actor_role VARCHAR(50),
  action VARCHAR(100), -- created, modified, approved, rejected, posted, deleted, exported
  old_values JSONB, -- Previous values for audit
  new_values JSONB, -- New values
  modification_reason TEXT, -- Reason for modification
  approval_reason TEXT, -- Reason for approval/rejection
  amount_modified NUMERIC, -- Amount changed
  affected_accounts JSONB[], -- Array of affected GL accounts
  ip_address INET,
  user_agent TEXT,
  audit_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  compliance_status VARCHAR(50) -- compliant, flagged, under_review
);
CREATE INDEX idx_jea_journal_entry ON journal_entry_audit_trail(journal_entry_id);
CREATE INDEX idx_jea_company ON journal_entry_audit_trail(company_id);
CREATE INDEX idx_jea_actor ON journal_entry_audit_trail(actor_id);
CREATE INDEX idx_jea_timestamp ON journal_entry_audit_trail(audit_timestamp);

-- =====================================================================
-- STEP 24: FINANCIAL CALCULATIONS (HTT, TVA, PCA, TTC)
-- =====================================================================

-- Enhanced Invoice Items with all calculations
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS
  unit_price_htt NUMERIC(15,2) NOT NULL DEFAULT 0, -- Hors Taxes (Net Price)
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS
  tva_rate NUMERIC(5,2) NOT NULL DEFAULT 19, -- TVA % (19% standard Algeria)
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS
  tva_amount NUMERIC(15,2) NOT NULL DEFAULT 0, -- TVA amount
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS
  total_ttc NUMERIC(15,2) NOT NULL DEFAULT 0, -- Total TTC
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS
  discount_type VARCHAR(20) DEFAULT 'percentage', -- percentage, fixed, tiered
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS
  discount_value NUMERIC(15,2) DEFAULT 0;

-- Enhanced Invoices with Totals
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS
  total_htt NUMERIC(15,2) NOT NULL DEFAULT 0, -- Total Hors Taxes
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS
  total_tva NUMERIC(15,2) NOT NULL DEFAULT 0, -- Total TVA
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS
  total_discount NUMERIC(15,2) DEFAULT 0, -- Total discount
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS
  total_ttc NUMERIC(15,2) NOT NULL DEFAULT 0, -- Total TTC
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS
  currency_code VARCHAR(3) DEFAULT 'DZD'; -- Algerian Dinar

-- Purchase Price Analysis (PCA) Table
CREATE TABLE IF NOT EXISTS purchase_price_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES fournisseurs(id) ON DELETE CASCADE,
  purchase_date DATE NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL, -- Price from supplier
  quantity NUMERIC(10,3) NOT NULL,
  total_cost NUMERIC(15,2) NOT NULL,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  shipping_cost NUMERIC(15,2) DEFAULT 0,
  actual_cost NUMERIC(15,2) NOT NULL, -- Final cost with all additions
  cost_per_unit NUMERIC(15,2) GENERATED ALWAYS AS (actual_cost / NULLIF(quantity,0)) STORED,
  previous_cost NUMERIC(15,2), -- Previous supplier price
  cost_variance NUMERIC(15,2), -- Price difference from last purchase
  cost_variance_percentage NUMERIC(5,2), -- % change from last purchase
  supplier_reliability_score NUMERIC(3,2), -- 1.0 to 5.0
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, article_id, supplier_id, purchase_date)
);
CREATE INDEX idx_pca_company ON purchase_price_analysis(company_id);
CREATE INDEX idx_pca_article ON purchase_price_analysis(article_id);
CREATE INDEX idx_pca_supplier ON purchase_price_analysis(supplier_id);

-- Expense Items with same calculation structure
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS
  total_htt NUMERIC(15,2) NOT NULL DEFAULT 0,
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS
  total_tva NUMERIC(15,2) NOT NULL DEFAULT 0,
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS
  total_ttc NUMERIC(15,2) NOT NULL DEFAULT 0;

-- =====================================================================
-- STEP 25: KPI DEFINITIONS & FINANCIAL INDICATORS
-- =====================================================================

-- KPI Definitions per company and role
CREATE TABLE IF NOT EXISTS kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  kpi_code VARCHAR(50) NOT NULL, -- EBITDA, ROE, ROA, GROSS_MARGIN, NET_MARGIN, DSO, DPO
  kpi_name VARCHAR(255) NOT NULL,
  kpi_description TEXT,
  category VARCHAR(50), -- Profitability, Liquidity, Efficiency, Leverage
  formula TEXT, -- SQL formula or description
  target_value NUMERIC(15,2),
  min_threshold NUMERIC(15,2), -- Alert if below
  max_threshold NUMERIC(15,2), -- Alert if above
  calculation_frequency VARCHAR(50) DEFAULT 'monthly', -- monthly, quarterly, yearly
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, kpi_code)
);
CREATE INDEX idx_kpi_company ON kpi_definitions(company_id);

-- KPI Values & History
CREATE TABLE IF NOT EXISTS kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  kpi_id UUID NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
  exercice VARCHAR(4) NOT NULL, -- Fiscal year
  periode VARCHAR(20), -- Period (month/quarter/year)
  value NUMERIC(15,2),
  target_value NUMERIC(15,2),
  variance NUMERIC(15,2), -- Difference from target
  variance_percentage NUMERIC(5,2),
  status VARCHAR(50), -- OK, WARNING, CRITICAL
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  calculated_by UUID REFERENCES users(id),
  notes TEXT,
  UNIQUE(company_id, kpi_id, exercice, periode)
);
CREATE INDEX idx_kpiv_company ON kpi_values(company_id);
CREATE INDEX idx_kpiv_kpi ON kpi_values(kpi_id);
CREATE INDEX idx_kpiv_exercice ON kpi_values(exercice);

-- Financial Indicators per account/category
CREATE TABLE IF NOT EXISTS financial_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exercice VARCHAR(4) NOT NULL,
  periode VARCHAR(20), -- m01, m02, ..., q1, q2, etc.
  account_code VARCHAR(50), -- GL account
  account_name VARCHAR(255),
  category VARCHAR(100), -- Revenue, Expenses, Assets, etc.
  opening_balance NUMERIC(15,2),
  debit_movements NUMERIC(15,2) DEFAULT 0,
  credit_movements NUMERIC(15,2) DEFAULT 0,
  closing_balance NUMERIC(15,2),
  variance_from_budget NUMERIC(15,2),
  variance_percentage NUMERIC(5,2),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, exercice, periode, account_code)
);
CREATE INDEX idx_fi_company ON financial_indicators(company_id);
CREATE INDEX idx_fi_account ON financial_indicators(account_code);

-- =====================================================================
-- STEP 26: ALERTS & NOTIFICATIONS SYSTEM
-- =====================================================================

-- Alert Definitions
CREATE TABLE IF NOT EXISTS alert_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  alert_code VARCHAR(100) NOT NULL,
  alert_name VARCHAR(255) NOT NULL,
  alert_description TEXT,
  alert_type VARCHAR(50), -- financial, compliance, operational, security
  trigger_condition VARCHAR(500), -- Condition description
  threshold_value NUMERIC(15,2), -- Alert threshold
  comparison_operator VARCHAR(10), -- <, >, <=, >=, =, !=
  severity_level VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
  affected_roles VARCHAR(255)[], -- Roles to notify
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  UNIQUE(company_id, alert_code)
);
CREATE INDEX idx_alert_company ON alert_definitions(company_id);

-- Alert Triggers & History
CREATE TABLE IF NOT EXISTS alert_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES alert_definitions(id) ON DELETE CASCADE,
  trigger_value NUMERIC(15,2), -- Actual value that triggered alert
  trigger_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  triggered_by_user_id UUID REFERENCES users(id),
  triggered_by_source VARCHAR(100), -- invoice, expense, journal_entry, etc.
  source_id UUID, -- ID of triggering record
  status VARCHAR(50) DEFAULT 'new', -- new, acknowledged, resolved, ignored
  acknowledged_by_user_id UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  resolution_notes TEXT,
  priority VARCHAR(50) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_alert_trigger_company ON alert_triggers(company_id);
CREATE INDEX idx_alert_trigger_alert ON alert_triggers(alert_id);
CREATE INDEX idx_alert_trigger_status ON alert_triggers(status);

-- User Notifications
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  notification_type VARCHAR(100), -- alert, approval_request, document_shared, signature_required
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_alert_id UUID REFERENCES alert_definitions(id),
  related_entry_id UUID, -- journal_entry, invoice, etc.
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  notification_channel VARCHAR(50) DEFAULT 'in_app', -- in_app, email, sms
  priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
  action_required BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days'
);
CREATE INDEX idx_notif_user ON user_notifications(user_id);
CREATE INDEX idx_notif_company ON user_notifications(company_id);
CREATE INDEX idx_notif_is_read ON user_notifications(is_read);
CREATE INDEX idx_notif_created ON user_notifications(created_at);

-- Notification Preferences per User
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL,
  enable_in_app BOOLEAN DEFAULT TRUE,
  enable_email BOOLEAN DEFAULT TRUE,
  enable_sms BOOLEAN DEFAULT FALSE,
  frequency VARCHAR(50) DEFAULT 'immediate', -- immediate, daily, weekly, digest
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, company_id, notification_type)
);
CREATE INDEX idx_notif_pref_user ON notification_preferences(user_id);

-- =====================================================================
-- STEP 27: APPROVAL WORKFLOW & SIGN-OFF
-- =====================================================================

-- Approval Workflow for Journal Entries
CREATE TABLE IF NOT EXISTS journal_entry_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  approval_level INT NOT NULL, -- 1: Comptable, 2: Supervisor, 3: Manager, 4: Director
  approver_id UUID NOT NULL REFERENCES users(id),
  approver_role VARCHAR(50) NOT NULL,
  required BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  approval_date TIMESTAMP,
  rejection_reason TEXT,
  digital_signature BYTEA, -- Digital signature
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(journal_entry_id, approval_level, approver_id)
);
CREATE INDEX idx_ja_company ON journal_entry_approvals(company_id);
CREATE INDEX idx_ja_entry ON journal_entry_approvals(journal_entry_id);
CREATE INDEX idx_ja_approver ON journal_entry_approvals(approver_id);
CREATE INDEX idx_ja_status ON journal_entry_approvals(status);

-- Reconciliation & Sign-off Table
CREATE TABLE IF NOT EXISTS accounting_signoff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exercice VARCHAR(4) NOT NULL,
  periode VARCHAR(20), -- Month or quarter
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  prepared_by_id UUID NOT NULL REFERENCES users(id),
  prepared_date TIMESTAMP,
  reviewed_by_id UUID REFERENCES users(id),
  reviewed_date TIMESTAMP,
  approved_by_id UUID REFERENCES users(id),
  approved_date TIMESTAMP,
  signoff_status VARCHAR(50) DEFAULT 'draft', -- draft, prepared, reviewed, approved, finalized
  total_journal_entries INT,
  total_amount_debits NUMERIC(15,2),
  total_amount_credits NUMERIC(15,2),
  balance_check_passed BOOLEAN,
  reconciliation_notes TEXT,
  approval_signature BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, exercice, periode)
);
CREATE INDEX idx_signoff_company ON accounting_signoff(company_id);

-- =====================================================================
-- STEP 28: CALCULATION FUNCTIONS
-- =====================================================================

-- Function: Calculate HTT, TVA, TTC for Invoice Items
CREATE OR REPLACE FUNCTION calculate_invoice_item_totals(
  p_item_id UUID
) RETURNS VOID AS $$
DECLARE
  v_qty NUMERIC;
  v_unit_price NUMERIC;
  v_discount_type VARCHAR;
  v_discount_value NUMERIC;
  v_tva_rate NUMERIC;
  v_htt NUMERIC;
  v_tva NUMERIC;
  v_ttc NUMERIC;
BEGIN
  SELECT quantity, unit_price_htt, discount_type, discount_value, tva_rate
  INTO v_qty, v_unit_price, v_discount_type, v_discount_value, v_tva_rate
  FROM invoice_items WHERE id = p_item_id;

  -- Calculate HTT before discount
  v_htt := v_qty * v_unit_price;
  
  -- Apply discount
  IF v_discount_type = 'percentage' THEN
    v_htt := v_htt * (1 - v_discount_value / 100);
  ELSIF v_discount_type = 'fixed' THEN
    v_htt := v_htt - v_discount_value;
  END IF;

  -- Calculate TVA
  v_tva := v_htt * (v_tva_rate / 100);
  
  -- Calculate TTC
  v_ttc := v_htt + v_tva;

  -- Update item
  UPDATE invoice_items SET
    unit_price_htt = v_htt / NULLIF(v_qty, 0),
    tva_amount = v_tva,
    total_ttc = v_ttc
  WHERE id = p_item_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Invoice Totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals(
  p_invoice_id UUID
) RETURNS VOID AS $$
DECLARE
  v_total_htt NUMERIC;
  v_total_tva NUMERIC;
  v_total_ttc NUMERIC;
BEGIN
  SELECT 
    COALESCE(SUM(unit_price_htt * quantity), 0),
    COALESCE(SUM(tva_amount), 0),
    COALESCE(SUM(total_ttc), 0)
  INTO v_total_htt, v_total_tva, v_total_ttc
  FROM invoice_items
  WHERE invoice_id = p_invoice_id;

  UPDATE invoices SET
    total_htt = v_total_htt,
    total_tva = v_total_tva,
    total_ttc = v_total_ttc
  WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Purchase Price Analysis
CREATE OR REPLACE FUNCTION analyze_purchase_price(
  p_supplier_id UUID,
  p_article_id UUID,
  p_company_id UUID,
  p_unit_price NUMERIC,
  p_quantity NUMERIC
) RETURNS TABLE(cost_per_unit NUMERIC, variance_percentage NUMERIC, reliability_score NUMERIC) AS $$
DECLARE
  v_previous_cost NUMERIC;
  v_actual_cost NUMERIC;
  v_variance NUMERIC;
  v_variance_pct NUMERIC;
  v_reliability NUMERIC;
BEGIN
  -- Get previous cost
  SELECT actual_cost / NULLIF(quantity, 0) INTO v_previous_cost
  FROM purchase_price_analysis
  WHERE supplier_id = p_supplier_id AND article_id = p_article_id
  ORDER BY purchase_date DESC LIMIT 1;

  v_actual_cost := p_unit_price * p_quantity;
  
  IF v_previous_cost IS NOT NULL THEN
    v_variance := v_actual_cost - v_previous_cost;
    v_variance_pct := (v_variance / v_previous_cost) * 100;
  ELSE
    v_variance := 0;
    v_variance_pct := 0;
  END IF;

  -- Calculate supplier reliability (placeholder - should use actual delivery metrics)
  v_reliability := 4.5;

  RETURN QUERY SELECT v_actual_cost / NULLIF(p_quantity, 0), v_variance_pct, v_reliability;
END;
$$ LANGUAGE plpgsql;

-- Function: Check & Trigger Alerts
CREATE OR REPLACE FUNCTION check_and_trigger_alerts(
  p_company_id UUID,
  p_alert_id UUID,
  p_value NUMERIC,
  p_source_id UUID,
  p_source_type VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_alert RECORD;
  v_should_trigger BOOLEAN DEFAULT FALSE;
  v_alert_trigger_id UUID;
BEGIN
  SELECT * INTO v_alert FROM alert_definitions WHERE id = p_alert_id;
  
  IF v_alert IS NULL THEN RETURN FALSE; END IF;

  -- Check condition
  CASE v_alert.comparison_operator
    WHEN '<' THEN v_should_trigger := p_value < v_alert.threshold_value;
    WHEN '>' THEN v_should_trigger := p_value > v_alert.threshold_value;
    WHEN '<=' THEN v_should_trigger := p_value <= v_alert.threshold_value;
    WHEN '>=' THEN v_should_trigger := p_value >= v_alert.threshold_value;
    WHEN '=' THEN v_should_trigger := p_value = v_alert.threshold_value;
    WHEN '!=' THEN v_should_trigger := p_value != v_alert.threshold_value;
  END CASE;

  IF v_should_trigger THEN
    -- Create alert trigger
    INSERT INTO alert_triggers(company_id, alert_id, trigger_value, triggered_by_source, source_id, status, priority)
    VALUES (p_company_id, p_alert_id, p_value, p_source_type, p_source_id, 'new', v_alert.severity_level)
    RETURNING id INTO v_alert_trigger_id;

    -- Create notifications for affected roles
    -- TODO: Implement notification logic based on affected_roles

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function: Create Notification for User
CREATE OR REPLACE FUNCTION create_user_notification(
  p_user_id UUID,
  p_company_id UUID,
  p_notification_type VARCHAR,
  p_subject VARCHAR,
  p_message TEXT,
  p_priority VARCHAR DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO user_notifications(
    user_id, company_id, notification_type, subject, message, priority, action_url
  ) VALUES (
    p_user_id, p_company_id, p_notification_type, p_subject, p_message, p_priority, p_action_url
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- STEP 29: TRIGGERS FOR AUTOMATIC CALCULATIONS
-- =====================================================================

-- Trigger: Calculate item totals when inserted/updated
CREATE OR REPLACE FUNCTION trg_calculate_invoice_item_totals() RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_invoice_item_totals(NEW.id);
  PERFORM calculate_invoice_totals(NEW.invoice_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_item_calculation
AFTER INSERT OR UPDATE ON invoice_items
FOR EACH ROW EXECUTE FUNCTION trg_calculate_invoice_item_totals();

-- Trigger: Audit Journal Entry Changes
CREATE OR REPLACE FUNCTION trg_audit_journal_entry_change() RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_user_role VARCHAR;
BEGIN
  -- Get current user from session
  SELECT user_id INTO v_user_id FROM user_sessions WHERE active = TRUE LIMIT 1;
  
  IF v_user_id IS NULL THEN v_user_id := NEW.created_by; END IF;

  INSERT INTO journal_entry_audit_trail(
    journal_entry_id, company_id, actor_id, action, old_values, new_values,
    affected_accounts, compliance_status
  ) VALUES (
    NEW.id, NEW.company_id, v_user_id, 'modified',
    to_jsonb(OLD), to_jsonb(NEW),
    ARRAY[to_jsonb(NEW.debit_account), to_jsonb(NEW.credit_account)],
    'compliant'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_journal_entry_audit
BEFORE UPDATE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION trg_audit_journal_entry_change();

-- =====================================================================
-- STEP 30: SEED DATA - ALERTS, KPIs, NOTIFICATION PREFERENCES
-- =====================================================================

-- Insert Default Alert Definitions
INSERT INTO alert_definitions(company_id, alert_code, alert_name, alert_description, alert_type, threshold_value, comparison_operator, severity_level, affected_roles) VALUES
  ('00000000-0000-0000-0000-000000000000'::UUID, 'LOW_CASH', 'Cash Level Critical', 'Triggered when available cash is below threshold', 'financial', 10000000, '<', 'critical', ARRAY['Directeur Général', 'Trésorier']),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'HIGH_DSO', 'High Days Sales Outstanding', 'Invoice collection period exceeds target', 'financial', 60, '>', 'high', ARRAY['Comptable', 'Manager Commercial']),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'BUDGET_VARIANCE', 'Budget Variance Exceeded', 'Actual exceeds budget by threshold', 'financial', 10, '>', 'medium', ARRAY['Comptable', 'Manager']),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'DUPLICATE_ENTRY', 'Duplicate Journal Entry', 'Same amount/account in short timeframe', 'compliance', 0, '=', 'high', ARRAY['Auditeur', 'Comptable Senior']),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'APPROVAL_PENDING', 'Approvals Pending', 'Journal entries awaiting approval > 5 days', 'operational', 5, '>', 'medium', ARRAY['Superviseur', 'Manager']),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'PRICE_VARIANCE', 'Purchase Price Variance', 'Purchase price varies > 5% from average', 'financial', 5, '>', 'medium', ARRAY['Comptable', 'Achat Manager'])
ON CONFLICT DO NOTHING;

-- Insert Default KPI Definitions
INSERT INTO kpi_definitions(company_id, kpi_code, kpi_name, kpi_description, category, target_value, min_threshold, max_threshold, calculation_frequency) VALUES
  ('00000000-0000-0000-0000-000000000000'::UUID, 'EBITDA', 'EBITDA', 'Earnings Before Interest, Taxes, Depreciation', 'Profitability', 1000000, 500000, NULL, 'monthly'),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'ROE', 'Return on Equity', 'Net Income / Shareholder Equity', 'Profitability', 15, 5, NULL, 'quarterly'),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'ROA', 'Return on Assets', 'Net Income / Total Assets', 'Profitability', 10, 3, NULL, 'quarterly'),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'GROSS_MARGIN', 'Gross Margin %', '(Revenue - COGS) / Revenue', 'Profitability', 40, 20, NULL, 'monthly'),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'NET_MARGIN', 'Net Profit Margin %', 'Net Income / Revenue', 'Profitability', 15, 5, NULL, 'monthly'),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'DSO', 'Days Sales Outstanding', 'Collection period in days', 'Efficiency', 45, NULL, 90, 'monthly'),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'DPO', 'Days Payable Outstanding', 'Payment period in days', 'Efficiency', 60, NULL, 120, 'monthly'),
  ('00000000-0000-0000-0000-000000000000'::UUID, 'CURRENT_RATIO', 'Current Ratio', 'Current Assets / Current Liabilities', 'Liquidity', 1.5, 1.0, NULL, 'monthly')
ON CONFLICT DO NOTHING;

-- Insert Default Notification Preferences for Admin Role
-- (Users will have personalized preferences)

*/

-- =====================================================================
-- End of Database Schema Initialization
-- =====================================================================
