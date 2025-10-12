import React from 'react';
import { CartItem } from '../types';
import { LOGO_URL } from '../assets';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  cashier: string; // expect role: admin | staff | manager
  transactionId: string | null; // show as mã đơn
  // createdAt may be a Date object or a string from API/UI
  createdAt: string | Date | null;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, items, total, cashier, transactionId, createdAt }) => {
  if (!isOpen) return null;

  // Nếu là chuỗi kiểu 'YYYY-MM-DD HH:mm:ss' thì hiển thị nguyên xi
  const isDbString = (val: any) => typeof val === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val);
  let createdDisplay = '-';
  if (createdAt) {
    if (isDbString(createdAt)) {
      createdDisplay = createdAt; // Hiển thị nguyên xi chuỗi gốc
    } else if (createdAt instanceof Date) {
      createdDisplay = createdAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    } else if (typeof createdAt === 'string') {
      // Nếu là chuỗi khác, thử parse sang Date
      const d = new Date(createdAt);
      createdDisplay = !isNaN(d.getTime()) ? d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : createdAt;
    }
  }

  return (
    <div id="receipt-print-root" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <style>
        {`@media print {
            @page { margin: 0; }
            html, body { width: 100%; height: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
            body * { visibility: hidden; }
            #receipt-print-root, #receipt-print-root * { visibility: visible; }
            #receipt-print-root { position: fixed; inset: 0; height: 100vh; display: flex; align-items: flex-start; justify-content: center; background: transparent !important; padding: 16px 0 0 0; }
            #receipt-print-area { width: 100%; max-width: 480px; margin: 0 auto; padding: 24px; box-shadow: none; page-break-inside: avoid; break-inside: avoid; }
            .no-print { display: none !important; visibility: hidden !important; }
        }`}
      </style>
      <div id="receipt-print-area" className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
        <div className="p-5">
          <div className="flex items-center justify-center mb-2">
            <img src={LOGO_URL} alt="Logo" className="h-10 md:h-12 w-auto" />
          </div>
          <h2 className="text-center text-gray-800 font-semibold">Phiếu thanh toán</h2>
          <div className="mt-4 text-sm text-gray-700 space-y-1">
            <div>Thu ngân : <span className="font-medium">{cashier || '-'}</span></div>
            <div>
              Ngày tạo: <span className="font-medium">{createdDisplay}</span>
            </div>
            <div>Mã đơn: <span className="font-medium break-all">{transactionId || '-'}</span></div>
          </div>

          <div className="mt-4 border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="p-2 text-left">Tên</th>
                  <th className="p-2 text-center">SL</th>
                  <th className="p-2 text-right">Tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2 text-gray-800">{item.name}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 p-3 border rounded text-gray-800 font-semibold flex items-center justify-between">
            <span>Thành tiền:</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">software by nightfood</div>
        </div>
        <div className="border-t p-3 flex items-center justify-end gap-2 no-print">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm">Đóng</button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm">In</button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;


