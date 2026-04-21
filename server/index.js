// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Підключення до MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Успішно підключено до MongoDB!'))
  .catch((error) => console.error('❌ Помилка підключення до MongoDB:', error));

// ПІДКЛЮЧЕННЯ РОУТІВ:
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);        

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на порту ${PORT}`);
});