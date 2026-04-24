// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth';
import AIAssistant from './components/AIAssistant/AIAssistant';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import Profile from './pages/Profile';
import Search from './pages/Search';

import './index.css';

// 1. Створюємо "Макет" для сторінок, де ПОТРІБНІ Хедер і Футер
const MainLayout = () => {
  return (
    <div className="container">
      <Header />
      <main style={{ minHeight: '60vh' }}>
        {/* Outlet - це місце, куди React підставить поточну сторінку (Home, Cart тощо) */}
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AIAssistant />
        
        <Routes>
          {/* 2. Ця сторінка стоїть ОКРЕМО, тому вона буде на весь екран без Хедера/Футера */}
          <Route path="/thank-you" element={<ThankYou />} />

          {/* 3. Всі інші сторінки загорнуті в MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            
            <Route path="*" element={<div style={{padding: '40px', textAlign: 'center'}}><h1>404 - Сторінку не знайдено</h1></div>} />
          </Route>
        </Routes>
        
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;