-- =====================
-- PROCÉDURES STOCKÉES : SNAPSHOT FEATURES & DRIFT DETECTION
-- =====================

-- Procédure de snapshot des features pour un ensemble donné
CREATE OR REPLACE FUNCTION snapshot_features(
  p_company_id UUID,
  p_feature_set_name VARCHAR,
  p_version VARCHAR,
  p_model_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_id UUID := gen_random_uuid();
  features_json JSONB;
  source_list TEXT;
BEGIN
  -- Agrégation des features selon le feature_set_name
  CASE p_feature_set_name
    WHEN 'client_risk_v1' THEN
      SELECT jsonb_agg(row_to_json(t)) INTO features_json
      FROM vw_client_risk_features t WHERE t.company_id = p_company_id;
      source_list := 'clients, invoices, payments';
    
    WHEN 'supplier_reliability_v1' THEN
      SELECT jsonb_agg(row_to_json(t)) INTO features_json
      FROM vw_supplier_reliability_features t WHERE t.company_id = p_company_id;
      source_list := 'fournisseurs, expenses, expenses_payments';
    
    WHEN 'invoice_summary_v1' THEN
      SELECT jsonb_agg(row_to_json(t)) INTO features_json
      FROM vw_invoice_summary_features t WHERE t.company_id = p_company_id;
      source_list := 'invoices';
    
    WHEN 'inventory_v1' THEN
      SELECT jsonb_agg(row_to_json(t)) INTO features_json
      FROM vw_inventory_features t WHERE t.company_id = p_company_id;
      source_list := 'inventory_movements';
    
    WHEN 'financial_performance_v1' THEN
      SELECT jsonb_agg(row_to_json(t)) INTO features_json
      FROM vw_financial_performance_features t WHERE t.company_id = p_company_id;
      source_list := 'financial_statements, invoices, expenses';
    
    ELSE
      RAISE EXCEPTION 'Feature set % non reconnu', p_feature_set_name;
  END CASE;

  -- Insertion dans ai_feature_store
  INSERT INTO ai_feature_store(id, model_id, company_id, feature_set_name, version, features, source_tables, hash, generated_at)
  VALUES (
    new_id,
    p_model_id,
    p_company_id,
    p_feature_set_name,
    p_version,
    features_json,
    source_list,
    md5(features_json::text),
    NOW()
  )
  ON CONFLICT (feature_set_name, version, company_id) DO UPDATE
    SET features = EXCLUDED.features,
        hash = EXCLUDED.hash,
        generated_at = NOW();

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION snapshot_features IS 'Capture et versionne un ensemble de features pour entraînement/prédiction IA.';

-- Procédure de calcul de dérive (PSI simplifié) entre deux périodes
CREATE OR REPLACE FUNCTION calculer_drift(
  p_model_id UUID,
  p_feature_set_name VARCHAR,
  p_feature_name VARCHAR,
  p_window_start TIMESTAMP,
  p_window_end TIMESTAMP,
  p_ref_window_start TIMESTAMP,
  p_ref_window_end TIMESTAMP,
  p_threshold NUMERIC DEFAULT 0.1
) RETURNS UUID AS $$
DECLARE
  drift_id UUID := gen_random_uuid();
  ref_dist JSONB;
  curr_dist JSONB;
  drift_metric NUMERIC;
  is_drifted BOOLEAN := FALSE;
BEGIN
  -- Calcul de la distribution de référence (simulé, remplacer par vraie logique statistique)
  -- Exemple simplifié : moyenne et écart-type pour features numériques
  -- Pour production : histogramme ou KDE, calcul PSI/KL
  SELECT jsonb_build_object(
    'mean', AVG((features->>p_feature_name)::numeric),
    'stddev', STDDEV((features->>p_feature_name)::numeric),
    'min', MIN((features->>p_feature_name)::numeric),
    'max', MAX((features->>p_feature_name)::numeric),
    'count', COUNT(*)
  ) INTO ref_dist
  FROM ai_feature_store
  WHERE feature_set_name = p_feature_set_name
    AND generated_at BETWEEN p_ref_window_start AND p_ref_window_end;

  -- Distribution actuelle
  SELECT jsonb_build_object(
    'mean', AVG((features->>p_feature_name)::numeric),
    'stddev', STDDEV((features->>p_feature_name)::numeric),
    'min', MIN((features->>p_feature_name)::numeric),
    'max', MAX((features->>p_feature_name)::numeric),
    'count', COUNT(*)
  ) INTO curr_dist
  FROM ai_feature_store
  WHERE feature_set_name = p_feature_set_name
    AND generated_at BETWEEN p_window_start AND p_window_end;

  -- Calcul métrique de dérive (simplifié : différence normalisée de moyennes)
  -- Pour production : utiliser PSI = SUM((curr_pct - ref_pct) * ln(curr_pct / ref_pct))
  drift_metric := ABS((curr_dist->>'mean')::numeric - (ref_dist->>'mean')::numeric) / 
                  NULLIF((ref_dist->>'stddev')::numeric, 0);

  IF drift_metric > p_threshold THEN
    is_drifted := TRUE;
  END IF;

  -- Insertion résultat
  INSERT INTO ai_drift_monitoring(
    id, model_id, feature_set_name, feature_name, 
    window_start, window_end, 
    ref_distribution, current_distribution, 
    drift_metric, threshold, drift_detected, created_at
  ) VALUES (
    drift_id, p_model_id, p_feature_set_name, p_feature_name,
    p_window_start, p_window_end,
    ref_dist, curr_dist,
    drift_metric, p_threshold, is_drifted, NOW()
  );

  RETURN drift_id;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculer_drift IS 'Calcule la dérive d''une feature entre deux fenêtres temporelles (simplifié, à remplacer par PSI/KL pour production).';

-- Fonction utilitaire : snapshot automatique de tous les feature sets pour une société
CREATE OR REPLACE FUNCTION snapshot_all_features(
  p_company_id UUID,
  p_version VARCHAR
) RETURNS TABLE(feature_set VARCHAR, snapshot_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT 'client_risk_v1'::VARCHAR, snapshot_features(p_company_id, 'client_risk_v1', p_version)
  UNION ALL
  SELECT 'supplier_reliability_v1'::VARCHAR, snapshot_features(p_company_id, 'supplier_reliability_v1', p_version)
  UNION ALL
  SELECT 'invoice_summary_v1'::VARCHAR, snapshot_features(p_company_id, 'invoice_summary_v1', p_version)
  UNION ALL
  SELECT 'inventory_v1'::VARCHAR, snapshot_features(p_company_id, 'inventory_v1', p_version)
  UNION ALL
  SELECT 'financial_performance_v1'::VARCHAR, snapshot_features(p_company_id, 'financial_performance_v1', p_version);
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION snapshot_all_features IS 'Capture tous les ensembles de features pour une société donnée en une seule opération.';

-- =====================
-- EXEMPLES D'UTILISATION :
-- =====================
-- 1. Snapshot features pour une société :
--    SELECT snapshot_features('company-uuid', 'client_risk_v1', 'v1.0');
--    SELECT snapshot_all_features('company-uuid', 'v1.0');
--
-- 2. Calcul de dérive pour une feature :
--    SELECT calculer_drift(
--      'model-uuid', 
--      'client_risk_v1', 
--      'avg_days_past_due',
--      NOW() - INTERVAL '7 days', NOW(),
--      NOW() - INTERVAL '30 days', NOW() - INTERVAL '23 days',
--      0.1
--    );
--
-- 3. Interroger les dérives détectées :
--    SELECT * FROM ai_drift_monitoring WHERE drift_detected = TRUE ORDER BY created_at DESC;
--
-- 4. Planifier snapshot quotidien (via cron ou pg_cron) :
--    SELECT cron.schedule('snapshot-daily', '0 2 * * *', $$
--      SELECT snapshot_all_features(company_id, to_char(NOW(), 'YYYY-MM-DD'))
--      FROM companies WHERE is_active = TRUE;
--    $$);
