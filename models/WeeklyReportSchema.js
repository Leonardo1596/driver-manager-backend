const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WeeklyReportSchema = new Schema({
    userId: mongoose.Schema.Types.ObjectId,
    weekStartDate: Date,
    weekEndDate: Date,
    weeklyAccumulatedSalary: Number,
    goalsAccumulated: [
        {
            goalName: String,
            weeklyAccumulated: Number
        }
    ],
    totalDistance: Number,
    totalFoodExpense: Number,
    totalExpense: Number,
    grossGain: Number,
    liquidGain: Number,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'WeeklyReport' });

module.exports = mongoose.model('WeeklyReport', WeeklyReportSchema);