import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  fullName: string;
  collegeEmail: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Basic persistent logic (mocked session using localStorage)
    const storedUser = localStorage.getItem('findnet_user');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch {
            localStorage.removeItem('findnet_user');
        }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('findnet_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('findnet_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});
