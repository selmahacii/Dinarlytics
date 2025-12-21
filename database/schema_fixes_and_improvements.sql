-- =====================================================================
-- SCHEMA DINARLYTICS - CORRECTIONS ET AMÉLIORATIONS
-- =====================================================================
-- Ce fichier corrige les incohérences et ajoute les éléments manquants

-- 1. STANDARDISATION DES IDs (UUID partout)
-- =====================================================================

-- Ajouter UUID extension si absente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. CORRECTIONS TABLE COMPANIES
-- =====================================================================
-- Si companies utilise SERIAL au lieu d'UUID, créer une nouvelle version:

ALTER TABLE companies ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT gen_random_uuid() UNIQUE;
-- Ou recréer complètement:
-- DROP TABLE IF EXISTS companies CASCADE;
-- CREATE TABLE companies (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) NOT NULL,
--   siret VARCHAR(20) UNIQUE,
--   address TEXT,
--   email VARCHAR(255),
--   phone VARCHAR(50),
--   is_active BOOLEAN NOT NULL DEFAULT TRUE,
--   fiscal_regime VARCHAR(50), -- 'micro', 'reel_simple', 'reel_normal'
--   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
--   updated_at TIMESTAMP NOT NULL DEFAULT NOW()
-- );
-- CREATE INDEX idx_companies_siret ON companies(siret);
-- CREATE INDEX idx_companies_active ON companies(is_active);

-- 3. AMÉLIORATIONS TABLE USERS
-- =====================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- 4. TABLE ROLES (manquante)
-- =====================================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, code)
);
CREATE INDEX IF NOT EXISTS idx_roles_company ON roles(company_id);
COMMENT ON TABLE roles IS 'Rôles d\'accès (admin, comptable, analyste, manager, etc.)';

-- Insérer les rôles par défaut
INSERT INTO roles (code, name, description) VALUES
  ('admin', 'Administrateur', 'Accès complet à tous les modules'),
  ('comptable', 'Comptable', 'Accès complète à la comptabilité'),
  ('analyste_financier', 'Analyste Financier', 'Accès aux rapports et analyses'),
  ('manager', 'Manager', 'Accès limité aux ventes et achats'),
  ('employe', 'Employé', 'Accès basique aux modules autorisés'),
  ('client', 'Client', 'Accès aux factures et documents propres')
ON CONFLICT DO NOTHING;

-- 5. TABLE PERMISSIONS (manquante)
-- =====================================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  module VARCHAR(50),
  action VARCHAR(50), -- read, create, edit, delete, export, sign
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE permissions IS 'Permissions granulaires disponibles';

-- Insérer les permissions par défaut
INSERT INTO permissions (code, name, module, action) VALUES
  ('invoices-read', 'Voir les factures', 'invoices', 'read'),
  ('invoices-create', 'Créer des factures', 'invoices', 'create'),
  ('invoices-edit', 'Modifier les factures', 'invoices', 'edit'),
  ('invoices-delete', 'Supprimer les factures', 'invoices', 'delete'),
  ('invoices-export', 'Exporter les factures', 'invoices', 'export'),
  ('invoices-sign', 'Signer les factures', 'invoices', 'sign'),
  ('comptabilite-read', 'Voir la comptabilité', 'comptabilite', 'read'),
  ('comptabilite-write', 'Modifier la comptabilité', 'comptabilite', 'write'),
  ('comptabilite-validate', 'Valider les écritures', 'comptabilite', 'validate'),
  ('clients-manage', 'Gérer les clients', 'clients', 'manage'),
  ('fournisseurs-manage', 'Gérer les fournisseurs', 'fournisseurs', 'manage'),
  ('articles-manage', 'Gérer les articles', 'articles', 'manage'),
  ('stocks-read', 'Voir les stocks', 'stocks', 'read'),
  ('stocks-write', 'Modifier les stocks', 'stocks', 'write'),
  ('facturation-read', 'Voir la facturation', 'facturation', 'read'),
  ('facturation-write', 'Modifier la facturation', 'facturation', 'write'),
  ('rapports-basic', 'Rapports basiques', 'rapports', 'read'),
  ('rapports-advanced', 'Rapports avancés', 'rapports', 'read'),
  ('audit-read', 'Voir l\'audit', 'audit', 'read'),
  ('users-manage', 'Gérer les utilisateurs', 'users', 'manage'),
  ('settings-manage', 'Gérer les paramètres', 'settings', 'manage'),
  ('lia-access', 'Accéder au LIA', 'lia', 'access'),
  ('lia-train', 'Entraîner le LIA', 'lia', 'train'),
  ('paie-read', 'Voir la paie', 'paie', 'read'),
  ('paie-write', 'Gérer la paie', 'paie', 'write')
ON CONFLICT DO NOTHING;

-- 6. TABLE USER_ROLES (manquante)
-- =====================================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
COMMENT ON TABLE user_roles IS 'Assignation des rôles aux utilisateurs (M:M)';

-- 7. TABLE ROLE_PERMISSIONS (manquante)
-- =====================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
COMMENT ON TABLE role_permissions IS 'Permissions assignées aux rôles (M:M)';

-- 8. ASSIGNATIONS PAR DÉFAUT
-- =====================================================================
-- Admin: toutes les permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'admin'
ON CONFLICT DO NOTHING;

-- Comptable: permissions comptabilité
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'comptable' AND p.code IN (
  'comptabilite-read', 'comptabilite-write', 'comptabilite-validate',
  'invoices-read', 'invoices-export', 'rapports-basic', 'audit-read'
)
ON CONFLICT DO NOTHING;

-- 9. AMÉLIORATION TABLE INVOICES
-- =====================================================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- 10. AMÉLIORATION TABLE ACCOUNTING_ENTRIES
-- =====================================================================
ALTER TABLE accounting_entries ADD COLUMN IF NOT EXISTS journal_code VARCHAR(10);
ALTER TABLE accounting_entries ADD COLUMN IF NOT EXISTS piece_number VARCHAR(50);
ALTER TABLE accounting_entries ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE accounting_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_accounting_entries_company ON accounting_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_date ON accounting_entries(date);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_account ON accounting_entries(account);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_status ON accounting_entries(status);

-- 11. TABLE CHART_OF_ACCOUNTS (manquante)
-- =====================================================================
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  account_code VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50), -- 'asset', 'liability', 'equity', 'revenue', 'expense'
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, account_code)
);
CREATE INDEX IF NOT EXISTS idx_coa_company ON chart_of_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_coa_type ON chart_of_accounts(account_type);
COMMENT ON TABLE chart_of_accounts IS 'Plan comptable personnalisé par entreprise';

-- 12. TABLE FISCAL_CATEGORIES (manquante)
-- =====================================================================
CREATE TABLE IF NOT EXISTS fiscal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  min_revenue NUMERIC(18,2),
  max_revenue NUMERIC(18,2),
  default_regime VARCHAR(50),
  default_tva_rate NUMERIC(5,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE fiscal_categories IS 'Catégories fiscales (micro, réel simple, réel normal) avec seuils';

-- Insérer les catégories fiscales algériennes
INSERT INTO fiscal_categories (code, name, min_revenue, max_revenue, default_regime, default_tva_rate) VALUES
  ('MICRO', 'Micro-entreprise', 0, 5000000, 'simplifié', 19),
  ('REEL_SIMPLE', 'Régime réel simplifié', 5000000, 500000000, 'reel_simple', 19),
  ('REEL_NORMAL', 'Régime réel normal', 500000000, NULL, 'reel_normal', 19),
  ('EXEMPT', 'Exonération TVA', NULL, NULL, 'exoneré', 0)
ON CONFLICT DO NOTHING;

-- 13. AMÉLIORATION TABLE PRODUCTS/ARTICLES
-- =====================================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(64) DEFAULT REPLACE(gen_random_uuid()::text,'-','');
ALTER TABLE products ADD COLUMN IF NOT EXISTS qr_code TEXT DEFAULT CONCAT('qr://', gen_random_uuid());
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 19;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- 14. TABLE INVENTORY (manquante)
-- =====================================================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quantity_on_hand NUMERIC(18,2) NOT NULL DEFAULT 0,
  quantity_reserved NUMERIC(18,2) NOT NULL DEFAULT 0,
  quantity_available NUMERIC(18,2) NOT NULL DEFAULT 0,
  reorder_point NUMERIC(18,2) DEFAULT 0,
  last_movement_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, company_id)
);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_company ON inventory(company_id);
COMMENT ON TABLE inventory IS 'État du stock en temps réel par produit et entreprise';

-- 15. AMÉLIORATIONS CLIENTS ET FOURNISSEURS
-- =====================================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(18,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50);

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_company ON suppliers(company_id);

-- 16. TABLE TAXES (manquante)
-- =====================================================================
CREATE TABLE IF NOT EXISTS taxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tax_code VARCHAR(50) NOT NULL,
  tax_name VARCHAR(100) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL,
  account_number VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, tax_code)
);
COMMENT ON TABLE taxes IS 'Configuration des taux de TVA et taxes applicables';

-- 17. VIEW: RÉSUMÉ FINANCIER UTILISATEUR
-- =====================================================================
CREATE OR REPLACE VIEW user_financial_summary AS
SELECT
  u.id,
  u.nom,
  u.email,
  c.name AS company_name,
  COUNT(DISTINCT i.id) AS total_invoices,
  COALESCE(SUM(i.total), 0) AS total_invoiced,
  COALESCE(COUNT(p.id), 0) AS total_payments,
  u.last_login,
  u.created_at
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN invoices i ON c.id = i.company_id
LEFT JOIN payments p ON i.id = p.invoice_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.nom, u.email, c.name, u.last_login, u.created_at;

-- 18. FUNCTION: METTRE À JOUR LAST_LOGIN
-- =====================================================================
CREATE OR REPLACE FUNCTION update_user_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET last_login = NOW() WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 19. TRIGGER: AUTO-UPDATE TIMESTAMP
-- =====================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER accounting_entries_updated_at BEFORE UPDATE ON accounting_entries
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 20. DONNÉES DE TEST
-- =====================================================================
-- Créer une entreprise test
INSERT INTO companies (name, siret, email, phone, is_active) 
VALUES ('Dinarlytics TEST', '12345678901234', 'test@dinarlytics.com', '+213555000000', true)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- FIN DES CORRECTIONS ET AMÉLIORATIONS
-- =====================================================================
COMMIT;
