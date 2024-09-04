const PersonalExpense = require('../models/PersonalExpenseSchema');
const CostPerKm = require('../models/CostPerKm');
const { getWeekDay } = require('../utils/weekDayUtils');
const { validateRequiredFields } = require('../utils/validationUtils');

const createPersonalExpense = async (req, res) => {
    try {
        let { userId, date, distance } = req.body;

        // Validate requiredFields
        const requiredFieldsError = validateRequiredFields(['userId', 'date', 'distance'], req.body);
        if (requiredFieldsError) {
            return res.status(400).json({ error: requiredFieldsError });
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
        };

        const costPerKm = totalCalculateCostPerKm();
        let expense = distance * costPerKm;
        let gasolinePrice = costPerKmData.gasolina.value;
        let gasolineExpense = costPerKmData.gasolina.km !== 0 ? Number((costPerKmData.gasolina.value / costPerKmData.gasolina.km)) * distance : 0;

        const existingPersonalExpense = await PersonalExpense.findOne({ date: date });

        // Check if there is an entrie with the same date
        if (existingPersonalExpense) {
            return res.status(409).json({ error: 'Já existe um lançamento com essa data' });
        }

        const newPersonalExpense = new PersonalExpense({
            userId,
            date,
            weekDay: getWeekDay(date),
            distance,
            expense,
            costPerKm,
            gasolinePrice,
            gasolineExpense
        });

        await newPersonalExpense.save();
        res.status(201).json(newPersonalExpense);
    } catch (error) {
        console.error('Ocorreu um erro ao criar o lançamento: ', error);
        return res.status(500).json({ error: 'Ocorreu um erro ao criar o lançamento' });
    }
};

const deletePersonalExpense = async (req, res) => {
    try {
        const { userId, personalExpenseId } = req.params;

        const deletedPersonalExpense = await PersonalExpense.findOneAndDelete({
            userId,
            _id: personalExpenseId
        });

        return res.status(200).json({ message: 'Lançamento deletado com sucesso' });
    } catch (error) {
        console.error('Ocorreu um erro ao deletar o lançamento: ', error);
        return res.status(500).json({ error: 'Ocorreu um erro ao deletar o lançamento' });
    }
};

const updatePersonalExpense = async (req, res) => {
    try {
        const { userId, personalExpenseId } = req.params;

        const updatedFields = req.body;

        // Get existing personalExpense
        const existingPersonalExpense = await PersonalExpense.findOne({ userId, _id: personalExpenseId });

        if (!existingPersonalExpense) {
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }

        // Retrieve costPerKm data
        const costPerKmData = await CostPerKm.findOne({ userId });

        // Update fields that have changed
        Object.assign(existingPersonalExpense, updatedFields);

        // Recalculate values
        if (updatedFields.distance !== undefined) {
            existingPersonalExpense.expense = existingPersonalExpense.distance * existingPersonalExpense.costPerKm;
            existingPersonalExpense.gasolineExpense = (costPerKmData.gasolina.value / costPerKmData.gasolina.km) * existingPersonalExpense.distance;
        }

        // Update updatedAt field
        existingPersonalExpense.updatedAt = new Date();

        // Save changes
        await existingPersonalExpense.save();
        res.json(existingPersonalExpense);
    } catch (error) {
        
    }
};

const getPersonalExpenses = async (req, res) => {
    try {
        const { userId } = req.params;
        const retrievedPersonalExpenses = await PersonalExpense.find({ userId: userId });

        res.status(200).json(retrievedPersonalExpenses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Não foi possível recuperar os lançamentos' });
    }
};

module.exports = {
    createPersonalExpense,
    deletePersonalExpense,
    updatePersonalExpense,
    getPersonalExpenses
}