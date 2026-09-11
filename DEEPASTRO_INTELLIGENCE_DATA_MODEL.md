# DEEPASTRO INTELLIGENCE UPGRADE 3.0: DATA MODEL SPECIFICATION

## 1. Core Schema Entities

### 1.1 `user_context`
Stores user-confirmed structural reality attributes.
```sql
CREATE TABLE user_context (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  domain VARCHAR(32) NOT NULL, -- 'career', 'relationship', 'education', 'location', 'decision'
  field_key VARCHAR(64) NOT NULL,
  field_value JSONB NOT NULL,
  source VARCHAR(32) NOT NULL, -- 'USER_EXPLICIT', 'SYSTEM_OBSERVED', 'INFERRED'
  user_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_user_context_user_id ON user_context(user_id);
```

### 1.2 `user_memory`
Consent-governed memory store with explicit expiration and confirmation flags.
```sql
CREATE TABLE user_memory (
  memory_id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  type VARCHAR(32) NOT NULL, -- 'EXPLICIT_FACT', 'USER_PREFERENCE', 'USER_GOAL', 'USER_EVENT', 'USER_DECISION', 'USER_OUTCOME'
  content TEXT NOT NULL,
  source VARCHAR(64) NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_user_memory_user_id ON user_memory(user_id);
```

### 1.3 `life_patterns`
Discovered correlations between confirmed life milestones and classical planetary periods.
```sql
CREATE TABLE life_patterns (
  pattern_id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  domain VARCHAR(32) NOT NULL,
  description TEXT NOT NULL,
  sample_size INTEGER NOT NULL,
  confidence VARCHAR(16) NOT NULL, -- 'LOW', 'MODERATE', 'HIGH'
  astrological_factors JSONB NOT NULL,
  historical_events JSONB NOT NULL,
  temporal_window VARCHAR(64) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'PATTERN_OBSERVED',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_life_patterns_user_id ON life_patterns(user_id);
```

### 1.4 `prediction_calibration`
Tracks directional and timing performance against user-verified outcomes.
```sql
CREATE TABLE prediction_calibration (
  prediction_id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  domain VARCHAR(32) NOT NULL,
  predicted_direction VARCHAR(32) NOT NULL,
  time_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  predicted_confidence NUMERIC(3,2) NOT NULL,
  actual_outcome VARCHAR(24), -- 'SUCCESS', 'PARTIAL', 'NOT_OCCURRED', 'UNCLEAR'
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);
CREATE INDEX idx_pred_calib_user_id ON prediction_calibration(user_id);
```

### 1.5 `intelligence_traces`
Full audit trail for cognitive reasoning operations.
```sql
CREATE TABLE intelligence_traces (
  trace_id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  intent VARCHAR(32) NOT NULL,
  engines_used JSONB NOT NULL,
  evidence_ids JSONB NOT NULL,
  contradictions_found JSONB NOT NULL,
  confidence VARCHAR(16) NOT NULL,
  duration_ms INTEGER NOT NULL,
  calculation_passport_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_intel_traces_user_id ON intelligence_traces(user_id);
```

## 2. Epistemic Hierarchy Typing
Data models categorize all evidence into strictly ordered epistemic ranks:
- `LEVEL_1_CALCULATED_FACT` (VSOP87 coordinates, Ascendant, Shadbala)
- `LEVEL_2_INDEPENDENTLY_VERIFIED_FACT` (External astronomical validation)
- `LEVEL_3_VERSIONED_CLASSICAL_RULE` (BPHS, Phaladeepika, Jaimini Upadesha)
- `LEVEL_4_TRUSTED_SOURCE` (Classical commentaries)
- `LEVEL_5_USER_CONFIRMED_CONTEXT` (Explicitly confirmed life milestones)
- `LEVEL_6_APPROVED_WORLD_FACT` (Consented relocation city datasets)
- `LEVEL_7_AI_INTERPRETATION` (Synthesized contextual guidance)
- `LEVEL_8_SPECULATION` (Unsubstantiated projection - strictly prohibited)
