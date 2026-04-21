// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Токен зазвичай передається в заголовку у форматі "Bearer <token>"
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Немає токена, авторизація відхилена" });
        }

        // Розшифровуємо токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Додаємо дані юзера до запиту
        req.user = decoded;
        next(); // Пропускаємо далі
    } catch (error) {
        res.status(401).json({ message: "Невалідний токен" });
    }
};