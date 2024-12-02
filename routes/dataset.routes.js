const express = require('express');
const {addDataset, getDataset, deleteDataset, getDatasetById, updateDataset, getProgress} = require('../controllers/dataset.controller');

const router = express.Router();

router.get('/dataset', getDataset);
router.get('/dataset/:id', getDatasetById);
router.get('/progress', getProgress); // Progressni olish
router.put('/dataset/:id', updateDataset);
router.post('/dataset', addDataset);
router.delete('/dataset/:id', deleteDataset);

module.exports = router;