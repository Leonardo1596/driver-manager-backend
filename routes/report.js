const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');

router.get('/report/entries/:userId', ReportController.getFinancialSummaryByDate);
router.get('/maintenance-report/:userId', ReportController.getMaintenanceSummaryByDate);
router.get('/personal-maintenance-report/:userId', ReportController.getPersonalMaintenanceSummaryByDate);

module.exports = router;