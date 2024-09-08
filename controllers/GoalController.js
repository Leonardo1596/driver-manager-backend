const Goal = require('../models/GoalSchema');
const { validateRequiredFields } = require('../utils/validationUtils');

const createGoal = async (req, res) => {
    let { userId, name, limit, totalAccumulated } = req.body;

    // Validate required fields
    const requiredFieldsError = validateRequiredFields(['userId', 'name', 'limit', 'totalAccumulated'], req.body);
    if (requiredFieldsError) {
        return res.status(400).json({ error: requiredFieldsError });
    }

    const existingGoal = await Goal.findOne({ name: name });

    // Check if there is a goal with the same name
    if (existingGoal) {
        return res.status(409).json({ error: 'Já existe uma meta com esse nome' });
    }

    const newGoal = new Goal({
        userId,
        name,
        limit,
        weeklyAccumulated: 0,
        monthlyAccumulated: 0,
        totalAccumulated: totalAccumulated ? totalAccumulated : 0,
        isDefault: false
    });

    await newGoal.save();
    res.status(201).json(newGoal);
};

const deleteGoal = async (req, res) => {
    try {
        const { userId, goalId } = req.params;

        const goal = await Goal.findOne({ userId, _id: goalId });

        if (goal.isDefault === true) {
            res.json({ message: 'A meta salário não pode ser deletada' })
            return;
        }

        const deletedGoal = await Goal.findByIdAndDelete({
            userId,
            _id: goalId
        });

        return res.status(200).json({ message: 'Meta deletada com sucesso' });
    } catch (error) {
        console.error('Ocorreu um erro ao deletar a meta', error);
        return res.status(500).json({ error: 'Ocorreu um erro ao deletar a meta' });
    }
};

const updateGoal = async (req, res) => {
    try {
        const { userId, goalId } = req.params;

        const updatedFields = req.body;

        // Get existing goal
        const existingGoal = await Goal.findOne({ userId, _id: goalId });

        if (!existingGoal) {
            return res.status(404).json({ error: 'Meta não encontrada' });
        }

        // Update fields that have changed
        Object.assign(existingGoal, updatedFields)

        // Update updatedAt field
        existingGoal.updatedAt = new Date();

        // Save changes
        await existingGoal.save();

        res.json({ existingGoal });
    } catch (error) {

    }
};

const getGoals = async (req, res) => {
    try {
        const { userId } = req.params;
        const retrievedGoals = await Goal.find({ userId });

        res.status(200).json({ retrievedGoals });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Não foi possível recuperar as metas' });
    }
};

module.exports = {
    createGoal,
    deleteGoal,
    updateGoal,
    getGoals
};