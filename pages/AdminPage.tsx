import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { User } from '../context/AuthContext';
import { Product } from '../types';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import EditProductModal from '../components/EditProductModal';
import TransactionHistory from '../components/TransactionHistory';
import ReceiptModal from '../components/ReceiptModal';
import RevenueChart from '../components/RevenueChart';

// Helper to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// =================================================================================
// Revenue & Sales Components
// =================================================================================

const StatCard: React.FC<{ title: string; value: string; icon: Element }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-orange-100 text-orange-500 rounded-full p-3 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// ...existing code...
// ...existing code...

const RevenueDashboard: React.FC = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/Banking/get')
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let dailyRevenue = 0;
    let monthlyRevenue = 0;
    let totalRevenue = 0;

    transactions.forEach((tx: any) => {
        const txDate = new Date(tx.timestamp);
        totalRevenue += tx.amount;
        if (txDate >= today) dailyRevenue += tx.amount;
        if (txDate >= startOfMonth) monthlyRevenue += tx.amount;
    });

    // Tuỳ chọn loại biểu đồ: 'week' hoặc 'month'
                                            const [chartType, setChartType] = useState<'week'|'month'|'year'>('week');
    let chartLabels: string[] = [];
    let chartValues: number[] = [];
    if (chartType === 'week') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            chartLabels.push(label);
            const sum = transactions
                .filter((tx: any) => {
                    const txDate = new Date(tx.timestamp);
                    return txDate.getFullYear() === d.getFullYear() && txDate.getMonth() === d.getMonth() && txDate.getDate() === d.getDate();
                })
                .reduce((s: number, tx: any) => s + tx.amount, 0);
            chartValues.push(sum);
        }
    } else if (chartType === 'month') {
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            chartLabels.push(label);
            const sum = transactions
                .filter((tx: any) => {
                    const txDate = new Date(tx.timestamp);
                    return txDate.getFullYear() === d.getFullYear() && txDate.getMonth() === d.getMonth() && txDate.getDate() === d.getDate();
                })
                .reduce((s: number, tx: any) => s + tx.amount, 0);
            chartValues.push(sum);
        }
    } else if (chartType === 'year') {
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
            chartLabels.push(label);
            const sum = transactions
                .filter((tx: any) => {
                    const txDate = new Date(tx.timestamp);
                    return txDate.getFullYear() === d.getFullYear() && txDate.getMonth() === d.getMonth();
                })
                .reduce((s: number, tx: any) => s + tx.amount, 0);
            chartValues.push(sum);
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Doanh thu hôm nay" value={formatPrice(dailyRevenue)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Doanh thu tháng này" value={formatPrice(monthlyRevenue)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <StatCard title="Tổng doanh thu" value={formatPrice(totalRevenue)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            </div>
            {/* Biểu đồ doanh thu */}
            <div className="bg-white p-4 rounded-lg shadow mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">Biểu đồ doanh thu {
                        chartType === 'week' ? '7 ngày gần nhất'
                        : chartType === 'month' ? '30 ngày gần nhất'
                        : '12 tháng gần nhất'
                    }</h3>
                    <button onClick={() => setChartType('week')} className={`px-3 py-1 rounded ${chartType==='week'?'bg-orange-500 text-white':'bg-gray-200 text-gray-700'}`}>7 ngày</button>
                    <button onClick={() => setChartType('month')} className={`px-3 py-1 rounded ${chartType==='month'?'bg-orange-500 text-white':'bg-gray-200 text-gray-700'}`}>30 ngày</button>
                    <button onClick={() => setChartType('year')} className={`px-3 py-1 rounded ${chartType==='year'?'bg-orange-500 text-white':'bg-gray-200 text-gray-700'}`}>12 tháng</button>
                </div>
                <div style={{ width: '100%', maxWidth: 900 }}>
                    <RevenueChart data={{ labels: chartLabels, values: chartValues }} />
                </div>
            </div>
        </div>
    );
};

const StaffDailyIncome: React.FC = () => {
    const { orders } = useOrders();
    const dailyRevenue = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return orders
            .filter(order => order.date >= today)
            .reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0), 0);
    }, [orders]);

    return (
        <div className="animate-fade-in">
             <StatCard title="Thu nhập hôm nay" value={formatPrice(dailyRevenue)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
        </div>
    );
};

const StaffMonthlyIncome: React.FC = () => {
    const { orders } = useOrders();
    const monthlyRevenue = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return orders
            .filter(order => order.date >= startOfMonth)
            .reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0), 0);
    }, [orders]);

    return (
        <div className="animate-fade-in">
             <StatCard title="Thu nhập tháng này" value={formatPrice(monthlyRevenue)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        </div>
    );
};


// =================================================================================
// Orders History (GET /api/Orders)
// =================================================================================
const OrdersHistory: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const role = (user?.role || '').toLowerCase();
    const canDelete = role === 'admin' || role === 'manager';
    const canPrint = role === 'admin' || role === 'manager' || role === 'staff';
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptItems, setReceiptItems] = useState<any[]>([]);
    const [receiptTotal, setReceiptTotal] = useState<number>(0);
    const [receiptCreatedAt, setReceiptCreatedAt] = useState<Date | null>(null);
    const [receiptTxId, setReceiptTxId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/Orders', {
                    headers: user?.token ? { 'Authorization': `Bearer ${user.token}` } : undefined,
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `HTTP ${res.status}`);
                }
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : (data?.items ?? []));
            } catch (e: any) {
                setError(e?.message || 'Không tải được lịch sử đơn hàng');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.token]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const getTransactionId = (o: any) => {
        return (
            o?.bankingTransactionId ||
            o?.bankingTransactionID ||
            o?.transactionId ||
            o?.bankTransactionId ||
            o?.bankingCode ||
            o?.paymentTransactionId ||
            o?.paymentCode ||
            '-'
        );
    };
    const getCreatedAt = (o: any) => o?.createdAt || o?.createdDate || o?.orderDate || o?.date || o?.timestamp || '';
    const getItemCount = (o: any) => {
        const numericFromKeys = (keys: string[]) => {
            for (const k of keys) {
                const v = o?.[k];
                if (typeof v === 'number' && !isNaN(v)) return v;
            }
            return null;
        };
        const fromKeys = numericFromKeys(['itemCount', 'itemsCount', 'totalItems', 'totalItem', 'totalQuantity', 'quantityTotal', 'count']);
        if (fromKeys != null) return fromKeys;
        if (Array.isArray(o?.items)) {
            const hasQuantity = o.items.some((it: any) => typeof it?.quantity === 'number');
            if (hasQuantity) return o.items.reduce((s: number, it: any) => s + (Number(it?.quantity) || 0), 0);
            return o.items.length;
        }
        if (Array.isArray(o?.orderItems)) {
            const hasQuantity = o.orderItems.some((it: any) => typeof it?.quantity === 'number');
            if (hasQuantity) return o.orderItems.reduce((s: number, it: any) => s + (Number(it?.quantity) || 0), 0);
            return o.orderItems.length;
        }
        return 0;
    };
    const getTotalAmount = (o: any) => {
        if (typeof o?.totalAmount === 'number') return o.totalAmount;
        if (Array.isArray(o?.items)) {
            const sum = o.items.reduce((s: number, it: any) => {
                const qty = Number(it?.quantity ?? 1);
                const price = Number(it?.price ?? 0);
                return s + (isNaN(qty * price) ? 0 : qty * price);
            }, 0);
            return sum > 0 ? sum : null;
        }
        return null;
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
    };

    const handlePrint = async (o: any) => {
        // Hiển thị UI hóa đơn giống ở trang thanh toán
        const itemsSource = Array.isArray(o?.items) ? o.items : (Array.isArray(o?.orderItems) ? o.orderItems : []);
        const transformed = itemsSource.map((it: any, idx: number) => ({
            id: it?.productId ?? idx,
            name: it?.name ?? it?.productName ?? `Sản phẩm #${it?.productId ?? idx+1}`,
            price: Number(it?.price ?? 0),
            imageUrl: '',
            description: '',
            category: '',
            quantity: Number(it?.quantity ?? 1),
        }));
        setReceiptItems(transformed);
        const total = getTotalAmount(o) ?? transformed.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
        setReceiptTotal(total);
        // Lấy đúng chuỗi giờ VN đã hiển thị ngoài bảng
        let createdText = '-';
        const created = getCreatedAt(o);
        if (created) {
          const utcDate = typeof created === 'string' ? new Date(created.replace(' ', 'T') + 'Z') : new Date(created);
          createdText = utcDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        }
        setReceiptCreatedAt(createdText);
        setReceiptTxId(getTransactionId(o));
        setShowReceipt(true);
    };

    const handleDelete = async (o: any) => {
        if (!canDelete) return;
        const id = o?.id;
        if (id == null) {
            alert('Không xác định được mã đơn để xóa');
            return;
        }
        if (!confirm(`Bạn có chắc muốn xóa đơn #${id}?`)) return;
        try {
            const res = await fetch(`/api/Orders/${id}`, {
                method: 'DELETE',
                headers: user?.token ? { 'Authorization': `Bearer ${user.token}` } : undefined,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setOrders(prev => prev.filter((x: any) => x?.id !== id));
        } catch (e: any) {
            alert('Xóa đơn thất bại: ' + (e?.message || ''));
        }
    };

    // Derived filtered list like TransactionHistory
    const filteredOrders = useMemo(() => {
        let list = orders as any[];
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let start: Date;
            if (dateFilter === 'today') start = today;
            else if (dateFilter === 'week') start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            else start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            list = list.filter(o => new Date(getCreatedAt(o)) >= start);
        }
        if (debouncedQuery.trim()) {
            const q = debouncedQuery.toLowerCase();
            list = list.filter(o => String(o?.id ?? '').toLowerCase().includes(q) || String(getTransactionId(o)).toLowerCase().includes(q));
        }
        return list;
    }, [orders, debouncedQuery, dateFilter]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <div className="flex items-center justify-between mb-4 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Lịch sử đơn hàng</h2>
                <button
                    onClick={async () => {
                        try {
                            setLoading(true);
                            setError(null);
                            const res = await fetch('/api/Orders', {
                                headers: user?.token ? { 'Authorization': `Bearer ${user.token}` } : undefined,
                            });
                            if (!res.ok) {
                                const text = await res.text();
                                throw new Error(text || `HTTP ${res.status}`);
                            }
                            const data = await res.json();
                            setOrders(Array.isArray(data) ? data : (data?.items ?? []));
                        } catch (err: any) {
                            setError(err?.message || 'Không tải được lịch sử đơn hàng');
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                    Tải lại
                </button>
            </div>

            {/* Search & Date filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm theo mã đơn, mã giao dịch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
                        />
                    </div>
                </div>
                <div>
                    <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                        {(['all','today','week','month'] as const).map(k => (
                            <button key={k} onClick={() => setDateFilter(k)} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${dateFilter===k?'bg-orange-500 text-white shadow':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {k==='all'?'Tất cả':k==='today'?'Hôm nay':k==='week'?'7 ngày qua':'30 ngày qua'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading && <div>Đang tải...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Mã đơn</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Mã giao dịch</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Thời gian</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Số món</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Tổng tiền</th>
                                {(canPrint || canDelete) && (
                                    <th className="p-3 font-semibold text-sm text-gray-600 uppercase text-right">Hành động</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 && (
                                <tr>
                                    <td className="p-3 text-gray-500" colSpan={5}>Chưa có đơn hàng</td>
                                </tr>
                            )}
                            {filteredOrders.map((o: any) => {
                                                                const total = getTotalAmount(o);
                                                                const created = getCreatedAt(o);
                                                                let createdText = '-';
                                                                if (created) {
                                                                    // Parse as UTC and convert to Vietnam time
                                                                    const utcDate = typeof created === 'string' ? new Date(created.replace(' ', 'T') + 'Z') : new Date(created);
                                                                    createdText = utcDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
                                                                }
                                return (
                                    <tr key={o?.id ?? `${getTransactionId(o)}-${created}`} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{o?.id ?? '-'}</td>
                                        <td className="p-3 text-gray-600 break-all">{getTransactionId(o)}</td>
                                        <td className="p-3 text-gray-600">{createdText}</td>
                                        <td className="p-3 text-gray-600">{getItemCount(o)}</td>
                                        <td className="p-3 text-gray-600">{total != null ? formatPrice(total) : '-'}</td>
                                        {(canPrint || canDelete) && (
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {canPrint && (
                                                        <button onClick={() => handlePrint(o)} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">In</button>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={() => handleDelete(o)} className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Xóa</button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Receipt Modal Preview */}
            <ReceiptModal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                items={receiptItems as any}
                total={receiptTotal}
                cashier={(user?.role || 'staff').toString()}
                transactionId={receiptTxId}
                createdAt={receiptCreatedAt}
            />
        </div>
    );
};

// =================================================================================
// Product Management Component
// =================================================================================
const ProductManagement: React.FC<{ isReadOnly: boolean }> = ({ isReadOnly }) => {
    const { products, deleteProduct } = useProducts();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);

    const handleConfirmDelete = async () => { // Thêm async
        if (productToDelete) {
            try {
                await deleteProduct(productToDelete.id); // Thêm await và try...catch
                setProductToDelete(null); // Chỉ đóng khi thành công
            } catch (error: any) {
                alert(`Lỗi khi xóa: ${error.message}`); // Hiển thị lỗi
            }
        }
    };
    

    return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Danh sách sản phẩm</h2>
                {!isReadOnly && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        Thêm món mới
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Tên món</th>
                            <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Danh mục</th>
                            <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Giá</th>
                            {!isReadOnly && <th className="p-3 font-semibold text-sm text-gray-600 uppercase text-right">Hành động</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-800">{product.name}</td>
                                <td className="p-3 text-gray-600">{product.category}</td>
                                <td className="p-3 text-gray-600">{formatPrice(product.price)}</td>
                                {!isReadOnly && (
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end items-center gap-3">
                                            <button onClick={() => setProductToEdit(product)} className="text-blue-500 hover:text-blue-700" aria-label={`Sửa ${product.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                            <button onClick={() => setProductToDelete(product)} className="text-red-500 hover:text-red-700" aria-label={`Xóa ${product.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} />}
            {productToEdit && <EditProductModal product={productToEdit} onClose={() => setProductToEdit(null)} />}
            {productToDelete && <ConfirmDeleteModal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} onConfirm={handleConfirmDelete} productName={productToDelete.name} />}
        </div>
    );
};

const ChangePasswordModal: React.FC<{ user: User; onClose: () => void; }> = ({ user, onClose }) => {
    const [password, setPassword] = useState('');
    const { updateUserPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!password.trim()) {
            alert('Mật khẩu mới không được để trống.');
            return;
        }
        try {
            // Gọi hàm updateUserPassword từ hook, truyền vào id của user và mật khẩu mới
            await updateUserPassword(user.id, password);
            alert('Đã cập nhật mật khẩu thành công!');
            onClose(); // Đóng modal sau khi thành công
        } catch (error: any) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            alert(`Có lỗi xảy ra khi đổi mật khẩu: ${error.message}`);
        }
    };    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="changePasswordModalTitle">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm animate-fade-in">
                <h2 id="changePasswordModalTitle" className="text-2xl font-bold text-center text-gray-800 mb-6">Đổi mật khẩu cho <br/><span className="font-mono text-base">{user.email}</span></h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new-password">Mật khẩu mới</label>
                        <input 
                            type="password" 
                            id="new-password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors">Hủy</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =================================================================================
// User Management Component
// =================================================================================
const UserManagement: React.FC = () => {
    const { users, addUser, deleteUser, user: currentUser, updateUserRole } = useAuth();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'staff' | 'manager'>('staff');
    const [password, setPassword] = useState('');
    const [userToChangePassword, setUserToChangePassword] = useState<User | null>(null);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            alert('Vui lòng nhập đầy đủ email và mật khẩu.');
            return;
        }
        addUser(email.trim(), role, password.trim());
        setEmail('');
        setPassword('');
    };
    
    const manageableUsers = users.filter(u => u.role !== 'admin');

    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Thêm người dùng mới</h2>
                 <form onSubmit={handleAddUser}>
                    <div className="mb-4">
                        <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email"
                            id="user-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@gmail.com"
                            className="bg-white shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input 
                            type="password"
                            id="user-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            className="bg-white shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select
                            id="user-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'staff' | 'manager')}
                            className="bg-white shadow-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200"
                        >
                            <option value="staff">Nhân viên</option>
                            <option value="manager">Quản lý</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">Thêm người dùng</button>
                 </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Quản lý người dùng</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Email</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Vai trò</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Phân quyền</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {manageableUsers.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800 break-all">{user.email}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.role === 'staff' ? 'bg-blue-100 text-blue-800' : 
                                            user.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {
                                                user.role === 'staff' ? 'Nhân viên' : 
                                                user.role === 'manager' ? 'Quản lý' :
                                                'Khách hàng'
                                            }
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUserRole(user.id, e.target.value as 'staff' | 'manager' | 'customer')}
                                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2"
                                            aria-label={`Phân quyền cho ${user.email}`}
                                        >
                                            <option value="customer">Khách hàng</option>
                                            <option value="staff">Nhân viên</option>
                                            <option value="manager">Quản lý</option>
                                        </select>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {user.role !== 'customer' && (
                                                <button onClick={() => setUserToChangePassword(user)} className="text-gray-500 hover:text-gray-700" aria-label={`Đổi mật khẩu cho ${user.email}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L4.667 19.41A2 2 0 012 17.914V14.5A2 2 0 014 12.5h2.141A6.001 6.001 0 0118 8zm-8 2a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button onClick={() => deleteUser(user.id)} disabled={currentUser?.id === user.id} className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={`Xóa ${user.email}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
            {userToChangePassword && <ChangePasswordModal user={userToChangePassword} onClose={() => setUserToChangePassword(null)} />}
        </div>
    );
};


// =================================================================================
// Main Admin Page Component
// =================================================================================
const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !['admin', 'staff', 'manager'].includes(user.role)) {
            navigate('/');
        }
    }, [user, navigate]);

    const adminTabs = ['Doanh thu', 'Sản phẩm', 'Người dùng', 'Lịch sử giao dịch', 'Lịch sử đơn hàng'];
    const managerTabs = ['Doanh thu', 'Sản phẩm', 'Lịch sử giao dịch', 'Lịch sử đơn hàng'];
    const staffTabs = ['Doanh thu', 'Sản phẩm', 'Lịch sử đơn hàng'];

    const tabs = user?.role === 'admin' ? adminTabs :
                 user?.role === 'manager' ? managerTabs :
                 staffTabs;
    const [activeTab, setActiveTab] = useState(tabs[0]);
    
    useEffect(() => {
        const currentTabs = user?.role === 'admin' ? adminTabs :
                            user?.role === 'manager' ? managerTabs :
                            staffTabs;
        if (!currentTabs.includes(activeTab)) {
            setActiveTab(currentTabs[0]);
        }
    }, [user, activeTab]);

    if (!user || !['admin', 'staff', 'manager'].includes(user.role)) {
        return null; // Render nothing while redirecting
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Trang Quản Lý</h1>

            <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {user.role === 'admin' && (
                    <>
                        {activeTab === 'Doanh thu' && <RevenueDashboard />}
                        {activeTab === 'Sản phẩm' && <ProductManagement isReadOnly={false} />}
                        {activeTab === 'Người dùng' && <UserManagement />}
                        {activeTab === 'Lịch sử giao dịch' && <TransactionHistory />}
                        {activeTab === 'Lịch sử đơn hàng' && <OrdersHistory />}
                    </>
                )}
                {user.role === 'manager' && (
                    <>
                        {activeTab === 'Doanh thu' && <RevenueDashboard />}
                        {activeTab === 'Sản phẩm' && <ProductManagement isReadOnly={false} />}
                        {activeTab === 'Lịch sử giao dịch' && <TransactionHistory />}
                        {activeTab === 'Lịch sử đơn hàng' && <OrdersHistory />}
                    </>
                )}
                {user.role === 'staff' && (
                    <>
                        {activeTab === 'Doanh thu' && <RevenueDashboard />}
                        {activeTab === 'Sản phẩm' && <ProductManagement isReadOnly={true} />}
                        {activeTab === 'Lịch sử đơn hàng' && <OrdersHistory />}
                    </>
                )}
            </div>
        </div>
    );
};

const AddProductModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
        const [name, setName] = useState('');
        const [price, setPrice] = useState('');
        const [description, setDescription] = useState('');
        const [category, setCategory] = useState('');
        const [imageUrl, setImageUrl] = useState('');
        const [loading, setLoading] = useState(false);
        const { addProduct, products } = useProducts();

        const existingCategories = useMemo(() => {
                const allCategories = products.map(p => p.category);
                return [...new Set(allCategories)].sort();
        }, [products]);

        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                const numericPrice = parseInt(price, 10);
                if (!name || isNaN(numericPrice) || numericPrice < 0 || !description || !category) {
                        alert('Vui lòng điền đầy đủ và chính xác thông tin.');
                        return;
                }
                setLoading(true);
                try {
                        await addProduct({ name, price: numericPrice, description, category, imageUrl });
                        alert('Thêm món ăn thành công!');
                        onClose();
                } catch (error: any) {
                        alert('Có lỗi xảy ra khi thêm món ăn: ' + (error?.message || 'Không xác định'));
                } finally {
                        setLoading(false);
                }
        };

        return (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="addProductModalTitle">
                        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md animate-fade-in">
                                <h2 id="addProductModalTitle" className="text-2xl font-bold text-center text-gray-800 mb-6">Thêm món ăn mới</h2>
                                <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Tên món ăn</label>
                                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" required disabled={loading} />
                                        </div>
                                        <div className="mb-4">
                                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Giá (VND)</label>
                                                <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" required min="0" disabled={loading} />
                                        </div>
                                        <div className="mb-4">
                                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">URL Hình ảnh</label>
                                                <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" placeholder="https://..." disabled={loading} />
                                                <p className="text-xs text-gray-500 mt-1">Để trống sẽ sử dụng ảnh mặc định.</p>
                                        </div>
                                        <div className="mb-4">
                                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Danh mục</label>
                                                <input 
                                                        type="text" 
                                                        id="category" 
                                                        value={category} 
                                                        onChange={(e) => setCategory(e.target.value)} 
                                                        className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" 
                                                        required 
                                                        placeholder="ví dụ: Món chính, Món ăn vặt..."
                                                        list="category-suggestions"
                                                        disabled={loading}
                                                />
                                                <datalist id="category-suggestions">
                                                        {existingCategories.map(cat => (
                                                                <option key={cat} value={cat} />
                                                        ))}
                                                </datalist>
                                        </div>
                                        <div className="mb-6">
                                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Mô tả</label>
                                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" required rows={3} disabled={loading} />
                                        </div>
                                        <div className="flex items-center justify-end gap-4">
                                                <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors" disabled={loading}>Hủy</button>
                                                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors" disabled={loading}>{loading ? 'Đang thêm...' : 'Thêm món ăn'}</button>
                                        </div>
                                </form>
                        </div>
                </div>
        );
};


export default AdminPage;