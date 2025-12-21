-- =====================
-- EXTENSIONS ERP : AUDIT, NOTIFICATIONS, DOCUMENTS, BUDGETS, BANQUE, WORKFLOWS, PARAMETRAGE
-- =====================

-- 1. Journalisation complète des actions (audit_trail)
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- ex: INSERT, UPDATE, DELETE
  entity_type VARCHAR(100),     -- ex: 'invoice', 'payment', 'user'
  entity_id UUID,
  details JSONB,                -- état complet ou diff
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE audit_trail IS 'Journalisation de toutes les actions critiques pour traçabilité et conformité.';
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);

-- 2. Notifications utilisateurs (in-app, email, SMS)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL DEFAULT 'inapp',
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notifications IS 'Notifications et alertes envoyées aux utilisateurs.';
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- 3. Gestion documentaire (documents liés, versioning)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  version INTEGER NOT NULL DEFAULT 1,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE documents IS 'Stockage des fichiers liés (factures, contrats, etc.) avec versioning.';
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);

-- 4. Modèles de documents personnalisables
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- ex: 'facture', 'devis'
  file_url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE document_templates IS 'Modèles personnalisables pour génération de documents.';

-- 5. Budgets et lignes budgétaires
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  exercice VARCHAR(10) NOT NULL,
  total_amount NUMERIC(18,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE budgets IS 'Budgets par société, exercice, centre de coût.';
CREATE TABLE IF NOT EXISTS budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE budget_lines IS 'Lignes détaillées des budgets (poste, montant, catégorie).';

-- 6. Comptes bancaires et rapprochement
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL,
  iban VARCHAR(34) NOT NULL,
  bic VARCHAR(11),
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE bank_accounts IS 'Comptes bancaires de l’entreprise.';
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  statement_date DATE NOT NULL,
  statement_balance NUMERIC(18,2) NOT NULL,
  matched BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE bank_reconciliations IS 'Rapprochements bancaires, relevés, anomalies.';

-- 7. Workflows de validation (approbation)
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE approval_requests IS 'Demandes de validation (achats, paiements, modifications).';
CREATE TABLE IF NOT EXISTS approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  step_order INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  decided_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE approval_steps IS 'Étapes du workflow de validation, statut, utilisateur.';

-- 8. Paramétrage global et préférences utilisateur
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, key)
);
COMMENT ON TABLE settings IS 'Paramètres globaux de l’ERP (TVA, devises, modèles, etc.).';
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, key)
);
COMMENT ON TABLE user_preferences IS 'Préférences utilisateur (tableau de bord, notifications, etc.).';

-- 9. Sessions utilisateurs (MFA, accès temporaires)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_validated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);
COMMENT ON TABLE user_sessions IS 'Sessions utilisateurs, MFA, accès temporaires.';

-- 10. Triggers d’audit (exemple sur invoices, à dupliquer sur autres tables critiques)
CREATE OR REPLACE FUNCTION audit_invoice_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_trail(user_id, action, entity_type, entity_id, details)
    VALUES (NEW.updated_by, TG_OP, 'invoice', NEW.id, row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_invoice ON invoices;
CREATE TRIGGER trg_audit_invoice
  AFTER UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_invoice_change();

-- =====================
-- POINTS RESTANTS À AJOUTER POUR UN ERP COMPLET :
-- - Triggers d’audit sur toutes les tables critiques (paiements, utilisateurs, budgets, etc.)
-- - Fonctions d’alertes automatiques (dépassement budget, échéances, etc.)
-- - Fonctions d’import/export (clients, articles, historiques)
-- - Fonctions de génération de rapports PDF/Excel
-- - Fonctions d’intégration API (CRM, e-commerce, banque)
-- - Sécurité avancée (MFA, logs RGPD, anonymisation)
-- - Automatisation des relances et notifications
-- - Vues matérialisées pour accélérer les dashboards
-- =====================
-- AUDIT, NOTIFICATIONS, DOCUMENTS, BUDGETS, BANQUE, WORKFLOWS, PARAMETRAGE
-- =====================

-- Audit trail (journalisation des actions)
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);

-- Notifications (in-app, email, SMS)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL DEFAULT 'inapp',
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Documents liés (factures, contrats, etc.)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  version INTEGER NOT NULL DEFAULT 1,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);

-- Modèles de documents personnalisables
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Budgets et lignes budgétaires
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  exercice VARCHAR(10) NOT NULL,
  total_amount NUMERIC(18,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comptes bancaires et rapprochement
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL,
  iban VARCHAR(34) NOT NULL,
  bic VARCHAR(11),
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  statement_date DATE NOT NULL,
  statement_balance NUMERIC(18,2) NOT NULL,
  matched BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Workflows de validation
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  step_order INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  decided_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Paramétrage global et préférences utilisateur
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, key)
);
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Sessions utilisateurs (MFA, accès temporaires)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_validated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Triggers d'audit de base (exemple sur invoices)
CREATE OR REPLACE FUNCTION audit_invoice_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_trail(user_id, action, entity_type, entity_id, details)
    VALUES (NEW.updated_by, TG_OP, 'invoice', NEW.id, row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_invoice ON invoices;
CREATE TRIGGER trg_audit_invoice
  AFTER UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_invoice_change();
-- =====================
-- TRIGGER: MAJ automatique du line_total sur invoice_items
-- =====================
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
-- =====================
-- ETATS FINANCIERS DE REFERENCE (pour ratios avancés)
-- =====================
CREATE TABLE IF NOT EXISTS financial_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exercice VARCHAR(10) NOT NULL,
  total_assets NUMERIC(18,2),
  current_assets NUMERIC(18,2),
  current_liabilities NUMERIC(18,2),
  equity NUMERIC(18,2),
  operating_expenses NUMERIC(18,2),
  depreciation NUMERIC(18,2),
  amortization NUMERIC(18,2),
  interest_expense NUMERIC(18,2),
  taxes_expense NUMERIC(18,2),
  net_income NUMERIC(18,2),
  current_inventory NUMERIC(18,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, exercice)
);
COMMENT ON TABLE financial_statements IS 'Agrégats financiers par société et exercice pour calculs avancés (ratios).';

-- =====================
-- FONCTIONS SQL STOCKÉES POUR CALCUL KPI/RATIOS
-- =====================

-- EBITDA = Résultat net + intérêts + impôts + amortissements + dépréciations
CREATE OR REPLACE FUNCTION calculer_ebitda(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE ebitda NUMERIC;
BEGIN
  SELECT COALESCE(net_income,0) + COALESCE(interest_expense,0) + COALESCE(taxes_expense,0)
         + COALESCE(amortization,0) + COALESCE(depreciation,0)
    INTO ebitda
  FROM financial_statements
  WHERE company_id = company AND exercice = exercice_annee;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'ebitda', 'EBITDA', ebitda, user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ROE = Résultat net / Capitaux propres
CREATE OR REPLACE FUNCTION calculer_roe(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE roe NUMERIC; ni NUMERIC; eq NUMERIC;
BEGIN
  SELECT net_income, equity INTO ni, eq FROM financial_statements
  WHERE company_id = company AND exercice = exercice_annee;
  IF COALESCE(eq,0) > 0 THEN
    roe := ROUND(100 * COALESCE(ni,0) / eq, 2);
  ELSE
    roe := NULL;
  END IF;
  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'roe', 'ROE (%)', roe, user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ROA = Résultat net / Actif total
CREATE OR REPLACE FUNCTION calculer_roa(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE roa NUMERIC; ni NUMERIC; ta NUMERIC;
BEGIN
  SELECT net_income, total_assets INTO ni, ta FROM financial_statements
  WHERE company_id = company AND exercice = exercice_annee;
  IF COALESCE(ta,0) > 0 THEN
    roa := ROUND(100 * COALESCE(ni,0) / ta, 2);
  ELSE
    roa := NULL;
  END IF;
  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'roa', 'ROA (%)', roa, user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Ratio de liquidité générale = Actifs courants / Passifs courants
CREATE OR REPLACE FUNCTION calculer_liquidite_generale(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE ratio NUMERIC; ca NUMERIC; cl NUMERIC;
BEGIN
  SELECT current_assets, current_liabilities INTO ca, cl FROM financial_statements
  WHERE company_id = company AND exercice = exercice_annee;
  IF COALESCE(cl,0) > 0 THEN
    ratio := ROUND(COALESCE(ca,0) / cl, 2);
  ELSE
    ratio := NULL;
  END IF;
  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'liq_generale', 'Liquidité générale', ratio, user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Ratio de liquidité immédiate (quick ratio) = (Actifs courants - Stocks) / Passifs courants
CREATE OR REPLACE FUNCTION calculer_liquidite_immediate(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE ratio NUMERIC; ca NUMERIC; inv NUMERIC; cl NUMERIC;
BEGIN
  SELECT current_assets, current_inventory, current_liabilities INTO ca, inv, cl FROM financial_statements
  WHERE company_id = company AND exercice = exercice_annee;
  IF COALESCE(cl,0) > 0 THEN
    ratio := ROUND((COALESCE(ca,0) - COALESCE(inv,0)) / cl, 2);
  ELSE
    ratio := NULL;
  END IF;
  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'liq_immediate', 'Liquidité immédiate (quick ratio)', ratio, user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================
-- FONCTIONS SQL STOCKÉES POUR CALCUL KPI/RATIOS
-- =====================

-- Fonction : Calcul et insertion de la marge brute (%)
CREATE OR REPLACE FUNCTION calculer_marge_brute(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE
  ca NUMERIC;
  cout_achats NUMERIC;
  marge NUMERIC;
BEGIN
  SELECT COALESCE(SUM(montant_ht),0) INTO ca FROM invoices
    WHERE company_id = company AND EXTRACT(YEAR FROM date_emission)::TEXT = exercice_annee AND statut IN ('validee','payee');

  SELECT COALESCE(SUM(ii.line_total),0) INTO cout_achats FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.company_id = company AND EXTRACT(YEAR FROM i.date_emission)::TEXT = exercice_annee AND ii.name ILIKE '%achat%';

  IF ca > 0 THEN
    marge := ROUND(100 * (ca - cout_achats) / ca, 2);
  ELSE
    marge := NULL;
  END IF;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'marge_brute', 'Marge brute (%)', marge, user_id)
    ON CONFLICT (company_id, exercice, periode, kpi_code) DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction : Calcul et insertion du DSO (Days Sales Outstanding)
CREATE OR REPLACE FUNCTION calculer_dso(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE
  ca NUMERIC;
  creances NUMERIC;
  dso NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_ttc),0) INTO ca FROM invoices
    WHERE company_id = company AND EXTRACT(YEAR FROM date_emission)::TEXT = exercice_annee AND statut IN ('validee','payee');

  SELECT COALESCE(SUM(i.total_ttc) - SUM(p.montant),0) INTO creances
    FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
    WHERE i.company_id = company AND EXTRACT(YEAR FROM i.date_emission)::TEXT = exercice_annee AND i.statut IN ('validee','payee');

  IF ca > 0 THEN
    dso := ROUND((creances / (ca/365)), 2);
  ELSE
    dso := NULL;
  END IF;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'dso', 'DSO (jours)', dso, user_id)
    ON CONFLICT (company_id, exercice, periode, kpi_code) DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================
-- EXEMPLES DE CALCULS SQL POUR KPI/RATIOS FINANCIERS
-- =====================

-- Marge brute (%) = (CA - Coût des ventes) / CA
-- Exemple d'insertion (à adapter selon vos tables de coûts) :
-- INSERT INTO financial_kpis (company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
-- SELECT i.company_id, EXTRACT(YEAR FROM i.date_emission)::text, 'global', 'marge_brute', 'Marge brute (%)',
--   ROUND(100 * (SUM(i.montant_ht) - COALESCE(SUM(cout.cout_total),0)) / NULLIF(SUM(i.montant_ht),0), 2),
--   'USER-UUID'
-- FROM invoices i
-- LEFT JOIN (SELECT invoice_id, SUM(line_total) as cout_total FROM invoice_items WHERE name ILIKE '%achat%' GROUP BY invoice_id) cout ON cout.invoice_id = i.id
-- WHERE i.statut IN ('validee','payee')
-- GROUP BY i.company_id;

-- Marge nette (%) = Résultat net / CA
-- (Nécessite une table de résultat net ou calcul via charges/dépenses)

-- DSO (Days Sales Outstanding) = (Créances clients / CA journalier moyen) * 365
-- Exemple d'insertion :
-- INSERT INTO financial_kpis (company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
-- SELECT i.company_id, EXTRACT(YEAR FROM i.date_emission)::text, 'global', 'dso', 'DSO (jours)',
--   ROUND((SUM(i.total_ttc) - COALESCE(SUM(p.montant),0)) / NULLIF((SUM(i.total_ttc)/365),0), 2),
--   'USER-UUID'
-- FROM invoices i
-- LEFT JOIN payments p ON p.invoice_id = i.id
-- WHERE i.statut IN ('validee','payee')
-- GROUP BY i.company_id;

-- EBITDA, ROE, ROA, ratios de liquidité, etc. peuvent être ajoutés selon la granularité de vos données (charges, immobilisations, capitaux propres...)

-- Pour automatiser, créez des vues ou des fonctions SQL stockées qui alimentent la table financial_kpis périodiquement.
-- =====================
-- COMMENTAIRES & CONTRAINTES ERP BUILDER
-- =====================
-- Table users
COMMENT ON TABLE users IS 'Utilisateurs de la plateforme Dinarlytics';
COMMENT ON COLUMN users.email IS 'Email unique de connexion';
COMMENT ON COLUMN users.password_hash IS 'Hash du mot de passe (bcrypt)';
COMMENT ON COLUMN users.company_id IS 'Société à laquelle l’utilisateur est rattaché';
COMMENT ON COLUMN users.is_active IS 'Compte actif ou désactivé';
COMMENT ON COLUMN users.created_at IS 'Date de création du compte';
COMMENT ON COLUMN users.updated_at IS 'Date de dernière modification du compte';

-- Table roles
COMMENT ON TABLE roles IS 'Rôles d’accès (admin, comptable, etc.)';
COMMENT ON COLUMN roles.name IS 'Nom unique du rôle';

-- Table permissions
COMMENT ON TABLE permissions IS 'Permissions granulaires attribuées aux rôles';
COMMENT ON COLUMN permissions.code IS 'Code unique de la permission';

-- Table user_roles
COMMENT ON TABLE user_roles IS 'Liaison entre utilisateurs et rôles';

-- Table companies
COMMENT ON TABLE companies IS 'Sociétés clientes de la plateforme';
COMMENT ON COLUMN companies.name IS 'Nom de la société';
COMMENT ON COLUMN companies.country_code IS 'Code pays (ISO 2)';
COMMENT ON COLUMN companies.currency_code IS 'Devise principale (ISO 3)';

-- Table clients
COMMENT ON TABLE clients IS 'Clients finaux des sociétés';
COMMENT ON COLUMN clients.company_id IS 'Société propriétaire du client';

-- Table invoices
COMMENT ON TABLE invoices IS 'Factures émises par les sociétés';
COMMENT ON COLUMN invoices.numero IS 'Numéro unique de facture';
COMMENT ON COLUMN invoices.client_id IS 'Client destinataire de la facture';
COMMENT ON COLUMN invoices.statut IS 'Statut de la facture (enum)';

-- Table invoice_items
COMMENT ON TABLE invoice_items IS 'Lignes détaillées des factures';
COMMENT ON COLUMN invoice_items.invoice_id IS 'Facture associée';
COMMENT ON COLUMN invoice_items.tax_rate IS 'Taux de TVA appliqué à la ligne';

-- Table signatures
COMMENT ON TABLE signatures IS 'Registre des signatures électroniques';
COMMENT ON COLUMN signatures.entity_type IS 'Type d’entité signée (facture, document, etc.)';
COMMENT ON COLUMN signatures.entity_id IS 'ID de l’entité signée';

-- Table payments
COMMENT ON TABLE payments IS 'Paiements associés aux factures';
COMMENT ON COLUMN payments.invoice_id IS 'Facture payée';
COMMENT ON COLUMN payments.mode IS 'Mode de paiement (enum)';

-- Table fiscal_declarations
COMMENT ON TABLE fiscal_declarations IS 'Déclarations fiscales des sociétés';
COMMENT ON COLUMN fiscal_declarations.type IS 'Type de déclaration (G50, IBS, etc.)';
COMMENT ON COLUMN fiscal_declarations.statut IS 'Statut de la déclaration';

-- Table reminders
COMMENT ON TABLE reminders IS 'Rappels et notifications pour les utilisateurs';
COMMENT ON COLUMN reminders.due_at IS 'Date d’échéance du rappel';

-- Table audit_logs
COMMENT ON TABLE audit_logs IS 'Logs d’audit des actions utilisateurs';
COMMENT ON COLUMN audit_logs.actor_id IS 'Utilisateur ayant effectué l’action';
COMMENT ON COLUMN audit_logs.action IS 'Action réalisée';

-- Table permission_audits
COMMENT ON TABLE permission_audits IS 'Audit des changements de permissions';
COMMENT ON COLUMN permission_audits.actor_id IS 'Utilisateur ayant modifié les droits';

-- Contraintes supplémentaires (ERP)
ALTER TABLE invoices ADD CONSTRAINT unique_invoice_per_company_numero UNIQUE (company_id, numero);
ALTER TABLE clients ADD CONSTRAINT unique_client_per_company_name UNIQUE (company_id, name);
ALTER TABLE payments ADD CONSTRAINT montant_positif CHECK (montant >= 0);
ALTER TABLE invoice_items ADD CONSTRAINT quantity_positif CHECK (quantity >= 0);
ALTER TABLE invoice_items ADD CONSTRAINT unit_price_positif CHECK (unit_price >= 0);
ALTER TABLE invoice_items ADD CONSTRAINT line_total_positif CHECK (line_total >= 0);
-- Dinarlytics database schema (PostgreSQL) - COMPLETE VERSION
-- Contains all entities: users, roles/permissions, access requests, companies, clients, invoices, 
-- payments, signatures, fiscal declarations, fiscal documents, calendar, reminders, rates, and audit logs.

-- =====================
-- Security & Identity
-- =====================
CREATE TABLE users (
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

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(150) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Access requests workflow ("Demander l'accès")
CREATE TYPE access_request_status AS ENUM ('pending','approved','rejected');
CREATE TABLE access_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_code VARCHAR(150) NOT NULL,
  justification   TEXT,
  status          access_request_status NOT NULL DEFAULT 'pending',
  decided_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  decided_at      TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================
-- Companies & Clients
-- =====================
CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  country_code    VARCHAR(2) NOT NULL,
  currency_code   VARCHAR(3) NOT NULL,
  segment         VARCHAR(50) NOT NULL DEFAULT 'micro',
  company_type    VARCHAR(50) NOT NULL DEFAULT 'eurl',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE users
  ADD CONSTRAINT fk_users_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

CREATE TABLE clients (
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

-- =====================
-- Invoices (Factures)
-- =====================
CREATE TYPE invoice_status AS ENUM ('brouillon','validee','envoyee','payee','annulee');

CREATE TABLE invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  numero           VARCHAR(50) UNIQUE NOT NULL,
  date_emission    DATE NOT NULL,
  date_echeance    DATE,
  conditions_paiement INTEGER,
  montant_ht       NUMERIC(18,2) NOT NULL DEFAULT 0,
  tva              NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_ttc        NUMERIC(18,2) NOT NULL DEFAULT 0,
  statut           invoice_status NOT NULL DEFAULT 'brouillon',
  reference        VARCHAR(100),
  notes            TEXT,
  signature_url    TEXT,
  qr_code_url      TEXT,
  signed_at        TIMESTAMP,
  signed_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  article_code  VARCHAR(100),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  quantity      NUMERIC(18,2) NOT NULL DEFAULT 1,
  unit_price    NUMERIC(18,2) NOT NULL DEFAULT 0,
  remise_pct    NUMERIC(5,2) DEFAULT 0,
  line_total    NUMERIC(18,2) NOT NULL DEFAULT 0
);
-- =====================
-- Articles & Fournisseurs (ERP Catalogues)
-- =====================
CREATE TABLE IF NOT EXISTS fournisseurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  tax_number VARCHAR(50),
  qr_code_url TEXT NOT NULL DEFAULT CONCAT('qr://', gen_random_uuid()),
  barcode VARCHAR(64) NOT NULL DEFAULT REPLACE(gen_random_uuid()::text,'-',''),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, name),
  UNIQUE(qr_code_url),
  UNIQUE(barcode)
);
COMMENT ON TABLE fournisseurs IS 'Fournisseurs entreprise avec QR code et code-barres uniques auto-générés';

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit VARCHAR(20) DEFAULT 'unite',
  unit_price NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  qr_code_url TEXT NOT NULL DEFAULT CONCAT('qr://', gen_random_uuid()),
  barcode VARCHAR(64) NOT NULL DEFAULT REPLACE(gen_random_uuid()::text,'-',''),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, code),
  UNIQUE(qr_code_url),
  UNIQUE(barcode)
);
COMMENT ON TABLE articles IS 'Articles catalogue avec QR code et code-barres uniques auto-générés';

-- Relations vers articles/fournisseurs
ALTER TABLE invoice_items
  ADD COLUMN IF NOT EXISTS article_id UUID REFERENCES articles(id) ON DELETE SET NULL;

ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_articles_company ON articles(company_id);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_company ON fournisseurs(company_id);

-- Electronic signatures registry
CREATE TABLE signatures (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   VARCHAR(50) NOT NULL,
  entity_id     UUID NOT NULL,
  signer_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  signature_url TEXT NOT NULL,
  method        VARCHAR(50) NOT NULL DEFAULT 'draw',
  signed_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TYPE payment_status AS ENUM ('en_attente','paye','en_retard');
CREATE TYPE payment_mode AS ENUM ('virement','cheque','especes','carte');

CREATE TABLE payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  numero        VARCHAR(50) UNIQUE,
  date_paiement DATE NOT NULL,
  mode          payment_mode NOT NULL,
  montant       NUMERIC(18,2) NOT NULL,
  statut        payment_status NOT NULL DEFAULT 'en_attente',
  couleur_tag   VARCHAR(30),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================
-- Fiscal Declarations
-- =====================
CREATE TYPE declaration_type AS ENUM ('g50','ibs','irg','tap');
CREATE TYPE declaration_status AS ENUM ('en_cours','teledeclaree','validee','rejetee');

CREATE TABLE fiscal_declarations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type             declaration_type NOT NULL,
  exercice         VARCHAR(10),
  periode          VARCHAR(10),
  numero           VARCHAR(50),
  date_declaration DATE,
  statut           declaration_status NOT NULL DEFAULT 'en_cours',
  montant_verse    NUMERIC(18,2) DEFAULT 0,
  date_versement   DATE,
  observations     TEXT,
  chiffre_affaires_ht NUMERIC(18,2),
  tva_collectee       NUMERIC(18,2),
  tva_deductible      NUMERIC(18,2),
  tva_a_verser        NUMERIC(18,2),
  charges_deductibles NUMERIC(18,2),
  amortissements      NUMERIC(18,2),
  provisions          NUMERIC(18,2),
  revenus_bruts       NUMERIC(18,2),
  abattements         NUMERIC(18,2),
  taux_tap            NUMERIC(6,4),
  score_conformite    NUMERIC(5,2),
  delai_declaration_j NUMERIC(6,2),
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Fiscal calendar & reminders
CREATE TYPE echeance_statut AS ENUM ('a_venir','proche','en_cours','en_retard');
CREATE TYPE echeance_priorite AS ENUM ('basse','moyenne','haute','critique');

CREATE TYPE document_category AS ENUM ('declaration','attestation','bilan','certificat','formulaire');
CREATE TYPE document_frequency AS ENUM ('mensuel','trimestriel','annuel','ponctuel');

CREATE TABLE fiscal_calendar (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type              declaration_type NOT NULL,
  libelle           VARCHAR(150) NOT NULL,
  frequence         document_frequency NOT NULL,
  date_echeance     DATE NOT NULL,
  jours_avant       INTEGER NOT NULL,
  statut            echeance_statut NOT NULL,
  priorite          echeance_priorite NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reminders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  title             VARCHAR(200) NOT NULL,
  message           TEXT,
  due_at            TIMESTAMP NOT NULL,
  related_type      VARCHAR(50),
  related_id        UUID,
  sent_at           TIMESTAMP,
  channel           VARCHAR(30) DEFAULT 'inapp',
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================
-- Fiscal Documents Catalog
-- =====================
CREATE TABLE fiscal_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(50) UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  category     document_category NOT NULL,
  frequency    document_frequency NOT NULL,
  description  TEXT,
  country_code VARCHAR(2) NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE created_fiscal_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_id   UUID NOT NULL REFERENCES fiscal_documents(id) ON DELETE RESTRICT,
  status        VARCHAR(20) NOT NULL DEFAULT 'draft',
  period        VARCHAR(10),
  amount        NUMERIC(18,2),
  pdf_url       TEXT,
  signature_id  UUID REFERENCES signatures(id) ON DELETE SET NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  submitted_at  TIMESTAMP,
  validated_at  TIMESTAMP
);

-- =====================
-- Accounting Plan & Rates (reference)
-- =====================
CREATE TABLE fiscal_rates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code  VARCHAR(2) NOT NULL,
  tva_normal    NUMERIC(6,4) NOT NULL,
  tva_reduit    NUMERIC(6,4) NOT NULL,
  ibs_rate      NUMERIC(6,4) NOT NULL,
  tap_rate      NUMERIC(6,4) NOT NULL,
  effective_from DATE NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================
-- Audit Logs
-- =====================
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action       VARCHAR(150) NOT NULL,
  entity_type  VARCHAR(100) NOT NULL,
  entity_id    UUID,
  metadata     JSONB,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Permission audits (grants/revokes)
CREATE TABLE permission_audits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user   UUID REFERENCES users(id) ON DELETE CASCADE,
  permission    VARCHAR(150) NOT NULL,
  action        VARCHAR(20) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================
-- Helpful indexes
-- =====================
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_declarations_company ON fiscal_declarations(company_id);
CREATE INDEX idx_declarations_type_period ON fiscal_declarations(type, exercice, periode);
CREATE INDEX idx_created_docs_company ON created_fiscal_documents(company_id);
CREATE INDEX idx_signatures_entity ON signatures(entity_type, entity_id);
CREATE INDEX idx_calendar_company_date ON fiscal_calendar(company_id, date_echeance);
CREATE INDEX idx_reminders_due ON reminders(company_id, due_at);
CREATE INDEX idx_access_requests_status ON access_requests(status, created_at);

-- =====================
-- Optional seed examples
-- =====================
-- Ajout des rôles spécialisés pour l'analyse financière
INSERT INTO roles(name, description) VALUES
  ('admin','Administrateur'),
  ('comptable','Comptabilité'),
  ('utilisateur','Utilisateur standard'),
  ('analyste_financier','Accès complet à l’analyse financière et aux ratios'),
  ('controleur_gestion','Gestion budgétaire, contrôle des écarts, accès aux prévisions'),
  ('auditeur','Lecture seule sur toutes les données et historiques'),
  ('manager','Accès aux dashboards, synthèses et alertes stratégiques')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions(code, description) VALUES
  ('admin','Rôle administrateur'),
  ('fiscalite-declarations','Accès à la page Fiscalité Déclarations'),
  ('rapports-basic','Accès aux rapports basiques'),
  ('comptabilite-read','Lecture comptabilité'),
  ('analyse-financiere-full','Accès complet à l’analyse financière'),
  ('analyse-ratios','Calcul et visualisation des ratios financiers'),
  ('analyse-budgets','Accès aux budgets et prévisions'),
  ('audit-read','Lecture des logs et historiques'),
  ('dashboard-manager','Accès aux dashboards et synthèses')
ON CONFLICT (code) DO NOTHING;

-- Create admin user (password hash placeholder, replace before production)
INSERT INTO users(email,password_hash,first_name,last_name, is_active)
VALUES ('hassan.boumediene@example.com','$2b$10$replace_with_real_bcrypt_hash','Hassan','Boumediene', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Link user to company (demo company)
INSERT INTO companies(name, country_code, currency_code, segment, company_type)
VALUES ('Selma PC','DZ','DZD','micro','eurl')
ON CONFLICT DO NOTHING;

-- Assign admin role to user
INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'hassan.boumediene@example.com' AND r.name = 'admin'
ON CONFLICT DO NOTHING;


-- Attribution des permissions aux nouveaux rôles
-- Admin : tout
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON TRUE WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Analyste financier
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('analyse-financiere-full','analyse-ratios','rapports-basic') WHERE r.name = 'analyste_financier'
ON CONFLICT DO NOTHING;

-- Contrôleur de gestion
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('analyse-budgets','analyse-ratios','rapports-basic') WHERE r.name = 'controleur_gestion'
ON CONFLICT DO NOTHING;

-- Auditeur
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('audit-read','analyse-ratios','rapports-basic') WHERE r.name = 'auditeur'
ON CONFLICT DO NOTHING;

-- Manager
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('dashboard-manager','analyse-ratios','rapports-basic') WHERE r.name = 'manager'
ON CONFLICT DO NOTHING;

-- Table pour stocker les calculs de KPI/ratios financiers
CREATE TABLE IF NOT EXISTS financial_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exercice VARCHAR(10) NOT NULL,
  periode VARCHAR(10),
  kpi_code VARCHAR(50) NOT NULL,
  kpi_label VARCHAR(100) NOT NULL,
  value NUMERIC(18,4) NOT NULL,
  calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON TABLE financial_kpis IS 'Stocke les résultats des calculs de ratios et KPI financiers par société et période.';
COMMENT ON COLUMN financial_kpis.kpi_code IS 'Code du ratio/KPI (ex: marge_nette, ebitda, dso, etc.)';
COMMENT ON COLUMN financial_kpis.value IS 'Valeur calculée du KPI';
-- Contrainte d'unicité pour upsert
ALTER TABLE financial_kpis ADD CONSTRAINT uq_financial_kpis UNIQUE (company_id, exercice, periode, kpi_code);
-- =====================
-- TABLES DEPENSES & INVENTAIRE (si absentes)
-- =====================
CREATE TABLE IF NOT EXISTS expenses_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  tax_number VARCHAR(50),
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE expenses_vendors IS 'Fournisseurs (AP) pour les dépenses';

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES expenses_vendors(id) ON DELETE SET NULL,
  numero VARCHAR(50),
  date_emission DATE NOT NULL,
  date_echeance DATE,
  montant_ht NUMERIC(18,2) NOT NULL DEFAULT 0,
  tva NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_ttc NUMERIC(18,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  statut VARCHAR(20) NOT NULL DEFAULT 'en_cours',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_company ON expenses(company_id);
COMMENT ON TABLE expenses IS 'Factures fournisseurs (dépenses / AP)';

CREATE TABLE IF NOT EXISTS expenses_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  date_paiement DATE NOT NULL,
  montant NUMERIC(18,2) NOT NULL,
  mode VARCHAR(30) DEFAULT 'virement',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_payments_expense ON expenses_payments(expense_id);
COMMENT ON TABLE expenses_payments IS 'Paiements effectués vers les fournisseurs';

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  article_code VARCHAR(100),
  quantity NUMERIC(18,2) NOT NULL,
  unit_cost NUMERIC(18,2) NOT NULL,
  movement_type VARCHAR(20) NOT NULL, -- in/out/adjust
  movement_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_company ON inventory_movements(company_id);
COMMENT ON TABLE inventory_movements IS 'Mouvements de stock (entrées/sorties) pour calcul de rotation';

CREATE TABLE IF NOT EXISTS inventory_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exercice VARCHAR(10) NOT NULL,
  avg_inventory_value NUMERIC(18,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, exercice)
);
COMMENT ON TABLE inventory_snapshot IS 'Valeur moyenne de stock par exercice (si disponible)';

-- =====================
-- FONCTIONS KPI: DPO, ROTATION STOCKS, MARGE NETTE
-- =====================

-- DPO (Days Payable Outstanding) = Dettes fournisseurs / (Achats journaliers moyens)
CREATE OR REPLACE FUNCTION calculer_dpo(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE achats NUMERIC; dettes NUMERIC; dpo NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_ttc),0) INTO achats FROM expenses
    WHERE company_id = company AND EXTRACT(YEAR FROM date_emission)::TEXT = exercice_annee;

  SELECT COALESCE(SUM(e.total_ttc) - COALESCE(SUM(ep.montant),0),0) INTO dettes
    FROM expenses e LEFT JOIN expenses_payments ep ON ep.expense_id = e.id
    WHERE e.company_id = company AND EXTRACT(YEAR FROM e.date_emission)::TEXT = exercice_annee;

  IF COALESCE(achats,0) > 0 THEN
    dpo := ROUND(dettes / (achats/365), 2);
  ELSE
    dpo := NULL;
  END IF;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'dpo', 'DPO (jours)', dpo, user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Rotation des stocks = Coût des ventes / Stock moyen
CREATE OR REPLACE FUNCTION calculer_rotation_stocks(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE cout_ventes NUMERIC; stock_moyen NUMERIC; rotation NUMERIC;
BEGIN
  SELECT COALESCE(SUM(quantity * unit_cost),0) INTO cout_ventes FROM inventory_movements
    WHERE company_id = company AND movement_type = 'out' AND EXTRACT(YEAR FROM movement_date)::TEXT = exercice_annee;

  SELECT avg_inventory_value INTO stock_moyen FROM inventory_snapshot
    WHERE company_id = company AND exercice = exercice_annee;

  IF stock_moyen IS NULL THEN
    SELECT COALESCE(SUM(CASE WHEN movement_type='in' THEN quantity*unit_cost ELSE 0 END) -
                    SUM(CASE WHEN movement_type='out' THEN quantity*unit_cost ELSE 0 END),0)
      INTO stock_moyen
    FROM inventory_movements
    WHERE company_id = company AND EXTRACT(YEAR FROM movement_date)::TEXT = exercice_annee;
  END IF;

  IF COALESCE(stock_moyen,0) > 0 THEN
    rotation := ROUND(cout_ventes / stock_moyen, 2);
  ELSE
    rotation := NULL;
  END IF;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'rotation_stocks', 'Rotation des stocks', rotation, user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Marge nette (%) = Résultat net / Chiffre d'affaires
CREATE OR REPLACE FUNCTION calculer_marge_nette(company UUID, exercice_annee TEXT, user_id UUID)
RETURNS VOID AS $$
DECLARE ca NUMERIC; net NUMERIC; marge NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_ttc),0) INTO ca FROM invoices
    WHERE company_id = company AND EXTRACT(YEAR FROM date_emission)::TEXT = exercice_annee AND statut IN ('validee','payee');

  SELECT COALESCE(net_income,0) INTO net FROM financial_statements
    WHERE company_id = company AND exercice = exercice_annee;

  IF COALESCE(ca,0) > 0 THEN
    marge := ROUND(100 * net / ca, 2);
  ELSE
    marge := NULL;
  END IF;

  INSERT INTO financial_kpis(company_id, exercice, periode, kpi_code, kpi_label, value, created_by)
    VALUES (company, exercice_annee, 'global', 'marge_nette', 'Marge nette (%)', marge, user_id)
  ON CONFLICT ON CONSTRAINT uq_financial_kpis DO UPDATE SET value = EXCLUDED.value, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;
-- Liquidité immédiate (quick ratio) = (Actif circulant - Stocks) / Passif circulant
-- =====================
-- MODULE INTELLIGENCE ARTIFICIELLE (MODELES & PREDICTIONS)
-- =====================
-- Table des modèles IA enregistrés (forecasting, scoring, NLP, anomalies)
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- ex: 'forecast', 'scoring', 'nlp', 'anomaly'
  version VARCHAR(20),
  description TEXT,
  file_url TEXT,       -- chemin vers artefact (onnx, pt, pickle)
  framework VARCHAR(30) DEFAULT 'pytorch',
  input_schema JSONB,  -- description des features attendues
  output_schema JSONB, -- description du format de sortie
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE ai_models IS 'Catalogue des modèles IA disponibles dans l\'ERP.';

-- Historique des prédictions générées
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  entity_type VARCHAR(50),  -- ex: 'client','invoice','article'
  entity_id UUID,
  input_data JSONB,         -- données d\'entrée brutes ou features
  prediction JSONB,         -- résultat (valeur, distribution, classes)
  score NUMERIC(10,6),      -- confiance principale
  scores JSONB,             -- scores multiples éventuels
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_model ON ai_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_entity ON ai_predictions(entity_type, entity_id);
COMMENT ON TABLE ai_predictions IS 'Historique des prédictions IA (forecast, scoring, classification...).';

-- Logs d'entraînement / fine-tuning
CREATE TABLE IF NOT EXISTS ai_training_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'running', -- running|success|failed|aborted
  metrics JSONB,        -- ex: {"loss":0.12,"accuracy":0.93}
  config JSONB,         -- hyperparamètres utilisés
  trained_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_ai_training_logs_model ON ai_training_logs(model_id);
COMMENT ON TABLE ai_training_logs IS 'Journal des entraînements/fine-tuning des modèles IA.';

-- Fonction pour enregistrer une prédiction
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

-- Fonction pour consigner la fin d'un entraînement
CREATE OR REPLACE FUNCTION finaliser_training_ia(
  p_log_id UUID,
  p_status VARCHAR,
  p_metrics JSONB
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_training_logs SET ended_at = NOW(), status = p_status, metrics = p_metrics WHERE id = p_log_id;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- POINTS RESTANTS IA :
-- - Table ai_feature_store (optionnelle) pour tracer versions des features.
-- - Table ai_drift_monitoring pour dérive des données et alertes.
-- - Vues matérialisées pour accélérer le scoring batch.
-- - Intégration ONNX pour exécution multiplateforme.
-- - Planification (cron) du recalcul des prédictions périodiques.
-- - Fonction de purge des prédictions anciennes.
-- - Ajout de rôles/permissions dédiés (ex: 'ia-admin','ia-view').
-- =====================
-- TABLES FEATURE STORE & DRIFT MONITORING
-- =====================
CREATE TABLE IF NOT EXISTS ai_feature_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  feature_set_name VARCHAR(100) NOT NULL, -- ex: 'client_risk_v1'
  version VARCHAR(20) NOT NULL,
  features JSONB NOT NULL,               -- vecteur ou dictionnaire de features agrégées
  source_tables TEXT,                    -- liste des tables sources
  hash VARCHAR(64),                      -- hash de contrôle (intégrité)
  generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(feature_set_name, version, company_id)
);
COMMENT ON TABLE ai_feature_store IS 'Stockage versionné des ensembles de features utilisés pour entraînement/prédiction.';

CREATE TABLE IF NOT EXISTS ai_drift_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  feature_set_name VARCHAR(100) NOT NULL,
  feature_name VARCHAR(100) NOT NULL,
  window_start TIMESTAMP NOT NULL,
  window_end TIMESTAMP NOT NULL,
  ref_distribution JSONB,   -- distribution de référence
  current_distribution JSONB, -- distribution observée
  drift_metric NUMERIC(12,6), -- ex: PSI, KL, JS
  threshold NUMERIC(12,6),
  drift_detected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_drift_feature ON ai_drift_monitoring(feature_set_name, feature_name);
COMMENT ON TABLE ai_drift_monitoring IS 'Surveillance de dérive des features (statistiques, alertes).';

-- =====================
-- VUES D'EXTRACTION FEATURES (BASE POUR IA)
-- =====================
-- Vue: risque client (retard paiements, volume, fréquence)
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

-- Vue: fiabilité fournisseur (fréquence, retards paiements sortants)
CREATE OR REPLACE VIEW vw_supplier_reliability_features AS
SELECT f.id AS fournisseur_id,
       f.company_id,
       COUNT(e.id) AS total_expenses,
       COALESCE(SUM(e.total_ttc),0) AS total_purchased,
       COALESCE(SUM(CASE WHEN ep.id IS NULL THEN e.total_ttc ELSE 0 END),0) AS unpaid_amount,
       AVG(GREATEST(0,(CURRENT_DATE - e.date_echeance))) FILTER (WHERE e.date_echeance IS NOT NULL) AS avg_days_late,
       ROUND(COALESCE(SUM(e.total_ttc) / NULLIF(COUNT(e.id),0),0),2) AS avg_expense_value
FROM fournisseurs f
LEFT JOIN expenses e ON e.fournisseur_id = f.id
LEFT JOIN expenses_payments ep ON ep.expense_id = e.id
GROUP BY f.id, f.company_id;

-- Vue: résumé facturation (tendance CA mensuelle)
CREATE OR REPLACE VIEW vw_invoice_summary_features AS
SELECT company_id,
       DATE_TRUNC('month', date_emission) AS month,
       COUNT(*) AS invoice_count,
       SUM(total_ttc) AS total_monthly_sales,
       SUM(CASE WHEN statut = 'payee' THEN total_ttc ELSE 0 END) AS paid_amount,
       SUM(CASE WHEN statut <> 'payee' THEN total_ttc ELSE 0 END) AS unpaid_amount
FROM invoices
GROUP BY company_id, DATE_TRUNC('month', date_emission);

-- Vue: inventaire (rotation approximative, valeur sorties)
CREATE OR REPLACE VIEW vw_inventory_features AS
SELECT company_id,
       DATE_TRUNC('month', movement_date) AS month,
       SUM(CASE WHEN movement_type='in' THEN quantity*unit_cost ELSE 0 END) AS value_in,
       SUM(CASE WHEN movement_type='out' THEN quantity*unit_cost ELSE 0 END) AS value_out,
       COUNT(*) AS movements_count
FROM inventory_movements
GROUP BY company_id, DATE_TRUNC('month', movement_date);

-- Vue: performance financière (exercice)
CREATE OR REPLACE VIEW vw_financial_performance_features AS
SELECT fs.company_id,
       fs.exercice,
       fs.total_assets,
       fs.current_assets,
       fs.current_liabilities,
       fs.equity,
       fs.net_income,
       (SELECT COALESCE(SUM(total_ttc),0) FROM invoices i WHERE i.company_id = fs.company_id AND EXTRACT(YEAR FROM i.date_emission)::text = fs.exercice) AS total_sales,
       (SELECT COALESCE(SUM(total_ttc),0) FROM expenses e WHERE e.company_id = fs.company_id AND EXTRACT(YEAR FROM e.date_emission)::text = fs.exercice) AS total_purchases
FROM financial_statements fs;

-- =====================
-- POINTS RESTANTS (IA AVANCÉE) :
-- - Matérialiser les vues (CREATE MATERIALIZED VIEW) pour accélérer gros volumes.
-- - Ajout vue anomalies (combinaison retards, montants atypiques).
-- - Ajout procédure de snapshot automatique vers ai_feature_store.
-- - Ajout tâche planifiée de calcul dérive (PSI/KL) alimentant ai_drift_monitoring.
-- - Compression colonnes JSONB si volumineux (partitions).