export const products = [
        {
        id: 1,
        name: "Зволожуючий крем для обличчя 'Сяйво'",
        price: 450,
        image: "images/moisturizer-cream.jpg",
        category: "cosmetics",
        description: "Насичений крем з гіалуроновою кислотою, ідеально зволожує шкіру протягом 24 годин.",
        tags: ["догляд", "зволоження", "для сухої шкіри"],
        popularity: 95, // Умовний рейтинг популярності від 0 до 100
        related_products: [2, 5] // ID товарів, які часто купують разом
    },
    {
        id: 2,
        name: "Матова помада 'Оксамит'",
        price: 320,
        image: "images/matte-lipstick.jpg",
        category: "cosmetics",
        description: "Стійка матова помада насиченого червоного кольору. Не сушить губи.",
        tags: ["макіяж", "помада", "стійка"],
        popularity: 88,
        related_products: [1]
    },
    {
        id: 3,
        name: "Еко-засіб для миття підлоги 'Лаванда'",
        price: 180,
        image: "images/lavender-floor-cleaner.png",
        category: "cleaning",
        description: "Концентрований засіб з натуральним ароматом лаванди. Безпечний для дітей та тварин.",
        tags: ["прибирання", "еко", "концентрат"],
        popularity: 92,
        related_products: [4]
    },
    {
        id: 4,
        name: "Спрей для чищення кухні 'Цитрус'",
        price: 150,
        image: "images/citrus-kitchen-spray.jpg",
        category: "cleaning",
        description: "Потужний спрей-антижир з освіжаючим ароматом цитрусових. Легко видаляє застарілий бруд.",
        tags: ["прибирання", "кухня", "антижир"],
        popularity: 85,
        related_products: [3, 12]
    },
    {
        id: 5,
        name: "Тонік для обличчя 'Рожева вода'",
        price: 280,
        image: "images/face-tonik.jpg",
        category: "cosmetics",
        description: "Натуральний тонік, що заспокоює шкіру, вирівнює тон та готує до нанесення крему.",
        tags: ["догляд", "тонік", "для чутливої шкіри"],
        popularity: 91,
        related_products: [1]
    },
    {
        id: 6,
        name: "Гель для душу 'М'ята та евкаліпт'",
        price: 210,
        image: "images/mint-shower-gel.png",
        category: "hygiene",
        description: "Освіжаючий гель для душу, що бадьорить та тонізує шкіру. Ідеально для ранкового душу.",
        tags: ["гігієна", "гель для душу", "тонізуючий"],
        popularity: 94,
        related_products: [7, 8]
    },
    {
        id: 7,
        name: "Натуральний шампунь 'Ромашка'",
        price: 350,
        image: "images/chamomile-shampoo.png",
        category: "hygiene",
        description: "М'який шампунь без сульфатів, з екстрактом ромашки. Підходить для щоденного використання.",
        tags: ["гігієна", "волосся", "без сульфатів"],
        popularity: 89,
        related_products: [6]
    },
    {
        id: 8,
        name: "Рідке мило 'Алое Вера'",
        price: 120,
        image: "images/lotion-bottle.jpg",
        category: "hygiene",
        description: "Зволожуюче рідке мило для рук з екстрактом алое. Не сушить шкіру.",
        tags: ["гігієна", "мило", "зволоження"],
        popularity: 98,
        related_products: [1]
    },
    {
        id: 9,
        name: "Набір губок для посуду (5 шт.)",
        price: 80,
        image: "images/kitchen-sponge.jpg",
        category: "household",
        description: "Високоякісні та довговічні губки для миття посуду. Добре піняться та очищують.",
        tags: ["господарські", "губки", "кухня"],
        popularity: 99,
        related_products: [4]
    },
    {
        id: 10,
        name: "Сяюча сироватка з вітаміном С",
        price: 550,
        image: "images/serum.jpg",
        category: "cosmetics",
        description: "Сироватка, що вирівнює тон шкіри, надає їй сяйва та бореться з першими ознаками старіння.",
        tags: ["догляд", "сироватка", "вітамін С"],
        popularity: 87,
        related_products: [1, 5]
    },
    {
        id: 11,
        name: "Засіб для миття скла 'Без розводів'",
        price: 130,
        image: "images/glass-cleaner.jpg",
        category: "cleaning",
        description: "Ефективно очищує вікна, дзеркала та скляні поверхні, не залишаючи розводів.",
        tags: ["прибирання", "скло", "дзеркала"],
        popularity: 80,
        related_products: [3, 4]
    },
    {
        id: 12,
        name: "Мікрофіброві ганчірки (3 шт.)",
        price: 160,
        image: "images/microfiber-cloths.jpg",
        category: "household",
        description: "Універсальні ганчірки з мікрофібри для сухого та вологого прибирання. Не залишають ворсинок.",
        tags: ["господарські", "прибирання", "мікрофібра"],
        popularity: 93,
        related_products: [3, 11]
    },
    {
        id: 13,
        name: "Кондиціонер для білизни 'Квіти сакури'",
        price: 190,
        image: "images/sakura-fabric-softener.png",
        category: "cleaning",
        description: "Надає білизні неймовірної м'якості та залишає тонкий аромат квітучої сакури.",
        tags: ["прання", "кондиціонер", "аромат"],
        popularity: 84,
        related_products: [3]
    },
    {
        id: 14,
        name: "Зубна паста 'М'ятна прохолода'",
        price: 95,
        image: "images/mint-toothpaste.png",
        category: "hygiene",
        description: "Захищає від карієсу та надовго освіжає подих.",
        tags: ["гігієна", "зубна паста", "м'ята"],
        popularity: 96,
        related_products: [8]
    },
    {
        id: 15,
        name: "Паперові рушники (2 рулони)",
        price: 110,
        image: "images/paper-towels.png",
        category: "household",
        description: "Міцні двошарові паперові рушники. Добре вбирають вологу.",
        tags: ["господарські", "папір", "кухня"],
        popularity: 90,
        related_products: [9]
    },
    {
        id: 16,
        name: "Сонцезахисний флюїд SPF 50",
        price: 650,
        image: "images/sunscreen.png",
        category: "cosmetics",
        description: "Невагомий флюїд, що надійно захищає шкіру від UVA/UVB променів. Не залишає білих слідів.",
        tags: ["догляд", "сонцезахист", "SPF"],
        popularity: 86,
        related_products: [1, 10]
    }
];

export const loggedInUser = {
    firstName: "Іван",
    lastName: "Петренко",
    email: "ivan.petrenko@example.com",
    phone: "+380 99 123 45 67",
    addresses: [
        {
            city: "Київ",
            street: "вул. Хрещатик, 1",
            postalCode: "01001"
        },
        {
            city: "Львів",
            street: "пл. Ринок, 10",
            postalCode: "79008"
        }
    ],
    orderHistory: [
        {
            orderId: "SYV-00123",
            date: "10.09.2025",
            total: 770,
            status: "Доставлено"
        },
        {
            orderId: "SYV-00119",
            date: "02.08.2025",
            total: 180,
            status: "Доставлено"
        }
    ]
};