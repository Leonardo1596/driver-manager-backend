const CostPerKm = require('../models/CostPerKm');

const createCostPerKm = async (costPerKmData) => {
    try {
        const newCostPerKm = new CostPerKm(costPerKmData);

        const savedCostPerKm = await newCostPerKm.save();

        return savedCostPerKm;
    } catch (error) {
        console.log(error);
    };
};

const updateCostPerKm = async (req, res) => {
    try {
        const { userId, costPerKmId } = req.params;

        const {
            oleo,
            relacao,
            pneuDianteiro,
            pneuTraseiro,
            gasolina
        } = req.body;

        const updatedCostPerKm = await CostPerKm.findOneAndUpdate(
            { userId, _id: costPerKmId },
            { 
                'oleo.value': oleo.value,
                'oleo.km': oleo.km,
                'relacao.value': relacao.value,
                'relacao.km': relacao.km,
                'pneuDianteiro.value': pneuDianteiro.value,
                'pneuDianteiro.km': pneuDianteiro.km,
                'pneuTraseiro.value': pneuTraseiro.value,
                'pneuTraseiro.km': pneuTraseiro.km,
                'gasolina.value': gasolina.value,
                'gasolina.km': gasolina.km
            },
            { new: true }
        );

        if (!updatedCostPerKm) {
            return res.status(404).json({ error: 'Custo por km não encontrado' });
        }

        res.json(updatedCostPerKm);

    } catch (error) {
        console.error('Ocorreu um erro ao atualizar o custo por km: ', error);
        res.status(500).json({ error: 'Ocorreu um erro ao atualizar o custo por km' });
    }
};

module.exports = {
    createCostPerKm,
    updateCostPerKm
}