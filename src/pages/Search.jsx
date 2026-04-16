// src/pages/Search.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/mockData';
import ProductCard from '../components/ProductCard/ProductCard';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query') || '';

    // Шукаємо за назвою або описом (незалежно від регістру)
    const lowerCaseQuery = query.toLowerCase();
    const results = products.filter(product => 
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.description.toLowerCase().includes(lowerCaseQuery)
    );

    return (
        <div className="catalog-main" style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '30px' }}>
                {query ? (
                    <>Результати пошуку для: "<em>{query}</em>"</>
                ) : (
                    "Будь ласка, введіть пошуковий запит"
                )}
            </h1>

            <div className="product-grid">
                {results.length > 0 ? (
                    results.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p style={{ gridColumn: '1 / -1' }}>На жаль, за вашим запитом "{query}" нічого не знайдено.</p>
                )}
            </div>
        </div>
    );
};

export default Search;