const express = require('express');
const router = express.Router();
const PersonalExpenseController = require('../controllers/PersonalExpenseController');

router.post('/create-personal-expense', PersonalExpenseController.createPersonalExpense);
router.delete('/personal-expense/delete/:userId/:personalExpenseId', PersonalExpenseController.deletePersonalExpense);
router.put('/personal-expense/update/:userId/:personalExpenseId', PersonalExpenseController.updatePersonalExpense);
router.get('/personal-expenses/:userId', PersonalExpenseController.getPersonalExpenses);

module.exports = router;