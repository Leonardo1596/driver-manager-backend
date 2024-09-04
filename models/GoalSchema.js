const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GoalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    limit: { type: Number, required: true },
    weeklyAccumulated: { type: Number, required: true },
    monthlyAccumulated: { type: Number, required: true },
    totalAccumulated: { type: Number, required: true },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'Goal' });

module.exports = mongoose.model('Goal', GoalSchema);