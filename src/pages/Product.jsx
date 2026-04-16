// src/pages/Product.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data/mockData';

const categoryNames = {
    cosmetics: "Косметика та парфумерія",
    cleaning: "Засоби для прибирання",
    hygiene: "Засоби особистої гігієни",
    household: "Господарські товари"
};

const Product = () => {
    // Дістаємо ID з URL (наприклад /product/3 -> id = "3")
    const { id } = useParams();
    
    // Шукаємо товар у базі
    const product = products.find(p => p.id === parseInt(id));
    
    // Стан для показу сповіщення
    const [toastMessage, setToastMessage] = useState('');

    // Якщо хтось ввів неправильний ID в URL
    if (!product) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Товар не знайдено</h1>
                <Link to="/catalog">Повернутися до каталогу</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        // Читаємо поточний кошик
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === product.id);

        // Якщо товар вже є - збільшуємо кількість, якщо ні - додаємо новий
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({ id: product.id, quantity: 1 });
        }

        // Зберігаємо назад
        localStorage.setItem('cart', JSON.stringify(cart));

        // Відправляємо сигнал, щоб Header оновив цифру
        window.dispatchEvent(new Event('cartUpdated'));

        // Показуємо сповіщення
        setToastMessage(`${product.name} додано в кошик!`);
        setTimeout(() => setToastMessage(''), 3000); // Ховаємо через 3 секунди
    };

    return (
        <div style={{ padding: '40px' }}>
            <nav className="breadcrumbs breadcrumbs-product" style={{ paddingTop: 0 }}>
                <Link to="/">Головна</Link>
                <span className="breadcrumb-separator">/</span>
                <Link to={`/catalog?category=${product.category}`}>
                    {categoryNames[product.category]}
                </Link>
                <span className="breadcrumb-separator">/</span>
                <span>{product.name}</span>
            </nav>

            <div className="product-page" style={{ padding: '20px 0' }}>
                <div className="product-image-container">
                    {/* Додаємо слеш, щоб картинка вантажилась від кореня сайту */}
                    <img src={`/${product.image}`} alt={product.name} />
                </div>
                <div className="product-info">
                    <h1>{product.name}</h1>
                    <p>{product.description}</p>
                    <div className="price">{product.price} грн</div>
                    <button className="add-to-cart-button" onClick={handleAddToCart}>
                        Додати в кошик
                    </button>
                </div>
            </div>

            {/* Контейнер для сповіщення (Toast) */}
            <div id="toast-container">
                <div className={`toast ${toastMessage ? 'show' : ''}`}>
                    {toastMessage}
                </div>
            </div>
        </div>
    );
};

export default Product;