// server/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Оновити особисті дані
router.patch('/me', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        
        // Знаходимо юзера і оновлюємо поля
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { firstName, lastName, phone } },
            { new: true } // Повертає оновлений документ
        ).select('-passwordHash');

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Помилка оновлення профілю" });
    }
});

// Оновити дані домогосподарства ("Мій дім")
router.patch('/me/household', authMiddleware, async (req, res) => {
    try {
        const { people, hasKids, hasPets, housingType } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { household: { people, hasKids, hasPets, housingType } } },
            { new: true }
        ).select('-passwordHash');

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Помилка оновлення домогосподарства" });
    }
});

// --- ДОДАВАННЯ ТОВАРУ В ЗАПАС ---
router.post('/me/stock', authMiddleware, async (req, res) => {
    try {
        const { productId, intervalDays } = req.body;
        
        // Перевіряємо, чи цей товар вже є в запасі
        const user = await User.findById(req.user.id);
        const existingItemIndex = user.stock.findIndex(item => item.productId.toString() === productId);

        if (existingItemIndex > -1) {
            // Оновлюємо інтервал і дату останньої покупки
            user.stock[existingItemIndex].intervalDays = intervalDays;
            user.stock[existingItemIndex].lastBought = new Date();
        } else {
            // Додаємо новий
            user.stock.push({
                productId,
                intervalDays,
                lastBought: new Date()
            });
        }

        await user.save();
        res.json({ message: "Запас оновлено", stock: user.stock });
    } catch (error) {
        res.status(500).json({ message: "Помилка оновлення запасу" });
    }
});

// --- ВИДАЛЕННЯ З ЗАПАСУ ---
router.delete('/me/stock/:productId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.stock = user.stock.filter(item => item.productId.toString() !== req.params.productId);
        await user.save();
        res.json({ message: "Видалено із запасу", stock: user.stock });
    } catch (error) {
        res.status(500).json({ message: "Помилка видалення" });
    }
});

module.exports = router;