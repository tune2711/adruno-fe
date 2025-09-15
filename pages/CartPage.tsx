import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const handleCheckout = () => {
      if(isAuthenticated) {
          navigate('/checkout');
      } else {
          alert('Vui lòng đăng nhập để tiếp tục thanh toán.');
          navigate('/login');
      }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">Giỏ hàng của bạn đang trống</h1>
        <p className="text-gray-600 mb-8">Hãy chọn món ăn yêu thích để thêm vào giỏ hàng nhé!</p>
        <Link to="/" className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors">
          Bắt đầu mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center md:text-left">Giỏ hàng của bạn</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cart Items */}
        <div className="w-full md:w-2/3">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="hidden sm:grid grid-cols-6 gap-4 font-semibold text-gray-600 uppercase p-4 border-b">
                    <div className="col-span-3">Sản phẩm</div>
                    <div className="col-span-1 text-center">Số lượng</div>
                    <div className="col-span-1 text-right">Tổng</div>
                    <div className="col-span-1 text-right"></div>
                </div>
                {cartItems.map(item => (
                <div key={item.id} className="grid grid-cols-6 gap-4 items-center p-4 border-b last:border-b-0">
                    {/* Product Info */}
                    <div className="col-span-6 sm:col-span-3 flex items-center">
                    <img src={item.imageUrl} alt={item.name} className="h-16 w-16 object-cover rounded-md mr-4" />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                        <p className="text-gray-500 text-sm">{formatPrice(item.price)}</p>
                    </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="col-span-3 sm:col-span-1 flex items-center justify-center">
                        <div className="flex items-center rounded-md border border-gray-200">
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                disabled={item.quantity <= 1}
                                aria-label="Giảm số lượng"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <input
                                type="text"
                                readOnly
                                value={item.quantity}
                                className="w-12 h-full text-center border-l border-r bg-white text-black focus:outline-none"
                                aria-label="Số lượng hiện tại"
                            />
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                                aria-label="Tăng số lượng"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Item Total */}
                    <div className="col-span-2 sm:col-span-1 text-right font-semibold text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                    </div>
                    
                    {/* Remove Button */}
                    <div className="col-span-1 text-right">
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 transition-colors" aria-label={`Xóa ${item.name}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                ))}
            </div>
        </div>
        
        {/* Order Summary */}
        <div className="w-full md:w-1/3">
          <div className="bg-white shadow-md rounded-lg p-6 sticky top-28">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-4">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-gray-600">Tổng cộng</span>
              <span className="text-2xl font-bold text-orange-500">{formatPrice(totalPrice)}</span>
            </div>
            <button 
                onClick={handleCheckout} 
                className="w-full mb-4 px-6 py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-transform transform hover:scale-105"
            >
                Tiến hành thanh toán
            </button>
             <button 
                onClick={clearCart} 
                className="w-full text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-md transition-colors"
            >
                Xóa tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;