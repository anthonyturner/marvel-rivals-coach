PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS heroes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  summary TEXT NOT NULL,
  playstyle TEXT NOT NULL,
  image_url TEXT NOT NULL,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hero_list_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hero_id TEXT NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('strength', 'weakness', 'counter', 'synergy')),
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS hero_abilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hero_id TEXT NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  kit_role TEXT,
  kit_label TEXT,
  name TEXT NOT NULL,
  ability_type TEXT NOT NULL,
  description TEXT NOT NULL,
  technical_details_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS hero_videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hero_id TEXT,
  role TEXT,
  video_type TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_portals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  path TEXT NOT NULL,
  image TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_content_blocks (
  content_key TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS glossary_terms (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  category TEXT NOT NULL,
  definition TEXT NOT NULL,
  coach_note TEXT NOT NULL,
  example TEXT NOT NULL,
  related_terms_json TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS external_sources (
  source_key TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  url TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_key TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_hero_list_items_hero_id ON hero_list_items(hero_id);
CREATE INDEX IF NOT EXISTS idx_hero_abilities_hero_id ON hero_abilities(hero_id);
CREATE INDEX IF NOT EXISTS idx_hero_videos_hero_id ON hero_videos(hero_id);
CREATE INDEX IF NOT EXISTS idx_hero_videos_role ON hero_videos(role);
CREATE INDEX IF NOT EXISTS idx_hero_videos_type ON hero_videos(video_type);
CREATE INDEX IF NOT EXISTS idx_home_portals_sort_order ON home_portals(sort_order);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_category ON glossary_terms(category);
CREATE INDEX IF NOT EXISTS idx_sync_runs_source_key ON sync_runs(source_key);
