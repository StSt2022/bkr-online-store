// src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [dbProducts, setDbProducts] = useState([]); // Всі товари з БД
    const [crossSell, setCrossSell] = useState([]);   // Рекомендації для кошика
    const [isLoading, setIsLoading] = useState(true);

    // 1. При завантаженні дістаємо кошик і ВАНТАЖИМО ТОВАРИ З БЕКЕНДУ
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);

        fetch('http://localhost:3001/api/products')
            .then(res => res.json())
            .then(data => {
                setDbProducts(data);
                setIsLoading(false);
            })
            .catch(console.error);
    }, []);

    // 2. Об'єднуємо дані (як і раніше)
    const enrichedCart = cart.map(cartItem => {
        const product = dbProducts.find(p => p.id === cartItem.id);
        return { ...cartItem, product };
    }).filter(item => item.product !== undefined);

    const totalSum = enrichedCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // 3. НОВА ЛОГІКА: Розумні рекомендації для кошика (Cross-sell)
    useEffect(() => {
        if (enrichedCart.length === 0) {
            setCrossSell([]);
            return;
        }

        // Збираємо всі теги з товарів у кошику
        const allTags = enrichedCart.flatMap(item => item.product.tags);
        const uniqueTags = [...new Set(allTags)]; // Унікальні теги
        
        // Збираємо ID товарів, які вже є в кошику (щоб не рекомендувати їх знову)
        const excludeIds = enrichedCart.map(item => item.product.id);

        // Робимо запит до нашого оновленого бекенду
        fetch(`http://localhost:3001/api/products/recommendations?tags=${uniqueTags.join(',')}&exclude=${excludeIds.join(',')}&limit=4`)
            .then(res => res.json())
            .then(data => setCrossSell(data))
            .catch(console.error);

    }, [cart, dbProducts]); // Запускати щоразу, коли змінюється кошик

    const updateQuantity = (productId, action) => {
        let updatedCart = [...cart];
        const productIndex = updatedCart.findIndex(item => item.id === productId);

        if (productIndex > -1) {
            if (action === 'increase') updatedCart[productIndex].quantity += 1;
            else if (action === 'decrease') {
                updatedCart[productIndex].quantity -= 1;
                if (updatedCart[productIndex].quantity === 0) updatedCart.splice(productIndex, 1);
            }
        }
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Завантаження кошика...</div>;

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
                                    <button className="quantity-btn" onClick={() => updateQuantity(id, 'decrease')}>-</button>
                                    <span className="quantity-text">{quantity}</span>
                                    <button className="quantity-btn" onClick={() => updateQuantity(id, 'increase')}>+</button>
                                </div>
                            </div>
                            <div className="cart-item-price">{product.price * quantity} грн</div>
                        </div>
                    ))
                )}
            </div>

            {enrichedCart.length > 0 && (
                <div className="cart-summary">
                    <h2>Загальна сума: <span>{totalSum}</span> грн</h2>
                    <Link to="/checkout" className="checkout-button">Оформити замовлення</Link>
                </div>
            )}

            {/* БЛОК РОЗУМНОГО КОШИКА */}
            {crossSell.length > 0 && (
                <div style={{ marginTop: '50px', borderTop: '1px solid #e0e0e0', paddingTop: '40px' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>До цього зазвичай беруть</h2>
                    <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {crossSell.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;