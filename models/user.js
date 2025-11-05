// Simple user model functions that accept a db instance as the first argument
export async function createUser(db, username) {
  const result = await db.run('INSERT INTO users (username) VALUES (?)', [
    username,
  ]);
  const id = result.lastID ?? result.lastId ?? null;
  return db.get('SELECT id, username FROM users WHERE id = ?', [id]);
}

export async function getAllUsers(db) {
  return db.all('SELECT id, username FROM users ORDER BY id');
}

export async function getUserById(db, id) {
  return db.get('SELECT id, username FROM users WHERE id = ?', [id]);
}

export default {
  createUser,
  getAllUsers,
  getUserById,
};
