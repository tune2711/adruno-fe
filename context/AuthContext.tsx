import React, { createContext, useState, ReactNode, useMemo, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'manager' | 'customer';
  password?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password?: string) => Promise<boolean>;
  addUser: (email: string, role: 'staff' | 'manager', password?: string) => void;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: 'staff' | 'manager' | 'customer') => void;
  updateUserPassword: (userId: string, newPassword: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: 'user-0', email: 'admin@gmail.com', role: 'admin', password: '1' },
    { id: 'user-1', email: 'staff@gmail.com', role: 'staff', password: 'staff' },
    { id: 'user-2', email: 'manager@gmail.com', role: 'manager', password: 'manager' },
];

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Lỗi giải mã token:", e);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const login = useCallback(async (email: string, password?: string) => {
    try {
      const response = await fetch('/api/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        if (token) {
          const decoded = parseJwt(token);
          if (decoded) {
            const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
            const userToSet: User = {
              id: decoded.sub || decoded.jti, 
              email: decoded.email,
              role: (roleClaim?.toLowerCase() as User['role']) || 'customer',
              token: token,
            };
            setUser(userToSet);
            return true;
          }
        }
        setUser(null);
        return false;
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.message || 'Email hoặc mật khẩu không đúng.');
        } catch (e) {
          console.error('Phản hồi lỗi đăng nhập không phải là JSON:', errorText);
          alert('Đã có lỗi từ server. Vui lòng thử lại.');
        }
        return false;
      }
    } catch (error) {
      console.error('Lỗi fetch khi đăng nhập:', error);
      alert('Đã xảy ra lỗi trong quá trình đăng nhập.');
      return false;
    }
  }, []);

  const register = useCallback(async (email: string, password?: string) => {
    try {
      const response = await fetch('/api/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role: 'customer' }), // Đã thêm role: 'customer'
      });

      if (response.ok) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        return true;
      } else {
        const errorData = await response.json();
        // Cố gắng hiển thị lỗi cụ thể từ server, nếu không thì hiển thị lỗi chung
        const message = errorData.errors ? Object.values(errorData.errors).flat().join(' ') : (errorData.message || 'Đăng ký không thành công.');
        alert(message);
        return false;
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      alert('Đã xảy ra lỗi trong quá trình đăng ký.');
      return false;
    }
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const addUser = useCallback((email: string, role: 'staff' | 'manager', password?: string) => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert('Email đã tồn tại.');
        return;
    }
    const newUser: User = { id: `user-${Date.now()}`, email, role, password: password || 'password123' };
    setUsers(prev => [...prev, newUser]);
  }, [users]);

  const deleteUser = useCallback((userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'admin') {
        alert('Không thể xóa tài khoản admin chính.');
        return;
    }
     if (user?.id === userId) {
        alert('Bạn không thể xóa chính mình.');
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, [users, user]);
  
  const updateUserRole = useCallback((userId: string, newRole: 'staff' | 'manager' | 'customer') => {
      setUsers(prevUsers => prevUsers.map(u => {
          if (u.id === userId && u.role !== 'admin') {
              return { ...u, role: newRole };
          }
          return u;
      }));
  }, []);
  
  const updateUserPassword = useCallback((userId: string, newPassword: string) => {
    const userToUpdate = users.find(u => u.id === userId && (u.role === 'staff' || u.role === 'manager'));

    if (userToUpdate) {
        setUsers(prevUsers => 
            prevUsers.map(u => 
                u.id === userId ? { ...u, password: newPassword } : u
            )
        );
        return true;
    }
    
    return false;
  }, [users]);

  const isAuthenticated = !!user;

  const contextValue = useMemo(() => ({ 
      user, 
      users, 
      isAuthenticated, 
      login, 
      logout, 
      register,
      addUser, 
      deleteUser,
      updateUserRole,
      updateUserPassword,
  }), [user, users, isAuthenticated, login, logout, register, addUser, deleteUser, updateUserRole, updateUserPassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
