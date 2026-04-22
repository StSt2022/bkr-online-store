// src/components/ProductCard/ProductCard.jsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    // Генеруємо фейковий рейтинг один раз для кожної картки
    const rating = useMemo(() => (Math.random() * (5.0 - 3.8) + 3.8).toFixed(1), []);
    const reviews = useMemo(() => Math.floor(Math.random() * (400 - 20 + 1)) + 20, []);

    return (
        <Link to={`/product/${product.id}`} className="product-card-link">
            <div className="catalog-card"> 
                <img src={`/${product.image}`} alt={product.name} className="catalog-card-image" />
                <div className="catalog-card-info">
                    <h3 className="catalog-card-title">{product.name}</h3>
                    
                    {/* НОВИЙ БЛОК РЕЙТИНГУ */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '10px', fontSize: '13px', color: '#666' }}>
                        <span style={{ color: '#FFB800', fontSize: '15px' }}>★</span>
                        <span style={{ fontWeight: '600', color: '#333' }}>{rating}</span>
                        <span>({reviews} відгуків)</span>
                    </div>

                    <div className="catalog-card-price">{product.price} грн</div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;