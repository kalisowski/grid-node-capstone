import express from 'express';
import usersController from '../controllers/usersController.js';

const router = express.Router();

// Create user
router.post('/', usersController.create);

// Read all users
router.get('/', usersController.list);

// Read single user
router.get('/:id', usersController.get);

// Add exercise to user
router.post('/:id/exercises', usersController.addExercise);

// Get user exercise log
router.get('/:id/logs', usersController.getExerciseLog);

export default router;
