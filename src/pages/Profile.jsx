// src/pages/Profile.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user, token, login } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('personal');
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState('');
    const [allProducts, setAllProducts] = useState([]); 
    const [selectedProductId, setSelectedProductId] = useState('');
    const [intervalDays, setIntervalDays] = useState(30);

    // Стани для форм (беремо з юзера, якщо даних ще нема - ставимо дефолтні)
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

    // Завантажуємо замовлення при відкритті таби "orders"
    useEffect(() => {
            if (token) {
                // Вантажимо замовлення
                if (activeTab === 'orders') {
                    fetch('http://localhost:3001/api/orders/my', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    .then(res => res.json())
                    .then(data => setOrders(data))
                    .catch(console.error);
                }
                
                // Вантажимо всі товари (потрібні для таби "Мій запас")
                if (activeTab === 'stock' && allProducts.length === 0) {
                    fetch('http://localhost:3001/api/products')
                    .then(res => res.json())
                    .then(data => setAllProducts(data))
                    .catch(console.error);
                }
            }
        }, [activeTab, token]);

    // Якщо не залогінений - кидаємо на сторінку входу
    if (!user) {
        return <Navigate to="/auth" />;
    }

    // Збереження особистих даних
    const handlePersonalSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(personalData)
            });
            const updatedUser = await res.json();
            login(token, updatedUser); // Оновлюємо глобальний стан
            setMessage('Особисті дані успішно збережено!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
        }
    };

    // Збереження даних про дім
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
            setMessage('Анкету "Мій дім" успішно збережено!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!selectedProductId) return;

        try {
            // Знаходимо реальний MongoDB _id для обраного товару
            const product = allProducts.find(p => p.id.toString() === selectedProductId);
            if (!product) return;

            const res = await fetch('http://localhost:3001/api/users/me/stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ productId: product._id, intervalDays })
            });
            const data = await res.json();
            
            // Оновлюємо глобальний стейт юзера (щоб список відмалювався одразу)
            login(token, { ...user, stock: data.stock });
            setMessage('Товар додано до запасу!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveStock = async (mongoId) => {
        try {
            const res = await fetch(`http://localhost:3001/api/users/me/stock/${mongoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            login(token, { ...user, stock: data.stock });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="profile-page" style={{ padding: '40px' }}>
            <h1>Особистий кабінет</h1>
            
            {/* Меню табів */}
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #ddd', marginBottom: '30px', paddingBottom: '10px' }}>
                <h3 onClick={() => setActiveTab('personal')} style={{ cursor: 'pointer', margin: 0, color: activeTab === 'personal' ? '#333' : '#999' }}>Особисті дані</h3>
                <h3 onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer', margin: 0, color: activeTab === 'orders' ? '#333' : '#999' }}>Мої замовлення</h3>
                <h3 onClick={() => setActiveTab('household')} style={{ cursor: 'pointer', margin: 0, color: activeTab === 'household' ? '#333' : '#999' }}>Мій дім</h3>
                <h3 onClick={() => setActiveTab('stock')} style={{ cursor: 'pointer', margin: 0, color: activeTab === 'stock' ? '#333' : '#999' }}>Мій запас</h3>
            </div>

            {message && <div style={{ backgroundColor: '#EAF3DE', color: '#3B6D11', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}

            {/* ТАБ 1: Особисті дані */}
            {activeTab === 'personal' && (
                <div className="profile-card" style={{ maxWidth: '500px' }}>
                    <form onSubmit={handlePersonalSubmit} className="checkout-form">
                        <div className="form-group">
                            <label>Email (не змінюється)</label>
                            <input type="email" value={user.email} disabled style={{ backgroundColor: '#f5f5f5' }} />
                        </div>
                        <div className="form-group">
                            <label>Ім'я</label>
                            <input type="text" value={personalData.firstName} onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Прізвище</label>
                            <input type="text" value={personalData.lastName} onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Телефон</label>
                            <input type="tel" value={personalData.phone} onChange={(e) => setPersonalData({...personalData, phone: e.target.value})} placeholder="+380..." />
                        </div>
                        <button type="submit" className="add-to-cart-button">Зберегти зміни</button>
                    </form>
                </div>
            )}

            {/* ТАБ 2: Замовлення */}
            {activeTab === 'orders' && (
                <div className="profile-card full-width">
                    {orders.length === 0 ? (
                        <p>У вас ще немає замовлень.</p>
                    ) : (
                        <table id="order-history-table">
                            <thead>
                                <tr>
                                    <th>Номер</th>
                                    <th>Дата</th>
                                    <th>Сума</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* МИ ДОДАЛИ ЦЕЙ БЛОК: перебираємо замовлення і малюємо рядки */}
                                {orders.map(order => {
                                    // Перекладач статусів
                                    const statusMap = {
                                        'pending': 'В обробці',
                                        'confirmed': 'Підтверджено',
                                        'delivered': 'Доставлено'
                                    };
                                    
                                    // Форматуємо дату
                                    const formattedDate = new Date(order.createdAt).toLocaleDateString('uk-UA', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    });

                                    return (
                                        <tr key={order._id}>
                                            <td style={{ fontWeight: '600' }}>{order.orderId}</td>
                                            <td>{formattedDate}</td>
                                            <td>{order.total} грн</td>
                                            <td>
                                                <span style={{
                                                    backgroundColor: order.status === 'pending' ? '#FFF8E6' : '#EAF3DE',
                                                    color: order.status === 'pending' ? '#D4A017' : '#3B6D11',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '13px',
                                                    fontWeight: '500'
                                                }}>
                                                    {statusMap[order.status] || order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ТАБ 3: Мій дім (ДЛЯ РЕКОМЕНДАЦІЙ) */}
            {activeTab === 'household' && (
                <div className="profile-card" style={{ maxWidth: '500px' }}>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Ці дані допоможуть нам підбирати найбезпечніші та найбільш ефективні засоби саме для вашого дому.</p>
                    <form onSubmit={handleHouseholdSubmit} className="checkout-form">
                        <div className="form-group">
                            <label>Кількість людей в сім'ї</label>
                            <input type="number" min="1" max="15" value={householdData.people} onChange={(e) => setHouseholdData({...householdData, people: Number(e.target.value)})} required />
                        </div>
                        
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                            <input type="checkbox" id="hasKids" checked={householdData.hasKids} onChange={(e) => setHouseholdData({...householdData, hasKids: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                            <label htmlFor="hasKids" style={{ margin: 0, cursor: 'pointer' }}>Є діти до 12 років (важлива екологічність)</label>
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <input type="checkbox" id="hasPets" checked={householdData.hasPets} onChange={(e) => setHouseholdData({...householdData, hasPets: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                            <label htmlFor="hasPets" style={{ margin: 0, cursor: 'pointer' }}>Є домашні тварини</label>
                        </div>

                        <div className="form-group">
                            <label>Тип житла</label>
                            <select value={householdData.housingType} onChange={(e) => setHouseholdData({...householdData, housingType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <option value="apartment">Квартира</option>
                                <option value="house">Приватний будинок</option>
                            </select>
                        </div>

                        <button type="submit" className="add-to-cart-button" style={{ marginTop: '20px' }}>Зберегти анкету</button>
                    </form>
                </div>
            )}

{/* ТАБ 4: Мій запас */}
            {activeTab === 'stock' && (
                <div className="profile-grid">
                    {/* Форма додавання */}
                    <div className="profile-card">
                        <h2>Додати в запас</h2>
                        <form onSubmit={handleAddStock} className="checkout-form">
                            <div className="form-group">
                                <label>Оберіть товар</label>
                                <select 
                                    value={selectedProductId} 
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    required
                                >
                                    <option value="">-- Виберіть товар --</option>
                                    {allProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.price} грн)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Як часто ви це купуєте?</label>
                                <select 
                                    value={intervalDays} 
                                    onChange={(e) => setIntervalDays(Number(e.target.value))}
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

                    {/* Список запасу */}
                    <div className="profile-card">
                        <h2>Мій поточний запас</h2>
                        {(!user.stock || user.stock.length === 0) ? (
                            <p style={{ color: '#666' }}>Ваш список порожній. Додайте товари, якими ви користуєтесь постійно.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {user.stock.map((item, idx) => {
                                    // Знаходимо назву по _id
                                    const prod = allProducts.find(p => p._id === item.productId);
                                    if (!prod) return null;

                                    // Рахуємо, коли наступна покупка
                                    const nextDate = new Date(item.lastBought);
                                    nextDate.setDate(nextDate.getDate() + item.intervalDays);
                                    const isSoon = nextDate.getTime() - new Date().getTime() < (3 * 24 * 60 * 60 * 1000); // Менше 3 днів

                                    return (
                                        <div key={idx} style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                            padding: '15px', border: `1px solid ${isSoon ? '#FCEBEB' : '#e8ede3'}`, 
                                            backgroundColor: isSoon ? '#FFF9F9' : '#fff', borderRadius: '12px' 
                                        }}>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontWeight: '600' }}>{prod.name}</p>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                                                    Наступна покупка: <strong style={{ color: isSoon ? '#A32D2D' : '#333' }}>
                                                        {nextDate.toLocaleDateString('uk-UA')}
                                                    </strong>
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveStock(item.productId)}
                                                style={{ background: 'none', border: 'none', color: '#A32D2D', cursor: 'pointer', fontSize: '20px' }}
                                                title="Видалити"
                                            >
                                                ×
                                            </button>
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