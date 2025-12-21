-- Extension du schéma ERP : audits, logs, authentification, KPIs, alertes, notifications, erreurs, connexions, historique, fiscalité, signatures, QR, CRUD

-- Table des audits
CREATE TABLE audits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100),
    entity_id INTEGER,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs système
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des erreurs applicatives
CREATE TABLE app_errors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    error_code VARCHAR(50),
    message TEXT,
    stack_trace TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des connexions utilisateurs
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP
);

-- Table de l'historique des actions
CREATE TABLE history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100),
    entity_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des alertes
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    level VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des indicateurs KPI
CREATE TABLE kpi_indicators (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    value NUMERIC(12,2),
    period VARCHAR(20),
    alert_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des signatures électroniques
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    document_id INTEGER,
    document_type VARCHAR(50),
    signature_data TEXT NOT NULL,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des QR codes
CREATE TABLE qr_codes (
    id SERIAL PRIMARY KEY,
    entity VARCHAR(100),
    entity_id INTEGER,
    qr_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des questions/réponses utilisateurs
CREATE TABLE user_questions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de la fiscalité
CREATE TABLE fiscalities (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    fiscal_year INTEGER NOT NULL,
    tax_type VARCHAR(50) NOT NULL,
    tax_amount NUMERIC(12,2) NOT NULL,
    declaration_date DATE,
    payment_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des CRUD logs (historique des modifications)
CREATE TABLE crud_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL,
    record_id INTEGER,
    before_data JSONB,
    after_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fonctions d'audit et de calcul
-- Exemple : fonction pour journaliser une action CRUD
CREATE OR REPLACE FUNCTION log_crud_action(user_id INTEGER, table_name VARCHAR, operation VARCHAR, record_id INTEGER, before_data JSONB, after_data JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO crud_logs(user_id, table_name, operation, record_id, before_data, after_data, created_at)
  VALUES (user_id, table_name, operation, record_id, before_data, after_data, CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

-- Exemple : fonction pour générer une alerte KPI
CREATE OR REPLACE FUNCTION generate_kpi_alert(company INTEGER, kpi_name VARCHAR, value NUMERIC, threshold NUMERIC)
RETURNS VOID AS $$
BEGIN
  IF value < threshold THEN
    INSERT INTO alerts(user_id, type, message, level, created_at)
    VALUES (NULL, 'KPI', CONCAT('KPI ', kpi_name, ' en dessous du seuil: ', value), 'critique', CURRENT_TIMESTAMP);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ajoutez d'autres fonctions, triggers, vues selon vos besoins métiers
