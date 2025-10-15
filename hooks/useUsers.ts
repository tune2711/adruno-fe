import { useState, useEffect, useCallback } from 'react';
import { User } from '../types'; // Removed UserRole as it does not exist in types.ts

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const { default: apiFetch } = await import('../utils/api');
      const response = await apiFetch('/api/Users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // You can add functions to add, update, delete users here

  return { users };
};
