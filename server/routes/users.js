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

module.exports = router;