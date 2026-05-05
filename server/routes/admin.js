// server/routes/admin.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Всі роути тут захищені обома middleware
router.use(authMiddleware, adminMiddleware);

// 1. Отримати загальну статистику для адмінки
router.get('/stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        res.json({ totalProducts, totalOrders, totalUsers });
    } catch (error) {
        res.status(500).json({ message: "Помилка" });
    }
});

// 2. Отримати всі замовлення всіх юзерів (для таблиці)
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Помилка" });
    }
});

// 3. Змінити статус замовлення
router.patch('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Помилка" });
    }
});

module.exports = router;