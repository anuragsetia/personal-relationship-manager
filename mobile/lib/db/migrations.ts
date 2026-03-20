import * as SQLite from 'expo-sqlite';

/**
 * Run initial schema migration on first launch.
 * We use raw SQL here so we can ship without a build step.
 * Later phases can add ALTER TABLE migrations below.
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      role TEXT,
      relationship TEXT,
      notes TEXT,
      tags TEXT,
      source TEXT DEFAULT 'manual',
      avatar_uri TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_interactions (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      date INTEGER NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      provider TEXT,
      account_number TEXT,
      website TEXT,
      start_date INTEGER,
      renewal_date INTEGER,
      expiry_date INTEGER,
      cost REAL,
      cost_currency TEXT DEFAULT 'USD',
      cost_frequency TEXT,
      status TEXT DEFAULT 'active',
      contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
      notes TEXT,
      tags TEXT,
      reminder_days INTEGER DEFAULT 7,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
      name TEXT,
      local_path TEXT,
      cloud_url TEXT,
      mime_type TEXT,
      extracted_data TEXT,
      extraction_status TEXT DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
    CREATE INDEX IF NOT EXISTS idx_contacts_updated ON contacts(updated_at);
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
    CREATE INDEX IF NOT EXISTS idx_services_renewal ON services(renewal_date);
    CREATE INDEX IF NOT EXISTS idx_interactions_contact ON contact_interactions(contact_id);
  `);

  // Phase 2 migration — add knownFrom + institutionName to contacts
  // IF NOT EXISTS is not supported in ALTER TABLE — use try/catch per column
  try { await db.execAsync(`ALTER TABLE contacts ADD COLUMN known_from TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE contacts ADD COLUMN institution_name TEXT;`); } catch {}
  try { await db.execAsync(`ALTER TABLE contacts ADD COLUMN relationship_type TEXT;`); } catch {}
}
