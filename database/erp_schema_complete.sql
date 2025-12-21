-- Schéma ERP complet pour PostgreSQL

-- Table des entreprises
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    siret VARCHAR(20),
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    segment VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des segments (micro, PME, ETI, GE, etc.)
CREATE TABLE segments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Table des rôles utilisateurs
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    segment_id INTEGER REFERENCES segments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des permissions
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Table de liaison rôles-permissions
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Table des clients
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    segment VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des fournisseurs
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    segment VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des factures
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des lignes de facture
CREATE TABLE invoice_lines (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL
);

-- Table des paiements
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des écritures comptables
CREATE TABLE accounting_entries (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    account VARCHAR(50) NOT NULL,
    debit NUMERIC(12,2) DEFAULT 0,
    credit NUMERIC(12,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des budgets
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des lignes de budget
CREATE TABLE budget_lines (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER REFERENCES budgets(id) ON DELETE CASCADE,
    category VARCHAR(100),
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des indicateurs de performance
CREATE TABLE kpis (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    value NUMERIC(12,2),
    period VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des segments analytiques
CREATE TABLE analytics_segments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Table de liaison utilisateurs-segments analytiques
CREATE TABLE user_analytics_segments (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    segment_id INTEGER REFERENCES analytics_segments(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, segment_id)
);

-- Fonctions de calculs (exemples)
-- Calcul du solde d'un compte
CREATE OR REPLACE FUNCTION get_account_balance(account_name VARCHAR, company INTEGER)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(debit - credit), 0)
  FROM accounting_entries
  WHERE account = account_name AND company_id = company;
$$ LANGUAGE SQL;

-- Calcul du chiffre d'affaires d'une entreprise sur une période
CREATE OR REPLACE FUNCTION get_company_revenue(company INTEGER, start_date DATE, end_date DATE)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(total), 0)
  FROM invoices
  WHERE company_id = company AND date BETWEEN start_date AND end_date;
$$ LANGUAGE SQL;

-- Calcul du nombre d'utilisateurs par segment
CREATE OR REPLACE FUNCTION count_users_by_segment(segment_name VARCHAR)
RETURNS INTEGER AS $$
  SELECT COUNT(*) FROM users u
  JOIN segments s ON u.segment_id = s.id
  WHERE s.name = segment_name;
$$ LANGUAGE SQL;

-- Calcul du stock total
CREATE OR REPLACE FUNCTION get_total_stock(company INTEGER)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(stock), 0) FROM products WHERE company_id = company;
$$ LANGUAGE SQL;

-- Ajoutez d'autres fonctions de calculs selon vos besoins
