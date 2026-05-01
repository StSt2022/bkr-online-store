// src/pages/Product.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { recordProductView } from '../utils/recommendations';
import { AuthContext } from '../context/AuthContext';

const categoryNames = {
    cosmetics: "Косметика та парфумерія",
    cleaning: "Засоби для прибирання",
    hygiene: "Засоби особистої гігієни",
    household: "Господарські товари"
};

const taskNames = {
    bathroom: "прибирають ванну", windows: "миють вікна", kitchen: "прибирають кухню",
    laundry: "перуть білизну", general: "роблять генеральне прибирання", personal: "обирають догляд"
};

const Product = () => {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [newReviewText, setNewReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');
    const [myReviewId, setMyReviewId] = useState(null); 

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    
    // Стан для банера "В тренді"
    const [trendingTask, setTrendingTask] = useState(null);

    const fetchSingleProduct = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:3001/api/products/${id}`);
            if (!response.ok) throw new Error('Товар не знайдено');
            const data = await response.json();
            setProduct(data);
            recordProductView(data);

            if (data.related_products && data.related_products.length > 0) {
                const relatedRes = await fetch(`http://localhost:3001/api/products?ids=${data.related_products.join(',')}`);
                setRelatedProducts(await relatedRes.json());
            } else {
                setRelatedProducts([]);
            }
            
            fetchReviews();
            fetchTrending(data); // Викликаємо нову функцію
            
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/products/${id}/reviews`);
            const data = await res.json();
            setReviews(data);
            
            if (user) {
                const currentUserId = user._id || user.id; 
                const myReview = data.find(r => r.userId._id === currentUserId);
                setMyReviewId(myReview ? myReview._id : null);
            }
        } catch (error) {
            console.error("Помилка:", error);
        }
    };

    // НОВА ФУНКЦІЯ: Перевіряємо, чи цей товар зараз в тренді
    const fetchTrending = async (currentProd) => {
        try {
            const res = await fetch('http://localhost:3001/api/products/trending');
            const data = await res.json();
            
            // Якщо є топ-задача І наш товар є в списку рекомендованих для цієї задачі
            if (data.topTask && data.products.some(p => p.id === currentProd.id)) {
                setTrendingTask(data.topTask);
            }
        } catch (error) {
            console.error("Помилка завантаження трендів", error);
        }
    };

    useEffect(() => {
        fetchSingleProduct();
    }, [id, user]);

    const handleAddToCart = () => {
        if (!product) return;
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.id === product.id);
        if (existing) existing.quantity += 1;
        else cart.push({ id: product.id, quantity: 1 });

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));

        setToastMessage(`${product.name} додано в кошик!`);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setReviewMessage('');

        try {
            const res = await fetch(`http://localhost:3001/api/products/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ rating: newRating, text: newReviewText })
            });

            if (!res.ok) throw new Error((await res.json()).message || 'Помилка');

            setNewReviewText('');
            setNewRating(5);
            
            await fetchReviews();
            await fetchSingleProduct(); 

        } catch (error) {
            setReviewMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/products/${id}/reviews/${myReviewId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setMyReviewId(null);
                await fetchReviews();
                await fetchSingleProduct();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Завантаження...</div>;
    if (error || !product) return <div style={{ padding: '40px', textAlign: 'center' }}><h1>{error}</h1></div>;

    return (
        <div style={{ padding: '40px' }}>
            <nav className="breadcrumbs breadcrumbs-product" style={{ paddingTop: 0 }}>
                <Link to="/">Головна</Link><span className="breadcrumb-separator">/</span>
                <Link to={`/catalog?category=${product.category}`}>{categoryNames[product.category]}</Link><span className="breadcrumb-separator">/</span>
                <span>{product.name}</span>
            </nav>

            <div className="product-page" style={{ padding: '20px 0' }}>
                <div className="product-image-container">
                    <img src={`/${product.image}`} alt={product.name} />
                </div>
                <div className="product-info">
                    <h1>{product.name}</h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#666' }}>
                        {reviews.length > 0 ? (
                            <>
                                <span style={{ color: '#FFB800', fontSize: '20px' }}>★</span>
                                <span style={{ fontWeight: '600', fontSize: '18px', color: '#333' }}>
                                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                                </span>
                                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                                    ({reviews.length} відгуків)
                                </span>
                            </>
                        ) : (
                            <>
                                <span style={{ color: '#ddd', fontSize: '20px' }}>★</span>
                                <span>Немає відгуків</span>
                            </>
                        )}
                    </div>

                    {/* НОВИЙ БАНЕР ТРЕНДУ */}
                    {trendingTask && trendingTask.count > 0 && (
                        <div style={{ backgroundColor: '#EAF3DE', border: '1px solid var(--green)', padding: '10px 15px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>🔥</span>
                            <span style={{ color: 'var(--green-dark)', fontWeight: '500', fontSize: '14px' }}>
                                Сьогодні <strong>{trendingTask.count}</strong> людей {taskNames[trendingTask.key]}, і беруть цей товар!
                            </span>
                        </div>
                    )}

                    <p>{product.description}</p>
                    <div className="price">{product.price} грн</div>
                    <button className="add-to-cart-button" onClick={handleAddToCart}>Додати в кошик</button>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div style={{ marginTop: '60px', borderTop: '1px solid #e8ede3', paddingTop: '40px' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>З цим товаром часто купують</h2>
                    <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '60px', borderTop: '1px solid #e8ede3', paddingTop: '40px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Відгуки покупців</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                    <div style={{ backgroundColor: '#fcfdfb', padding: '25px', borderRadius: '16px', border: '1px solid #e8ede3', height: 'fit-content' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Залишити відгук</h3>
                        
                        {!user ? (
                            <p style={{ color: '#666', fontSize: '14px' }}>Щоб залишити відгук, <Link to="/auth" style={{ color: 'var(--green)', fontWeight: '600' }}>увійдіть</Link>.</p>
                        ) : myReviewId ? (
                            <div style={{ padding: '15px', backgroundColor: '#EAF3DE', color: '#27500A', borderRadius: '8px', fontSize: '14px' }}>
                                Ви вже залишили відгук! 💚
                            </div>
                        ) : (
                            <form onSubmit={handleReviewSubmit}>
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span key={star} onClick={() => setNewRating(star)} style={{ fontSize: '28px', cursor: 'pointer', color: star <= newRating ? '#FFB800' : '#ddd', lineHeight: 1 }}>★</span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <textarea 
                                        value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)}
                                        placeholder="Поділіться враженнями..."
                                        style={{ width: '100%', boxSizing: 'border-box', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit', resize: 'vertical', fontSize: '14px' }}
                                        required
                                    />
                                </div>
                                {reviewMessage && <p style={{ color: 'red', fontSize: '13px', margin: '0 0 10px 0' }}>{reviewMessage}</p>}
                                <button type="submit" disabled={isSubmitting} className="add-to-cart-button" style={{ width: '100%', padding: '10px', fontSize: '14px' }}>
                                    {isSubmitting ? 'Відправка...' : 'Опублікувати'}
                                </button>
                            </form>
                        )}
                    </div>

                    <div>
                        {reviews.length === 0 ? (
                            <p style={{ color: '#888' }}>Будьте першим, хто залишить відгук!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {reviews.map(review => (
                                    <div key={review._id} style={{ borderBottom: '1px solid #f0f4eb', paddingBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--green-light)', color: 'var(--green-dark)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                                                    {review.userId.firstName.charAt(0)}
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: '600', fontSize: '15px', display: 'block', color: '#1a1a1a' }}>{review.userId.firstName} {review.userId.lastName}</span>
                                                    <span style={{ fontSize: '12px', color: '#999' }}>{new Date(review.createdAt).toLocaleDateString('uk-UA')}</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: '#FFB800', fontSize: '16px', letterSpacing: '1px' }}>
                                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                </div>
                                                {user && (user._id || user.id) === review.userId._id && (
                                                    <button onClick={handleDeleteReview} style={{ background: 'none', border: 'none', color: '#A32D2D', fontSize: '12px', cursor: 'pointer', padding: 0, marginTop: '5px' }}>
                                                        Видалити мій відгук
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, color: '#444', lineHeight: '1.5', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div id="toast-container"><div className={`toast ${toastMessage ? 'show' : ''}`}>{toastMessage}</div></div>
        </div>
    );
};

export default Product;