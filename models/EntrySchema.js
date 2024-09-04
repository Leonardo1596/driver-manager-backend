const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EntrieSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: { type: Date, required: true },
    weekDay: { type: String, required: true },
    initialKm: { type: Number, required: true },
    finalKm: { type: Number, required: true },
    distance: { type: Number, required: true },
    grossGain: { type: Number, required: true },
    liquidGain: { type: Number, required: true },
    expense: { type: Number, required: true },
    foodExpense: { type: Number, required: true },
    percentageExpense: { type: Number, required: true },
    costPerKm: { type: Number, required: true },
    gasolinePrice: { type: Number, required: true },
    gasolineExpense: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'Entrie' });

module.exports = mongoose.model('Entrie', EntrieSchema);