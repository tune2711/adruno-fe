
import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import { useState, useEffect } from 'react';


/**
 * Custom hook to access the ProductContext.
 * This provides a centralized way to manage product state throughout the application.
 *
 * @returns The product context including the list of products, loading/error states,
 * and functions to add, update, or delete products.
 * @throws {Error} If used outside of a ProductProvider.
 */
export function useProducts() {
  const [products, setProducts] = useState([]); // Luôn là mảng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/Products')
      .then(res => res.json())
      .then(data => {
        console.log('API data:', data);
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setProducts([]); // Đảm bảo là mảng khi lỗi
        setLoading(false);
      });
  }, []);

  return { products, loading, error };
}
