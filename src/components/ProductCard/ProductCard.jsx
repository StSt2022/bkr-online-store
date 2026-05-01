// src/components/ProductCard/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, isTrending }) => {
    // Беремо реальні дані або ставимо 0, якщо їх ще нема
    const rating = product.avgRating || 0;
    const reviews = product.reviewCount || 0;

    return (
        <Link to={`/product/${product.id}`} className="product-card-link">
            <div className="catalog-card"> 
                {/* Обгортка для картинки і бейджа */}
                <div style={{ position: 'relative' }}>
                    <img src={`/${product.image}`} alt={product.name} className="catalog-card-image" />
                    
                    {/* БЕЙДЖ ТРЕНДУ */}
                    {isTrending && (
                        <span style={{
                            position: 'absolute', top: '10px', left: '10px',
                            backgroundColor: 'var(--green)', color: '#fff',
                            fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold'
                        }}>
                            🔥 Популярне
                        </span>
                    )}
                </div>

                <div className="catalog-card-info">
                    <h3 className="catalog-card-title">{product.name}</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '10px', fontSize: '13px', color: '#666' }}>
                        <span style={{ color: rating > 0 ? '#FFB800' : '#ddd', fontSize: '15px' }}>★</span>
                        {rating > 0 ? (
                            <>
                                <span style={{ fontWeight: '600', color: '#333' }}>{rating}</span>
                                <span>({reviews} відгуків)</span>
                            </>
                        ) : (
                            <span>Немає відгуків</span>
                        )}
                    </div>

                    <div className="catalog-card-price">{product.price} грн</div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;