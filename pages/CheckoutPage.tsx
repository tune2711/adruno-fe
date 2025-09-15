
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';

const CheckoutPage: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !paymentConfirmed) {
      navigate('/');
    }
  }, [cartItems, paymentConfirmed, navigate]);

  const handleConfirmPayment = () => {
    // Add order to history before clearing cart
    addOrder(cartItems);
    setPaymentConfirmed(true);
    setTimeout(() => {
        clearCart();
    }, 500); // give time for the state to update before clearing cart
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const qrDescription = encodeURIComponent(`Thanh toan don hang ${Date.now()}`);
  const qrCodeUrl = `https://img.vietqr.io/image/MB-0396374030-compact.png?amount=${totalPrice}&addInfo=${qrDescription}`;


  if (paymentConfirmed) {
      return (
          <div className="container mx-auto px-6 py-8 text-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-600 mb-6">Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được chuẩn bị.</p>
              <button onClick={() => navigate('/')} className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600">
                  Tiếp tục mua sắm
              </button>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Thanh toán</h1>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Order Summary */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Tóm tắt đơn hàng</h2>
            {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2">
                    <span className="text-gray-700">{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
                    <span className="font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                </div>
            ))}
            <div className="flex justify-between items-center font-bold text-xl mt-4 pt-4 border-t">
                <span className="text-gray-800">Tổng cộng</span>
                <span className="text-orange-500">{formatPrice(totalPrice)}</span>
            </div>
        </div>

        {/* QR Code Payment */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Quét mã QR để thanh toán</h2>
            <p className="text-gray-600 text-center mb-4">Sử dụng ứng dụng ngân hàng hoặc ví điện tử của bạn để quét mã.</p>
            <div className="p-4 border rounded-lg">
                <img 
                    src={qrCodeUrl}
                    alt="QR Code thanh toán"
                    className="w-64 h-64"
                />
            </div>
            <button onClick={handleConfirmPayment} className="mt-6 w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">
                Xác nhận đã thanh toán
            </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
