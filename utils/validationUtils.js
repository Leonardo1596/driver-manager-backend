const validateRequiredFields = (fields, data) => {
    for (let field of fields) {
        if (!data[field] && data[field] !== 0) {
            return `O campo ${field} é obrigatório.`;
        }
    }
    return null;
};

const validateKilometers = (initialKm, finalKm) => {
    if (finalKm < initialKm) {
        return 'Quilometragem final deve ser maior ou igual à inicial.';
    }
    return null;
};

module.exports = {
    validateRequiredFields,
    validateKilometers
};