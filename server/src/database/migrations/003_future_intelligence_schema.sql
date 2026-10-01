-- DeepAstro Future Intelligence Schema Migration
-- Migration 003: Tables for Future Intelligence Engine (FUTURE_INTELLIGENCE_V1)

-- 1. saved_charts (multi-kundli support: Self, Family, Partner, Child)
CREATE TABLE IF NOT EXISTS saved_charts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_place VARCHAR(128) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    timezone DECIMAL(4, 2) NOT NULL DEFAULT 5.5,
    gender VARCHAR(16) DEFAULT 'Other',
    is_approximate_time BOOLEAN DEFAULT FALSE,
    relationship VARCHAR(32) DEFAULT 'Self', -- Self, Partner, Child, Parent, Sibling, Other
    calculation_fingerprint VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_saved_charts_user ON saved_charts(user_id);

-- 2. future_forecasts (master forecast records referencing canonical chart)
CREATE TABLE IF NOT EXISTS future_forecasts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chart_id VARCHAR(64) NOT NULL,
    calculation_fingerprint VARCHAR(128) NOT NULL,
    prediction_version VARCHAR(32) NOT NULL DEFAULT 'FUTURE_INTELLIGENCE_V1',
    forecast_horizon VARCHAR(32) NOT NULL DEFAULT '5_YEARS',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    summary_theme TEXT,
    signal_strength VARCHAR(32) NOT NULL DEFAULT 'STRONG',
    confidence_level VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_future_forecasts_user ON future_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_future_forecasts_chart ON future_forecasts(chart_id);
CREATE INDEX IF NOT EXISTS idx_future_forecasts_fingerprint ON future_forecasts(calculation_fingerprint);

-- 3. future_forecast_years (structured annual forecasts)
CREATE TABLE IF NOT EXISTS future_forecast_years (
    id VARCHAR(64) PRIMARY KEY,
    forecast_id VARCHAR(64) NOT NULL REFERENCES future_forecasts(id) ON DELETE CASCADE,
    year INT NOT NULL,
    theme TEXT NOT NULL,
    career TEXT NOT NULL,
    finance TEXT NOT NULL,
    relationships TEXT NOT NULL,
    health TEXT NOT NULL,
    family TEXT NOT NULL,
    education TEXT NOT NULL,
    travel TEXT NOT NULL,
    spirituality TEXT NOT NULL,
    signal_strength VARCHAR(32) NOT NULL DEFAULT 'STRONG',
    confidence_score DECIMAL(5, 2) DEFAULT 80.0,
    active_dasha TEXT NOT NULL,
    major_transits JSONB DEFAULT '[]'::jsonb,
    key_planets JSONB DEFAULT '[]'::jsonb,
    d9_signals JSONB DEFAULT '[]'::jsonb,
    d10_signals JSONB DEFAULT '[]'::jsonb,
    numerology_signals JSONB DEFAULT '{}'::jsonb,
    important_windows JSONB DEFAULT '[]'::jsonb,
    caution_windows JSONB DEFAULT '[]'::jsonb,
    supportive_periods JSONB DEFAULT '[]'::jsonb,
    evidence_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_future_forecast_years_fid ON future_forecast_years(forecast_id);
CREATE INDEX IF NOT EXISTS idx_future_forecast_years_yr ON future_forecast_years(forecast_id, year);

-- 4. future_forecast_windows (convergent signal windows)
CREATE TABLE IF NOT EXISTS future_forecast_windows (
    id VARCHAR(64) PRIMARY KEY,
    forecast_id VARCHAR(64) NOT NULL REFERENCES future_forecasts(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    peak_date DATE NOT NULL,
    end_date DATE NOT NULL,
    category VARCHAR(64) NOT NULL,
    theme TEXT NOT NULL,
    signal_strength VARCHAR(32) NOT NULL DEFAULT 'STRONG',
    convergence_factor DECIMAL(5, 2) DEFAULT 85.0,
    evidence_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_future_forecast_windows_fid ON future_forecast_windows(forecast_id);
