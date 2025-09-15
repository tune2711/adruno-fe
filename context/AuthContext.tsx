import React, { createContext, useState, ReactNode, useMemo, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'manager' | 'customer';
  password?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  register: (email: string, password?: string) => boolean;
  addUser: (email: string, role: 'staff' | 'manager') => void;
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const login = useCallback((email: string, password?: string) => {
    const lowerEmail = email.toLowerCase();
    const existingUser = users.find(u => u.email.toLowerCase() === lowerEmail && u.password === password);

    if (existingUser) {
      setUser(existingUser);
      return true;
    }
    alert('Email hoặc mật khẩu không đúng.');
    return false;
  }, [users]);

  const register = useCallback((email: string, password?: string) => {
    const lowerEmail = email.toLowerCase();
    if (users.some(u => u.email.toLowerCase() === lowerEmail)) {
        alert('Email này đã được đăng ký.');
        return false;
    }
    const newCustomer: User = { 
        id: `user-${Date.now()}`, 
        email: lowerEmail, 
        role: 'customer',
        password: password,
    };
    setUsers(prev => [...prev, newCustomer]);
    setUser(newCustomer); // Auto-login after registration
    return true;
  }, [users]);

  const logout = useCallback(() => setUser(null), []);

  const addUser = useCallback((email: string, role: 'staff' | 'manager') => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert('Email đã tồn tại.');
        return;
    }
    const newUser: User = { id: `user-${Date.now()}`, email, role, password: 'password123' };
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