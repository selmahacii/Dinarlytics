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
