import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';
import { useTheme } from './ThemeContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jade_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('jade_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
          if (res.user.themePreference) {
            setTheme(res.user.themePreference);
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('jade_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await authApi.login(email, pass);
    localStorage.setItem('jade_token', res.token);
    setToken(res.token);
    setUser(res.user);
    if (res.user.themePreference) {
      setTheme(res.user.themePreference);
    }
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('jade_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
