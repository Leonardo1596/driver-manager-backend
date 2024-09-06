const User = require('../models/UserSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CostPerKmController = require('../controllers/CostPerKmController');
const Goal = require('../models/GoalSchema');
const { validateRequiredFields, validateKilometers } = require('../utils/validationUtils');

const register = async (req, res, next) => {
    try {
        const requiredFieldsError = validateRequiredFields(['name', 'email', 'password'], req.body);
        if (requiredFieldsError) {
            return res.status(400).json({ error: requiredFieldsError });
        }

        // Hash of password
        const hashedPass = await bcrypt.hash(req.body.password, 10);

        // Creation of new user
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPass,
        });

        // Check If the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            console.log('Email already exists');
            return res.json({ message: 'Email já existe' });
        }

        // Save user
        const savedUser = await user.save();

        // Create token
        const accessToken = jwt.sign({ _id: savedUser._id, email: savedUser.email }, process.env.JWT_KEY, {
            expiresIn: '3600s'
        });

        // Create costPerKm
        const costPerKmData = {
            userId: savedUser._id,
            oleo: { value: 0, km: 0 },
            relacao: { value: 0, km: 0 },
            pneuDianteiro: { value: 0, km: 0 },
            pneuTraseiro: { value: 0, km: 0 },
            gasolina: { value: 0, km: 0 },
        };

        const costPerKm = await CostPerKmController.createCostPerKm(costPerKmData);

        // Check if default goal already exists
        let defaultGoal = await Goal.findOne({ _id: savedUser._id, name: 'Salário' });
        if (!defaultGoal) {
            // Create default goal "Salário"
            salaryGoal = new Goal({
                userId: savedUser._id,
                name: 'Salário',
                limit: 400,
                weeklyAccumulated: 0,
                monthlyAccumulated: 0,
                totalAccumulated: 0,
                isDefault: true
            });
            await salaryGoal.save();
        }

        console.log('Successfully registered');
        console.log(`User: ${savedUser.username}`);
        console.log(savedUser);

        res.status(201).json({ token: accessToken, userProfile: savedUser, message: 'Successfully registered' });
    } catch (error) {
        console.log(error);
        res.json({ message: 'An error occurred' });
    }
};

const login = (req, res, next) => {
    const requiredFieldsError = validateRequiredFields(['email', 'password'], req.body);
    if (requiredFieldsError) {
        return res.status(400).json({ error: requiredFieldsError });
    }

    User.findOne({ email: req.body.email })
        .then(async user => {
            if (user) {
                bcrypt.compare(req.body.password, user.password, async (err, result) => {
                    if (err) {
                        res.json({ error: err });
                    }
                    if (result) {
                        // Create token
                        const accessToken = jwt.sign({ _id: user._id, email: user.email, username: user.username }, process.env.JWT_KEY, {
                            expiresIn: '3600s'
                        });

                        let userInfo = {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                        };

                        // Successfully
                        console.log(`User: ${user.email} is signed`)

                        res.json({ token: accessToken, userInfo: userInfo, message: 'Logado com sucesso' });
                        next();
                    } else {
                        res.json({ message: 'A senha está incorreta' });
                    }
                });
            } else {
                console.log('user not found');
                res.json({ message: 'Usuário não encontrado' });
            }
        });
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const {
            email,
            username,
        } = req.body;

        // Get existing user
        const existingUser = await User.findOne({ _id: userId });

        if (!existingUser) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        };

        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { email: email, username: username },
            { new: true }
        );

        res.json(updatedUser);

    } catch (error) {
        console.error('Ocorreu um erro ao atualizar o usuário: ', error);
        res.status(500).json({ error: 'Ocorreu um erro ao atualizar o usuário' });
    }
};

const getUser = async (req, res) => {

    User.findOne({ _id: req.params.userId })
        .then(async user => {
            let userInfo = {
                _id: user._id,
                name: user.name,
                email: user.email,
            }

            res.json(userInfo);
        })
};


module.exports = {
    register, login, updateUser, getUser
}