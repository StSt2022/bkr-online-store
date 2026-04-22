// src/components/Header/Header.jsx
import React, { useState, useEffect, useRef, useContext } from 'react'; // Додали useContext
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { products } from '../../data/mockData';
import { AuthContext } from '../../context/AuthContext'; // Імпорт вже є

const Header = () => {
    // 1. ДІСТАЄМО ЮЗЕРА ТА ФУНКЦІЮ ВИХОДУ
    const { user, logout } = useContext(AuthContext);

    const [cartCount, setCartCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);

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

    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchVisible(false);
        setSearchQuery('');
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length > 0) {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchVisible(false);
        }
    };

    return (
        <header>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/" className="logo">СЯЙВО</Link>
                <Link to="/catalog" style={{ 
                    backgroundColor: 'var(--green-light)', 
                    color: 'var(--green)', 
                    padding: '8px 16px', 
                    borderRadius: '10px', 
                    textDecoration: 'none', 
                    fontWeight: '600', 
                    marginLeft: '20px',
                    fontSize: '15px'
                }}>
                    ☰ Каталог
                </Link>
            </div>
            
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
                <button 
                    className="burger-menu" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
                >
                    <img src={isMenuOpen ? "/images/close.png" : "/images/menu.png"} alt="Menu" />
                </button>

                <nav className={`user-menu ${isMenuOpen ? 'is-active' : ''}`}>
                    {/* 2. НОВА ЛОГІКА ДЛЯ ПРОФІЛЮ / ВХОДУ */}
                    {user ? (
                        <>
                            <Link to="/profile">
                                <img src="/images/user.png" alt="User" /> {user.firstName}
                            </Link>
                            <span 
                                onClick={logout} 
                                style={{ cursor: 'pointer', marginLeft: '15px', color: '#888', fontSize: '14px', alignSelf: 'center' }}
                            >
                                Вийти
                            </span>
                        </>
                    ) : (
                        <Link to="/auth">
                            <img src="/images/user.png" alt="User" /> Увійти
                        </Link>
                    )}

                    <Link to="/cart">
                        <img src="/images/shopping-bag.png" alt="Cart" /> Кошик {cartCount > 0 && `(${cartCount})`}
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;