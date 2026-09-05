-- DeepAstro Checkpoint 9 Master PostgreSQL Schema
-- Complete Relational and JSONB Schema for Production Astrology OS

CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'USER', -- USER, ASTROLOGER, ADMIN, SUPER_ADMIN
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32),
    avatar_url TEXT,
    city VARCHAR(64),
    country VARCHAR(64) DEFAULT 'India',
    language_preference VARCHAR(16) DEFAULT 'en',
    theme_preference VARCHAR(16) DEFAULT 'dark',
    chart_style_preference VARCHAR(16) DEFAULT 'north',
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. birth_profiles
CREATE TABLE IF NOT EXISTS birth_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(128) NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_place VARCHAR(128) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    timezone DECIMAL(4, 2) NOT NULL,
    gender VARCHAR(16) DEFAULT 'Other',
    is_approximate_time BOOLEAN DEFAULT FALSE,
    ascendant_sign VARCHAR(32),
    moon_sign VARCHAR(32),
    sun_sign VARCHAR(32),
    nakshatra VARCHAR(64),
    nakshatra_pada INT,
    current_mahadasha VARCHAR(32),
    current_antardasha VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_birth_profiles_user_id ON birth_profiles(user_id);

-- 3. kundli_calculations
CREATE TABLE IF NOT EXISTS kundli_calculations (
    id VARCHAR(64) PRIMARY KEY,
    calculation_fingerprint VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 (birthDate, birthTime, lat, lng, tz, ayanamsha, houseSystem, versions)
    julian_day DECIMAL(15, 6) NOT NULL,
    ayanamsha_degrees DECIMAL(8, 4) NOT NULL,
    ayanamsha_name VARCHAR(32) DEFAULT 'Lahiri',
    house_system VARCHAR(32) DEFAULT 'Equal',
    ascendant_longitude DECIMAL(8, 4) NOT NULL,
    ascendant_sign VARCHAR(32) NOT NULL,
    ascendant_degree_in_sign DECIMAL(8, 4) NOT NULL,
    ascendant_nakshatra VARCHAR(32) NOT NULL,
    ascendant_nakshatra_pada INT NOT NULL,
    moon_longitude DECIMAL(8, 4) NOT NULL,
    moon_sign VARCHAR(32) NOT NULL,
    moon_nakshatra VARCHAR(32) NOT NULL,
    sun_longitude DECIMAL(8, 4) NOT NULL,
    sun_sign VARCHAR(32) NOT NULL,
    engine_version VARCHAR(32) NOT NULL,
    ephemeris_version VARCHAR(32) NOT NULL,
    fact_set_json JSONB NOT NULL, -- Canonical immutable snapshot
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kundli_calc_fingerprint ON kundli_calculations(calculation_fingerprint);

-- 4. kundli_planets
CREATE TABLE IF NOT EXISTS kundli_planets (
    id VARCHAR(64) PRIMARY KEY,
    calculation_id VARCHAR(64) REFERENCES kundli_calculations(id) ON DELETE CASCADE,
    name VARCHAR(32) NOT NULL,
    sidereal_longitude DECIMAL(8, 4) NOT NULL,
    tropical_longitude DECIMAL(8, 4) NOT NULL,
    sign VARCHAR(32) NOT NULL,
    sign_index INT NOT NULL,
    house INT NOT NULL,
    degree_in_sign DECIMAL(8, 4) NOT NULL,
    nakshatra VARCHAR(32) NOT NULL,
    nakshatra_pada INT NOT NULL,
    is_retrograde BOOLEAN DEFAULT FALSE,
    is_combust BOOLEAN DEFAULT FALSE,
    dignity VARCHAR(32),
    shadbala_score DECIMAL(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kundli_planets_calc_id ON kundli_planets(calculation_id);

-- 5. kundli_houses
CREATE TABLE IF NOT EXISTS kundli_houses (
    id VARCHAR(64) PRIMARY KEY,
    calculation_id VARCHAR(64) REFERENCES kundli_calculations(id) ON DELETE CASCADE,
    house_number INT NOT NULL,
    sign VARCHAR(32) NOT NULL,
    start_degree DECIMAL(8, 4) NOT NULL,
    mid_degree DECIMAL(8, 4) NOT NULL,
    end_degree DECIMAL(8, 4) NOT NULL,
    lord VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kundli_houses_calc_id ON kundli_houses(calculation_id);

-- 6. kundli_vargas (Divisional Charts D1 through D60)
CREATE TABLE IF NOT EXISTS kundli_vargas (
    id VARCHAR(64) PRIMARY KEY,
    calculation_id VARCHAR(64) REFERENCES kundli_calculations(id) ON DELETE CASCADE,
    varga_code VARCHAR(16) NOT NULL, -- D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D60
    name VARCHAR(64) NOT NULL,
    planets_payload JSONB NOT NULL,
    ascendant_sign VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kundli_vargas_calc_id ON kundli_vargas(calculation_id);

-- 7. kundli_yogas
CREATE TABLE IF NOT EXISTS kundli_yogas (
    id VARCHAR(64) PRIMARY KEY,
    calculation_id VARCHAR(64) REFERENCES kundli_calculations(id) ON DELETE CASCADE,
    yoga_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    sanskrit_name VARCHAR(128),
    category VARCHAR(32) NOT NULL,
    is_formed BOOLEAN NOT NULL,
    strength_score DECIMAL(5, 2) NOT NULL,
    involved_planets TEXT[] NOT NULL,
    houses_involved INT[] NOT NULL,
    effects TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kundli_yogas_calc_id ON kundli_yogas(calculation_id);

-- 8. kundli_doshas
CREATE TABLE IF NOT EXISTS kundli_doshas (
    id VARCHAR(64) PRIMARY KEY,
    calculation_id VARCHAR(64) REFERENCES kundli_calculations(id) ON DELETE CASCADE,
    dosha_name VARCHAR(64) NOT NULL, -- Manglik, KaalSarp, SadeSati, Pitra
    is_present BOOLEAN NOT NULL,
    intensity VARCHAR(32) NOT NULL,
    details JSONB NOT NULL,
    cancellations TEXT[],
    remedy_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kundli_doshas_calc_id ON kundli_doshas(calculation_id);

-- 9. dasha_periods
CREATE TABLE IF NOT EXISTS dasha_periods (
    id VARCHAR(64) PRIMARY KEY,
    calculation_id VARCHAR(64) REFERENCES kundli_calculations(id) ON DELETE CASCADE,
    level INT NOT NULL, -- 1 = Mahadasha, 2 = Antardasha, 3 = Pratyantardasha
    parent_id VARCHAR(64) REFERENCES dasha_periods(id) ON DELETE CASCADE,
    planet VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_years DECIMAL(6, 3),
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dasha_periods_calc_id ON dasha_periods(calculation_id);

-- 10. transits (Dynamic Gochara)
CREATE TABLE IF NOT EXISTS transits (
    id VARCHAR(64) PRIMARY KEY,
    calculation_id VARCHAR(64) REFERENCES kundli_calculations(id) ON DELETE CASCADE,
    transit_date DATE NOT NULL,
    planet VARCHAR(32) NOT NULL,
    transit_sign VARCHAR(32) NOT NULL,
    house_from_lagna INT NOT NULL,
    house_from_moon INT NOT NULL,
    is_retrograde BOOLEAN DEFAULT FALSE,
    effects TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_transits_calc_id ON transits(calculation_id);

-- 11. numerology_reports
CREATE TABLE IF NOT EXISTS numerology_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(128) NOT NULL,
    birth_date DATE NOT NULL,
    birth_number INT NOT NULL,
    life_path_number INT NOT NULL,
    destiny_number INT NOT NULL,
    soul_urge_number INT NOT NULL,
    personality_number INT NOT NULL,
    personal_year INT NOT NULL,
    report_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_numerology_user_id ON numerology_reports(user_id);

-- 12. palmistry_reports
CREATE TABLE IF NOT EXISTS palmistry_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    image_storage_path TEXT NOT NULL,
    image_sha256 VARCHAR(64) NOT NULL,
    hand_type VARCHAR(16) NOT NULL,
    is_dominant BOOLEAN DEFAULT TRUE,
    confidence_status VARCHAR(32) NOT NULL, -- VERIFIED, LOW_CONFIDENCE, NOT_VISIBLE
    feature_analysis JSONB NOT NULL,
    traditional_interpretation TEXT,
    safety_audit_passed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_palmistry_user_id ON palmistry_reports(user_id);

-- 13. reports
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    profile_id VARCHAR(64) REFERENCES birth_profiles(id) ON DELETE SET NULL,
    calculation_id VARCHAR(64) REFERENCES kundli_calculations(id) ON DELETE SET NULL,
    generation_request_id VARCHAR(128) UNIQUE NOT NULL, -- Idempotency key
    report_type VARCHAR(32) NOT NULL, -- FULL_KUNDLI, CAREER_WEALTH, COMPATIBILITY, LIFE_BLUEPRINT
    title VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL, -- GENERATING, VERIFIED, VERIFIED_WITH_WARNINGS, REVIEW_REQUIRED, BLOCKED, FAILED
    integrity_status VARCHAR(32) NOT NULL,
    integrity_score INT DEFAULT 0,
    calculation_fingerprint VARCHAR(64) NOT NULL,
    engine_version VARCHAR(32) NOT NULL,
    ephemeris_version VARCHAR(32) NOT NULL,
    rule_engine_version VARCHAR(32) NOT NULL,
    prompt_version VARCHAR(32) NOT NULL,
    renderer_version VARCHAR(32) NOT NULL,
    current_version INT DEFAULT 1,
    native_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_calc_fingerprint ON reports(calculation_fingerprint);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- 14. report_versions (Immutable Version Snapshots)
CREATE TABLE IF NOT EXISTS report_versions (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) REFERENCES reports(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    report_payload JSONB NOT NULL,
    calculation_fingerprint VARCHAR(64) NOT NULL,
    engine_version VARCHAR(32) NOT NULL,
    ephemeris_version VARCHAR(32) NOT NULL,
    rule_engine_version VARCHAR(32) NOT NULL,
    ai_models_used TEXT[] NOT NULL,
    prompt_version VARCHAR(32) NOT NULL,
    renderer_version VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_report_versions_report_id ON report_versions(report_id);

-- 15. report_pipeline_runs
CREATE TABLE IF NOT EXISTS report_pipeline_runs (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) REFERENCES reports(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL, -- RUNNING, COMPLETED, FAILED, INTERRUPTED
    current_stage VARCHAR(64),
    heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    retry_count INT DEFAULT 0,
    failure_reason TEXT,
    recoverable BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_report_id ON report_pipeline_runs(report_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_heartbeat ON report_pipeline_runs(heartbeat_at);

-- 16. report_pipeline_stages (22 Fine-Grained Pipeline Stages)
CREATE TABLE IF NOT EXISTS report_pipeline_stages (
    id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64) REFERENCES report_pipeline_runs(id) ON DELETE CASCADE,
    report_id VARCHAR(64) REFERENCES reports(id) ON DELETE CASCADE,
    stage_name VARCHAR(64) NOT NULL, -- INPUT_VALIDATION, LOCATION_RESOLUTION, etc.
    stage_order INT NOT NULL,
    status VARCHAR(32) NOT NULL, -- PENDING, RUNNING, COMPLETED, WARNING, FAILED, BLOCKED
    message TEXT,
    duration_ms INT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_report_id ON report_pipeline_stages(report_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_run_id ON report_pipeline_stages(run_id);

-- 17. report_claims (Claim-Level Fact Checking)
CREATE TABLE IF NOT EXISTS report_claims (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) REFERENCES reports(id) ON DELETE CASCADE,
    claim_id VARCHAR(64) NOT NULL,
    text TEXT NOT NULL,
    claim_type VARCHAR(32) NOT NULL, -- FACTUAL, INTERPRETIVE, REMEDIAL, PREDICTIVE
    source_ids TEXT[] NOT NULL,
    calculation_references TEXT[] NOT NULL,
    rule_references TEXT[] NOT NULL,
    model_origin VARCHAR(64) NOT NULL,
    confidence VARCHAR(16) NOT NULL, -- HIGH, MEDIUM, LOW
    status VARCHAR(32) NOT NULL, -- VERIFIED, SUPPORTED, PARTIALLY_SUPPORTED, UNSUPPORTED, BLOCKED, REQUIRES_REVIEW
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_report_claims_report_id ON report_claims(report_id);
CREATE INDEX IF NOT EXISTS idx_report_claims_status ON report_claims(status);

-- 18. report_sources
CREATE TABLE IF NOT EXISTS report_sources (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) REFERENCES reports(id) ON DELETE CASCADE,
    source_name VARCHAR(128) NOT NULL,
    edition VARCHAR(64),
    chapter VARCHAR(64),
    verse_or_page VARCHAR(64),
    domain VARCHAR(32) NOT NULL,
    rule_id VARCHAR(64),
    is_primary_classical BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_report_sources_report_id ON report_sources(report_id);

-- 19. ai_runs
CREATE TABLE IF NOT EXISTS ai_runs (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) REFERENCES reports(id) ON DELETE SET NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    feature VARCHAR(64) NOT NULL,
    provider VARCHAR(32) NOT NULL, -- OpenAI, Gemini, Grok, Ollama
    model VARCHAR(64) NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    estimated_cost_cents DECIMAL(8, 4) DEFAULT 0,
    latency_ms INT DEFAULT 0,
    status VARCHAR(32) NOT NULL, -- SUCCESS, TIMEOUT, MODEL_UNAVAILABLE, INVALID_JSON, REJECTED
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_runs_report_id ON ai_runs(report_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_user_id ON ai_runs(user_id);

-- 20. ai_consensus_results
CREATE TABLE IF NOT EXISTS ai_consensus_results (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) REFERENCES reports(id) ON DELETE CASCADE,
    topic VARCHAR(64) NOT NULL,
    models_evaluated TEXT[] NOT NULL,
    agreement_score DECIMAL(5, 2) NOT NULL, -- 0 to 100
    consensus_text TEXT NOT NULL,
    disagreements_recorded JSONB,
    deterministic_override_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_consensus_report_id ON ai_consensus_results(report_id);

-- 21. verification_results
CREATE TABLE IF NOT EXISTS verification_results (
    id VARCHAR(64) PRIMARY KEY,
    calculation_id VARCHAR(64) REFERENCES kundli_calculations(id) ON DELETE CASCADE,
    overall_status VARCHAR(32) NOT NULL, -- VERIFIED, VERIFIED_WITH_WARNINGS, REVIEW_REQUIRED, CALCULATION_CONFLICT
    integrity_score INT NOT NULL,
    checks JSONB NOT NULL, -- Array of { checkId, name, status, expected, actual, difference, tolerance, severity, source }
    conflicts TEXT[],
    warnings TEXT[],
    calculation_hash VARCHAR(64) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_verification_calc_id ON verification_results(calculation_id);

-- 22. pdf_artifacts
CREATE TABLE IF NOT EXISTS pdf_artifacts (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) REFERENCES reports(id) ON DELETE CASCADE,
    version_id VARCHAR(64) REFERENCES report_versions(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    file_size_bytes INT NOT NULL,
    mime_type VARCHAR(64) DEFAULT 'application/pdf',
    page_count INT NOT NULL,
    renderer_version VARCHAR(32) NOT NULL,
    binary_signature_verified BOOLEAN DEFAULT TRUE,
    round_trip_passed BOOLEAN NOT NULL,
    qa_status VARCHAR(32) NOT NULL, -- PASS, WARNINGS, FAILED
    qa_details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pdf_artifacts_report_id ON pdf_artifacts(report_id);
CREATE INDEX IF NOT EXISTS idx_pdf_artifacts_sha256 ON pdf_artifacts(sha256);

-- 23. knowledge_sources
CREATE TABLE IF NOT EXISTS knowledge_sources (
    id VARCHAR(64) PRIMARY KEY,
    source_name VARCHAR(128) NOT NULL,
    tradition VARCHAR(64) NOT NULL,
    author VARCHAR(128),
    tier INT DEFAULT 1,
    verified_authority BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. knowledge_chunks
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id VARCHAR(64) PRIMARY KEY,
    source_id VARCHAR(64) REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    domain VARCHAR(64) NOT NULL,
    topic VARCHAR(128) NOT NULL,
    keywords TEXT[] NOT NULL,
    content TEXT NOT NULL,
    rule_data JSONB,
    embedding_model VARCHAR(64),
    embedding_version VARCHAR(32),
    embedding_dimension INT,
    confidence DECIMAL(4, 2) DEFAULT 0.95,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_domain ON knowledge_chunks(domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_topic ON knowledge_chunks(topic);

-- 25. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    resource VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64),
    ip_address VARCHAR(45),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
