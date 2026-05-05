// src/pages/Admin.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Admin = () => {
    // ДОДАЛИ isLoading
    const { user, token, isLoading } = useContext(AuthContext); 
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0 });
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

useEffect(() => {
        if (user && user.isAdmin) {
            fetch('http://localhost:3001/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.message) throw new Error(data.message);
                setStats(data);
            })
            .catch(console.error);

            fetch('http://localhost:3001/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    throw new Error(data.message || 'Не вдалося завантажити');
                }
            })
            .catch(err => setError(err.message));
        }
    }, [user, token]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Перевірка прав доступу...</div>; 
    if (!user) return <Navigate to="/auth" />; 
    if (user && !user.isAdmin) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}><h1>403</h1><p>Доступ заборонено. Тільки для адміністраторів.</p></div>;

    return (
        <div style={{ padding: '40px', backgroundColor: '#fdfdfd' }}>
            <h1 style={{ marginBottom: '30px' }}>Панель управління (Admin)</h1>

            {/* СТАТИСТИКА */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #e8ede3', padding: '25px', borderRadius: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Товарів у базі</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--green-dark)' }}>{stats.totalProducts}</div>
                </div>
                <div style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #e8ede3', padding: '25px', borderRadius: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Замовлень</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--green-dark)' }}>{stats.totalOrders}</div>
                </div>
                <div style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #e8ede3', padding: '25px', borderRadius: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Клієнтів</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--green-dark)' }}>{stats.totalUsers}</div>
                </div>
            </div>

            {/* ЗАМОВЛЕННЯ */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e8ede3', borderRadius: '15px', padding: '30px' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Всі замовлення ({orders.length})</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '15px 10px', color: '#888', fontWeight: '500' }}>№</th>
                            <th style={{ padding: '15px 10px', color: '#888', fontWeight: '500' }}>Дата</th>
                            <th style={{ padding: '15px 10px', color: '#888', fontWeight: '500' }}>Клієнт</th>
                            {/* Сума і Статус притиснуті вправо */}
                            <th style={{ padding: '15px 10px', color: '#888', fontWeight: '500', textAlign: 'right' }}>Сума</th>
                            <th style={{ padding: '15px 0', color: '#888', fontWeight: '500', textAlign: 'right' }}>Управління статусом</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px 10px', fontWeight: '600' }}>{order.orderId}</td>
                                <td style={{ padding: '15px 10px' }}>{new Date(order.createdAt).toLocaleDateString('uk-UA')}</td>
                                <td style={{ padding: '15px 10px' }}>
                                    {order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : order.contacts?.firstName || 'Гість'}
                                </td>
                                <td style={{ padding: '15px 10px', fontWeight: 'bold', textAlign: 'right' }}>{order.total} ₴</td>
                                <td style={{ padding: '15px 0', textAlign: 'right' }}>
                                    <select 
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        style={{ 
                                            padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', 
                                            backgroundColor: order.status === 'pending' ? '#FFF8E6' : (order.status === 'delivered' ? '#EAF3DE' : '#E6F1FB'),
                                            color: order.status === 'pending' ? '#D4A017' : (order.status === 'delivered' ? '#3B6D11' : '#185FA5'),
                                            fontWeight: '600', cursor: 'pointer', outline: 'none',
                                            width: '200px' /* Фіксована ширина для краси */
                                        }}
                                    >
                                        <option value="pending">В обробці (Pending)</option>
                                        <option value="confirmed">Підтверджено (Confirmed)</option>
                                        <option value="delivered">Доставлено (Delivered)</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;