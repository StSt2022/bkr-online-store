// src/pages/Profile.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getViewedIds } from '../utils/recommendations'; // Для історії переглядів
import ProductCard from '../components/ProductCard/ProductCard';

const Profile = () => {
    const { user, token, login } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('personal');
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState('');
    
    // Нові стани
    const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, reviewsCount: 0, favoriteCategory: '-' });
    const [expandedOrder, setExpandedOrder] = useState(null); // Яке замовлення зараз розгорнуте
    const [viewedProducts, setViewedProducts] = useState([]); // Історія переглядів

    const [allProducts, setAllProducts] = useState([]); 
    const [selectedProductId, setSelectedProductId] = useState('');
    const [intervalDays, setIntervalDays] = useState(30);

    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!selectedProductId) return;
        try {
            const product = allProducts.find(p => p.id.toString() === selectedProductId);
            if (!product) return;
            const res = await fetch('http://localhost:3001/api/users/me/stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ productId: product._id, intervalDays })
            });
            const data = await res.json();
            login(token, { ...user, stock: data.stock });
            setMessage('Товар додано до запасу!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) { console.error(error); }
    };

    const handleRemoveStock = async (mongoId) => {
        try {
            const res = await fetch(`http://localhost:3001/api/users/me/stock/${mongoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            login(token, { ...user, stock: data.stock });
        } catch (error) { console.error(error); }
    };

    const [personalData, setPersonalData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || ''
    });

    const [householdData, setHouseholdData] = useState({
        people: user?.household?.people || 1,
        hasKids: user?.household?.hasKids || false,
        hasPets: user?.household?.hasPets || false,
        housingType: user?.household?.housingType || 'apartment'
    });

    // Стан для кнопки "Купити знову" (замість alert)
    const [addedOrderId, setAddedOrderId] = useState(null);

    useEffect(() => {
        if (token) {
            // Вантажимо статистику
            fetch('http://localhost:3001/api/users/me/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error);

            // Вантажимо замовлення
            if (activeTab === 'orders') {
                fetch('http://localhost:3001/api/orders/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(console.error);
            }
            
            // Вантажимо історію переглядів
            if (activeTab === 'viewed') {
                const ids = getViewedIds();
                if (ids.length > 0) {
                    fetch(`http://localhost:3001/api/products?ids=${ids.join(',')}`)
                    .then(res => res.json())
                    .then(data => setViewedProducts(data))
                    .catch(console.error);
                } else {
                    setViewedProducts([]);
                }
            }

            if (activeTab === 'stock' && allProducts.length === 0) {
                fetch('http://localhost:3001/api/products')
                .then(res => res.json())
                .then(data => setAllProducts(data))
                .catch(console.error);
            }
        }
    }, [activeTab, token]);

    if (!user) return <Navigate to="/auth" />;

    const handlePersonalSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(personalData)
            });
            const updatedUser = await res.json();
            login(token, updatedUser); 
            setMessage('Особисті дані збережено!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) { console.error(error); }
    };

    const handleHouseholdSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/users/me/household', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(householdData)
            });
            const updatedUser = await res.json();
            login(token, updatedUser);
            setMessage('Анкету "Мій дім" збережено!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) { console.error(error); }
    };

    // "Купити знову"
    const handleReorder = (orderItems, orderId) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        // В замовленнях ми зберігаємо Монго _id в полі productId.
        // Оскільки кошик у нас працює зі звичайними id, нам доводиться робити цей хак.
        // В ідеалі треба все перевести на _id. Поки просто додаємо як є.
        orderItems.forEach(item => {
            const existing = cart.find(c => c.id === item.productId); // Може не співпасти, якщо кошик чекає 1,2,3
            if (existing) existing.quantity += 1;
            else cart.push({ id: item.productId, quantity: item.quantity }); 
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        
        setAddedOrderId(orderId);
        setTimeout(() => setAddedOrderId(null), 2000);
    };

    const handleClearHistory = () => {
        localStorage.removeItem('viewedProducts');
        setViewedProducts([]);
    };

    return (
        <div className="profile-page" style={{ padding: '40px' }}>
            <h1>Особистий кабінет</h1>
            
            {/* СТАТИСТИКА ЮЗЕРА */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <div style={{ flex: 1, backgroundColor: 'var(--green-light)', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green-dark)' }}>{stats.totalOrders}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Замовлень</div>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--green-light)', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green-dark)' }}>{stats.totalSpent} ₴</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Витрачено</div>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--green-light)', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green-dark)' }}>{stats.reviewsCount}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Відгуків</div>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--green-light)', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--green-dark)', lineHeight: '1.2' }}>{stats.favoriteCategory}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Улюблена категорія</div>
                </div>
            </div>

            {/* Меню табів */}
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #ddd', marginBottom: '30px', paddingBottom: '10px' }}>
                <h3 onClick={() => setActiveTab('personal')} style={{ cursor: 'pointer', margin: 0, color: activeTab === 'personal' ? '#333' : '#999' }}>Особисті дані</h3>
                <h3 onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer', margin: 0, color: activeTab === 'orders' ? '#333' : '#999' }}>Мої замовлення</h3>
                <h3 onClick={() => setActiveTab('household')} style={{ cursor: 'pointer', margin: 0, color: activeTab === 'household' ? '#333' : '#999' }}>Мій дім</h3>
                <h3 onClick={() => setActiveTab('viewed')} style={{ cursor: 'pointer', margin: 0, color: activeTab === 'viewed' ? '#333' : '#999' }}>Переглянуті</h3>
                <h3 onClick={() => setActiveTab('stock')} style={{ cursor: 'pointer', margin: 0, color: activeTab === 'stock' ? '#333' : '#999' }}>Мій запас</h3>
            </div>

            {message && <div style={{ backgroundColor: '#EAF3DE', color: '#3B6D11', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}

            {activeTab === 'personal' && (
                <div className="profile-card" style={{ maxWidth: '500px' }}>
                    <form onSubmit={handlePersonalSubmit} className="checkout-form">
                        <div className="form-group"><label>Email</label><input type="email" value={user.email} disabled style={{ backgroundColor: '#f5f5f5' }} /></div>
                        <div className="form-group"><label>Ім'я</label><input type="text" value={personalData.firstName} onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})} required /></div>
                        <div className="form-group"><label>Прізвище</label><input type="text" value={personalData.lastName} onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})} required /></div>
                        <div className="form-group"><label>Телефон</label><input type="tel" value={personalData.phone} onChange={(e) => setPersonalData({...personalData, phone: e.target.value})} /></div>
                        <button type="submit" className="add-to-cart-button">Зберегти зміни</button>
                    </form>
                </div>
            )}

            {activeTab === 'household' && (
                <div className="profile-card" style={{ maxWidth: '500px' }}>
                    <form onSubmit={handleHouseholdSubmit} className="checkout-form">
                        <div className="form-group"><label>Людей в сім'ї</label><input type="number" min="1" max="15" value={householdData.people} onChange={(e) => setHouseholdData({...householdData, people: Number(e.target.value)})} required /></div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                            <input type="checkbox" id="hasKids" checked={householdData.hasKids} onChange={(e) => setHouseholdData({...householdData, hasKids: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                            <label htmlFor="hasKids" style={{ margin: 0, cursor: 'pointer' }}>Є діти до 12 років</label>
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <input type="checkbox" id="hasPets" checked={householdData.hasPets} onChange={(e) => setHouseholdData({...householdData, hasPets: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                            <label htmlFor="hasPets" style={{ margin: 0, cursor: 'pointer' }}>Є домашні тварини</label>
                        </div>
                        <div className="form-group"><label>Тип житла</label>
                            <select value={householdData.housingType} onChange={(e) => setHouseholdData({...householdData, housingType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <option value="apartment">Квартира</option><option value="house">Приватний будинок</option>
                            </select>
                        </div>
                        <button type="submit" className="add-to-cart-button" style={{ marginTop: '20px' }}>Зберегти анкету</button>
                    </form>
                </div>
            )}

            {/* РОЗШИРЕНІ ЗАМОВЛЕННЯ */}
            {activeTab === 'orders' && (
                <div className="profile-card full-width">
                    {orders.length === 0 ? <p>У вас ще немає замовлень.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {orders.map(order => {
                                const isExpanded = expandedOrder === order._id;
                                return (
                                    <div key={order._id} style={{ border: '1px solid #e8ede3', borderRadius: '12px', overflow: 'hidden' }}>
                                        {/* Шапка замовлення (клікабельна) */}
                                        <div 
                                            onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                            style={{ backgroundColor: isExpanded ? '#fcfdfb' : '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: isExpanded ? '1px solid #e8ede3' : 'none' }}
                                        >
                                            <div style={{ display: 'flex', gap: '30px' }}>
                                                <div><div style={{ fontSize: '12px', color: '#888' }}>Номер</div><div style={{ fontWeight: 'bold' }}>{order.orderId}</div></div>
                                                <div><div style={{ fontSize: '12px', color: '#888' }}>Дата</div><div>{new Date(order.createdAt).toLocaleDateString('uk-UA')}</div></div>
                                                <div><div style={{ fontSize: '12px', color: '#888' }}>Сума</div><div style={{ fontWeight: 'bold' }}>{order.total} ₴</div></div>
                                            </div>
                                            <div>
                                                <span style={{ backgroundColor: '#EAF3DE', color: '#3B6D11', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', marginRight: '15px' }}>Доставлено</span>
                                                <span>{isExpanded ? '▲' : '▼'}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Вміст замовлення */}
                                        {isExpanded && (
                                            <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                                                <h4 style={{ margin: '0 0 15px 0' }}>Товари в замовленні:</h4>
                                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
                                                    {order.items.map((item, idx) => (
                                                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #eee', marginBottom: '10px' }}>
                                                            <span>{item.name} <span style={{ color: '#888' }}>x{item.quantity}</span></span>
                                                            <span style={{ fontWeight: '500' }}>{item.price * item.quantity} ₴</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleReorder(order.items, order._id); }}
                                                    style={{ backgroundColor: addedOrderId === order._id ? 'var(--green-light)' : 'var(--green)', color: addedOrderId === order._id ? 'var(--green-dark)' : '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                                                >
                                                    {addedOrderId === order._id ? '✅ Додано в кошик' : 'Купити ці товари знову'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* НОВИЙ ТАБ: ПЕРЕГЛЯНУТІ */}
            {activeTab === 'viewed' && (
                <div className="profile-card full-width">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0 }}>Історія переглядів</h2>
                        {viewedProducts.length > 0 && (
                            <button onClick={handleClearHistory} style={{ background: 'none', border: '1px solid #ddd', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer' }}>Очистити історію</button>
                        )}
                    </div>
                    
                    {viewedProducts.length === 0 ? (
                        <p style={{ color: '#888' }}>Ви ще не переглядали жодного товару.</p>
                    ) : (
                        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            {viewedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'stock' && (
                <div className="profile-grid">
                    <div className="profile-card">
                        <h2>Додати в запас</h2>
                        <form onSubmit={handleAddStock} className="checkout-form">
                            <div className="form-group">
                                <label>Оберіть товар</label>
                                <select 
                                    value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} required
                                >
                                    <option value="">-- Виберіть товар --</option>
                                    {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} грн)</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Як часто ви це купуєте?</label>
                                <select 
                                    value={intervalDays} onChange={(e) => setIntervalDays(Number(e.target.value))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    <option value={14}>Кожні 2 тижні (14 днів)</option>
                                    <option value={30}>Щомісяця (30 днів)</option>
                                    <option value={60}>Раз на 2 місяці (60 днів)</option>
                                </select>
                            </div>
                            <button type="submit" className="add-to-cart-button" style={{ marginTop: '10px' }}>Додати нагадування</button>
                        </form>
                    </div>

                    <div className="profile-card">
                        <h2>Мій поточний запас</h2>
                        {(!user.stock || user.stock.length === 0) ? (
                            <p style={{ color: '#666' }}>Ваш список порожній. Додайте товари, якими ви користуєтесь постійно.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {user.stock.map((item, idx) => {
                                    const prod = allProducts.find(p => p._id === item.productId);
                                    if (!prod) return null;
                                    const nextDate = new Date(item.lastBought);
                                    nextDate.setDate(nextDate.getDate() + item.intervalDays);
                                    const isSoon = nextDate.getTime() - new Date().getTime() < (3 * 24 * 60 * 60 * 1000);

                                    return (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: `1px solid ${isSoon ? '#FCEBEB' : '#e8ede3'}`, backgroundColor: isSoon ? '#FFF9F9' : '#fff', borderRadius: '12px' }}>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontWeight: '600' }}>{prod.name}</p>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                                                    Наступна покупка: <strong style={{ color: isSoon ? '#A32D2D' : '#333' }}>{nextDate.toLocaleDateString('uk-UA')}</strong>
                                                </p>
                                            </div>
                                            <button onClick={() => handleRemoveStock(item.productId)} style={{ background: 'none', border: 'none', color: '#A32D2D', cursor: 'pointer', fontSize: '20px' }}>×</button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;