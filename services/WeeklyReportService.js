const User = require('../models/UserSchema');
const Goal = require('../models/GoalSchema');
const Entry = require('../models/EntrySchema');
const WeeklyReport = require('../models/WeeklyReportSchema');

const generatedWeeklyReport = async (userId) => {
    try {
        const goals = await Goal.find({ userId });

        // Set startDate and endDate
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToSunday = dayOfWeek;
        const diffToNextSaturday = 6 - dayOfWeek;

        const weekStartDate = new Date(now);
        weekStartDate.setDate(now.getDate() - diffToSunday);
        weekStartDate.setHours(0, 0, 0, 0); // Starts at the beginning of the day

        const weekEndDate = new Date(now);
        weekEndDate.setDate(now.getDate() + diffToNextSaturday);
        weekEndDate.setHours(23, 59, 59, 999); // Ends at the beginning of the day

        // Search entries of user week
        const entries = await Entry.find({
            userId: userId,
            date: { $gte: weekStartDate, $lte: weekEndDate }
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

        const report = new WeeklyReport({
            userId,
            weekStartDate,
            weekEndDate,
            weeklyAccumulatedSalary: goals.find(goal => goal.name === 'Salário')?.weeklyAccumulated || 0,
            goalsAccumulated: goals.map(goal => ({
                goalName: goal.name,
                weeklyAccumulated: goal.weeklyAccumulated
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
            goal.weeklyAccumulated = 0;
            await goal.save();
        }

        console.log(`Relatório semanal gerado para o usuário ${userId}`);
    } catch (error) {
        console.error(`Erro ao gerar relatório semanal para o usuário ${userId}`, error);
    }
};

// Funcion to generate weekly reports for all users
const generateWeeklyReportsForAllUsers = async () => {
    try {
        const users = await User.find({});

        users.forEach(user => {
            generatedWeeklyReport(user._id);
        });
    } catch (error) {
        console.error('Erro ao buscar os usuários', error)
    }
};

module.exports = {
    generateWeeklyReportsForAllUsers
};