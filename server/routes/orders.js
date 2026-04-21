// server/routes/orders.js
const express = require('express');
const router = express.Router();
// const Order = require('../models/Order'); // Ми створимо цю модель на наступному кроці

const authMiddleware = require('../middleware/authMiddleware');

// Отримати всі замовлення поточного юзера
router.get('/my', authMiddleware, async (req, res) => {
    try {
        // Поки бази замовлень нема, віддаємо пустий масив
        // const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json([]); 
    } catch (error) {
        res.status(500).json({ message: "Помилка отримання замовлень" });
    }
});

module.exports = router;