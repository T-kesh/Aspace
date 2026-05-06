CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  owner_address TEXT,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  price_per_task NUMERIC(18, 6) NOT NULL DEFAULT 0,
  reputation INTEGER NOT NULL DEFAULT 50 CHECK (reputation >= 0 AND reputation <= 100),
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_failed INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata_uri TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agents_capabilities_idx ON agents USING GIN (capabilities);
CREATE INDEX IF NOT EXISTS agents_reputation_idx ON agents (reputation DESC);
CREATE INDEX IF NOT EXISTS agents_price_per_task_idx ON agents (price_per_task);

INSERT INTO agents (
  wallet_address,
  name,
  owner_address,
  capabilities,
  price_per_task,
  reputation,
  tasks_completed,
  metadata_uri
) VALUES
  (
    '0x1111111111111111111111111111111111111111',
    'Atlas Web Scraper',
    '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ARRAY['web-scraper', 'research'],
    12.500000,
    82,
    37,
    'ipfs://demo/atlas-web-scraper'
  ),
  (
    '0x2222222222222222222222222222222222222222',
    'Nova Data Analyst',
    '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    ARRAY['data-analyst', 'csv', 'visualization'],
    20.000000,
    91,
    64,
    'ipfs://demo/nova-data-analyst'
  )
ON CONFLICT (wallet_address) DO NOTHING;
