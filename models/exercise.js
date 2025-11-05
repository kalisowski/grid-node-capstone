export async function createExercise(db, userId, description, duration, date) {
  const result = await db.run(
    'INSERT INTO exercises (userId, description, duration, date) VALUES (?, ?, ?, ?)',
    [userId, description, duration, date]
  );
  const id = result.lastID ?? result.lastId ?? null;
  return db.get(
    'SELECT id, userId, description, duration, date FROM exercises WHERE id = ?',
    [id]
  );
}

export async function getExerciseLogForUser(
  db,
  userId,
  { from, to, limit } = {}
) {
  const user = await db.get('SELECT id, username FROM users WHERE id = ?', [
    userId,
  ]);
  if (!user) return null;

  // build SQL and params dynamically to avoid binding undefined/null values
  let sql =
    'SELECT id, description, duration, date FROM exercises WHERE userId = ?';
  const params = [userId];

  if (from) {
    sql += ' AND date >= ?';
    params.push(from);
  }
  if (to) {
    sql += ' AND date <= ?';
    params.push(to);
  }

  sql += ' ORDER BY date';

  if (limit !== undefined && limit !== null) {
    const n = Number.parseInt(limit, 10);
    if (Number.isNaN(n) || n <= 0) {
      throw new Error('Invalid limit format');
    }
    sql += ' LIMIT ?';
    params.push(n);
  }

  const logs = await db.all(sql, params);

  return {
    ...user,
    logs: logs,
    count: logs.length,
  };
}
