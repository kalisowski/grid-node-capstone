import path from 'path';
import { Database } from 'sqlite-async';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.sqlite');

export default Database.open(DB_PATH).then(async (db) => {
  await db.run('PRAGMA foreign_keys = ON');

  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY,
    userId INTEGER NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    date TEXT NOT NULL DEFAULT (DATE('now')),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await db.run(
    `CREATE INDEX IF NOT EXISTS idx_exercises_userId ON exercises(userId)`
  );

  return db;
});
