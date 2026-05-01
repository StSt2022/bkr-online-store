// server/routes/reviews.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

// Допоміжна функція: перераховує середній рейтинг
const updateProductRating = async (productId) => {
    try {
        const numId = Number(productId);
        console.log(`[1] Початок перерахунку для товару ID: ${numId}`);

        // Шукаємо всі відгуки для цього товару
        const reviews = await Review.find({ productId: numId });
        const count = reviews.length;
        const avg = count > 0 ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 0;
        
        console.log(`[2] Знайдено відгуків: ${count}, Новий рейтинг: ${avg}`);

        // БРОНЕБІЙНИЙ ФІКС: Прямий запит до колекції MongoDB, щоб уникнути багів Mongoose з полем 'id'
        const mongoose = require('mongoose');
        const result = await mongoose.connection.collection('products').updateOne(
            { id: numId }, 
            { $set: { avgRating: avg, reviewCount: count } }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`[3] ✅ Базу даних успішно оновлено!`);
        } else {
            console.log(`[3] ⚠️ Товар знайдено, але рейтинг не змінився (або товар не знайдено)`);
        }
    } catch (error) {
        console.error("❌ Помилка оновлення рейтингу:", error);
    }
};

// 1. ОТРИМАТИ відгуки для конкретного товару
router.get('/:id/reviews', async (req, res) => {
    try {
        // .populate дозволяє витягнути ім'я юзера за його ID з колекції Users
        const reviews = await Review.find({ productId: Number(req.params.id) })
            .populate('userId', 'firstName lastName')
            .sort({ createdAt: -1 }); // Нові зверху
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Помилка отримання відгуків" });
    }
});

// 2. ДОДАТИ відгук (тільки для залогінених)
router.post('/:id/reviews', authMiddleware, async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const { rating, text } = req.body;

        const newReview = new Review({
            productId,
            userId: req.user.id,
            rating,
            text
        });

        await newReview.save();
        await updateProductRating(productId); // Оновлюємо рейтинг товару

        res.status(201).json({ message: "Відгук успішно додано!" });
    } catch (error) {
        // Помилка 11000 означає, що такий індекс (юзер+товар) вже існує
        if (error.code === 11000) {
            return res.status(409).json({ message: "Ви вже залишили відгук на цей товар" });
        }
        res.status(500).json({ message: "Помилка при збереженні відгуку" });
    }
});

// 3. ВИДАЛИТИ відгук (тільки свій)
router.delete('/:id/reviews/:reviewId', authMiddleware, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        
        if (!review) return res.status(404).json({ message: "Відгук не знайдено" });
        
        // Перевіряємо, чи це відгук саме цього юзера
        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Ви не можете видалити чужий відгук" });
        }

        await Review.findByIdAndDelete(req.params.reviewId);
        await updateProductRating(Number(req.params.id)); // Перераховуємо рейтинг

        res.json({ message: "Відгук видалено" });
    } catch (error) {
        res.status(500).json({ message: "Помилка при видаленні" });
    }
});

module.exports = router;