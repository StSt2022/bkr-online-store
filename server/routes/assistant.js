// server/routes/assistant.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { GoogleGenAI } = require('@google/genai');

// Ініціалізуємо клієнт
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: "Повідомлення порожнє" });

        // 1. Беремо всі товари з БД, щоб "показати" їх Штучному Інтелекту
        // Беремо тільки потрібні поля, щоб не витрачати ліміти API
        const products = await Product.find().select('id name category tags description price');
        
        // 2. Формуємо системну інструкцію
        const systemPrompt = `
        Ти привітний продавець-консультант інтернет-магазину "СЯЙВО".
        Ось каталог товарів:
        ${JSON.stringify(products)}
        
        Клієнт каже: "${message}"
        
        ПРАВИЛА:
        1. Підбери 1-3 товари, які найкраще вирішують задачу клієнта.
        2. Напиши коротку відповідь (1-2 речення).
        3. НІКОЛИ не пиши слово "id" або цифри ID у тексті відповіді! Згадуй тільки назви товарів.
        4. УВАЖНО ПЕРЕВІР: масив "productIds" повинен містити ТОЧНО ТІ id, які належать товарам, що ти порадив у тексті. Не плутай id!
        
        Відповідай ТІЛЬКИ в форматі JSON без маркдауну:
        {
            "text": "Текст відповіді",
            "productIds": [id1, id2]
        }
        `;

        // 3. Відправляємо запит до Gemini (використовуємо нову модель gemini-2.5-flash)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: systemPrompt,
        });

        let rawResponse = response.text;
        
        // Очищаємо можливий маркдаун (```json ... ```)
        rawResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsedResponse = JSON.parse(rawResponse);

        // 4. Знаходимо повні об'єкти товарів, які порадив AI
        const recommendedProducts = await Product.find({
            id: { $in: parsedResponse.productIds }
        });

        // 5. Віддаємо фронтенду
        res.json({
            text: parsedResponse.text,
            products: recommendedProducts
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "Помилка AI асистента" });
    }
});

module.exports = router;