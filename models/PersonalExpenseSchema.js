const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PersonalExpenseSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: { type: Date, required: true },
    weekDay: { type: String, required: true },
    distance: { type: Number, required: true },
    expense: { type: Number, required: true },
    costPerKm: { type: Number, required: true },
    gasolinePrice: { type: Number, required: true },
    gasolineExpense: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'PersonalExpense' });

module.exports = mongoose.model('PersonalExpense', PersonalExpenseSchema);