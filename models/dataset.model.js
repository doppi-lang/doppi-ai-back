const mongoose = require("mongoose");

const datasetScheme = new mongoose.Schema({
    question: { type: String, required: true,unique: true },
    answer: { type: String, required: true},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("dataset", datasetScheme);