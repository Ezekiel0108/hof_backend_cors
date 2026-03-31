import path from 'path';
import fs from 'fs';
import db from './dbMigrate';

function extractVersion(filename: string): number {
  const match = filename.match(/v(\d+)\.ts/);
  return match?.[1] ? parseInt(match[1], 10) : 0;
}

async function runMigrations(): Promise<void> {
  let currentVersion: number;

  try {
    // Crea versioning se non esiste ancora
    await db.execute(`
      CREATE TABLE IF NOT EXISTS versioning (
        version INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Se è vuota inserisci versione 0
    const [rows]: any = await db.execute('SELECT version FROM versioning LIMIT 1');
    if (rows.length === 0) {
      await db.execute('INSERT INTO versioning (version) VALUES (0)');
      currentVersion = 0;
    } else {
      currentVersion = rows[0].version;
    }

    console.log(`Versione attuale del DB: ${currentVersion}`);
  } catch (error) {
    console.error('Errore lettura versione:', error);
    return;
  }

  const migrationDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationDir)
    .filter(file => file.endsWith('.ts'))
    .sort((a, b) => extractVersion(a) - extractVersion(b));

  for (const file of files) {
    const fileVersion = extractVersion(file);
    if (fileVersion <= currentVersion) continue;

    console.log(`Applico migration: ${file} (v${fileVersion})`);

    try {
      const migration = await import(path.join(migrationDir, file));
      await migration.up(db);
      await db.execute('UPDATE versioning SET version = ?', [fileVersion]);
      console.log(`DB aggiornato alla versione ${fileVersion}`);
    } catch (error) {
      console.error(`Errore migration ${file}:`, error);
      return; // blocca le migration successive se una fallisce
    }
  }

  console.log('Database all\'ultima versione.');
}

async function rollbackMigration(): Promise<void> {
  let currentVersion: number;

  try {
    const [rows]: any = await db.execute('SELECT version FROM versioning LIMIT 1');
    if (!rows || rows.length === 0) return;
    currentVersion = rows[0].version;
    if (currentVersion === 0) {
      console.log('Già alla versione 0, nessun rollback possibile.');
      return;
    }
  } catch (error) {
    console.error('Errore lettura versione:', error);
    return;
  }

  const migrationDir = path.join(__dirname, 'migrations');
  const file = `v${currentVersion}.ts`;
  const filePath = path.join(migrationDir, file);

  if (!fs.existsSync(filePath)) {
    console.error(`File migration ${file} non trovato`);
    return;
  }

  try {
    console.log(`Rollback migration: ${file}`);
    const migration = await import(filePath);
    await migration.down(db);
    await db.execute('UPDATE versioning SET version = ?', [currentVersion - 1]);
    console.log(`Rollback completato, DB alla versione ${currentVersion - 1}`);
  } catch (error) {
    console.error(`Errore rollback ${file}:`, error);
  }
}

export { runMigrations, rollbackMigration };