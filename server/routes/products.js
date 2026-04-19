// server/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Отримати всі товари
router.get('/', async (req, res) => {
    try {
        // Беремо всі товари з БД (без якихось фільтрів поки що)
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера при отриманні товарів" });
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