// server/routes/tasks.js
const express = require('express');
const router = express.Router();
const TaskCounter = require('../models/TaskCounter');

// Допоміжна функція для отримання сьогоднішньої дати (напр. '2025-04-22')
const getToday = () => new Date().toISOString().split('T')[0];

// 1. Отримати всі лічильники за сьогодні
router.get('/today', async (req, res) => {
    try {
        const today = getToday();
        // Шукаємо за сьогодні і сортуємо (найпопулярніші зверху)
        const counters = await TaskCounter.find({ date: today }).sort({ count: -1 });
        res.json(counters);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// 2. Клікнули на задачу (Збільшити лічильник)
router.post('/:key/click', async (req, res) => {
    try {
        const today = getToday();
        const taskKey = req.params.key;

        // findOneAndUpdate з { upsert: true } означає:
        // "Якщо запису немає - створи його з count: 1. Якщо є - просто збільш count на 1".
        const updatedCounter = await TaskCounter.findOneAndUpdate(
            { taskKey, date: today },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );

        res.json(updatedCounter);
    } catch (error) {
        res.status(500).json({ message: "Помилка оновлення лічильника" });
    }
});

module.exports = router;