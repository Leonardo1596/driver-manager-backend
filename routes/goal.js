const express = require('express');
const router = express.Router();
const GoalController = require('../controllers/GoalController');

router.post('/create-goal', GoalController.createGoal);
router.delete('/goal/delete/:userId/:goalId', GoalController.deleteGoal);
router.put('/goal/update/:userId/:goalId', GoalController.updateGoal);
router.get('/goals/:userId', GoalController.getGoals);

module.exports = router;