
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types'; // Assuming User type is defined in types.ts

// URL uses the proxy set up in vite.config.ts
const USER_API_URL = '/api/users'; 

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(USER_API_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err);
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetchUsers: fetchUsers };
};

export default useUsers;
