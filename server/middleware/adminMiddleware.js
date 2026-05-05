// server/middleware/adminMiddleware.js
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Ми беремо ID з токена (req.user формується в authMiddleware)
        const userId = req.user.id || req.user._id;
        
        if (!userId) {
            return res.status(401).json({ message: "Немає ID в токені" });
        }

        // Шукаємо юзера в базі
        const user = await User.findById(userId);
        
        // Якщо юзер знайдений І його поле isAdmin дорівнює true
        if (user && user.isAdmin === true) {
            next(); // Пропускаємо!
        } else {
            res.status(403).json({ message: "Доступ заборонено. Тільки для адміністраторів." });
        }
    } catch (error) {
        console.error("Помилка в adminMiddleware:", error);
        res.status(500).json({ message: "Помилка сервера при перевірці прав" });
    }
};