// src/pages/Product.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard'; // ДОДАЛИ
import { recordProductView } from '../utils/recommendations'; // ДОДАЛИ

const categoryNames = {
    cosmetics: "Косметика та парфумерія",
    cleaning: "Засоби для прибирання",
    hygiene: "Засоби особистої гігієни",
    household: "Господарські товари"
};

const Product = () => {
    const { id } = useParams();
    
    // Стани для роботи з бекендом
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
            const fetchSingleProduct = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch(`http://localhost:3001/api/products/${id}`);
                    if (!response.ok) throw new Error('Товар не знайдено');
                    const data = await response.json();
                    setProduct(data);
                    
                    // 1. ЗАПИСУЄМО ПЕРЕГЛЯД
                    recordProductView(data);

                    // 2. ВАНТАЖИМО ПОВ'ЯЗАНІ ТОВАРИ (Часто купують разом)
                    if (data.related_products && data.related_products.length > 0) {
                        const relatedRes = await fetch(`http://localhost:3001/api/products?ids=${data.related_products.join(',')}`);
                        const relatedData = await relatedRes.json();
                        setRelatedProducts(relatedData);
                    } else {
                        setRelatedProducts([]);
                    }

                    setIsLoading(false);
                } catch (err) {
                    setError(err.message);
                    setIsLoading(false);
                }
            };
            fetchSingleProduct();
        }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === product.id);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({ id: product.id, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));

        setToastMessage(`${product.name} додано в кошик!`);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Рендеримо різні стани: лоадер, помилку або саму сторінку
    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Завантаження...</div>;
    
    if (error || !product) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>{error || "Товар не знайдено"}</h1>
                <Link to="/catalog">Повернутися до каталогу</Link>
            </div>
        );
    }

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

            {relatedProducts.length > 0 && (
                <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>З цим товаром часто купують</h2>
                    <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            )}

            <div id="toast-container">
                <div className={`toast ${toastMessage ? 'show' : ''}`}>
                    {toastMessage}
                </div>
            </div>
        </div>
    );
};

export default Product;