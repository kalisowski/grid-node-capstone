import validateId from '../lib/utils/validate-id.js';
import * as exerciseModel from '../models/exercise.js';
import * as userModel from '../models/user.js';

export async function create(req, res) {
  const db = req.app.get('db');
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: 'username required' });

  try {
    const user = await userModel.createUser(db, username);
    return res.status(201).json(user);
  } catch (err) {
    if (err && err.message && err.message.toLowerCase().includes('unique')) {
      return res.status(409).json({ error: 'username already exists' });
    }
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

export async function list(req, res) {
  const db = req.app.get('db');
  try {
    const users = await userModel.getAllUsers(db);
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

export async function get(req, res) {
  const db = req.app.get('db');
  const { id } = req.params;

  if (validateId(id)) {
    return res.status(400).json({ error: 'invalid user id' });
  }

  try {
    const user = await userModel.getUserById(db, id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

export async function addExercise(req, res) {
  const { id } = req.params;
  const db = req.app.get('db');

  let { description, duration, date } = req.body || {};

  if (validateId(id)) {
    return res.status(400).json({ error: 'invalid user id' });
  }

  if (!description) {
    return res.status(400).json({ error: 'description is required' });
  }

  if (!duration) {
    return res.status(400).json({ error: 'duration is required' });
  }

  if (typeof description !== 'string') {
    return res.status(400).json({ error: 'description must be a string' });
  }

  description = description.trim();
  if (description.length === 0) {
    return res.status(400).json({ error: 'description required' });
  }

  if (description.length > 1000) {
    return res.status(400).json({ error: 'description too long' });
  }

  const durationNum = Number(duration);
  if (
    !Number.isFinite(durationNum) ||
    !Number.isInteger(durationNum) ||
    durationNum < 0
  ) {
    return res
      .status(400)
      .json({ error: 'duration must be a non-negative integer' });
  }

  if (date) {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'invalid date format' });
    }
    date = dateObj.toISOString().split('T')[0];
  } else {
    const today = new Date();
    date = today.toISOString().split('T')[0];
  }

  try {
    const user = await userModel.getUserById(db, id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    const exercise = await exerciseModel.createExercise(
      db,
      id,
      description,
      duration,
      date
    );
    return res.json(exercise);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

export async function getExerciseLog(req, res) {
  const { id } = req.params;
  const db = req.app.get('db');

  if (validateId(id)) {
    return res.status(400).json({ error: 'invalid user id' });
  }

  const { from: fromRaw, to: toRaw, limit: limitRaw } = req.query;

  let from;
  if (fromRaw) {
    const d = new Date(fromRaw);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ error: 'invalid from date format' });
    }
    from = d.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  let to;
  if (toRaw) {
    const d = new Date(toRaw);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ error: 'invalid to date format' });
    }
    to = d.toISOString().split('T')[0];
  }

  let limit;
  if (limitRaw !== undefined) {
    const n = Number.parseInt(limitRaw, 10);
    if (Number.isNaN(n) || n <= 0) {
      return res.status(400).json({ error: 'invalid limit format' });
    }
    limit = n;
  }

  if (from && to && from > to) {
    return res.status(400).json({ error: 'invalid date range' });
  }

  try {
    const user = await userModel.getUserById(db, id);
    if (!user) return res.status(404).json({ error: 'user not found' });

    const log = await exerciseModel.getExerciseLogForUser(db, id, {
      from,
      to,
      limit,
    });
    return res.json(log);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

export default {
  create,
  list,
  get,
  addExercise,
  getExerciseLog,
};
