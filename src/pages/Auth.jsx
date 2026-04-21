// src/pages/Auth.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Auth = () => {
    const [isLoginTab, setIsLoginTab] = useState(true); // Перемикач табів
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isLoginTab ? '/api/auth/login' : '/api/auth/register';
        const url = `http://localhost:3001${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Помилка авторизації');
            }

            // Зберігаємо юзера і токен глобально
            login(data.token, data.user);
            
            // Кидаємо на головну
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
            <div className="product-card" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                    <h2 
                        onClick={() => setIsLoginTab(true)} 
                        style={{ cursor: 'pointer', color: isLoginTab ? '#333' : '#999', margin: 0 }}
                    >Вхід</h2>
                    <h2 
                        onClick={() => setIsLoginTab(false)} 
                        style={{ cursor: 'pointer', color: !isLoginTab ? '#333' : '#999', margin: 0 }}
                    >Реєстрація</h2>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="checkout-form">
                    {!isLoginTab && (
                        <>
                            <div className="form-group">
                                <label>Ім'я</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Прізвище</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="add-to-cart-button" style={{ width: '100%', marginTop: '10px' }}>
                        {isLoginTab ? 'Увійти' : 'Зареєструватися'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;