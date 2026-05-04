// src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query') || '';
    
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!query) return;
        
        setIsLoading(true);
        // Звертаємось до нашого оновленого бекенду!
        fetch(`http://localhost:3001/api/products?search=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                setResults(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [query]);

    return (
        <div className="catalog-main" style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '30px' }}>
                {query ? (
                    <>Результати пошуку для: "<em>{query}</em>"</>
                ) : (
                    "Будь ласка, введіть пошуковий запит"
                )}
            </h1>

            {isLoading ? (
                <p>Шукаємо товари...</p>
            ) : (
                <div className="product-grid">
                    {results.length > 0 ? (
                        results.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p style={{ gridColumn: '1 / -1' }}>На жаль, за вашим запитом "{query}" нічого не знайдено.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;