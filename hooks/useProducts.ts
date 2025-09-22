
import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';

/**
 * Custom hook to access the ProductContext.
 * This provides a centralized way to manage product state throughout the application.
 *
 * @returns The product context including the list of products, loading/error states,
 * and functions to add, update, or delete products.
 * @throws {Error} If used outside of a ProductProvider.
 */
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
