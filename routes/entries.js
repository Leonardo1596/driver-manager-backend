const express = require('express');
const router = express.Router();
const EntryController = require('../controllers/EntryController');

router.post('/create_entry', EntryController.createEntry);
router.delete('/entry/delete/:userId/:entryId', EntryController.deleteEntry);
router.put('/entry/update/:userId/:entryId', EntryController.updateEntry);
router.get('/entries/:userId', EntryController.getEntries);

module.exports = router;