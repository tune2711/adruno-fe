import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAddToCart = () => {
    if (isAdding) return;
    addToCart(product);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1500);
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl h-full flex flex-col">
      <img className="w-full h-48 object-cover" src={product.imageUrl} alt={product.name} />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600 mt-1 text-sm flex-grow">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-orange-500">{formatPrice(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-4 py-2 text-white text-sm font-semibold rounded-full transition-all duration-300 ease-in-out flex items-center justify-center active:scale-95 w-28 h-10
              ${isAdding
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
              }`}
          >
            {isAdding ? (
              <div className="flex items-center animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Đã thêm
              </div>
            ) : (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                Thêm
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;