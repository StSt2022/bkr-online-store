// src/components/AIAssistant/AIAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Додано для посилань з карток

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Стан для ефекту кнопки "Додано" (зберігає ID повідомлення, для якого натиснули кнопку)
    const [addedMsgId, setAddedMsgId] = useState(null);
    
    const messagesEndRef = useRef(null);

    // Автоскрол вниз при новому повідомленні
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newHistory = [...chatHistory, { type: 'user', text: message }];
        setChatHistory(newHistory);
        setMessage('');
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:3001/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            
            setChatHistory([...newHistory, { 
                type: 'ai', 
                text: data.text, 
                products: data.products,
                msgId: Date.now() // Унікальний ID для відстеження кнопки
            }]);
        } catch (error) {
            setChatHistory([...newHistory, { type: 'ai', text: "Ой, я трохи втомився. Спробуйте пізніше!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAll = (products, msgId) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        products.forEach(p => {
            const existing = cart.find(item => item.id === p.id);
            if (existing) existing.quantity += 1;
            else cart.push({ id: p.id, quantity: 1 });
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Показуємо "✅ Додано!" на 2 секунди замість alert()
        setAddedMsgId(msgId);
        setTimeout(() => setAddedMsgId(null), 2000);
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            {/* КНОПКА ВІДКРИТТЯ (Тепер зелена) */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '65px', height: '65px', borderRadius: '50%', backgroundColor: 'var(--green)', 
                        color: '#fff', border: 'none', fontSize: '28px', cursor: 'pointer',
                        boxShadow: '0 8px 25px rgba(59, 109, 17, 0.4)', transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    ✨
                </button>
            )}

            {/* ВІКНО ЧАТУ (Ширше: 420px) */}
            {isOpen && (
                <div style={{
                    width: '420px', height: '600px', backgroundColor: '#fff', borderRadius: '24px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', border: '1px solid #e8ede3'
                }}>
                    {/* Шапка чату (Зелена) */}
                    <div style={{ backgroundColor: 'var(--green)', color: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>✨</span>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>AI Асистент</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>×</button>
                    </div>

                    {/* Історія повідомлень */}
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#fcfdfb', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {chatHistory.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: '60px' }}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👋</div>
                                <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.5' }}>
                                    Розкажіть, що плануєте робити вдома, і я миттєво підберу найкращі засоби! <br/><br/>
                                    <em>Наприклад: "Чим відмити духовку?"</em>
                                </p>
                            </div>
                        )}

                        {chatHistory.map((msg, index) => (
                            <div key={index} style={{
                                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '90%'
                            }}>
                                {/* Текст */}
                                <div style={{
                                    /* Бульбашка юзера тепер світло-зелена, а AI - біла з сірою рамкою */
                                    backgroundColor: msg.type === 'user' ? 'var(--green-light)' : '#fff',
                                    color: msg.type === 'user' ? 'var(--green-dark)' : '#333',
                                    padding: '12px 18px', 
                                    borderRadius: msg.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                                    border: msg.type === 'ai' ? '1px solid #e8ede3' : 'none',
                                    fontSize: '14px', lineHeight: '1.5',
                                    boxShadow: msg.type === 'ai' ? '0 2px 8px rgba(0,0,0,0.03)' : 'none'
                                }}>
                                    {msg.text}
                                </div>
                                
                                {/* Картки товарів */}
                                {msg.type === 'ai' && msg.products && msg.products.length > 0 && (
                                    <div style={{ marginTop: '12px', display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'thin' }}>
                                        {msg.products.map(p => (
                                            <Link to={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <div style={{ 
                                                    minWidth: '140px', maxWidth: '140px', backgroundColor: '#fff', 
                                                    border: '1px solid #e8ede3', borderRadius: '12px', padding: '10px', 
                                                    transition: 'box-shadow 0.2s'
                                                }}>
                                                    <img src={`/${p.image}`} alt={p.name} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                                                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1a1a1a' }}>{p.price} ₴</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Кнопка "Додати всі" (Без алерту) */}
                                {msg.type === 'ai' && msg.products && msg.products.length > 0 && (
                                    <button 
                                        onClick={() => handleAddAll(msg.products, msg.msgId)} 
                                        style={{
                                            width: '100%', padding: '12px', marginTop: '8px', 
                                            backgroundColor: addedMsgId === msg.msgId ? 'var(--green-light)' : 'var(--green)', 
                                            color: addedMsgId === msg.msgId ? 'var(--green-dark)' : '#fff',
                                            border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {addedMsgId === msg.msgId ? '✅ Додано в кошик!' : 'Додати всі в кошик'}
                                    </button>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', backgroundColor: '#fff', border: '1px solid #e8ede3', padding: '12px 18px', borderRadius: '18px 18px 18px 4px', fontSize: '13px', color: '#888' }}>
                                Друкую відповідь... ✍️
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Поле вводу */}
                    <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #e8ede3', padding: '16px 20px', display: 'flex', gap: '12px', backgroundColor: '#fff' }}>
                        <input 
                            type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                            placeholder="Що плануєте робити?"
                            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', fontSize: '14px', fontFamily: 'inherit' }}
                        />
                        <button type="submit" disabled={isLoading || !message.trim()} style={{ 
                            backgroundColor: (isLoading || !message.trim()) ? '#ddd' : 'var(--green)', 
                            color: '#fff', border: 'none', borderRadius: '12px', padding: '0 20px', cursor: (isLoading || !message.trim()) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;