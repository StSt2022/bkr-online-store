// server/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Отримати всі товари АБО товари за списком ID
router.get('/', async (req, res) => {
    try {
        let query = {};
        // Якщо передали ?ids=1,2,3 - шукаємо тільки їх
        if (req.query.ids) {
            const idsArray = req.query.ids.split(',').map(Number);
            query = { id: { $in: idsArray } };
        }
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// GET /api/products/recommendations - Отримати рекомендації по тегах
router.get('/recommendations', async (req, res) => {
    try {
        const tags = req.query.tags ? req.query.tags.split(',') : [];
        const exclude = req.query.exclude ? req.query.exclude.split(',').map(Number) : [];
        const limit = parseInt(req.query.limit) || 4;

        let products = [];

        // 1. Спочатку шукаємо по тегах
        if (tags.length > 0) {
            products = await Product.find({
                tags: { $in: tags },
                id: { $nin: exclude }
            }).sort({ popularity: -1 }).limit(limit);
        }

        // 2. Якщо знайшли менше ніж треба (або тегів не було взагалі) - ДОБИВАЄМО ПОПУЛЯРНИМИ
        if (products.length < limit) {
            const foundIds = products.map(p => p.id);
            const ignoreIds = [...exclude, ...foundIds]; // Виключаємо ті, що вже дивимось, і ті, що вже знайшли
            const needed = limit - products.length;

            const fallbackProducts = await Product.find({
                id: { $nin: ignoreIds }
            }).sort({ popularity: -1 }).limit(needed);

            products = [...products, ...fallbackProducts];
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Помилка генерації рекомендацій" });
    }
});

// GET /api/products/:id/also-bought - АЛГОРИТМ "Інші також купували"
router.get('/:id/also-bought', async (req, res) => {
    try {
        const Order = require('../models/Order');
        const numId = Number(req.params.id);
        
        // 1. Знаходимо _id товару в Монго (бо в замовленнях лежать _id, а не наші кастомні id)
        const currentProduct = await Product.findOne({ id: numId });
        if (!currentProduct) return res.json([]);

        // 2. Агрегація (Магія MongoDB): Шукаємо всі товари, які купували разом з цим
        const alsoBoughtAgg = await Order.aggregate([
            // Крок А: Беремо тільки ті замовлення, де був цей товар
            { $match: { "items.productId": currentProduct._id } },
            // Крок Б: "Розбиваємо" масив товарів на окремі документи
            { $unwind: "$items" },
            // Крок В: Виключаємо сам цей товар (бо ми і так знаємо, що його купили)
            { $match: { "items.productId": { $ne: currentProduct._id } } },
            // Крок Г: Групуємо за ID інших товарів і рахуємо частоту їх появи
            { $group: { _id: "$items.productId", frequency: { $sum: 1 } } },
            // Крок Ґ: Сортуємо від найчастіших до найменш
            { $sort: { frequency: -1 } },
            // Крок Д: Беремо тільки Топ-4
            { $limit: 4 }
        ]);

        if (alsoBoughtAgg.length === 0) return res.json([]);

        // 3. У нас є список найпопулярніших _id. Тепер дістаємо самі товари з бази
        const topProductIds = alsoBoughtAgg.map(item => item._id);
        const relatedProducts = await Product.find({ _id: { $in: topProductIds } });

        res.json(relatedProducts);
    } catch (error) {
        console.error("Помилка алгоритму also-bought:", error);
        res.status(500).json({ message: "Помилка аналізу замовлень" });
    }
});

// GET /api/products/trending - Отримати товари з топ задачі дня
router.get('/trending', async (req, res) => {
    try {
        const TaskCounter = require('../models/TaskCounter');
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Знаходимо найпопулярнішу задачу за сьогодні
        const topTask = await TaskCounter.findOne({ date: today }).sort({ count: -1 });
        
        if (!topTask) return res.json({ topTask: null, products: [] });

        // Наш словник тегів (такий же, як на фронтенді)
        const taskTagsMap = {
            'bathroom': ['ванна', 'сантехніка'],
            'windows': ['скло', 'вікна', 'дзеркала'],
            'kitchen': ['кухня', 'антижир'],
            'laundry': ['прання', 'кондиціонер'],
            'general': ['підлога', 'поверхні'],
            'personal': ['догляд', 'гігієна', 'мило']
        };

        const tagsToSearch = taskTagsMap[topTask.taskKey] || [];

        // 2. Шукаємо товари, які підходять під цю задачу
        const products = await Product.find({ tags: { $in: tagsToSearch } }).limit(8);

        res.json({ 
            topTask: { key: topTask.taskKey, count: topTask.count }, 
            products 
        });
    } catch (error) {
        res.status(500).json({ message: "Помилка отримання трендів" });
    }
});

// GET /api/products/:id - Отримати один товар за нашим полем 'id'
router.get('/:id', async (req, res) => {
    try {
        // Зверни увагу: шукаємо по нашому полю 'id', а не по '_id' монго
        const product = await Product.findOne({ id: Number(req.params.id) });
        if (!product) {
            return res.status(404).json({ message: "Товар не знайдено" });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

module.exports = router;