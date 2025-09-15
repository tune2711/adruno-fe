import React, { createContext, ReactNode, useState, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { PRODUCTS as initialProducts } from '../constants';

interface ProductContextType {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id'>) => void;
  editProduct: (productId: number, productData: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: number) => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    setProducts(prevProducts => {
      const newProduct: Product = {
        id: (prevProducts.length > 0 ? Math.max(...prevProducts.map(p => p.id)) : 0) + 1,
        ...productData,
        imageUrl: productData.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(productData.name)}/400/300`,
      };
      return [...prevProducts, newProduct];
    });
  }, []);

  const editProduct = useCallback((productId: number, productData: Omit<Product, 'id'>) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId ? { ...product, ...productData } : product
      )
    );
  }, []);

  const deleteProduct = useCallback((productId: number) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
  }, []);
  
  const contextValue = useMemo(() => ({
    products,
    addProduct,
    editProduct,
    deleteProduct,
  }), [products, addProduct, editProduct, deleteProduct]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};