-- 0000_init.sql
-- Esegui con: wrangler d1 execute gatto-dashboard-db --file=drizzle/migrations/0000_init.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  email_verified INTEGER DEFAULT 0,
  image TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date TEXT,
  sex TEXT DEFAULT 'unknown',
  breed TEXT DEFAULT 'unknown',
  lifestyle TEXT DEFAULT 'indoor',
  sterilized TEXT DEFAULT 'unknown',
  microchip TEXT,
  main_food TEXT,
  food_kcal_per_kg INTEGER,
  plan_dry_grams INTEGER DEFAULT 60,
  plan_meals_per_day INTEGER DEFAULT 3,
  plan_wet_per_week INTEGER DEFAULT 1,
  notes TEXT,
  photo_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS cats_user_idx ON cats(user_id);

CREATE TABLE IF NOT EXISTS daily_logs (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight REAL,
  bcs INTEGER,
  mcs TEXT,
  dry_grams REAL,
  wet_grams REAL,
  meals INTEGER,
  snack_kcal REAL,
  water_ml REAL,
  play_minutes INTEGER,
  grooming_sessions INTEGER,
  shedding INTEGER,
  feces_notes TEXT,
  vomiting INTEGER DEFAULT 0,
  diarrhea INTEGER DEFAULT 0,
  behavior_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cat_id, date)
);

CREATE INDEX IF NOT EXISTS logs_cat_date_idx ON daily_logs(cat_id, date);

CREATE TABLE IF NOT EXISTS prevention (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  date TEXT,
  next_date TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'profile',
  taken_at TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS share_tokens (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
