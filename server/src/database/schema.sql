-- DeepAstro Relational & pgvector Schema
-- PostgreSQL & Supabase Compatible

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'USER', -- USER, ASTROLOGER, ADMIN, SUPER_ADMIN
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32),
    avatar_url TEXT,
    address_line TEXT,
    city VARCHAR(64),
    state VARCHAR(64),
    country VARCHAR(64) DEFAULT 'India',
    postal_code VARCHAR(32),
    language_preference VARCHAR(16) DEFAULT 'en',
    theme_preference VARCHAR(16) DEFAULT 'dark',
    chart_style_preference VARCHAR(16) DEFAULT 'north', -- north, south, east
    notification_preferences JSONB DEFAULT '{"daily_prediction": true, "transits": true, "consultations": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
    gender VARCHAR(16),
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

CREATE TABLE IF NOT EXISTS astrology_charts (
    id VARCHAR(64) PRIMARY KEY,
    birth_profile_id VARCHAR(64) REFERENCES birth_profiles(id) ON DELETE CASCADE,
    chart_type VARCHAR(32) DEFAULT 'D1_RASHI',
    julian_day DECIMAL(15, 6),
    ayanamsha_degrees DECIMAL(8, 4),
    ascendant_degree DECIMAL(8, 4),
    chart_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(32) PRIMARY KEY, -- FREE, PREMIUM, PRO
    name VARCHAR(64) NOT NULL,
    price_cents INT NOT NULL,
    currency VARCHAR(8) DEFAULT 'INR',
    interval VARCHAR(16) DEFAULT 'month',
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(32) REFERENCES subscription_plans(id),
    status VARCHAR(32) DEFAULT 'active', -- active, past_due, canceled
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    payment_provider VARCHAR(32) DEFAULT 'stripe', -- stripe, razorpay
    provider_subscription_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entitlements (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    feature_key VARCHAR(64) NOT NULL,
    is_granted BOOLEAN DEFAULT TRUE,
    granted_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, feature_key)
);

CREATE TABLE IF NOT EXISTS astrologers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    bio TEXT NOT NULL,
    experience_years INT NOT NULL,
    languages TEXT[] NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.9,
    review_count INT DEFAULT 0,
    price_per_minute_cents INT NOT NULL,
    consultation_types TEXT[] NOT NULL, -- Call, Video, Chat
    phone_protected VARCHAR(32) NOT NULL,     -- PROTECTED: Unmasked only with entitlement
    whatsapp_protected VARCHAR(32) NOT NULL,  -- PROTECTED: Unmasked only with entitlement
    email_protected VARCHAR(128) NOT NULL,    -- PROTECTED: Unmasked only with entitlement
    is_verified BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS astrologer_specialties (
    id VARCHAR(64) PRIMARY KEY,
    astrologer_id VARCHAR(64) REFERENCES astrologers(id) ON DELETE CASCADE,
    specialty_name VARCHAR(64) NOT NULL -- Vedic, KP, Vastu, Palmistry, Lal Kitab, Numerology
);

CREATE TABLE IF NOT EXISTS consultations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    astrologer_id VARCHAR(64) REFERENCES astrologers(id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'scheduled', -- scheduled, in_progress, completed, canceled
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 30,
    consultation_type VARCHAR(32) NOT NULL,
    amount_paid_cents INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compatibility_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    person_a_name VARCHAR(128) NOT NULL,
    person_b_name VARCHAR(128) NOT NULL,
    total_score INT NOT NULL,
    percentage_score INT NOT NULL,
    verdict VARCHAR(32) NOT NULL,
    report_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS numerology_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(128) NOT NULL,
    birth_date DATE NOT NULL,
    birth_number INT NOT NULL,
    life_path_number INT NOT NULL,
    report_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS palmistry_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    hand_type VARCHAR(16) NOT NULL, -- Left, Right
    is_dominant BOOLEAN DEFAULT TRUE,
    analysis_payload JSONB NOT NULL,
    disclaimer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(128) DEFAULT 'AstroBot Cosmic Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(16) NOT NULL, -- user, bot
    message TEXT NOT NULL,
    grounded_evidence JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_usage (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    feature VARCHAR(64) NOT NULL,
    provider VARCHAR(32) NOT NULL, -- OpenAI, Gemini, Grok
    model VARCHAR(64) NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    estimated_cost_cents DECIMAL(8, 4) DEFAULT 0,
    latency_ms INT DEFAULT 0,
    status VARCHAR(16) DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(64) PRIMARY KEY,
    source VARCHAR(128) NOT NULL, -- Brihat Parashara Hora Shastra, Phaladeepika, Saravali, Lal Kitab
    title VARCHAR(128) NOT NULL,
    tradition VARCHAR(64) NOT NULL,
    topic VARCHAR(64) NOT NULL,
    version VARCHAR(16) DEFAULT '1.0'
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    topic VARCHAR(64) NOT NULL,
    content TEXT NOT NULL,
    confidence DECIMAL(4, 2) DEFAULT 0.95
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'daily_prediction',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    resource VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    category VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- SELF-LEARNING JYOTISH INTELLIGENCE & PERSONALIZATION ENGINE
-- ==========================================================

CREATE TABLE IF NOT EXISTS calculation_snapshots (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    birth_profile_id VARCHAR(64) REFERENCES birth_profiles(id) ON DELETE CASCADE,
    engine_version VARCHAR(32) NOT NULL,
    fingerprint VARCHAR(64) NOT NULL,
    julian_day DECIMAL(15, 6) NOT NULL,
    ayanamsha_degrees DECIMAL(8, 4) NOT NULL,
    ayanamsha_name VARCHAR(64) NOT NULL,
    node_mode VARCHAR(16) NOT NULL, -- True, Mean
    house_system VARCHAR(32) NOT NULL, -- Sripati, Placidus, WholeSign
    snapshot_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personalization_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(16) DEFAULT 'en',
    reading_depth VARCHAR(32) DEFAULT 'standard', -- summary, standard, in_depth, research
    tone VARCHAR(32) DEFAULT 'philosophical', -- compassionate, direct, philosophical, uplifting
    preferred_topics TEXT[] DEFAULT ARRAY['career', 'personal_growth']::text[],
    career_focus BOOLEAN DEFAULT TRUE,
    relationship_focus BOOLEAN DEFAULT TRUE,
    finance_focus BOOLEAN DEFAULT TRUE,
    spiritual_focus BOOLEAN DEFAULT TRUE,
    technical_detail VARCHAR(16) DEFAULT 'medium', -- low, medium, high
    classical_source_visibility BOOLEAN DEFAULT TRUE,
    practical_advice_preference BOOLEAN DEFAULT TRUE,
    fear_free_language BOOLEAN DEFAULT TRUE,
    personalization_enabled BOOLEAN DEFAULT TRUE,
    outcome_learning_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_memories (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL, -- profile, preferences, goals, interests, previous_questions, previous_readings, confirmed_life_events, rejected_interpretations, feedback, communication_preferences
    content TEXT NOT NULL,
    source VARCHAR(64) NOT NULL, -- USER_EXPLICIT, USER_SURVEY, CHAT_INTERACTION, FEEDBACK_FORM
    confidence VARCHAR(16) DEFAULT 'HIGH', -- VERIFIED, HIGH, MODERATE, LOW
    user_confirmed BOOLEAN DEFAULT FALSE,
    memory_type VARCHAR(32) DEFAULT 'DYNAMIC', -- FACT, PREFERENCE, HISTORICAL, GOAL
    provenance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS life_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_type VARCHAR(64) NOT NULL, -- education, career, promotion, business, relationship, marriage, relocation, financial_milestone, achievement, setback, spiritual_milestone, custom
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_confirmation VARCHAR(16) DEFAULT 'CONFIRMED', -- CONFIRMED, TENTATIVE, UNVERIFIED
    source VARCHAR(64) DEFAULT 'USER_INPUT',
    privacy_state VARCHAR(32) DEFAULT 'PERSONALIZATION_ONLY', -- PRIVATE, PERSONALIZATION_ONLY
    astrological_correlations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prediction_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_id VARCHAR(64) REFERENCES calculation_snapshots(id) ON DELETE SET NULL,
    prediction_type VARCHAR(64) NOT NULL, -- DAILY, CURATED_DOMAIN, MUHURTA, TRANSIT_ALERT
    domain VARCHAR(64),
    headline VARCHAR(255) NOT NULL,
    prediction_text TEXT NOT NULL,
    supporting_factors JSONB NOT NULL,
    rules_applied JSONB NOT NULL,
    sources_cited JSONB NOT NULL,
    confidence_model JSONB NOT NULL,
    uncertainties JSONB,
    recommended_actions JSONB,
    evidence_graph JSONB,
    versions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prediction_feedback (
    id VARCHAR(64) PRIMARY KEY,
    prediction_id VARCHAR(64) NOT NULL REFERENCES prediction_records(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback_rating VARCHAR(32) NOT NULL, -- accurate, partially_accurate, inaccurate, too_generic, wrong_timing, wrong_life_area, not_applicable
    user_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prediction_errors (
    id VARCHAR(64) PRIMARY KEY,
    prediction_id VARCHAR(64) NOT NULL REFERENCES prediction_records(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback_id VARCHAR(64) REFERENCES prediction_feedback(id) ON DELETE SET NULL,
    error_class VARCHAR(64) NOT NULL, -- CALCULATION_ERROR, TIMEZONE_ERROR, LOCATION_ERROR, EPHEMERIS_ERROR, AYANAMSHA_ERROR, DASHA_ERROR, RULE_SELECTION_ERROR, TIMING_ERROR, INTERPRETATION_ERROR, PERSONALIZATION_ERROR, INSUFFICIENT_CONTEXT, USER_OUTCOME_UNCERTAIN
    investigation_pipeline JSONB NOT NULL,
    root_cause_analysis TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS improvement_proposals (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_engine VARCHAR(64) NOT NULL, -- JYOTISH_RULE, INTERPRETATION, PERSONALIZATION, TIMING
    status VARCHAR(32) DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, APPROVED, REJECTED, STAGED, DEPLOYED
    proposed_changes JSONB NOT NULL,
    regression_test_results JSONB,
    created_by VARCHAR(64) DEFAULT 'SELF_LEARNING_SYSTEM',
    reviewed_by VARCHAR(64),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS engine_versions (
    id VARCHAR(64) PRIMARY KEY,
    calculation_version VARCHAR(32) NOT NULL,
    rule_version VARCHAR(32) NOT NULL,
    interpretation_version VARCHAR(32) NOT NULL,
    personalization_version VARCHAR(32) NOT NULL,
    rag_version VARCHAR(32) NOT NULL,
    ai_model_version VARCHAR(32) NOT NULL,
    changelog TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
