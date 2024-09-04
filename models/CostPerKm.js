const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CostPerKmSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    oleo: {
        value: { type: Number, required: true },
        km: { type: Number, required: true }
    },
    relacao: {
        value: { type: Number, required: true },
        km: { type: Number, required: true }
    },
    pneuDianteiro: {
        value: { type: Number, required: true },
        km: { type: Number, required: true }
    },
    pneuTraseiro: {
        value: { type: Number, required: true },
        km: { type: Number, required: true }
    },
    gasolina: {
        value: { type: Number, required: true },
        km: { type: Number, required: true }
    },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'CostPerKm' });

module.exports = mongoose.model('CostPerKm', CostPerKmSchema);