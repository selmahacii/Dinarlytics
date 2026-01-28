-- Create Roles
INSERT INTO roles (id, name, description, permissions) VALUES 
(uuid_generate_v4(), 'superadmin', 'Super Administrator with full access', '["*"]'),
(uuid_generate_v4(), 'admin', 'Administrator with most permissions', '["manage_users", "view_reports", "manage_accounting"]'),
(uuid_generate_v4(), 'manager', 'Manager dealing with specific modules', '["view_reports", "manage_clients", "manage_suppliers"]'),
(uuid_generate_v4(), 'comptable', 'Accountant', '["manage_accounting", "view_reports"]');

-- Insert Initial Users (Passwords should be hashed in real DB, using placeholder hashes here)
-- SuperAdmin
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active, is_verified, role_id) 
SELECT uuid_generate_v4(), 'superadmin', 'superadmin@dinarlytics.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.6q.F.1W.1W.1W.1W', 'Super', 'Admin', true, true, id 
FROM roles WHERE name = 'superadmin';

-- Admin
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active, is_verified, role_id) 
SELECT uuid_generate_v4(), 'admin', 'admin@dinarlytics.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.6q.F.1W.1W.1W.1W', 'Admin', 'User', true, true, id 
FROM roles WHERE name = 'admin';

-- Manager
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active, is_verified, role_id) 
SELECT uuid_generate_v4(), 'manager', 'manager@dinarlytics.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.6q.F.1W.1W.1W.1W', 'Manager', 'User', true, true, id 
FROM roles WHERE name = 'manager';

-- Comptable
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active, is_verified, role_id) 
SELECT uuid_generate_v4(), 'comptable', 'comptable@dinarlytics.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.6q.F.1W.1W.1W.1W', 'Comptable', 'User', true, true, id 
FROM roles WHERE name = 'comptable';
