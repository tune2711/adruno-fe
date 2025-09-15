
import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const HomePage: React.FC = () => {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState(''); // Giá trị nhập vào tức thì
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery); // Giá trị đã được debounce để lọc

  // Hiệu ứng Debounce để trì hoãn việc cập nhật query lọc
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // Đợi 300ms sau khi người dùng ngừng gõ

    return () => {
      clearTimeout(handler); // Hủy timeout nếu người dùng gõ tiếp
    };
  }, [searchQuery]);

  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category);
    return ['Tất cả', ...Array.from(new Set(allCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Lọc theo danh mục
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Lọc theo từ khóa tìm kiếm đã được debounce
    if (debouncedQuery.trim() !== '') {
      result = result.filter(p =>
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }

    return result;
  }, [products, selectedCategory, debouncedQuery]); // Chỉ tính toán lại khi debouncedQuery thay đổi

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Search and Filter Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800 shrink-0">Thực đơn đêm nay</h1>
          <div className="relative w-full md:max-w-sm group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Tìm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-sm"
              aria-label="Tìm kiếm sản phẩm"
            />
            {searchQuery && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    aria-label="Xóa tìm kiếm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div key={selectedCategory + debouncedQuery} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="animate-fade-in">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Không tìm thấy món ăn phù hợp</h2>
          <p className="mt-2 text-gray-500">Vui lòng thử tìm kiếm với từ khóa khác hoặc đổi danh mục nhé.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
