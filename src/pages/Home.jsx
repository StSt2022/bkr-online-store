import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { getRecommendedTags, getViewedIds } from '../utils/recommendations';
import { AuthContext } from '../context/AuthContext';

const dailyTasks = [
    { id: 'bathroom', label: '🛁 Прибрати ванну', tags: ['ванна', 'сантехніка'] },
    { id: 'windows', label: '🪟 Помити вікна', tags: ['скло', 'вікна', 'дзеркала'] },
    { id: 'kitchen', label: '🍳 Прибрати кухню', tags: ['кухня', 'антижир'] },
    { id: 'laundry', label: '👕 Випрати білизну', tags: ['прання', 'кондиціонер'] },
    { id: 'general', label: '🏠 Генеральне', tags: ['підлога', 'поверхні'] },
    { id: 'personal', label: '🚿 Догляд', tags: ['догляд', 'гігієна', 'мило'] }
];

const Home = () => {
    const { user, token } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [activeTask, setActiveTask] = useState(dailyTasks[0]);
    
    // НОВІ СТАНИ ДЛЯ ЛІЧИЛЬНИКІВ
    const [taskCounters, setTaskCounters] = useState({});
    const [topTaskKey, setTopTaskKey] = useState(null);

    const [reminders, setReminders] = useState([]);
    const [isRemindersVisible, setIsRemindersVisible] = useState(true);

    useEffect(() => {
        // Вантажимо товари
        fetch('http://localhost:3001/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(console.error);

        // Вантажимо рекомендації
        const tags = getRecommendedTags();
        const excludeIds = getViewedIds();
        if (tags.length > 0) {
            const safeFilter = (user && user.household && user.household.hasKids) ? '&safeForKids=true' : '';

            fetch(`http://localhost:3001/api/products/recommendations?tags=${tags.join(',')}&exclude=${excludeIds.join(',')}`)
                .then(res => res.json())
                .then(data => setRecommendedProducts(data))
                .catch(console.error);
        }

        // ВАНТАЖИМО ЛІЧИЛЬНИКИ ЗАДАЧ
        fetch('http://localhost:3001/api/tasks/today')
            .then(res => res.json())
            .then(data => {
                const countersMap = {};
                let maxCount = 0;
                let topKey = null;

                data.forEach(item => {
                    countersMap[item.taskKey] = item.count;
                    if (item.count > maxCount) {
                        maxCount = item.count;
                        topKey = item.taskKey;
                    }
                });

                setTaskCounters(countersMap);
                setTopTaskKey(topKey);
            })
            .catch(console.error);

        if (token) {
            fetch('http://localhost:3001/api/users/me/stock/reminders', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setReminders(data))
            .catch(console.error);
        }

    }, [token, user]);

    // Функція додавання нагадувань в кошик
    const handleAddRemindersToCart = () => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        reminders.forEach(p => {
            const existing = cart.find(item => item.id === p.id);
            if (existing) existing.quantity += 1;
            else cart.push({ id: p.id, quantity: 1 });
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        setIsRemindersVisible(false); // Ховаємо банер
        alert("Всі нагадування додано в кошик!");
    };

    // НОВА ФУНКЦІЯ КЛІКУ НА ЗАДАЧУ
    const handleTaskClick = async (task) => {
        setActiveTask(task);
        
        try {
            // Відправляємо клік на бекенд
            const res = await fetch(`http://localhost:3001/api/tasks/${task.id}/click`, { method: 'POST' });
            const data = await res.json();
            
            // Оновлюємо лічильник локально, щоб користувач одразу побачив +1
            setTaskCounters(prev => ({
                ...prev,
                [task.id]: data.count
            }));
        } catch (error) {
            console.error("Помилка кліку", error);
        }
    };

    const taskProducts = products.filter(product => product.tags.some(tag => activeTask.tags.includes(tag))).slice(0, 4);
    const popularProducts = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
    const newProducts = products.filter(p => p.isNewProduct).slice(0, 4);

    return (
        <>
            {/* НОВИЙ БАНЕР НАГАДУВАНЬ */}
            {reminders.length > 0 && isRemindersVisible && (
                <div style={{ backgroundColor: '#FFF8E6', borderBottom: '1px solid #D4A017', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🔔</span>
                        <span style={{ color: '#7A5C00', fontWeight: '500', fontSize: '14px' }}>
                            Час поповнити запас: <strong>{reminders.map(r => r.name).join(', ')}</strong>
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={handleAddRemindersToCart} style={{ backgroundColor: '#D4A017', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                            Додати в кошик
                        </button>
                        <button onClick={() => setIsRemindersVisible(false)} style={{ background: 'none', border: 'none', color: '#7A5C00', cursor: 'pointer', fontSize: '20px', padding: 0 }}>
                            ×
                        </button>
                    </div>
                </div>
            )}

            <section className="hero">
                <div className="hero-content">
                    {/* НОВЕ ПРИВІТАННЯ */}
                    {user ? (
                        <>
                            <div style={{ display: 'inline-block', backgroundColor: '#EAF3DE', color: 'var(--green)', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', marginBottom: '15px' }}>
                                З поверненням, {user.firstName}! 👋
                            </div>
                            <h1>Ось що ми підібрали для вас сьогодні</h1>
                        </>
                    ) : (
                        <h1>Все для дому та особистої гігієни</h1>
                    )}
                    
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
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
                        {dailyTasks.map(task => {
                            const isTop = task.id === topTaskKey;
                            const count = taskCounters[task.id] || 0;
                            
                            return (
                                <div key={task.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <button 
                                        onClick={() => handleTaskClick(task)}
                                        style={{
                                            position: 'relative', // Для позиціонування бейджа
                                            padding: '12px 24px',
                                            borderRadius: '50px',
                                            border: isTop ? '2px solid var(--green)' : '1px solid #ddd',
                                            backgroundColor: activeTask.id === task.id ? '#333' : '#fff',
                                            color: activeTask.id === task.id ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            fontWeight: isTop ? '600' : '500',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isTop && activeTask.id !== task.id ? '0 4px 15px rgba(59, 109, 17, 0.1)' : 'none'
                                        }}
                                    >
                                        {/* Бейдж "Топ сьогодні" */}
                                        {isTop && (
                                            <span style={{
                                                position: 'absolute', top: '-10px', right: '-10px',
                                                backgroundColor: 'var(--green-light)', color: 'var(--green-dark)',
                                                fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', border: '1px solid var(--green)'
                                            }}>
                                                Топ сьогодні
                                            </span>
                                        )}
                                        {task.label}
                                    </button>
                                    
                                    {/* Підпис із кількістю кліків */}
                                    <span style={{ fontSize: '12px', color: '#666', height: '15px' }}>
                                        {count > 0 ? `🔥 ${count} сьогодні` : ''}
                                    </span>
                                </div>
                            );
                        })}
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