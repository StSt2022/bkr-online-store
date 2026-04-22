// src/utils/recommendations.js

// Зберігаємо товар в історію
export const recordProductView = (product) => {
    let viewed = JSON.parse(localStorage.getItem('viewedProducts')) || [];
    
    // Видаляємо, якщо такий вже є, щоб перемістити його на початок
    viewed = viewed.filter(p => p.id !== product.id);
    
    // Додаємо на початок
    viewed.unshift({ id: product.id, tags: product.tags });
    
    // Зберігаємо тільки останні 10, щоб не засмічувати пам'ять
    if (viewed.length > 10) viewed.pop();
    
    localStorage.setItem('viewedProducts', JSON.stringify(viewed));
};

// Дістаємо унікальні теги з ПАРУ ОСТАННІХ переглянутих товарів
export const getRecommendedTags = () => {
    const viewed = JSON.parse(localStorage.getItem('viewedProducts')) || [];
    
    // БЕРЕМО ТІЛЬКИ 2 ОСТАННІ ТОВАРИ! 
    // Це робить систему дуже чутливою до того, що юзер шукає саме зараз
    const recentViewed = viewed.slice(0, 2); 
    
    const allTags = recentViewed.flatMap(p => p.tags);
    return [...new Set(allTags)]; // Повертає масив унікальних тегів
};

// Дістаємо ID переглянутих товарів
export const getViewedIds = () => {
    const viewed = JSON.parse(localStorage.getItem('viewedProducts')) || [];
    return viewed.map(p => p.id);
};