// src/components/Footer/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <>
            <div className="pre-footer-strip"></div>
            <footer className="site-footer">
                <div className="footer-container">
                    <div className="footer-column">
                        <h4 className="footer-logo">СЯЙВО</h4>
                        <p>Все для чистоти вашого дому та особистої гігієни.</p>
                    </div>
                    <div className="footer-column">
                        <h4>Магазин</h4>
                        <ul>
                            <li><a href="/catalog">Каталог товарів</a></li>
                            <li><a href="/sales">Акції</a></li>
                            <li><a href="/new">Новинки</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Інформація</h4>
                        <ul>
                            <li><a href="/about">Про нас</a></li>
                            <li><a href="/delivery">Доставка та оплата</a></li>
                            <li><a href="/privacy">Політика конфіденційності</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Контакти</h4>
                        <p>
                            м. Дрогобич, вул. Мазепи, 2<br />
                            <a href="mailto:info@siyavo.com">info@siyavo.com</a><br />
                            <a href="tel:+380991234567">+38 (099) 123-45-67</a>
                        </p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="social-icons">
                        <a href="#"><img src="/images/instagram.png" alt="Instagram" /></a>
                        <a href="#"><img src="/images/facebook.png" alt="Facebook" /></a>
                        <a href="#"><img src="/images/telegram.png" alt="Telegram" /></a>
                    </div>
                    <p className="copyright-text">© 2025 СЯЙВО. Всі права захищено.</p>
                </div>
            </footer>
        </>
    );
};

export default Footer;