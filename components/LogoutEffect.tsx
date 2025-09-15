import React from 'react';

const LogoutEffect: React.FC = () => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[999] flex flex-col justify-center items-center animate-overlay-fade-in p-4"
      role="status"
      aria-live="assertive"
    >
      <div className="bg-white text-center p-10 rounded-xl shadow-2xl animate-logout-pop w-full max-w-xs sm:max-w-sm">
        <svg className="spinner h-12 w-12 mb-5 mx-auto" viewBox="0 0 50 50">
          <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
        </svg>
        <h1 className="text-2xl font-bold text-gray-800">Đang đăng xuất</h1>
        <p className="text-gray-500 text-sm mt-1">Vui lòng chờ...</p>
      </div>
    </div>
  );
};

export default LogoutEffect;
