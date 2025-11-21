-- app/lib/schema.sql
-- Schema for Vercel Postgres

CREATE TABLE IF NOT EXISTS media_items (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('CARDAPIO', 'COMBO_DIA', 'COMBO_TARDE')),
    description TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster category queries
CREATE INDEX IF NOT EXISTS idx_media_category ON media_items(category);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media_items(created_at DESC);
