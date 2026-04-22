// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { getRecommendedTags, getViewedIds } from '../utils/recommendations';

// Наші "Задачі дня" та теги, які їм відповідають
const dailyTasks = [
    { id: 'bathroom', label: '🛁 Прибрати ванну', tags: ['ванна', 'сантехніка'] },
    { id: 'windows', label: '🪟 Помити вікна', tags: ['скло', 'вікна', 'дзеркала'] },
    { id: 'kitchen', label: '🍳 Прибрати кухню', tags: ['кухня', 'антижир'] },
    { id: 'laundry', label: '👕 Випрати білизну', tags: ['прання', 'кондиціонер'] },
    { id: 'general', label: '🏠 Генеральне', tags: ['підлога', 'поверхні'] },
    { id: 'personal', label: '🚿 Догляд', tags: ['догляд', 'гігієна', 'мило'] }
];

const Home = () => {
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [activeTask, setActiveTask] = useState(dailyTasks[0]); // За замовчуванням перша задача

    useEffect(() => {
            // 1. Вантажимо всі товари (як було)
            fetch('http://localhost:3001/api/products')
                .then(res => res.json())
                .then(data => setProducts(data))
                .catch(err => console.error(err));

            // 2. ВАНТАЖИМО ПЕРСОНАЛЬНІ РЕКОМЕНДАЦІЇ
            const tags = getRecommendedTags();
            const excludeIds = getViewedIds();
            
            if (tags.length > 0) {
                fetch(`http://localhost:3001/api/products/recommendations?tags=${tags.join(',')}&exclude=${excludeIds.join(',')}`)
                    .then(res => res.json())
                    .then(data => setRecommendedProducts(data))
                    .catch(err => console.error(err));
            }
        }, []);

    // Фільтруємо товари для "Задачі дня"
    // Шукаємо товари, у яких є хоча б один тег, що збігається з тегами активної задачі
    const taskProducts = products.filter(product => 
        product.tags.some(tag => activeTask.tags.includes(tag))
    ).slice(0, 4); // Беремо максимум 4 штуки для краси

    // Фільтруємо Популярні товари (popularity > 90)
    const popularProducts = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

    // Фільтруємо Новинки
    const newProducts = products.filter(p => p.isNewProduct).slice(0, 4);

    return (
        <>
            {/* Твій оригінальний HERO банер */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Все для дому та особистої гігієни</h1>
                    <div className="hero-actions">
                        <Link to="/catalog" className="hero-btn primary-btn">Перейти до каталогу</Link>
                        <a href="#weekly-sale" className="hero-btn secondary-btn">Акції тижня</a>
                    </div>
                </div>
            </section>

            {/* Твої оригінальні категорії */}
            <section className="categories">
                <Link to="/catalog?category=cleaning" className="category-item-link">
                    <div className="category-item">
                        <div className="icon-bg" style={{ backgroundColor: '#e0f2e3' }}>
                            <img src="/images/mop.png" alt="Cleaning" />
                        </div>
                        <p>Засоби для прибирання</p>
                    </div>
                </Link>
                <Link to="/catalog?category=cosmetics" className="category-item-link">
                    <div className="category-item">
                        <div className="icon-bg" style={{ backgroundColor: '#ffe0e0' }}>
                            <img src="/images/cosmetics.png" alt="Cosmetics" />
                        </div>
                        <p>Косметика та парфумерія</p>
                    </div>
                </Link>
                <Link to="/catalog?category=hygiene" className="category-item-link">
                    <div className="category-item">
                        <div className="icon-bg" style={{ backgroundColor: '#d4f1f4' }}>
                            <img src="/images/personal-hygiene.png" alt="Hygiene" />
                        </div>
                        <p>Засоби особистої гігієни</p>
                    </div>
                </Link>
                <Link to="/catalog?category=household" className="category-item-link">
                    <div className="category-item">
                        <div className="icon-bg" style={{ backgroundColor: '#e9e7f9' }}>
                            <img src="/images/cleaning.png" alt="Household" />
                        </div>
                        <p>Господарські товари</p>
                    </div>
                </Link>
            </section>

            <main>
                {/* НОВА СЕКЦІЯ: ЗАДАЧА ДНЯ */}
                <section style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Що робимо сьогодні?</h2>
                    
                    {/* Кнопки задач */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
                        {dailyTasks.map(task => (
                            <button 
                                key={task.id}
                                onClick={() => setActiveTask(task)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '50px',
                                    border: '1px solid #ddd',
                                    backgroundColor: activeTask.id === task.id ? '#333' : '#fff',
                                    color: activeTask.id === task.id ? '#fff' : '#333',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {task.label}
                            </button>
                        ))}
                    </div>

                    {/* Товари для задачі */}
                    <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {taskProducts.length > 0 ? (
                            taskProducts.map(p => <ProductCard key={p.id} product={p} />)
                        ) : (
                            <p>Для цієї задачі поки немає товарів.</p>
                        )}
                    </div>
                </section>

                {recommendedProducts.length > 0 && (
                    <section style={{ marginBottom: '60px', padding: '30px', backgroundColor: '#F5FCFF', borderRadius: '20px', border: '1px solid #DFEEFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '30px' }}>✨</span>
                            <div>
                                <h2 style={{ fontSize: '24px', margin: 0, color: '#185FA5' }}>Рекомендовано для вас</h2>
                                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>На основі ваших переглядів</p>
                            </div>
                        </div>
                        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            {recommendedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </section>
                )}

                {/* НОВА СЕКЦІЯ: ПОПУЛЯРНЕ */}
                <section style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '28px', margin: 0 }}>Популярні товари</h2>
                        <Link to="/catalog" style={{ color: '#333', textDecoration: 'none', fontWeight: '500' }}>Дивитись усі →</Link>
                    </div>
                    <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {popularProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>

                {/* НОВА СЕКЦІЯ: НОВИНКИ */}
                <section style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '28px', margin: 0 }}>Новинки</h2>
                        <Link to="/catalog" style={{ color: '#333', textDecoration: 'none', fontWeight: '500' }}>Дивитись усі →</Link>
                    </div>
                    <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            </main>
        </>
    );
};

export default Home;