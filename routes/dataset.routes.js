const express = require('express');
const {addDataset, getDataset, deleteDataset, getDatasetById, updateDataset} = require('../controllers/dataset.controller');

const router = express.Router();

router.get('/dataset', getDataset);
router.get('/dataset/:id', getDatasetById);
router.put('/dataset/:id', updateDataset);
router.post('/dataset', addDataset);
router.delete('/dataset/:id', deleteDataset);

module.exports = router;