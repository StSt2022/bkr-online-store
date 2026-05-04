// src/context/WishlistContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    // Зберігаємо масив ID товарів, які юзер додав в обране
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        // При завантаженні читаємо з пам'яті браузера
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        setWishlist(savedWishlist);
    }, []);

    const toggleWishlist = (productId) => {
        let newWishlist = [...wishlist];
        const index = newWishlist.indexOf(productId);
        
        if (index > -1) {
            // Якщо товар вже там - видаляємо
            newWishlist.splice(index, 1);
        } else {
            // Якщо немає - додаємо
            newWishlist.push(productId);
        }
        
        setWishlist(newWishlist);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    };

    const isInWishlist = (productId) => {
        return wishlist.includes(productId);
    };

    const clearWishlist = () => {
        setWishlist([]);
        localStorage.removeItem('wishlist');
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};