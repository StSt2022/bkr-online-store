// server/seedReviews.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Review = require('./models/Review');
const Product = require('./models/Product');

const texts = [
    "Чудовий засіб, дуже рекомендую!", "Запах трохи різкий, але відмиває добре.",
    "Найкраще, що я пробувала для дому.", "Звичайна якість за ці гроші, нічого особливого.",
    "Економний розхід, вистачить надовго.", "Не сподобалось, залишає розводи.",
    "Беру вже втретє, супер!", "Дуже ніжна текстура, приємний аромат.",
    "Моїй родині підходить ідеально.", "Класний еко-засіб, безпечний для кота."
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ Підключено до MongoDB');
        
        // Очищаємо старі відгуки (якщо запускали раніше)
        await Review.deleteMany({});
        
        // Створюємо 10 тестових юзерів
        const passwordHash = await bcrypt.hash('Test1234', 10);
        let userIds = [];
        
        for(let i = 1; i <= 10; i++) {
            const email = `test${i}@test.com`;
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    firstName: `Покупець`,
                    lastName: `${i}`,
                    email,
                    passwordHash
                });
            }
            userIds.push(user._id);
        }
        console.log('👤 10 тестових юзерів створено/знайдено');

        // Розкидаємо відгуки
        const products = await Product.find();
        
        for (let user_id of userIds) {
            // Кожен юзер залишає 4 відгуки на випадкові товари
            const shuffledProducts = products.sort(() => 0.5 - Math.random()).slice(0, 4);
            
            for (let prod of shuffledProducts) {
                const rating = Math.floor(Math.random() * 3) + 3; // Рейтинг від 3 до 5
                const text = texts[Math.floor(Math.random() * texts.length)];
                
                await Review.create({
                    productId: prod.id,
                    userId: user_id,
                    rating,
                    text
                });
            }
        }
        console.log('💬 Відгуки успішно розкидані!');

        // Перераховуємо рейтинги для всіх товарів
        for (let prod of products) {
            const reviews = await Review.find({ productId: prod.id });
            const count = reviews.length;
            const avg = count > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0;
            
            await Product.findOneAndUpdate({ id: prod.id }, { avgRating: Number(avg), reviewCount: count });
        }
        console.log('⭐ Середні рейтинги перераховано!');

        mongoose.disconnect();
        process.exit();
    })
    .catch((error) => console.error(error));