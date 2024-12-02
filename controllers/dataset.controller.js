const { get } = require('mongoose');
const dataset = require('../models/dataset.model');

const getDataset = async (req, res) => {
    try {
        // Ma'lumotlarni MongoDB dan olish
        const cursor = dataset.find().cursor(); // Cursor orqali qism-qism olish
        res.setHeader('Content-Type', 'application/json');
        res.write('['); // JSON massiv boshlanishi
        let isFirst = true;
        for await (const doc of cursor) {
            if (!isFirst) res.write(','); // JSON elementlarni ajratish
            res.write(JSON.stringify(doc.toObject())); // Hujjatni JSON formatida yuborish
            isFirst = false;
        }
        res.write(']'); // JSON massivni yakunlash
        res.end(); // Ma'lumotni yuborishni tugatish
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getProgress = async (req, res) => {
    try {
        const total = await dataset.countDocuments(); // Jami hujjatlarni olish
        const cursor = dataset.find().cursor(); // Streaming orqali ishlash
        let count = 0;

        // Streaming orqali progressni yuborish
        for await (const _ of cursor) {
            count++;
            const progress = ((count / total) * 100).toFixed(2); // Progressni hisoblash
            res.write(JSON.stringify({ progress }) + '\n'); // JSON formatida progressni yuborish
        }
        res.end(); // Yuborishni tugatish
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getDatasetById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await dataset.findById(id);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const addDataset = async (req, res) => {
    try {
        const { id, question, answer } = req.body;

        // Tekshirish: Savol avvaldan mavjud bo'lsa, xatolik qaytariladi
        const existingDataset = await dataset.findOne({ question: { $regex: question, $options: 'i' } });
        if (existingDataset) {
            return res.status(400).json({ error: "This question already exists in the dataset" });
        }
        // Yangi datasetni yaratish
        // const data = new dataset({ id, question, answer });
        // await data.save();
        const data = new dataset({ question, answer});
        await data.save();
        // Fetch all datasets sorted with the newest at the top
        const updatedDataset = await dataset.find().sort({ createdAt: -1 });
        res.json({ message: "Dataset added successfully", data:updatedDataset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const deleteDataset = async (req, res) => {
    try {
        const { id } = req.params;
        await dataset.findByIdAndDelete(id);
        res.json({ message: 'Dataset deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const updateDataset = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        await dataset.findByIdAndUpdate(id, { question, answer });
        res.json({ message: 'Dataset updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = { getDataset, addDataset,deleteDataset,getDatasetById,updateDataset,getProgress };