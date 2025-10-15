import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import LogoutEffect from './LogoutEffect';
import { LOGO_URL } from '../assets';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    setTimeout(() => {
      navigate('/');
      setIsLoggingOut(false);
    }, 1500);
  };
  
  const userRole = user?.role?.toLowerCase();

  // Icons
  const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M1 18a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H1.75A.75.75 0 011 18zM4.75 3a.75.75 0 01.75.75v11.5a.75.75 0 01-1.5 0V3.75A.75.75 0 014.75 3zM9.25 6a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0V6.75A.75.75 0 019.25 6zM14.25 9a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>;
  const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;
  const LoginIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center shrink-0" aria-label="Trang chủ Night Food">
            <img src={LOGO_URL} alt="Night Food Logo" className="logo-img" />
          </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
            {(userRole === 'admin' || userRole === 'staff' || userRole === 'manager') && (
              <Link to="/admin" className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-100">
                <AdminIcon />
                <span className="hidden sm:inline">Quản lý</span>
              </Link>
            )}
            <Link id="site-cart-icon" to="/cart" className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-300" aria-label="Xem giỏ hàng">
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <button onClick={handleLogout} disabled={isLoggingOut} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:bg-gray-400">
                <LogoutIcon/> <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <LoginIcon/> <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
          </div>
        </nav>
      </header>
      {isLoggingOut && <LogoutEffect />}
    </>
  );
};

export default Header;
