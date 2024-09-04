const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MonthlyReportSchema = new Schema({
    userId: mongoose.Schema.Types.ObjectId,
    monthStartDate: Date,
    monthEndDate: Date,
    monthlyAccumulatedSalary: Number,
    goalsAccumulated: [
        {
            goalName: String,
            monthlyAccumulated: Number
        }
    ],
    totalDistance: Number,
    totalFoodExpense: Number,
    totalExpense: Number,
    grossGain: Number,
    liquidGain: Number,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'MonthlyReport' });

module.exports = mongoose.model('MonthlyReport', MonthlyReportSchema);