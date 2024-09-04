const Entry = require('../models/EntrySchema');
const PersonalExpense = require('../models/PersonalExpenseSchema');
const CostPerKm = require('../models/CostPerKm');


const getFinancialSummaryByDate = async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        // Filter entries by date and user
        const entries = await Entry.find({
            userId,
            date: {
                $gte: new Date(`${startDate}T00:00:00.000Z`),
                $lte: new Date(`${endDate}T00:00:00.000Z`)
            }
        });

        const totalGain = entries.reduce((acc, entry) => acc + entry.grossGain, 0);
        const totalExpense = entries.reduce((acc, entry) => acc + entry.expense, 0);
        const totalLiquidGain = entries.reduce((acc, entry) => acc + entry.liquidGain, 0);
        const totalDistance = entries.reduce((acc, entry) => acc + entry.distance, 0);
        const totalFoodExpense = entries.reduce((acc, entry) => acc + entry.foodExpense, 0);
        const total = totalGain + totalExpense + totalLiquidGain + totalDistance + totalFoodExpense;

        const summary = {
            totalGain,
            totalExpense,
            totalLiquidGain,
            totalDistance,
            totalFoodExpense,
            total
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar o resumo financeiro' });
    }
};

const getMaintenanceSummaryByDate = async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        const costPerKmData = await CostPerKm.findOne({ userId });


        // Filter entries by date and user
        const entries = await Entry.find({
            userId,
            date: {
                $gte: new Date(`${startDate}T00:00:00.000Z`),
                $lte: new Date(`${endDate}T00:00:00.000Z`)
            }
        });

        // Get all cost Per Km
        const oleo = costPerKmData.oleo.km !== 0 ? Number((costPerKmData.oleo.value / costPerKmData.oleo.km).toFixed(4)) : 0;
        const relacao = costPerKmData.relacao.km !== 0 ? Number((costPerKmData.relacao.value / costPerKmData.relacao.km).toFixed(4)) : 0;
        const pneuDianteiro = costPerKmData.pneuDianteiro.km !== 0 ? Number((costPerKmData.pneuDianteiro.value / costPerKmData.pneuDianteiro.km).toFixed(4)) : 0;
        const pneuTraseiro = costPerKmData.pneuTraseiro.km !== 0 ? Number((costPerKmData.pneuTraseiro.value / costPerKmData.pneuTraseiro.km).toFixed(4)) : 0;
        const gasolina = costPerKmData.gasolina.km !== 0 ? Number((costPerKmData.gasolina.value / costPerKmData.gasolina.km).toFixed(4)) : 0;

        // Calculate total
        const totalOleo = oleo * entries.reduce((acc, entry) => acc + entry.distance, 0);
        const totalRelacao = relacao * entries.reduce((acc, entry) => acc + entry.distance, 0);
        const totalPneuDianteiro = pneuDianteiro * entries.reduce((acc, entry) => acc + entry.distance, 0);
        const totalPneuTraseiro = pneuTraseiro * entries.reduce((acc, entry) => acc + entry.distance, 0);
        const totalGasolina = gasolina * entries.reduce((acc, entry) => acc + entry.distance, 0);

        const summary = {
            totalOleo,
            totalRelacao,
            totalPneuDianteiro,
            totalPneuTraseiro,
            totalGasolina
        };

        res.json(summary);

    } catch (error) {

    }
};

const getPersonalMaintenanceSummaryByDate = async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        const costPerKm = await CostPerKm.find({ userId });

        // Filter personalExpenses by date and user
        const personalExpenses = await PersonalExpense.find({
            userId,
            date: {
                $gte: new Date(`${startDate}T00:00:00.000Z`),
                $lte: new Date(`${endDate}T00:00:00.000Z`)
            }
        });

        // Get all cost Per Km
        const oleo = costPerKm[0].oleo.value / costPerKm[0].oleo.km;
        const relacao = costPerKm[0].relacao.value / costPerKm[0].relacao.km;
        const pneuDianteiro = costPerKm[0].pneuDianteiro.value / costPerKm[0].pneuDianteiro.km;
        const pneuTraseiro = costPerKm[0].pneuTraseiro.value / costPerKm[0].pneuTraseiro.km;
        const gasolina = costPerKm[0].gasolina.value / costPerKm[0].gasolina.km;

        // Calculate total
        const totalOleo = oleo * personalExpenses.reduce((acc, entry) => acc + entry.distance, 0);
        const totalRelacao = relacao * personalExpenses.reduce((acc, entry) => acc + entry.distance, 0);
        const totalPneuDianteiro = pneuDianteiro * personalExpenses.reduce((acc, entry) => acc + entry.distance, 0);
        const totalPneuTraseiro = pneuTraseiro * personalExpenses.reduce((acc, entry) => acc + entry.distance, 0);
        const totalGasolina = gasolina * personalExpenses.reduce((acc, entry) => acc + entry.distance, 0);

        const summary = {
            totalOleo,
            totalRelacao,
            totalPneuDianteiro,
            totalPneuTraseiro,
            totalGasolina
        };

        res.json(summary);
    } catch (error) {

    }
};

module.exports = {
    getFinancialSummaryByDate,
    getMaintenanceSummaryByDate,
    getPersonalMaintenanceSummaryByDate
}