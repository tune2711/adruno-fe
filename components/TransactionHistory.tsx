import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Define the transaction type
interface Transaction {
    transactionId: string; 
    amount: number;
    description: string;
    bank: string;
    timestamp: string; // ISO string date
    userName: string;
}

// Define the error object type
interface FetchError {
  title: string;
  message: string;
  details: string;
}

const API_BASE_URL = '/api/Banking'; // Define base URL for the API
const ITEMS_PER_PAGE = 10;

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactElement; color?: 'orange' | 'green' }> = ({ title, value, icon, color = 'orange' }) => {
    const colorStyles = {
        orange: {
            bg: 'bg-orange-100',
            text: 'text-orange-500',
            valueText: 'text-orange-600',
        },
        green: {
            bg: 'bg-green-100',
            text: 'text-green-500',
            valueText: 'text-green-600',
        },
    };

    const styles = colorStyles[color];

    return (
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <div className={`${styles.bg} ${styles.text} rounded-full p-3 mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className={`font-bold ${styles.valueText}`}>{value}</p>
            </div>
        </div>
    );
};

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<FetchError | null>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
    const [dateFilter, setDateFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/get`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                cache: 'no-cache',
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                let detailMessage = `Phản hồi từ máy chủ: ${errorText.substring(0, 300)}`;
                if (errorText.trim().startsWith('<!DOCTYPE html>')) {
                    detailMessage = "Máy chủ đã trả về một trang HTML thay vì dữ liệu JSON.";
                }
                throw new Error(`Lỗi HTTP: ${response.status} ${response.statusText}. ${detailMessage}`);
            }
            const data: Transaction[] = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setTransactions(sortedData);
        } catch (err: any) {
            let detailedError: FetchError = {
                title: 'Đã xảy ra lỗi!',
                message: 'Không thể tải lịch sử giao dịch.',
                details: ''
            };
            if (err instanceof SyntaxError) {
                 detailedError.title = 'Lỗi Dữ liệu Trả về';
                 detailedError.message = 'Máy chủ trả về dữ liệu không hợp lệ (không phải JSON).';
                 detailedError.details = `URL: <code>${API_BASE_URL}/get</code>.`;
            } else if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
                 detailedError.title = 'Lỗi kết nối hoặc CORS';
                 detailedError.message = 'Không thể kết nối đến máy chủ API.';
            } else if (err instanceof Error) {
                detailedError.message = err.message;
            }
            setError(detailedError);
            console.error('Không thể lấy lịch sử giao dịch:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let startDate: Date;

            switch (dateFilter) {
                case 'today':
                    startDate = today;
                    break;
                case 'week':
                    startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                     startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }
            
            filtered = filtered.filter(tx => new Date(tx.timestamp) >= startDate);
        }
        
        if (debouncedQuery.trim()) {
            const lowercasedQuery = debouncedQuery.toLowerCase();
            filtered = filtered.filter(tx => 
                tx.description.toLowerCase().includes(lowercasedQuery) ||
                tx.transactionId.toLowerCase().includes(lowercasedQuery)
            );
        }

        return filtered;
    }, [transactions, debouncedQuery, dateFilter]);
    
    const summaryStats = useMemo(() => {
        const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalTransactions = filteredTransactions.length;
        return { totalAmount, totalTransactions };
    }, [filteredTransactions]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    
    const handleRefresh = () => {
      setSearchQuery('');
      setDateFilter('all');
      setCurrentPage(1);
      fetchTransactions();
    };

    const handleDelete = async (transactionId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/delete/${transactionId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Lỗi xóa giao dịch ${transactionId}:`, response.status, errorText);
                throw new Error(`Xóa thất bại. Server: ${errorText || response.statusText}`);
            }
            setTransactions(prev => prev.filter(tx => tx.transactionId !== transactionId));
            alert('Xóa giao dịch thành công!');
        } catch (err: any) {
            alert(`Không thể xóa giao dịch: ${err.message}`);
            console.error(err);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center p-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
                    <p className="ml-4 text-gray-600 text-lg">Đang tải dữ liệu...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 animate-fade-in" role="alert">
                    <p className="font-bold text-lg text-red-800">{error.title}</p>
                    <p className="mt-1 text-red-800">{error.message}</p>
                    {error.details && <div className="mt-2" dangerouslySetInnerHTML={{ __html: error.details }} />}
                </div>
            );
        }

        if (transactions.length > 0 && paginatedTransactions.length === 0) {
           return (
                <div className="text-center py-16 animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">Không tìm thấy giao dịch</h2>
                    <p className="mt-2 text-gray-500">Không có giao dịch nào phù hợp với bộ lọc hiện tại.</p>
                </div>
           );
        }
        
        if (transactions.length === 0) {
            return (
                <div className="text-center py-16 animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 002 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10" />
                    </svg>
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">Không có giao dịch nào</h2>
                    <p className="mt-2 text-gray-500">Chưa có giao dịch nào được ghi nhận.</p>
                </div>
            );
        }

        return (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Thời gian</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Số tiền</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Mô tả</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase hidden md:table-cell">Ngân hàng</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase hidden lg:table-cell">ID Giao dịch</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Người chuyển</th>
                                <th className="p-3 font-semibold text-sm text-gray-600 uppercase">Xóa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedTransactions.map(tx => (
                                <tr key={tx.transactionId} className="hover:bg-gray-50">
                                    <td className="p-3 text-gray-600 whitespace-nowrap">{formatDate(tx.timestamp)}</td>
                                    <td className="p-3 text-green-600 font-semibold whitespace-nowrap">{formatPrice(tx.amount)}</td>
                                    <td className="p-3 text-gray-800 font-medium">{tx.description}</td>
                                    <td className="p-3 text-gray-600 hidden md:table-cell">{tx.bank}</td>
                                    <td className="p-3 font-mono text-gray-500 break-all hidden lg:table-cell text-base font-semibold">{tx.transactionId}</td>
                                    <td className="p-3">{tx.userName}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleDelete(tx.transactionId)}
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                            title="Xóa giao dịch"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                         <span className="text-sm text-gray-600">
                            Trang <span className="font-semibold">{currentPage}</span> / <span className="font-semibold">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                             <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }
    
    const dateFilters = [
        { key: 'all', label: 'Tất cả' },
        { key: 'today', label: 'Hôm nay' },
        { key: 'week', label: '7 ngày qua' },
        { key: 'month', label: '30 ngày qua' },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Lịch sử giao dịch</h2>
                <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 4s0-2-2-2-2 2-2 2M4 20s0 2 2 2 2-2 2-2" /></svg>
                    Làm mới
                </button>
            </div>
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm theo mô tả, ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
                        />
                    </div>
                </div>
                 <div>
                    <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                      {dateFilters.map(filter => (
                        <button
                          key={filter.key}
                          onClick={() => { setDateFilter(filter.key); setCurrentPage(1); }}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            dateFilter === filter.key
                              ? 'bg-orange-500 text-white shadow'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                </div>
            </div>

            {!loading && !error && transactions.length > 0 &&
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <StatCard title="Tổng giao dịch" value={summaryStats.totalTransactions.toLocaleString('vi-VN')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                    <StatCard title="Tổng tiền" value={formatPrice(summaryStats.totalAmount)} color="green" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                </div>
            }

            {renderContent()}
        </div>
    );
};

export default TransactionHistory;