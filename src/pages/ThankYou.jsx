// src/pages/ThankYou.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
    const [orderNumber, setOrderNumber] = useState('');

    useEffect(() => {
            // Читаємо реальний номер з бекенду
            const savedOrderId = sessionStorage.getItem('lastOrderId');
            
            if (savedOrderId) {
                setOrderNumber(savedOrderId);
                sessionStorage.removeItem('lastOrderId'); // Очищаємо за собою
            } else {
                // Фолбек, якщо щось пішло не так
                setOrderNumber(`#SYV-${Math.floor(10000 + Math.random() * 90000)}`);
            }

            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('cartUpdated'));
        }, []);

    return (
        <div className="thank-you-body">
            <div className="thank-you-container">
                <img src="/images/checked.png" alt="Успішно" className="thank-you-icon" />
                <h1 className="thank-you-title">Дякуємо!</h1>
                <p className="thank-you-text">
                    Ваше замовлення <strong style={{ color: '#333' }}>{orderNumber}</strong> успішно оформлено. 
                    Ми зв'яжемося з вами найближчим часом для підтвердження деталей.
                </p>
                <Link to="/" className="back-to-home-btn">Повернутися на головну</Link>
            </div>
        </div>
    );
};

export default ThankYou;