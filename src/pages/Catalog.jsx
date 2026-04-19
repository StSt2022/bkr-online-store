// src/pages/Catalog.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
// ВИДАЛИЛИ: import { products } from '../data/mockData';

const categoryData = {
    cleaning: { name: "Засоби для прибирання", colorClass: "category-cleaning" },
    cosmetics: { name: "Косметика та парфумерія", colorClass: "category-cosmetics" },
    hygiene: { name: "Засоби особистої гігієни", colorClass: "category-hygiene" },
    household: { name: "Господарські товари", colorClass: "category-household" }
};

const Catalog = () => {
    const [searchParams] = useSearchParams();
    const categoryQuery = searchParams.get('category');

    // Нові стани для роботи з бекендом
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentCategoryInfo = categoryData[categoryQuery] || { name: "Каталог товарів", colorClass: "category-default" };

    // Звертаємося до бекенду при завантаженні сторінки
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Робимо запит на наш бекенд
                const response = await fetch('http://localhost:3001/api/products');
                if (!response.ok) throw new Error('Помилка при завантаженні товарів');
                
                const data = await response.json();
                setProducts(data); // Зберігаємо отримані товари
                setIsLoading(false); // Вимикаємо лоадер
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []); // Порожній масив означає, що запит відбудеться 1 раз при відкритті сторінки

    // Фільтруємо вже ОТРИМАНІ з бекенду товари
    const filteredProducts = categoryQuery
        ? products.filter(p => p.category === categoryQuery)
        : products;

    return (
        <div className={`catalog-main ${currentCategoryInfo.colorClass}`}>
            <nav className="breadcrumbs-catalog">
                <Link to="/">Головна</Link>
                <span className="breadcrumb-separator">/</span>
                <span>{currentCategoryInfo.name}</span>
            </nav>
            
            <h1>{currentCategoryInfo.name}</h1>
            
            {/* Показуємо лоадер або помилку, якщо щось пішло не так */}
            {isLoading && <p>Завантаження товарів...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {/* Показуємо товари тільки коли вони завантажились і немає помилок */}
            {!isLoading && !error && (
                <div className="product-grid">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p>На жаль, у цій категорії товарів ще немає.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Catalog;