const dataset  = require("../models/dataset.model");
const getDataset = async () => {
    try {
        fetchData = await dataset.find();
        return fetchData
    } catch (error) {
        console.error(error);
        return null;
    }
};

module.exports = { getDataset };