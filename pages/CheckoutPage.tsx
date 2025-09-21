import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';

const CheckoutPage: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5); // Countdown state

  useEffect(() => {
    if (cartItems.length === 0 && !paymentConfirmed) {
      navigate('/');
    }
  }, [cartItems, paymentConfirmed, navigate]);

  const handleConfirmPayment = () => {
    addOrder(cartItems);
    setPaymentConfirmed(true);
    setTimeout(() => {
        clearCart();
    }, 500);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const hasFetched = useRef(false);
  useEffect(() => {
    if (totalPrice > 0 && cartItems.length > 0 && !hasFetched.current) {
      hasFetched.current = true;
      fetch(`/api/Banking/create?amount=${totalPrice}`)
        .then(async res => {
          if (!res.ok) throw new Error('API error');
          const data = await res.json();
          setTransactionId(data?.transactionId || null);
        })
        .catch(() => setTransactionId(null));
    } else if (totalPrice === 0 || cartItems.length === 0) {
      setTransactionId(null);
      hasFetched.current = false;
    }
  }, [totalPrice, cartItems]);

  const qrDescription = transactionId ? encodeURIComponent(transactionId) : '';
  const qrCodeUrl = `https://img.vietqr.io/image/MB-0396374030-compact.png?addInfo=${qrDescription}&accountName=NGUYEN%20DUC%20TOAN${totalPrice > 0 ? `&amount=${totalPrice}` : ''}`;

  // Effect for countdown and redirect
  useEffect(() => {
    if (paymentConfirmed) {
      const countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      const redirectTimeout = setTimeout(() => {
        navigate('/');
      }, 5000);

      return () => {
        clearInterval(countdownInterval);
        clearTimeout(redirectTimeout);
      };
    }
  }, [paymentConfirmed, navigate]);

  if (paymentConfirmed) {
      return (
          <div className="container mx-auto px-6 py-8 text-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-600 mb-6">Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được chuẩn bị.</p>
              <p className="text-gray-500 mb-6">Bạn sẽ được chuyển về trang chủ sau {countdown} giây.</p>
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

        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Quét mã QR để thanh toán</h2>
            <p className="text-gray-600 text-center mb-4">Sử dụng ứng dụng ngân hàng hoặc ví điện tử của bạn để quét mã.</p>
            <div className="p-4 border rounded-lg">
              {transactionId ? (
                <>
                  <img 
                    src={qrCodeUrl}
                    alt="QR Code thanh toán"
                    className="w-64 h-64"
                  />
                  <div className="mt-4 p-2 bg-gray-100 rounded text-center break-all">
                    <span className="font-semibold text-gray-700">Mã giao dịch:</span><br />
                    <span className="text-blue-600">{transactionId}</span>
                  </div>
                </>
              ) : (
                <div>Đang tạo mã QR...</div>
              )}
            </div>
            <button onClick={handleConfirmPayment} className="mt-6 w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600" disabled={!transactionId}>
              Xác nhận đã thanh toán
            </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
