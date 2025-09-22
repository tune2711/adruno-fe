import React, { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const HomePage: React.FC = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  const categories = useMemo(() => {
    const preferredOrder = ['Tất cả', 'Món chính', 'Món ăn vặt', 'Đồ uống', 'Tráng miệng'];
    const productCategories = [...new Set(products.map(p => p.category))];
    const orderedCategories = preferredOrder.filter(cat => cat === 'Tất cả' || productCategories.includes(cat));
    productCategories.forEach(cat => {
      if (!preferredOrder.includes(cat)) {
        orderedCategories.push(cat);
      }
    });
    return orderedCategories;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product =>
        selectedCategory === 'Tất cả' || product.category === selectedCategory
      )
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, searchTerm, selectedCategory]);

  if (loading) {
    return <div className="container mx-auto text-center p-8">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="container mx-auto text-center p-8 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div>
      {/* Sticky Filter Bar */}
      <div className="bg-white shadow-sm sticky top-[88px] z-40">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col md:flex-row gap-4 items-center self-start md:self-center">
              <h1 className="text-3xl font-bold text-gray-800 flex-shrink-0 self-start md:self-center">
                Thực đơn
              </h1>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}>
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Tìm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center col-span-full py-16">
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
