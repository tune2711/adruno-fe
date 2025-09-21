import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LOGO_URL } from '../assets';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError(null);
    
    const result = await register(email, password);
    
    setLoading(false);
    if (result.success) {
        navigate('/login');
    } else {
        setError(result.message || 'Đăng ký không thành công.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full">
          <div className="text-center mb-8">
              <Link to="/" className="inline-block" aria-label="Trang chủ Night Food">
                  <img src={LOGO_URL} alt="Night Food Logo" className="w-48 mx-auto" />
              </Link>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng ký tài khoản</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-gray-50 border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    error && error.includes('Email') ? 'border-red-500' : ''
                  }`}
                  required
                  placeholder="email@example.com"
                />
                {error && error.includes('Email') && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  required
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirm-password">
                  Xác nhận Mật khẩu
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`bg-gray-50 border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    error && error.includes('khớp') ? 'border-red-500' : ''
                  }`}
                  required
                  placeholder="••••••••"
                />
                {error && error.includes('khớp') && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
              </div>
            </form>
            <p className="text-center text-gray-600 text-sm mt-8">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
      </div>
    </div>
  );
};

export default RegisterPage;