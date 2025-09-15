import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-center items-center text-sm text-gray-500">
           <p className="text-center">© {new Date().getFullYear()} Cửa Hàng Ăn Đêm. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;