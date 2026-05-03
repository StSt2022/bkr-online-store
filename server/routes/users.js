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

// GET /api/users/me/stats - Отримати статистику
router.get('/me/stats', authMiddleware, async (req, res) => {
    try {
        const Order = require('../models/Order');
        const Review = require('../models/Review');
        
        // 1. Всі замовлення юзера
        const orders = await Order.find({ userId: req.user.id });
        
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        
        // 2. Кількість відгуків
        const reviewsCount = await Review.countDocuments({ userId: req.user.id });
        
        // 3. Улюблена категорія (вираховуємо з замовлень)
        // Для спрощення, оскільки категорій немає прямо в Order, 
        // ми просто витягнемо найчастіше слово "name" (в реальному проекті роблять populate, 
        // але щоб не перевантажувати бекенд, зробимо базовий підрахунок або просто фіктивну поки)
        
        // Спрощений агрегатор: беремо id всіх куплених товарів
        let allBoughtProductIds = [];
        orders.forEach(order => {
            order.items.forEach(item => allBoughtProductIds.push(item.productId));
        });

        let favoriteCategory = "Поки невідомо";
        if (allBoughtProductIds.length > 0) {
            const Product = require('../models/Product');
            // Знаходимо найпопулярнішу категорію серед куплених
            const catAgg = await Product.aggregate([
                { $match: { _id: { $in: allBoughtProductIds } } },
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]);
            
            if (catAgg.length > 0) {
                const categoryNames = {
                    cosmetics: "Косметика", cleaning: "Прибирання", 
                    hygiene: "Гігієна", household: "Господарські"
                };
                favoriteCategory = categoryNames[catAgg[0]._id] || catAgg[0]._id;
            }
        }

        res.json({ totalOrders, totalSpent, reviewsCount, favoriteCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка отримання статистики" });
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

// GET /api/users/me/stock/reminders - Отримати нагадування (що час купити)
router.get('/me/stock/reminders', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.stock || user.stock.length === 0) return res.json([]);

        const today = new Date();
        const reminders = [];

        // Перевіряємо кожен товар у запасі
        for (let item of user.stock) {
            const nextDate = new Date(item.lastBought);
            nextDate.setDate(nextDate.getDate() + item.intervalDays);
            
            // Якщо до наступної покупки залишилось менше 3 днів (або вже прострочено)
            const daysLeft = (nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
            
            if (daysLeft <= 3) {
                // Дістаємо інфу про товар, щоб показати назву і ціну
                const Product = require('../models/Product');
                const productInfo = await Product.findById(item.productId);
                if (productInfo) {
                    reminders.push(productInfo);
                }
            }
        }

        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: "Помилка отримання нагадувань" });
    }
});

module.exports = router;