// server/seedOrders.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');

// Правила, які імітують логіку реальних покупців
const purchasePatterns = [
    [3, 12, 9],   // Засіб для підлоги + Мікрофібра + Губки
    [4, 9, 11],   // Спрей для кухні + Губки + Засіб для скла
    [1, 5, 2],    // Крем для обличчя + Тонік + Помада
    [6, 7, 8],    // Гель для душу + Шампунь + Рідке мило
    [13, 14, 15]  // Кондиціонер + Зубна паста + Паперові рушники
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ Підключено до MongoDB');
        
        // Очищаємо старі замовлення
        await Order.deleteMany({});
        console.log('🗑 Старі замовлення видалено');

        const users = await User.find();
        if (users.length === 0) {
            console.log('❌ Юзерів немає. Спочатку запустіть seedReviews.js');
            process.exit(1);
        }

        const allProducts = await Product.find();
        const getProductDetails = (id) => allProducts.find(p => p.id === id);

        // Кожен з 10 юзерів робить по 2 замовлення
        for (let user of users) {
            for (let i = 0; i < 2; i++) {
                // Вибираємо випадковий патерн покупок
                const pattern = purchasePatterns[Math.floor(Math.random() * purchasePatterns.length)];
                
                // Формуємо кошик
                const items = pattern.map(id => {
                    const prod = getProductDetails(id);
                    return {
                        productId: prod._id, // У замовленнях зберігаємо _id Монго
                        name: prod.name,
                        price: prod.price,
                        quantity: Math.floor(Math.random() * 2) + 1 // 1 або 2 штуки
                    };
                });

                const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const orderId = `SYV-${Math.floor(10000 + Math.random() * 90000)}`;
                
                // Рандомна дата за останні 30 днів
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 30));

                await Order.create({
                    userId: user._id,
                    orderId,
                    items,
                    total,
                    status: 'delivered', // Всі тестові замовлення вже доставлені
                    delivery: { method: 'nova-poshta', city: 'Київ', postOffice: '1' },
                    payment: 'card-online',
                    createdAt: date
                });
            }
        }
        
        console.log('🛍 20 тестових замовлень успішно згенеровано!');
        mongoose.disconnect();
        process.exit();
    })
    .catch((error) => console.error(error));