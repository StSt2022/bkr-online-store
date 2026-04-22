// server/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Отримати всі товари АБО товари за списком ID
router.get('/', async (req, res) => {
    try {
        let query = {};
        // Якщо передали ?ids=1,2,3 - шукаємо тільки їх
        if (req.query.ids) {
            const idsArray = req.query.ids.split(',').map(Number);
            query = { id: { $in: idsArray } };
        }
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// GET /api/products/recommendations - Отримати рекомендації по тегах
router.get('/recommendations', async (req, res) => {
    try {
        const tags = req.query.tags ? req.query.tags.split(',') : [];
        const exclude = req.query.exclude ? req.query.exclude.split(',').map(Number) : [];
        const limit = parseInt(req.query.limit) || 4;

        if (tags.length === 0) return res.json([]);

        const products = await Product.find({
            tags: { $in: tags },
            id: { $nin: exclude }
        })
        .sort({ popularity: -1 }) // ДОДАЛИ: Сортуємо від найпопулярніших до найменш
        .limit(limit);

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Помилка генерації рекомендацій" });
    }
});

// GET /api/products/:id - Отримати один товар за нашим полем 'id'
router.get('/:id', async (req, res) => {
    try {
        // Зверни увагу: шукаємо по нашому полю 'id', а не по '_id' монго
        const product = await Product.findOne({ id: Number(req.params.id) });
        if (!product) {
            return res.status(404).json({ message: "Товар не знайдено" });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

module.exports = router;