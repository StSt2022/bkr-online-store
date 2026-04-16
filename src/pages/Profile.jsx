// src/pages/Profile.jsx
import React from 'react';
import { loggedInUser } from '../data/mockData';

const Profile = () => {
    // Якщо користувач раптом не знайдений (для безпеки)
    if (!loggedInUser) {
        return <div style={{ padding: '40px' }}>Будь ласка, увійдіть в систему.</div>;
    }

    return (
        <div className="profile-page" style={{ padding: '40px' }}>
            <h1>Особистий кабінет</h1>
            
            <div className="profile-grid">
                {/* Картка особистих даних */}
                <div className="profile-card">
                    <h2>Особисті дані</h2>
                    <div className="profile-data-grid">
                        <span className="data-label">Ім'я:</span>
                        <span className="data-value">{loggedInUser.firstName}</span>

                        <span className="data-label">Прізвище:</span>
                        <span className="data-value">{loggedInUser.lastName}</span>

                        <span className="data-label">Email:</span>
                        <span className="data-value">{loggedInUser.email}</span>

                        <span className="data-label">Телефон:</span>
                        <span className="data-value">{loggedInUser.phone}</span>
                    </div>
                    <button className="edit-btn">Редагувати</button>
                </div>

                {/* Картка адрес */}
                <div className="profile-card">
                    <h2>Адреси доставки</h2>
                    <div>
                        {loggedInUser.addresses.map((addr, index) => (
                            <div className="address-item" key={index}>
                                <p>{addr.city}, {addr.street}, {addr.postalCode}</p>
                            </div>
                        ))}
                    </div>
                    <button className="add-btn">Додати нову адресу</button>
                </div>

                {/* Таблиця замовлень на всю ширину */}
                <div className="profile-card full-width">
                    <h2>Мої замовлення</h2>
                    <table id="order-history-table">
                        <thead>
                            <tr>
                                <th>Номер замовлення</th>
                                <th>Дата</th>
                                <th>Сума</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loggedInUser.orderHistory.map((order, index) => (
                                <tr key={index}>
                                    <td>{order.orderId}</td>
                                    <td>{order.date}</td>
                                    <td>{order.total} грн</td>
                                    <td>{order.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Profile;