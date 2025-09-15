import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useProducts } from '../hooks/useProducts';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { editProduct, products } = useProducts();

  useEffect(() => {
    if (product) {
        setName(product.name);
        setPrice(product.price.toString());
        setDescription(product.description);
        setCategory(product.category);
        setImageUrl(product.imageUrl);
    }
  }, [product]);

  const existingCategories = useMemo(() => {
    const allCategories = products.map(p => p.category);
    return [...new Set(allCategories)].sort();
  }, [products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseInt(price, 10);
    if (!name || isNaN(numericPrice) || numericPrice < 0 || !description || !category) {
      alert('Vui lòng điền đầy đủ và chính xác thông tin.');
      return;
    }
    editProduct(product.id, { name, price: numericPrice, description, category, imageUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="editProductModalTitle">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md animate-fade-in">
        <h2 id="editProductModalTitle" className="text-2xl font-bold text-center text-gray-800 mb-6">Chỉnh sửa món ăn</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">Tên món ăn</label>
            <input type="text" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-price">Giá (VND)</label>
            <input type="number" id="edit-price" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" required min="0" />
          </div>
           <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-imageUrl">URL Hình ảnh</label>
            <input type="url" id="edit-imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" required />
          </div>
           <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-category">Danh mục</label>
            <input 
              type="text" 
              id="edit-category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" 
              required 
              placeholder="ví dụ: Món chính, Món ăn vặt..."
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              {existingCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">Mô tả</label>
            <textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-200" required rows={3} />
          </div>
          <div className="flex items-center justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors">Hủy</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;