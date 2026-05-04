// src/components/ProductCard/ProductCard.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../../context/WishlistContext'; // Імпортуємо контекст

const ProductCard = ({ product, isTrending }) => {
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    
    const rating = product.avgRating || 0;
    const reviews = product.reviewCount || 0;
    
    const isLiked = isInWishlist(product.id);

    const handleHeartClick = (e) => {
        e.preventDefault(); // Забороняємо перехід по лінку при кліку на серце
        toggleWishlist(product.id);
    };

    return (
        <Link to={`/product/${product.id}`} className="product-card-link">
            <div className="catalog-card"> 
                <div style={{ position: 'relative' }}>
                    <img src={`/${product.image}`} alt={product.name} className="catalog-card-image" />
                    
                    {isTrending && (
                        <span style={{
                            position: 'absolute', top: '10px', left: '10px',
                            backgroundColor: 'var(--green)', color: '#fff',
                            fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold'
                        }}>
                            🔥 Популярне
                        </span>
                    )}

                    {/* КНОПКА СЕРДЕЧКА */}
                    <button 
                        onClick={handleHeartClick}
                        style={{
                            position: 'absolute', top: '10px', right: '10px',
                            background: 'rgba(255,255,255,0.9)', border: 'none',
                            width: '32px', height: '32px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: '18px',
                            color: isLiked ? '#A32D2D' : '#999',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {isLiked ? '♥' : '♡'}
                    </button>
                </div>

                <div className="catalog-card-info">
                    <h3 className="catalog-card-title">{product.name}</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '10px', fontSize: '13px', color: '#666' }}>
                        <span style={{ color: rating > 0 ? '#FFB800' : '#ddd', fontSize: '15px' }}>★</span>
                        {rating > 0 ? (
                            <><span style={{ fontWeight: '600', color: '#333' }}>{rating}</span><span>({reviews} відгуків)</span></>
                        ) : (<span>Немає відгуків</span>)}
                    </div>

                    <div className="catalog-card-price">{product.price} грн</div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;