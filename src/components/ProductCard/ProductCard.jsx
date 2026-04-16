// src/components/ProductCard/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <Link to={`/product/${product.id}`} className="product-card-link">
            <div className="catalog-card"> 
                {/* Додаємо / перед шляхом до картинки, щоб з будь-якої сторінки шлях був правильним */}
                <img src={`/${product.image}`} alt={product.name} className="catalog-card-image" />
                <div className="catalog-card-info">
                    <h3 className="catalog-card-title">{product.name}</h3>
                    <div className="catalog-card-price">{product.price} грн</div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;