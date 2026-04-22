// server/routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');

// СТВОРЕННЯ ЗАМОВЛЕННЯ (POST /api/orders)
// Зверни увагу: authMiddleware тут НЕМАЄ, бо гості теж можуть замовляти.
// Ми перевіримо токен "руками", якщо він є.
router.post('/', async (req, res) => {
    try {
        const { items, total, delivery, payment, contacts } = req.body;
        
        // Генеруємо номер замовлення
        const randomNumber = Math.floor(10000 + Math.random() * 90000);
        const orderId = `SYV-${randomNumber}`;

        // Створюємо об'єкт замовлення
        const newOrderData = {
            orderId,
            items,
            total,
            delivery,
            payment,
            contacts
        };

        // Якщо в заголовках передали токен - значить це залогінений юзер
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const jwt = require('jsonwebtoken');
            const token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                newOrderData.userId = decoded.id; // Прив'язуємо до юзера!
            } catch (err) {
                console.log("Токен невалідний, оформлюємо як гостя");
            }
        }

        const order = new Order(newOrderData);
        await order.save();

        res.status(201).json({ orderId: order.orderId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка створення замовлення" });
    }
});

// ОТРИМАТИ ЗАМОВЛЕННЯ ЮЗЕРА (GET /api/orders/my)
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Помилка отримання замовлень" });
    }
});

module.exports = router;