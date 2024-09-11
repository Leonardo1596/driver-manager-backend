const Entry = require('../models/EntrySchema');
const CostPerKm = require('../models/CostPerKm');
const Goal = require('../models/GoalSchema');
const { getWeekDay } = require('../utils/weekDayUtils');
const { validateRequiredFields, validateKilometers } = require('../utils/validationUtils');

const createEntry = async (req, res) => {
    try {
        let { userId, date, initialKm, finalKm, grossGain, foodExpense } = req.body;

        // Validate required fields
        const requiredFieldsError = validateRequiredFields(['userId', 'date', 'initialKm', 'finalKm', 'grossGain'], req.body);
        if (requiredFieldsError) {
            return res.status(400).json({ error: requiredFieldsError });
        }

        // Kilometers validation
        const kilometersError = validateKilometers(initialKm, finalKm);
        if (kilometersError) {
            return res.status(400).json({ error: kilometersError });
        }

        // Retrieve costPerKm data
        const costPerKmData = await CostPerKm.findOne({ userId });

        // Calculate costPerKm
        function totalCalculateCostPerKm() {
            const oleo = costPerKmData.oleo.km !== 0 ? Number((costPerKmData.oleo.value / costPerKmData.oleo.km).toFixed(4)) : 0;
            const relacao = costPerKmData.relacao.km !== 0 ? Number((costPerKmData.relacao.value / costPerKmData.relacao.km).toFixed(4)) : 0;
            const pneuDianteiro = costPerKmData.pneuDianteiro.km !== 0 ? Number((costPerKmData.pneuDianteiro.value / costPerKmData.pneuDianteiro.km).toFixed(4)) : 0;
            const pneuTraseiro = costPerKmData.pneuTraseiro.km !== 0 ? Number((costPerKmData.pneuTraseiro.value / costPerKmData.pneuTraseiro.km).toFixed(4)) : 0;
            const gasolina = costPerKmData.gasolina.km !== 0 ? Number((costPerKmData.gasolina.value / costPerKmData.gasolina.km).toFixed(4)) : 0;

            return oleo + relacao + pneuDianteiro + pneuTraseiro + gasolina;
        }

        const costPerKm = totalCalculateCostPerKm();
        let distance = finalKm - initialKm;
        let expense = (distance * costPerKm) + foodExpense;
        let liquidGain = grossGain - expense;
        let percentageExpense = grossGain !== 0 ? (expense / grossGain) : 1;
        let gasolinePrice = costPerKmData.gasolina.value;
        let gasolineExpense = costPerKmData.gasolineExpense ? (costPerKmData.gasolina.value / costPerKmData.gasolina.km) * distance : 0;

        const existingEntry = await Entry.findOne({ userId: userId, date: date });

        // Check if there is an entry with the same date
        if (existingEntry) {
            return res.status(409).json({ error: 'Já existe um lançamento com essa data' });
        }

        const newEntry = new Entry({
            userId,
            date,
            weekDay: getWeekDay(date),
            initialKm,
            finalKm,
            distance,
            grossGain,
            liquidGain,
            expense,
            foodExpense,
            percentageExpense,
            costPerKm,
            gasolinePrice,
            gasolineExpense
        });

        await newEntry.save();

        // Check if date is within the current week
        const isWithinCurrentWeek = (entryDate) => {
            const now = new Date();
            const currentDayOfWeek = now.getDay();
            const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

            // Define the start of the week (Monday)
            const weekStartDate = new Date(now);
            weekStartDate.setDate(now.getDate() - diffToMonday);
            weekStartDate.setHours(0, 0, 0, 0);

            // Define the end of the week (Sunday)
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6); // Ends on Sunday
            weekEndDate.setHours(23, 59, 59, 999);

            const entryDateObj = new Date(entryDate);
            return entryDateObj >= weekStartDate && entryDateObj <= weekEndDate;
        };

        const isWithinCurrentMonth = (entryDate) => {
            const now = new Date();
            const entryDateObj = new Date(entryDate);
            return (
                entryDateObj.getFullYear() === now.getFullYear() &&
                entryDateObj.getMonth() === now.getMonth()
            );
        };

        const allocateFundsToGoals = (goals, liquidGain) => {
            for (let goal of goals) {
                if (liquidGain <= 0) break;

                const remainingLimit = goal.limit - goal.weeklyAccumulated;
                const amountToAdd = Math.min(liquidGain, remainingLimit);

                if (isWithinCurrentWeek(date)) {
                    goal.weeklyAccumulated += amountToAdd;
                }
                if (isWithinCurrentMonth(date)) {
                    goal.monthlyAccumulated += amountToAdd;
                }
                goal.totalAccumulated += amountToAdd;

                liquidGain -= amountToAdd;
            }
        };

        const goals = await Goal.find({ userId });
        allocateFundsToGoals(goals, liquidGain);

        // Save updated goals
        for (let goal of goals) {
            await goal.save();
        }

        res.status(201).json(newEntry);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao criar o lançamento' });
    }
};

const deleteEntry = async (req, res) => {
    try {
        const { userId, entryId } = req.params;

        // Find the entry to be deleted
        const deletedEntry = await Entry.findOneAndDelete({
            userId,
            _id: entryId
        });

        if (!deletedEntry) {
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }

        // Retrieve goals for the user
        const goals = await Goal.find({ userId });

        const isWithinCurrentWeek = (entryDate) => {
            const now = new Date();
            const currentDayOfWeek = now.getDay();

            // Adjusts so that the week starts on Monday (1) and ends on Sunday (0)
            const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

            // Sets the start of the week (Monday)
            const weekStartDate = new Date(now);
            weekStartDate.setDate(now.getDate() - diffToMonday);
            weekStartDate.setHours(0, 0, 0, 0);

            // Sets the end of the week (Sunday)
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6); // Ends on Sunday
            weekEndDate.setHours(23, 59, 59, 999);

            const entryDateObj = new Date(entryDate);
            return entryDateObj >= weekStartDate && entryDateObj <= weekEndDate;
        };

        const isWithinCurrentMonth = (entryDate) => {
            const now = new Date();
            const entryDateObj = new Date(entryDate);
            return (
                entryDateObj.getFullYear() === now.getFullYear() &&
                entryDateObj.getMonth() === now.getMonth()
            );
        };

        const subtractFundsFromGoals = (goals, liquidGain) => {
            for (let goal of goals) {
                // Value to be subtracted
                let amountToSubtract = liquidGain;

                // Updates weekly if it is in the current week
                if (isWithinCurrentWeek(deletedEntry.date)) {
                    const subtractFromWeekly = Math.min(amountToSubtract, goal.weeklyAccumulated);
                    goal.weeklyAccumulated -= subtractFromWeekly;
                    amountToSubtract -= subtractFromWeekly;
                }

                // Updates monthly if it is in the current month
                if (isWithinCurrentMonth(deletedEntry.date)) {
                    const subtractFromMonthly = Math.min(liquidGain, goal.monthlyAccumulated);
                    goal.monthlyAccumulated -= subtractFromMonthly;
                }

                // Always update total
                goal.totalAccumulated -= liquidGain; // Subtracts the total value of the deleted entry

                // If the remaining value is less than or equal to 0, exit the loop
                if (amountToSubtract <= 0) break;
            }
        };

        // Subtract funds from goals
        subtractFundsFromGoals(goals, deletedEntry.liquidGain);

        // Save the updated goals
        for (let goal of goals) {
            await goal.save();
        }

        res.status(200).json({ message: 'Lançamento deletado com sucesso' });

    } catch (error) {
        console.error('Ocorreu um erro ao deletar o lançamento: ', error);
        return res.status(500).json({ error: 'Ocorreu um erro ao deletar o lançamento' });
    }
};

const updateEntry = async (req, res) => {
    try {
        const { userId, entryId } = req.params;

        const updatedFields = req.body;

        // Get existing entry
        const existingEntry = await Entry.findOne({ userId, _id: entryId });

        if (!existingEntry) {
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }

        // Retrieve costPerKm data
        const costPerKmData = await CostPerKm.findOne({ userId });

        // Update fields that have changed
        Object.assign(existingEntry, updatedFields);

        // Recalculate values
        if (updatedFields.date !== undefined) {
            existingEntry.weekDay = getWeekDay(existingEntry.date);
        }

        if (updatedFields.initialKm !== undefined || updatedFields.finalKm !== undefined) {
            existingEntry.distance = existingEntry.finalKm - existingEntry.initialKm;
            existingEntry.gasolineExpense = (costPerKmData.gasolina.value / costPerKmData.gasolina.km) * existingEntry.distance;
        }

        if (updatedFields.gasolinePrice !== undefined) {
            existingEntry.gasolineExpense = (costPerKmData.gasolina.value / costPerKmData.gasolina.km) * existingEntry.distance;
        }

        if (updatedFields.initialKm !== undefined || updatedFields.finalKm !== undefined || updatedFields.costPerKm !== undefined || updatedFields.foodExpense !== undefined) {
            existingEntry.expense = (existingEntry.distance * existingEntry.costPerKm) + existingEntry.foodExpense;
            existingEntry.liquidGain = existingEntry.grossGain - existingEntry.expense;
            existingEntry.percentageExpense = existingEntry.expense / existingEntry.grossGain;
        }

        // Update updatedAt field
        existingEntry.updatedAt = new Date();

        // Save changes
        await existingEntry.save();

        res.json(existingEntry);

    } catch (error) {

    }
}

const getEntries = async (req, res) => {
    try {
        const { userId } = req.params;
        const retrievedEntries = await Entry.find({ userId: userId });

        res.status(200).json({ retrievedEntries });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Não foi possível recuperar os lançamentos' });
    }
};

module.exports = {
    createEntry,
    deleteEntry,
    updateEntry,
    getEntries,
};