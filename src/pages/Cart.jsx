// src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/mockData';

const Cart = () => {
    // Стан для зберігання товарів кошика
    const [cart, setCart] = useState([]);

    // При завантаженні сторінки дістаємо кошик з localStorage
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
    }, []);

    // Функція для зміни кількості або видалення товару
    const updateQuantity = (productId, action) => {
        let updatedCart = [...cart];
        const productIndex = updatedCart.findIndex(item => item.id === productId);

        if (productIndex > -1) {
            if (action === 'increase') {
                updatedCart[productIndex].quantity += 1;
            } else if (action === 'decrease') {
                updatedCart[productIndex].quantity -= 1;
                // Якщо кількість стала 0, видаляємо товар з масиву
                if (updatedCart[productIndex].quantity === 0) {
                    updatedCart.splice(productIndex, 1);
                }
            }
        }

        // Оновлюємо стан (щоб екран перемалювався)
        setCart(updatedCart);
        // Зберігаємо в пам'ять браузера
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        // Даємо сигнал Хедеру оновити лічильник
        window.dispatchEvent(new Event('cartUpdated'));
    };

    // Об'єднуємо дані кошика (id, quantity) з даними товарів (name, price, image)
    const enrichedCart = cart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        return { ...cartItem, product };
    }).filter(item => item.product !== undefined); // Захист від помилок

    // Рахуємо загальну суму
    const totalSum = enrichedCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <div className="cart-page">
            <h1>Ваш кошик</h1>
            
            <div className="cart-items-container">
                {enrichedCart.length === 0 ? (
                    <p className="empty-cart-message">Ваш кошик порожній.</p>
                ) : (
                    enrichedCart.map(({ id, quantity, product }) => (
                        <div className="cart-item" key={id}>
                            <img src={`/${product.image}`} alt={product.name} />
                            <div className="cart-item-info">
                                <h3>{product.name}</h3>
                                <div className="quantity-controls">
                                    <span className="quantity-label">Кількість:</span>
                                    <button 
                                        className="quantity-btn" 
                                        onClick={() => updateQuantity(id, 'decrease')}
                                    >-</button>
                                    <span className="quantity-text">{quantity}</span>
                                    <button 
                                        className="quantity-btn" 
                                        onClick={() => updateQuantity(id, 'increase')}
                                    >+</button>
                                </div>
                            </div>
                            <div className="cart-item-price">{product.price * quantity} грн</div>
                        </div>
                    ))
                )}
            </div>

            {/* Показуємо суму і кнопку тільки якщо кошик не порожній */}
            {enrichedCart.length > 0 && (
                <div className="cart-summary">
                    <h2>Загальна сума: <span>{totalSum}</span> грн</h2>
                    <Link to="/checkout" className="checkout-button">Оформити замовлення</Link>
                </div>
            )}
        </div>
    );
};

export default Cart;