CREATE DATABASE platform_db;

\c platform_db;

CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_url TEXT NOT NULL,
    branch VARCHAR(100) DEFAULT 'main',
    status VARCHAR(20) NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    ai_documentation TEXT,
    complexity_metrics JSONB,
    patterns TEXT[],
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX idx_analysis_results_analysis_id ON analysis_results(analysis_id);

CREATE USER platform_user WITH PASSWORD 'platform_pass';
GRANT ALL PRIVILEGES ON DATABASE platform_db TO platform_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO platform_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO platform_user;
