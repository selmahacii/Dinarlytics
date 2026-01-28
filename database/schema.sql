-- ============================================================================
-- DINARLYTICS : UNIFIED ERP SCHEMA (ALGERIAN COMPLIANCE)
-- This schema includes Core ERP, AI Modules, and Comprehensive Audit Trail.
-- ============================================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EXTENSIONS & IDENTITY
-- ========================

CREATE TABLE IF NOT EXISTS companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  tax_number      VARCHAR(50) UNIQUE,
  registration_number VARCHAR(50) UNIQUE,
  address         TEXT,
  phone           VARCHAR(50),
  email           VARCHAR(255),
  country_code    VARCHAR(2) DEFAULT 'DZ',
  currency_code   VARCHAR(3) DEFAULT 'DZD',
  segment         VARCHAR(50) DEFAULT 'micro', -- 'micro', 'small', 'medium', 'large'
  company_type    VARCHAR(50) DEFAULT 'sarl',  -- 'eurl', 'sarl', 'spa', 'snc'
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  username        VARCHAR(255) UNIQUE NOT NULL,
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  last_login      TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(50) UNIQUE NOT NULL,
  description     TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 2. ACCOUNTING & FINANCIALS
-- ==========================

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  account_code    VARCHAR(50) NOT NULL,
  account_name    VARCHAR(255) NOT NULL,
  account_class   INTEGER, -- 1-7 (Algerian SCF)
  account_type    VARCHAR(50), -- 'asset', 'liability', 'equity', 'revenue', 'expense'
  status          VARCHAR(20) DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, account_code)
);

CREATE TABLE IF NOT EXISTS financial_statements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exercice        VARCHAR(10) NOT NULL, -- e.g., '2025'
  period          VARCHAR(20),          -- 'Q1', 'Jan'...
  total_assets    NUMERIC(18,2) DEFAULT 0,
  total_liabilities NUMERIC(18,2) DEFAULT 0,
  equity          NUMERIC(18,2) DEFAULT 0,
  revenue         NUMERIC(18,2) DEFAULT 0,
  expenses        NUMERIC(18,2) DEFAULT 0,
  net_income      NUMERIC(18,2) DEFAULT 0,
  operating_cash_flow NUMERIC(18,2) DEFAULT 0,
  inventory_value NUMERIC(18,2) DEFAULT 0,
  is_closed       BOOLEAN DEFAULT FALSE,
  closed_at       TIMESTAMP,
  closed_by       UUID REFERENCES users(id),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, exercice, period)
);

-- 3. INVENTORY & SALES
-- ====================

CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(50),
  address         TEXT,
  tax_number      VARCHAR(50),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fournisseurs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(50),
  address         TEXT,
  tax_number      VARCHAR(50),
  barcode         VARCHAR(64) UNIQUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code            VARCHAR(100) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  unit            VARCHAR(20) DEFAULT 'unit',
  unit_price      NUMERIC(18,2) DEFAULT 0,
  tax_rate        NUMERIC(5,2) DEFAULT 19.0, -- Standard Algerian TVA
  barcode         VARCHAR(64) UNIQUE,
  stock_quantity  NUMERIC(18,3) DEFAULT 0,
  min_stock       NUMERIC(18,3) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id),
  type            VARCHAR(20) DEFAULT 'sale', -- 'sale', 'purchase'
  numero          VARCHAR(50) NOT NULL,
  date_emission   DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance   DATE,
  total_ht        NUMERIC(18,2) DEFAULT 0,
  total_tva       NUMERIC(18,2) DEFAULT 0,
  total_ttc       NUMERIC(18,2) DEFAULT 0,
  statut          VARCHAR(20) DEFAULT 'draft', -- 'draft', 'validated', 'paid', 'cancelled'
  payment_method  VARCHAR(50),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, numero)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  article_id      UUID REFERENCES articles(id),
  description     TEXT,
  quantity        NUMERIC(18,3) NOT NULL,
  unit_price      NUMERIC(18,2) NOT NULL,
  tva_rate        NUMERIC(5,2) DEFAULT 19.0,
  line_total_ht   NUMERIC(18,2) NOT NULL,
  line_total_ttc  NUMERIC(18,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id      UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount          NUMERIC(18,2) NOT NULL,
  payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  mode            VARCHAR(50) DEFAULT 'bank_transfer', -- 'cash', 'check', 'bank_transfer'
  reference       VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- 4. ARTIFICIAL INTELLIGENCE & ANALYTICS
-- ======================================

CREATE TABLE IF NOT EXISTS ai_models (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL UNIQUE,
  type            VARCHAR(50), -- 'scoring', 'forecasting', 'anomaly'
  version         VARCHAR(20),
  framework       VARCHAR(50) DEFAULT 'pytorch',
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_predictions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id        UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  entity_type     VARCHAR(50), -- 'invoice', 'client', 'company'
  entity_id       UUID,
  input_data      JSONB,
  prediction      JSONB,
  confidence      NUMERIC(5,4),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- 5. AUDIT & LOGGING (COMPREHENSIVE)
-- =================================

CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID, -- Can be NULL for system actions
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  action          VARCHAR(100) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', etc.
  entity_type     VARCHAR(100), -- 'invoice', 'payment', etc.
  entity_id       UUID,
  old_values      JSONB,
  new_values      JSONB,
  ip_address      VARCHAR(45),
  user_agent      VARCHAR(500),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- 6. TRIGGERS & AUTO-CALCULATIONS (Correctness & Spans)
-- ====================================================

-- Function to update invoice totals automatically
CREATE OR REPLACE FUNCTION update_invoice_totals() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE invoices 
    SET 
      total_ht = COALESCE((SELECT SUM(line_total_ht) FROM invoice_items WHERE invoice_id = OLD.invoice_id), 0),
      total_ttc = COALESCE((SELECT SUM(line_total_ttc) FROM invoice_items WHERE invoice_id = OLD.invoice_id), 0),
      total_tva = COALESCE((SELECT SUM(line_total_ttc - line_total_ht) FROM invoice_items WHERE invoice_id = OLD.invoice_id), 0),
      updated_at = NOW()
    WHERE id = OLD.invoice_id;
    RETURN OLD;
  ELSE
    UPDATE invoices 
    SET 
      total_ht = COALESCE((SELECT SUM(line_total_ht) FROM invoice_items WHERE invoice_id = NEW.invoice_id), 0),
      total_ttc = COALESCE((SELECT SUM(line_total_ttc) FROM invoice_items WHERE invoice_id = NEW.invoice_id), 0),
      total_tva = COALESCE((SELECT SUM(line_total_ttc - line_total_ht) FROM invoice_items WHERE invoice_id = NEW.invoice_id), 0),
      updated_at = NOW()
    WHERE id = NEW.invoice_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_invoice_totals
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- Generic Audit Trigger Function (The "Spans" for Traceability)
CREATE OR REPLACE FUNCTION audit_generic_trigger() RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
BEGIN
    -- Attempt to get user_id from session (standard practice in Postgres ERPs)
    BEGIN
        v_user_id := current_setting('app.current_user_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- Attempt to get company_id
    IF (TG_OP = 'DELETE') THEN
        BEGIN v_company_id := OLD.company_id; EXCEPTION WHEN OTHERS THEN v_company_id := NULL; END;
    ELSE
        BEGIN v_company_id := NEW.company_id; EXCEPTION WHEN OTHERS THEN v_company_id := NULL; END;
    END IF;

    INSERT INTO audit_log (
        user_id, company_id, action, entity_type, entity_id, 
        old_values, new_values, created_at
    ) VALUES (
        v_user_id,
        v_company_id,
        TG_OP,
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD)::JSONB END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW)::JSONB END,
        NOW()
    );
    
    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE OR REPLACE TRIGGER trg_audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION audit_generic_trigger();
CREATE OR REPLACE TRIGGER trg_audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION audit_generic_trigger();
CREATE OR REPLACE TRIGGER trg_audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_generic_trigger();
CREATE OR REPLACE TRIGGER trg_audit_articles AFTER INSERT OR UPDATE OR DELETE ON articles FOR EACH ROW EXECUTE FUNCTION audit_generic_trigger();
CREATE OR REPLACE TRIGGER trg_audit_coa AFTER INSERT OR UPDATE OR DELETE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION audit_generic_trigger();
