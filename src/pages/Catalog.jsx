// src/pages/Catalog.jsx
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { products } from '../data/mockData';
import ProductCard from '../components/ProductCard/ProductCard';

// Об'єкт з даними категорій (перенесли з твого старого JS)
const categoryData = {
    cleaning: { name: "Засоби для прибирання", colorClass: "category-cleaning" },
    cosmetics: { name: "Косметика та парфумерія", colorClass: "category-cosmetics" },
    hygiene: { name: "Засоби особистої гігієни", colorClass: "category-hygiene" },
    household: { name: "Господарські товари", colorClass: "category-household" }
};

const Catalog = () => {
    // Читаємо параметр category з URL
    const [searchParams] = useSearchParams();
    const categoryQuery = searchParams.get('category');

    // Визначаємо поточну категорію (або дефолтну, якщо це загальний каталог)
    const currentCategoryInfo = categoryData[categoryQuery] || { name: "Каталог товарів", colorClass: "category-default" };

    // Фільтруємо товари
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
            
            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    // Магія React: перебираємо масив і для кожного товару малюємо картку
                    filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p>На жаль, у цій категорії товарів ще немає.</p>
                )}
            </div>
        </div>
    );
};

export default Catalog;