// src/pages/Catalog.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';

const categoryData = {
    cleaning: { name: "Засоби для прибирання", colorClass: "category-cleaning" },
    cosmetics: { name: "Косметика та парфумерія", colorClass: "category-cosmetics" },
    hygiene: { name: "Засоби особистої гігієни", colorClass: "category-hygiene" },
    household: { name: "Господарські товари", colorClass: "category-household" }
};

const Catalog = () => {
    const [searchParams] = useSearchParams();
    const categoryQuery = searchParams.get('category');

    const [products, setProducts] = useState([]);
    const [trendingIds, setTrendingIds] = useState([]); // СТАН ДЛЯ ТРЕНДІВ
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentCategoryInfo = categoryData[categoryQuery] || { name: "Каталог товарів", colorClass: "category-default" };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/products');
                if (!response.ok) throw new Error('Помилка при завантаженні товарів');
                const data = await response.json();
                setProducts(data);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        // Завантажуємо список ID товарів, які зараз в тренді
        const fetchTrending = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/products/trending');
                const data = await res.json();
                if (data.products) {
                    setTrendingIds(data.products.map(p => p.id));
                }
            } catch (error) {
                console.error("Помилка завантаження трендів", error);
            }
        };

        fetchProducts();
        fetchTrending(); // ВИКЛИКАЄМО ТУТ
    }, []); 

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
            
            {isLoading && <p>Завантаження товарів...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {!isLoading && !error && (
                <div className="product-grid">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                isTrending={trendingIds.includes(product.id)} // ПЕРЕДАЄМО ФЛАГ В КАРТКУ
                            />
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