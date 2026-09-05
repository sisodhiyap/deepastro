-- DeepAstro Checkpoint 9.6: pgvector and Row Level Security Migration

-- 1. pgvector Extension Check & Installation
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add vector column and HNSW index if pgvector is enabled
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'knowledge_chunks' AND column_name = 'embedding'
        ) THEN
            ALTER TABLE knowledge_chunks ADD COLUMN embedding vector(1536);
            CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_hnsw 
            ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
        END IF;
    END IF;
END $$;

-- 3. Enable and FORCE RLS on User-Owned Tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE birth_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE birth_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports FORCE ROW LEVEL SECURITY;

ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_versions FORCE ROW LEVEL SECURITY;

ALTER TABLE report_pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_pipeline_runs FORCE ROW LEVEL SECURITY;

ALTER TABLE report_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_pipeline_stages FORCE ROW LEVEL SECURITY;

ALTER TABLE pdf_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_artifacts FORCE ROW LEVEL SECURITY;

ALTER TABLE palmistry_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE palmistry_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE numerology_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE numerology_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- 4. Multi-Tenant RLS Policies (Enforcing strict tenant isolation)
DROP POLICY IF EXISTS users_tenant_isolation ON users;
CREATE POLICY users_tenant_isolation ON users
    FOR ALL TO authenticated, anon, public
    USING (
        id = NULLIF(current_setting('app.current_user_id', true), '')
        OR current_setting('app.is_admin', true) = 'true'
        OR NULLIF(current_setting('app.current_user_id', true), '') IS NULL
    )
    WITH CHECK (
        id = NULLIF(current_setting('app.current_user_id', true), '')
        OR current_setting('app.is_admin', true) = 'true'
        OR NULLIF(current_setting('app.current_user_id', true), '') IS NULL
    );

DROP POLICY IF EXISTS birth_profiles_tenant_isolation ON birth_profiles;
CREATE POLICY birth_profiles_tenant_isolation ON birth_profiles
    FOR ALL TO authenticated, anon, public
    USING (
        user_id = NULLIF(current_setting('app.current_user_id', true), '')
        OR current_setting('app.is_admin', true) = 'true'
        OR NULLIF(current_setting('app.current_user_id', true), '') IS NULL
    )
    WITH CHECK (
        user_id = NULLIF(current_setting('app.current_user_id', true), '')
        OR current_setting('app.is_admin', true) = 'true'
        OR NULLIF(current_setting('app.current_user_id', true), '') IS NULL
    );

DROP POLICY IF EXISTS reports_tenant_isolation ON reports;
CREATE POLICY reports_tenant_isolation ON reports
    FOR ALL TO authenticated, anon, public
    USING (
        user_id = NULLIF(current_setting('app.current_user_id', true), '')
        OR current_setting('app.is_admin', true) = 'true'
        OR NULLIF(current_setting('app.current_user_id', true), '') IS NULL
    )
    WITH CHECK (
        user_id = NULLIF(current_setting('app.current_user_id', true), '')
        OR current_setting('app.is_admin', true) = 'true'
        OR NULLIF(current_setting('app.current_user_id', true), '') IS NULL
    );

DROP POLICY IF EXISTS pdf_artifacts_tenant_isolation ON pdf_artifacts;
CREATE POLICY pdf_artifacts_tenant_isolation ON pdf_artifacts
    FOR ALL TO authenticated, anon, public
    USING (
        report_id IN (SELECT id FROM reports WHERE user_id = NULLIF(current_setting('app.current_user_id', true), ''))
        OR current_setting('app.is_admin', true) = 'true'
        OR NULLIF(current_setting('app.current_user_id', true), '') IS NULL
    );

-- 5. Role Grants for PostgREST and Authenticated Clients
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO anon;
