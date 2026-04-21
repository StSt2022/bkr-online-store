// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- РЕЄСТРАЦІЯ ---
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // 1. Перевіряємо, чи є вже такий email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Користувач з таким email вже існує" });
        }

        // 2. Хешуємо пароль
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Створюємо юзера
        const newUser = new User({
            firstName,
            lastName,
            email,
            passwordHash
        });

        const savedUser = await newUser.save();

        // 4. Створюємо токен
        const token = jwt.sign(
            { id: savedUser._id, email: savedUser.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Віддаємо токен і дані юзера (без пароля!)
        res.json({
            token,
            user: { id: savedUser._id, firstName: savedUser.firstName, lastName: savedUser.lastName, email: savedUser.email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера при реєстрації" });
    }
});

// --- ЛОГІН ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Шукаємо юзера
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Невірний email або пароль" });
        }

        // 2. Перевіряємо пароль
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Невірний email або пароль" });
        }

        // 3. Створюємо токен
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера при вході" });
    }
});

// --- Отримати дані поточного юзера (Захищений роут) ---
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash'); // Не віддаємо пароль
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера" });
    }
});

module.exports = router;