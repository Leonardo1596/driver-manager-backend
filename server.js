require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cron = require('node-cron');
const port = process.env.PORT || 8000;
const { generateWeeklyReportsForAllUsers } = require('./services/WeeklyReportService')
const { generateMonthlyReportForAllUsers } = require('./services/MonthlyReportService');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

// Import Routes
const routeHomeApi = require('./routes/homeApi');
const routeUsers = require('./routes/users');
const routeEntries = require('./routes/entries');
const routeCostPerKm = require('./routes/costPerKm');
const routeReport = require('./routes/report');
const routePersonalExpense = require('./routes/personalExpense');
const routeGoal = require('./routes/goal');

// Routes
app.use(routeHomeApi);
app.use(routeUsers);
app.use(routeEntries);
app.use(routeCostPerKm);
app.use(routeReport);
app.use(routePersonalExpense);
app.use(routeGoal);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.emit('ready');
        console.log('Connected to MongoDB');
    })
    .catch((error) => console.log(error));

// Server
app.on('ready', () => {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        console.log(`http://localhost:${8000}`);

        // Start cron jobs
        cron.schedule('10 0 * * 1', generateWeeklyReportsForAllUsers);
        cron.schedule('59 23 28-31 * *', generateMonthlyReportForAllUsers);
    });
});