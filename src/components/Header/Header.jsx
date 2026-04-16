// src/components/Header/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { products } from '../../data/mockData';

const Header = () => {
    const [cartCount, setCartCount] = useState(0);
    
    // Стан для мобільного меню
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Стан для пошуку
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null); // Щоб знати, де знаходиться пошук (для кліку повз)

    // --- Логіка Кошика ---
    const updateCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
    };

    useEffect(() => {
        updateCount();
        window.addEventListener('cartUpdated', updateCount);
        return () => window.removeEventListener('cartUpdated', updateCount);
    }, []);

    // --- Логіка Закриття меню при переході ---
    // Коли змінюється URL (location.pathname), меню і пошук закриваються
    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchVisible(false);
        setSearchQuery('');
    }, [location.pathname]);

    // --- Логіка Кліку повз пошук ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Обробка вводу в пошук ---
    const handleSearchInput = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim().length >= 2) {
            const results = products.filter(product =>
                product.name.toLowerCase().includes(query.trim().toLowerCase())
            );
            setSearchResults(results);
            setIsSearchVisible(true);
        } else {
            setIsSearchVisible(false);
        }
    };

    // --- Обробка натискання Enter / Кнопки пошуку ---
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length > 0) {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchVisible(false);
        }
    };

    return (
        <header>
            <Link to="/" className="logo">СЯЙВО</Link>
            
            {/* Додали ref сюди, щоб відстежувати кліки */}
            <div className="search-container" ref={searchRef}>
                <form className="search-bar-top" onSubmit={handleSearchSubmit}>
                    <input 
                        type="text" 
                        placeholder="Пошук" 
                        autoComplete="off" 
                        value={searchQuery}
                        onChange={handleSearchInput}
                        onFocus={() => searchQuery.length >= 2 && setIsSearchVisible(true)}
                    />
                    <button type="submit">
                        <img src="/images/search-icon.png" alt="Search" />
                    </button>
                </form>

                {/* Живий пошук (випадаючий список) */}
                {isSearchVisible && (
                    <div className="search-results-list" style={{ display: 'block' }}>
                        {searchResults.length > 0 ? (
                            searchResults.slice(0, 5).map(product => (
                                <Link to={`/product/${product.id}`} className="search-result-item" key={product.id}>
                                    <img src={`/${product.image}`} alt={product.name} className="search-result-image" />
                                    <div className="search-result-info">
                                        <span className="search-result-name">{product.name}</span>
                                        <span className="search-result-price">{product.price} грн</span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="search-no-results">Нічого не знайдено</div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="mobile-menu-container">
                {/* Кнопка Бургер-меню */}
                <button 
                    className="burger-menu" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
                >
                    <img src={isMenuOpen ? "/images/close.png" : "/images/menu.png"} alt="Menu" />
                </button>

                {/* Якщо isMenuOpen === true, додається клас 'is-active' */}
                <nav className={`user-menu ${isMenuOpen ? 'is-active' : ''}`}>
                    <Link to="/profile">
                        <img src="/images/user.png" alt="User" /> Профіль
                    </Link>
                    <Link to="/cart">
                        <img src="/images/shopping-bag.png" alt="Cart" /> Кошик {cartCount > 0 && `(${cartCount})`}
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;