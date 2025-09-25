
import React, { useContext } from 'react';
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
  // Lấy context từ ProductContext
  const context = React.useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  // Trả về đầy đủ các hàm và state từ context
  return context;
}
