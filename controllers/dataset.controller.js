const dataset = require('../models/dataset.model');

const getDataset = async (req, res) => {
    try {
        // Ma'lumotlarni MongoDB dan olish
        const cursor = dataset.find().cursor(); // Cursor orqali qism-qism olish
        const total = await dataset.countDocuments(); // Jami hujjat sonini olish
        let count = 0;
        // Streaming uchun header'ni o'rnatish
        res.setHeader('Content-Type', 'application/json');
        res.write('['); // JSON massiv boshlanishi
        for await (const doc of cursor) {
            if (count > 0) res.write(','); // JSON elementlarni ajratish

            const progress = ((count + 1) / total) * 100; // Progressni hisoblash

            // Har bir hujjatni JSON formatida yozish
            res.write(JSON.stringify({ ...doc.toObject(), progress }));

            count++;
        }

        res.write(']'); // JSON massivni yakunlash
        res.end(); // Ma'lumotni yuborishni tugatish

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
module.exports = { getDataset, addDataset,deleteDataset,getDatasetById,updateDataset };