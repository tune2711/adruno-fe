import { useState, useEffect, useCallback } from 'react';
import { User } from '../types'; // Removed UserRole as it does not exist in types.ts

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/Users'); // Endpoint to get all users
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Corrected: .json() is a method and must be called.
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
