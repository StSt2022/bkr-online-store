// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <>
            <section className="hero">
                <div className="hero-content">
                    <h1>Все для дому та особистої гігієни</h1>
                    <div className="hero-actions">
                        <Link to="/catalog" className="hero-btn primary-btn">Перейти до каталогу</Link>
                        <a href="#weekly-sale" className="hero-btn secondary-btn">Акції тижня</a>
                    </div>
                </div>
            </section>

            <section className="categories">
                <Link to="/catalog?category=cleaning" className="category-item-link">
                    <div className="category-item">
                        <div className="icon-bg" style={{ backgroundColor: '#e0f2e3' }}>
                            <img src="/images/mop.png" alt="Cleaning" />
                        </div>
                        <p>Засоби для прибирання</p>
                    </div>
                </Link>
                
                <Link to="/catalog?category=cosmetics" className="category-item-link">
                    <div className="category-item">
                        <div className="icon-bg" style={{ backgroundColor: '#ffe0e0' }}>
                            <img src="/images/cosmetics.png" alt="Cosmetics" />
                        </div>
                        <p>Косметика та парфумерія</p>
                    </div>
                </Link>
                
                <Link to="/catalog?category=hygiene" className="category-item-link">
                    <div className="category-item">
                        <div className="icon-bg" style={{ backgroundColor: '#d4f1f4' }}>
                            <img src="/images/personal-hygiene.png" alt="Hygiene" />
                        </div>
                        <p>Засоби особистої гігієни</p>
                    </div>
                </Link>
                
                <Link to="/catalog?category=household" className="category-item-link">
                    <div className="category-item">
                        <div className="icon-bg" style={{ backgroundColor: '#e9e7f9' }}>
                            <img src="/images/cleaning.png" alt="Household" />
                        </div>
                        <p>Господарські товари</p>
                    </div>
                </Link>
            </section>

            <section className="promo-blocks" id="weekly-sale">
                <div className="promo-item sale">
                    <div className="promo-text">
                        <h2>Акція тижня</h2>
                        <p className="discount">-20%</p>
                        <p>на засоби для прання</p>
                    </div>
                    <img src="/images/washing-bottle.png" alt="Laundry Detergent" />
                </div>
                <div className="promo-item delivery-promo">
                    <img src="/images/delivery-truck.png" alt="Доставка" className="promo-icon" />
                    <h3>Безкоштовна доставка</h3>
                    <p>На всі замовлення від 500 грн по всій Україні. Обирайте зручний для вас спосіб!</p>
                </div>
            </section>

            <section className="product-showcase">
                <Link to="/catalog?category=cosmetics" className="product-card-link">
                    <div className="product-card">
                        <h3>Новинки косметики</h3>
                        <img src="/images/cosmetics.jpg" alt="Новинки косметики" />
                        <div className="features">
                            <div className="feature-item">
                                <img src="/images/delivery.png" alt="Доставка" />
                                <span>Швидка доставка</span>
                            </div>
                            <div className="feature-item">
                                <img src="/images/leaves.png" alt="Натуральні інгредієнти" />
                                <span>Натуральні інгредієнти</span>
                            </div>
                            <div className="feature-item">
                                <img src="/images/tag.png" alt="Знижки" />
                                <span>Знижки на набори</span>
                            </div>
                            <div className="feature-item">
                                <img src="/images/gift.png" alt="Подарунок" />
                                <span>Подарунок у замовленні</span>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/catalog?category=household" className="product-card-link">
                    <div className="product-card">
                        <h3>Набори для дому</h3>
                        <img src="/images/cleaning-kit.jpg" alt="Набори для дому" />
                        <div className="features">
                            <div className="feature-item">
                                <img src="/images/leaf.png" alt="Еко-засоби" />
                                <span>Еко-засоби</span>
                            </div>
                            <div className="feature-item">
                                <img src="/images/shield.png" alt="Безпечно для дітей" />
                                <span>Безпечно для дітей</span>
                            </div>
                            <div className="feature-item">
                                <img src="/images/best-price.png" alt="Вигідна ціна" />
                                <span>Вигідна ціна</span>
                            </div>
                            <div className="feature-item">
                                <img src="/images/waterdrop.png" alt="Концентрат" />
                                <span>Концентровані формули</span>
                            </div>
                        </div>
                    </div>
                </Link>
            </section>
        </>
    );
};

export default Home;