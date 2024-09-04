const User = require('../models/UserSchema');
const Goal = require('../models/GoalSchema');
const Entry = require('../models/EntrySchema');
const WeeklyReport = require('../models/WeeklyReportSchema');
const MonthlyReport = require('../models/MonthlyReportSchema');

const generatedMonthlyReport = async (userId) => {
    try {
        const goals = await Goal.find({ userId });

        // Set startDate and endDate
        const now = new Date();
        const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Search entries of user week
        const entries = await Entry.find({
            userId: userId,
            date: { $gte: monthStartDate, $lte: monthEndDate }
        });

        // Calculate totals
        let totalDistance = 0;
        let totalFoodExpense = 0;
        let totalExpense = 0;
        let totalGrossGain = 0;
        let totalLiquidGain = 0;

        entries.forEach(entry => {
            totalDistance += entry.distance;
            totalFoodExpense += entry.foodExpense;
            totalExpense += entry.expense;
            totalGrossGain += entry.grossGain;
            totalLiquidGain += entry.liquidGain
        });

        const report = new MonthlyReport({
            userId,
            monthStartDate,
            monthEndDate,
            monthlyAccumulatedSalary: goals.find(goal => goal.name === 'Salário')?.monthlyAccumulated || 0,
            goalsAccumulated: goals.map(goal => ({
                goalName: goal.name,
                monthlyAccumulated: goal.monthlyAccumulated
            })),
            totalDistance,
            totalFoodExpense,
            totalExpense,
            grossGain: totalGrossGain,
            liquidGain: totalLiquidGain
        });

        // Save report
        await report.save();

        for (let goal of goals) {
            goal.monthlyAccumulated = 0;
            await goal.save();
        }

        console.log(`Relatório mensal gerado para o usuário ${userId}`);
    } catch (error) {
        console.error(`Erro ao gerar relatório mensal para o usuário ${userId}`, error);
    }
};

// Funcion to generate monthly reports for all users
const generateMonthlyReportForAllUsers = async () => {
    try {
        const users = await User.find({});

        users.forEach(user => {
            generatedMonthlyReport(user._id);
        });
    } catch (error) {
        console.error('Erro ao buscar os usuários', error)
    }
};

module.exports = {
    generateMonthlyReportForAllUsers
};