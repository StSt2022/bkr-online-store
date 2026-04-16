// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { products, loggedInUser } from '../data/mockData';

const Checkout = () => {
    const navigate = useNavigate();
    
    // Стан для обраного способу доставки (за замовчуванням Нова Пошта)
    const [deliveryMethod, setDeliveryMethod] = useState('nova-poshta');
    const [cart, setCart] = useState([]);

    // Завантажуємо кошик при відкритті сторінки
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
        
        // Якщо кошик порожній, немає сенсу тут бути - кидаємо на головну
        if (savedCart.length === 0) {
            navigate('/');
        }
    }, [navigate]);

    // Рахуємо суму і збираємо дані товарів
    const enrichedCart = cart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        return { ...cartItem, product };
    }).filter(item => item.product !== undefined);

    const totalSum = enrichedCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Функція, яка спрацює при успішному заповненні форми
    const handleSubmit = (e) => {
        e.preventDefault(); // Зупиняємо стандартну поведінку браузера
        
        // Тут в майбутньому ми будемо відправляти дані на бекенд (в папку server)
        // А поки що просто переходимо на сторінку "Дякуємо"
        navigate('/thank-you');
    };

    return (
        <div className="checkout-page" style={{ padding: '40px' }}>
            <h1>Оформлення замовлення</h1>
            
            {/* Обертаємо все у форму */}
            <form className="checkout-grid" onSubmit={handleSubmit}>
                <div className="checkout-form">
                    <section>
                        <h2>1. Контактні дані</h2>
                        <div className="form-group">
                            <label htmlFor="firstName">Ім'я</label>
                            <input type="text" id="firstName" defaultValue={loggedInUser.firstName} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Прізвище</label>
                            <input type="text" id="lastName" defaultValue={loggedInUser.lastName} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Телефон</label>
                            <input type="tel" id="phone" defaultValue={loggedInUser.phone} required />
                        </div>
                    </section>

                    <section>
                        <h2>2. Доставка</h2>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="delivery" 
                                    value="nova-poshta" 
                                    checked={deliveryMethod === 'nova-poshta'}
                                    onChange={(e) => setDeliveryMethod(e.target.value)}
                                />
                                <span className="radio-custom"></span> Нова Пошта
                            </label>
                            {/* Умовний рендер: показуємо поля, ТІЛЬКИ якщо обрана Нова Пошта */}
                            {deliveryMethod === 'nova-poshta' && (
                                <div className="delivery-fields">
                                    <div className="form-group">
                                        <label htmlFor="city">Місто</label>
                                        <input type="text" id="city" placeholder="Наприклад, Київ" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="post-office">Номер відділення або поштомату</label>
                                        <input type="text" id="post-office" placeholder="Наприклад, 142" required />
                                    </div>
                                </div>
                            )}

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="delivery" 
                                    value="ukrposhta"
                                    checked={deliveryMethod === 'ukrposhta'}
                                    onChange={(e) => setDeliveryMethod(e.target.value)}
                                />
                                <span className="radio-custom"></span> Укр Пошта
                            </label>
                            {deliveryMethod === 'ukrposhta' && (
                                <div className="delivery-fields">
                                    <div className="form-group">
                                        <label htmlFor="city-ukr">Місто</label>
                                        <input type="text" id="city-ukr" placeholder="Наприклад, Львів" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="post-office-ukr">Індекс відділення</label>
                                        <input type="text" id="post-office-ukr" placeholder="Наприклад, 79008" required />
                                    </div>
                                </div>
                            )}

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="delivery" 
                                    value="courier"
                                    checked={deliveryMethod === 'courier'}
                                    onChange={(e) => setDeliveryMethod(e.target.value)}
                                />
                                <span className="radio-custom"></span> Кур'єром по місту
                            </label>
                            {deliveryMethod === 'courier' && (
                                <div className="delivery-fields">
                                    <div className="form-group">
                                        <label htmlFor="address">Ваша адреса</label>
                                        <input type="text" id="address" placeholder="вул. Хрещатик, 1, кв. 5" required />
                                    </div>
                                </div>
                            )}

                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="delivery" 
                                    value="self-delivery"
                                    checked={deliveryMethod === 'self-delivery'}
                                    onChange={(e) => setDeliveryMethod(e.target.value)}
                                />
                                <span className="radio-custom"></span> Самовивіз
                            </label>
                        </div>
                    </section>

                    <section>
                        <h2>3. Оплата</h2>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input type="radio" name="payment" value="card-online" defaultChecked required />
                                <span className="radio-custom"></span> Оплата карткою онлайн
                            </label>
                            <label className="radio-label">
                                <input type="radio" name="payment" value="cash-on-delivery" required />
                                <span className="radio-custom"></span> Оплата при отриманні
                            </label>
                        </div>
                    </section>
                </div>

                <div className="order-summary">
                    <h2>Ваше замовлення</h2>
                    <div id="summary-items-container">
                        {enrichedCart.map(({ id, quantity, product }) => (
                            <div className="summary-item" key={id}>
                                <span className="summary-item-name">{product.name} (x{quantity})</span>
                                <span className="summary-item-price">{product.price * quantity} грн</span>
                            </div>
                        ))}
                    </div>
                    <div className="summary-total">
                        <strong>Всього:</strong>
                        <strong>{totalSum} грн</strong>
                    </div>
                    {/* Тепер це кнопка типу submit */}
                    <button type="submit" className="confirm-order-btn" style={{width: '100%'}}>
                        Підтвердити замовлення
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Checkout;