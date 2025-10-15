/// <reference types="vite/client" />

// Custom hook: chỉ true khi window.SpeechSDK đã sẵn sàng
function useSpeechReady() {
  const [isSpeechReady, setIsSpeechReady] = useState(!!window.SpeechSDK);
  useEffect(() => {
    if (window.SpeechSDK) {
      setIsSpeechReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
    script.async = true;
    script.onload = () => setIsSpeechReady(true);
    document.head.appendChild(script);
    return () => { script.onload = null; };
  }, []);
  return isSpeechReady;
}
// Khai báo mở rộng window cho SpeechSDK
declare global {
  interface Window {
    SpeechSDK?: any;
  }
}
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth'; // Import useAuth
import ReceiptModal from '../components/ReceiptModal';
// Azure Speech TTS config
const AZURE_KEY = import.meta.env.VITE_AZURE_KEY;
const AZURE_REGION = "japaneast";
const TTS_VOICE = "vi-VN-HoaiMyNeural";

function speakAmount(amount, onDone) {
  if (!window.SpeechSDK) {
    setTimeout(() => speakAmount(amount, onDone), 500);
    return;
  }
  const sdk = window.SpeechSDK;
  if (!AZURE_KEY) {
    throw new Error("Azure Speech key is missing. Please set VITE_AZURE_KEY in your .env file.");
  }
  const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
  const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
  const synth = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  const text = `Bạn đã thanh toán thành công. Cảm ơn bạn đã mua và sử dụng sản phẩm.`;
  // Slightly speed up TTS using prosody rate
  const ssml = `<speak version=\"1.0\" xml:lang=\"vi-VN\"><voice name=\"${TTS_VOICE}\"><prosody rate=\"+20%\">${text}</prosody></voice></speak>`;
  synth.speakSsmlAsync(ssml,
    result => {
      if (onDone) onDone();
      synth.close();
    },
    err => { synth.close(); if (onDone) onDone(); }
  );
}

const CheckoutPage: React.FC = () => {
  const [speechEnabled, setSpeechEnabled] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('voiceEnabled') : null;
    return saved === 'true';
  });

  // Save voice toggle state to localStorage when changed
  useEffect(() => {
    localStorage.setItem('voiceEnabled', speechEnabled ? 'true' : 'false');
  }, [speechEnabled]);
  // Ref để luôn lấy trạng thái mới nhất của speechEnabled
  const speechEnabledRef = useRef(speechEnabled);
  useEffect(() => { speechEnabledRef.current = speechEnabled; }, [speechEnabled]);
  const isSpeechReady = useSpeechReady();
  const hasSpokenRef = useRef(false);
  const hasSuccessSpokenRef = useRef(false); // Đảm bảo chỉ đọc 1 lần ở trang thành công
  const isProcessingPaymentRef = useRef(false); // Flag để tránh xử lý thanh toán nhiều lần
  // Persist cart items in localStorage
  const { cartItems, totalPrice, clearCart, setCartItems } = useCart();

  // Load cart from localStorage on first render
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {}
    }
  }, [setCartItems]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);
  const { addOrder } = useOrders();
  const { user } = useAuth(); // Get user info
  const navigate = useNavigate();



  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [lastPaidAmount, setLastPaidAmount] = useState<number | null>(null); // Lưu số tiền đã nhận
  const [isCashPolling, setIsCashPolling] = useState(false); // Đang chờ xác nhận tiền mặt
  const [createdOrderId, setCreatedOrderId] = useState<string | number | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [snapshotItems, setSnapshotItems] = useState(cartItems);
  const [snapshotTime, setSnapshotTime] = useState<Date | null>(null);
  const [snapshotTransactionId, setSnapshotTransactionId] = useState<string | null>(null);

  // Gửi đơn hàng lên API Orders/receipt
  const submitOrderReceipt = async () => {
    try {
      if (!transactionId || cartItems.length === 0) return;
      const res = await fetch('/api/Orders/receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity })),
          bankingTransactionId: transactionId,
        }),
      });
      try {
        const data = await res.json();
        const id = data?.id || data?.orderId || data?.data?.id || data?.data?.orderId || null;
        if (id != null) setCreatedOrderId(id);
      } catch {}
    } catch (err) {
      console.error('Submit order failed', err);
    }
  };

  const printReceipt = async () => {
    try {
      let url = '';
      if (createdOrderId != null) {
        url = `/api/Orders/${createdOrderId}/receipt`;
      } else if (transactionId) {
        url = `/api/Orders/receipt-by-transaction/${transactionId}`;
      } else {
        alert('Không có thông tin đơn hàng để in.');
        return;
      }
      const res = await fetch(url, {
        headers: {
          ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `In hóa đơn thất bại (HTTP ${res.status})`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `receipt-${createdOrderId || transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      alert(err?.message || 'Không thể in hóa đơn');
    }
  };

  // Đếm ngược và tự động chuyển về trang chủ khi thành công
  useEffect(() => {
    if (!paymentConfirmed) return;
    if (countdown <= 0) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [paymentConfirmed, countdown, navigate]);

  // Tự động kiểm tra trạng thái giao dịch mỗi 1 giây (cho cả QR và tiền mặt)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!transactionId || paymentConfirmed || totalPrice <= 0 || isProcessingPaymentRef.current) return;
    // Nếu là tiền mặt thì chỉ polling khi isCashPolling=true, QR thì luôn polling
    if (!isCashPolling && !hasSpokenRef.current) {
      // QR code: polling luôn
    } else if (!isCashPolling) {
      return;
    }
    hasSpokenRef.current = false;
    const checkStatus = async () => {
      try {
  const res = await fetch(`/api/Banking/get/id/${transactionId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.amount >= totalPrice && !hasSpokenRef.current && !isProcessingPaymentRef.current && isSpeechReady) {
          hasSpokenRef.current = true;
          isProcessingPaymentRef.current = true;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setLastPaidAmount(data.amount); // Lưu số tiền đã nhận
          if (speechEnabledRef.current) speakAmount(data.amount, undefined); // Phát giọng nói nếu bật
          await submitOrderReceipt();
          addOrder(isCashPolling ? cartItems : cartItems, isCashPolling ? 'CASH' : 'QR_CODE');
          setPaymentConfirmed(true);
          setIsCashPolling(false);
          setSnapshotItems(cartItems);
          // Đảm bảo giờ Việt Nam khi tạo hóa đơn
          setSnapshotTime(new Date());
          setSnapshotTransactionId(transactionId);
          setTimeout(() => {
            clearCart();
          }, 500);
        }
      } catch {}
    };
    intervalRef.current = setInterval(checkStatus, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [transactionId, paymentConfirmed, totalPrice, cartItems, addOrder, clearCart, isSpeechReady, isCashPolling]);
// Load Azure Speech SDK script nếu chưa có
if (typeof window !== 'undefined' && !window.SpeechSDK) {
  const script = document.createElement('script');
  script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
  script.async = true;
  document.head.appendChild(script);
}

  useEffect(() => {
    if (cartItems.length === 0 && !paymentConfirmed) {
      navigate('/');
    }
  }, [cartItems, paymentConfirmed, navigate]);

  // Reset flags khi component unmount hoặc khi bắt đầu giao dịch mới
  useEffect(() => {
    return () => {
      hasSpokenRef.current = false;
      isProcessingPaymentRef.current = false;
    };
  }, []);

  // Reset flags khi transactionId thay đổi (giao dịch mới)
  useEffect(() => {
    if (transactionId) {
      hasSpokenRef.current = false;
      isProcessingPaymentRef.current = false;
    }
  }, [transactionId]);

  const handleConfirmPayment = () => {
    if (!transactionId) {
      alert('Không có mã giao dịch. Vui lòng thử lại!');
      return;
    }
    
    // Kiểm tra nếu đã đang xử lý thanh toán thì không làm gì
    if (isProcessingPaymentRef.current) {
      return;
    }
    
  fetch(`/api/Banking/get/id/${transactionId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Không kiểm tra được trạng thái giao dịch');
        const data = await res.json();
        if (data.amount >= totalPrice) {
          // Kiểm tra lại lần nữa để tránh race condition
          if (isProcessingPaymentRef.current) {
            return;
          }
          isProcessingPaymentRef.current = true;
          hasSpokenRef.current = true;
          
          // Dừng polling nếu đang chạy
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          setLastPaidAmount(data.amount); // Lưu số tiền đã nhận
          if (speechEnabledRef.current) speakAmount(data.amount, undefined); // Phát giọng nói nếu bật
          await submitOrderReceipt();
          addOrder(cartItems, 'QR_CODE');
          setPaymentConfirmed(true);
          setSnapshotItems(cartItems);
          setSnapshotTime(new Date());
          setSnapshotTransactionId(transactionId);
          setTimeout(() => {
            clearCart();
          }, 500);
        } else {
          alert('Chưa nhận đủ tiền cho mã giao dịch này. Vui lòng kiểm tra lại!');
        }
      })
      .catch((err) => {
        alert('Lỗi kiểm tra giao dịch: ' + err.message);
      });
  };

  const handleCashPayment = () => {
    if (!transactionId) {
      alert('Không có mã giao dịch. Vui lòng thử lại!');
      return;
    }
  fetch(`/api/Banking/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: totalPrice,
        transactionId: transactionId,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Gửi thanh toán thất bại');
        // Sau khi post thành công, bắt đầu polling để chờ nhận tiền mặt
        setIsCashPolling(true);
      })
      .catch((err) => {
        alert('Lỗi khi gửi thanh toán tiền mặt: ' + err.message);
      });
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const hasFetched = useRef(false);
  useEffect(() => {
  if (totalPrice > 0 && cartItems.length > 0 && !hasFetched.current) {
    hasFetched.current = true;
    fetch(`/api/Banking/create?amount=${totalPrice}`, {
      method: 'GET'
    })
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

  useEffect(() => {
    // Không tự động chuyển trang khi paymentConfirmed, chỉ chuyển sau khi đọc xong TTS
  }, []);

  const allowedRoles = ['admin', 'manager', 'staff'];
  const canAcceptCash = user && allowedRoles.includes(user.role.toLowerCase());

  // Đã chuyển speakAmount vào polling, không cần gọi ở đây nữa để tránh lặp

  if (paymentConfirmed) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          items={snapshotItems}
          total={lastPaidAmount || totalPrice}
          cashier={(user?.role || 'staff').toString()}
          transactionId={snapshotTransactionId || transactionId || (typeof createdOrderId === 'number' ? String(createdOrderId) : null)}
          createdAt={snapshotTime ? snapshotTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
  <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
  <p className="text-gray-600 mb-6">Bạn đã thanh toán thành công. Cảm ơn bạn đã mua và sử dụng sản phẩm.</p>
        <p className="text-gray-500 mb-6">Bạn sẽ được chuyển về trang chủ sau {countdown} giây.</p>
        <div className="flex items-center justify-center gap-3 mb-6">
          <button onClick={() => setShowReceipt(true)} className="px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-md hover:bg-gray-200">
            In hóa đơn
          </button>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Thanh toán</h1>
      {/* Voice toggle removed from checkout page per UX request */}
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
            <div className="p-4 md:p-6 border rounded-lg max-w-md w-full mx-auto bg-white">
              {transactionId ? (
                <>
                  <div className="flex items-center justify-center py-2">
                    <img 
                      src={qrCodeUrl}
                      alt="QR Code thanh toán"
                      className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 max-w-full"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="mt-3 px-3 py-2 bg-gray-50 rounded text-center break-all text-sm">
                    <div className="text-gray-600">Mã giao dịch:</div>
                    <div className="text-blue-600 font-medium mt-1">{transactionId}</div>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">Đang tạo mã QR...</div>
              )}
            </div>
            {/* Confirm button removed per UX request */}
            {canAcceptCash && (
              <button 
                onClick={handleCashPayment} 
                className="mt-4 w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
              >
                Thanh toán bằng tiền mặt
              </button>

            )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
