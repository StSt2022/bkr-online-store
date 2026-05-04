// src/pages/Wishlist.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard/ProductCard';

const Wishlist = () => {
    const { wishlist, clearWishlist } = useContext(WishlistContext);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (wishlist.length === 0) {
            setProducts([]);
            return;
        }

        setIsLoading(true);
        // Завантажуємо тільки ті товари, які є у вішлісті
        fetch(`http://localhost:3001/api/products?ids=${wishlist.join(',')}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setIsLoading(false);
            })
            .catch(console.error);
    }, [wishlist]);

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0 }}>Список бажань</h1>
                {wishlist.length > 0 && (
                    <button 
                        onClick={clearWishlist} 
                        style={{ background: 'none', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', color: '#666' }}
                    >
                        Очистити все
                    </button>
                )}
            </div>

            {isLoading ? (
                <p>Завантаження...</p>
            ) : wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <div style={{ fontSize: '50px', marginBottom: '20px', color: '#ddd' }}>♡</div>
                    <h2 style={{ color: '#666' }}>Ваш список бажань порожній</h2>
                    <Link to="/catalog" className="add-to-cart-button" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '20px' }}>
                        Перейти до каталогу
                    </Link>
                </div>
            ) : (
                <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;