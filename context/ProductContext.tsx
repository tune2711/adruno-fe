import React, { createContext, ReactNode, useState, useCallback, useMemo, useEffect } from 'react';
import { Product } from '../types';

const API_PREFIX = '/api';

interface ProductContextType {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  // Allow partial updates, but require the ID to be passed in the body for PUT requests.
  updateProduct: (productId: number, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_PREFIX}/Products`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch products' }));
        throw new Error(errorData.message);
      }
      const data: Product[] = await response.json();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
      const response = await fetch(`${API_PREFIX}/Products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add product' }));
        throw new Error(errorData.message);
      }
      await fetchProducts();
    } catch (err: any) {
      console.error("Add Product Error:", err);
      throw err;
    }
  }, [fetchProducts]);

  // The productData now includes the ID, as required by many backends for PUT requests.
  const updateProduct = useCallback(async (productId: number, productData: Partial<Product>) => {
    try {
      const response = await fetch(`${API_PREFIX}/Products/${productId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update product' }));
        throw new Error(errorData.message);
      }
      await fetchProducts();
    } catch (err: any) {
      console.error("Update Product Error:", err);
      throw err;
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (productId: number) => {
    try {
      const response = await fetch(`${API_PREFIX}/Products/${productId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete product' }));
        throw new Error(errorData.message);
      }
      await fetchProducts();
    } catch (err: any) {
      console.error("Delete Product Error:", err);
      throw err;
    }
  }, [fetchProducts]);

  const contextValue = useMemo(() => ({
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    loading,
    error,
  }), [products, addProduct, updateProduct, deleteProduct, loading, error]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};
