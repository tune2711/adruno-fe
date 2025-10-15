import React, { createContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';

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
  register: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  addUser: (email: string, role: 'staff' | 'manager', password?: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: 'staff' | 'manager' | 'customer') => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async (token: string) => {
    try {
      const { default: apiFetch } = await import('../utils/api');
      const response = await apiFetch('/api/Users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const loggedUser: User = JSON.parse(storedUser);
      setUser(loggedUser);
      if (loggedUser.role === 'admin' && loggedUser.token) {
        fetchUsers(loggedUser.token);
      }
    }
    // react to global unauthorized events (from api wrapper)
    const onUnauthorized = () => {
      setUser(null);
      setUsers([]);
      try { localStorage.removeItem('user'); localStorage.removeItem('loginTime'); } catch (e) {}
    };
    window.addEventListener('auth:unauthorized', onUnauthorized as EventListener);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized as EventListener);
  }, [fetchUsers]);

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
            localStorage.setItem('user', JSON.stringify(userToSet));
            localStorage.setItem('loginTime', new Date().getTime().toString());
            if (userToSet.role === 'admin') {
              fetchUsers(userToSet.token);
            }
            return true;
          }
        }
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
  }, [fetchUsers]);

  const register = useCallback(async (email: string, password?: string) => {
    try {
      const response = await fetch('/api/Register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'customer' }),
      });

      if (response.ok) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        return { success: true };
      } else {
        const errorData = await response.json();
        const message = errorData.errors ? Object.values(errorData.errors).flat().join(' ') : (errorData.message || 'Đăng ký không thành công.');
        return { success: false, message: message };
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      return { success: false, message: 'Đã xảy ra lỗi trong quá trình đăng ký.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setUsers([]);
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
  }, []);

 const addUser = useCallback(async (email: string, role: 'staff' | 'manager', password?: string) => {
  if (!user?.token) return;
  try {
    const { default: apiFetch } = await import('../utils/api');
    const response = await apiFetch('/api/Users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });
    if (response.ok) {
      alert('Thêm người dùng thành công!');
      fetchUsers(user.token);
    } else {
      const error = await response.json();
      alert(`Thêm thất bại: ${error.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Có lỗi xảy ra khi thêm người dùng.');
  }
}, [user?.token, fetchUsers]);


  const deleteUser = useCallback(async (userId: string) => {
    if (!user?.token) return;
     if (user?.id === userId) {
        alert('Bạn không thể xóa chính mình.');
        return;
    }
    try {
    const { default: apiFetch } = await import('../utils/api');
    const response = await apiFetch(`/api/Users/${userId}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Xóa người dùng thành công!');
      fetchUsers(user.token);
    } else {
      alert('Xóa thất bại.');
    }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Có lỗi xảy ra khi xóa người dùng.');
    }
}, [user?.token, user?.id, fetchUsers]);
  
  const updateUserRole = useCallback(async (userId: string, newRole: 'staff' | 'manager' | 'customer') => {
      if (!user?.token) return;
      try {
    const { default: apiFetch } = await import('../utils/api');
    const response = await apiFetch(`/api/Users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });

    if (response.ok) {
      alert('Cập nhật vai trò thành công!');
      fetchUsers(user.token);
    } else {
       alert('Cập nhật vai trò thất bại.');
    }
      } catch (error) {
          console.error('Error updating user role:', error);
          alert('Có lỗi xảy ra.');
      }
  }, [user?.token, fetchUsers]);
  
  const updateUserPassword = useCallback(async (userId: string, newPassword: string) => {
    if (!user?.token) return false;
     try {
    const { default: apiFetch } = await import('../utils/api');
    const response = await apiFetch(`/api/Users/${userId}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    return response.ok;
      } catch (error) {
          console.error('Error updating password:', error);
          return false;
      }
  }, [user?.token]);

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
