-- Script pour créer l'utilisateur Selma avec tous les droits
-- Mot de passe: selma

DO $$
DECLARE
    company_uuid UUID;
    user_uuid UUID;
    admin_role_uuid UUID;
BEGIN
    -- Créer ou récupérer la company
    INSERT INTO companies (name, siret, email, phone) 
    VALUES ('Dinarlytics Demo', '12345678901234', 'demo@dinarlytics.dz', '+213555000000')
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO company_uuid;
    
    -- Créer l'utilisateur Selma (mot de passe: selma)
    -- Hash bcrypt de 'selma': $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyK3H8nQPb6K
    INSERT INTO users (company_id, nom, email, password_hash, role, is_active)
    VALUES (
        company_uuid,
        'Selma',
        'selma@dinarlytics.dz',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyK3H8nQPb6K',
        'admin',
        TRUE
    )
    ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = TRUE
    RETURNING id INTO user_uuid;
    
    -- Assigner le rôle admin
    SELECT id INTO admin_role_uuid FROM roles WHERE code = 'admin' LIMIT 1;
    
    IF admin_role_uuid IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (user_uuid, admin_role_uuid)
        ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Utilisateur Selma créé avec succès!';
    RAISE NOTICE 'Email: selma@dinarlytics.dz';
    RAISE NOTICE 'Mot de passe: selma';
END $$;

-- Vérifier que l'utilisateur a été créé
SELECT 
    u.id,
    u.nom,
    u.email,
    u.role,
    u.is_active,
    c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.email = 'selma@dinarlytics.dz';
