import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

export type UserRole = 'admin' | 'project_manager' | 'team_member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchDemo: (role: UserRole) => Promise<void>;
  updateUserContext: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smart_pm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smart_pm_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  // Verify session on mount
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('smart_pm_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        // Token expired or invalid
        setUser(null);
        setToken(null);
        localStorage.removeItem('smart_pm_token');
        localStorage.removeItem('smart_pm_user');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: loggedInUser, token: authToken } = res.data;
        setUser(loggedInUser);
        setToken(authToken);
        localStorage.setItem('smart_pm_token', authToken);
        localStorage.setItem('smart_pm_user', JSON.stringify(loggedInUser));
        showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role?: string
  ): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        const { user: registeredUser, token: authToken } = res.data;
        setUser(registeredUser);
        setToken(authToken);
        localStorage.setItem('smart_pm_token', authToken);
        localStorage.setItem('smart_pm_user', JSON.stringify(registeredUser));
        showToast('Registration successful! Welcome to Smart PM.', 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_pm_token');
    localStorage.removeItem('smart_pm_user');
    showToast('Logged out successfully', 'info');
  };

  const switchDemo = async (role: UserRole) => {
    try {
      const res = await api.post('/auth/switch-demo', { role });
      if (res.data.success) {
        const { user: switchedUser, token: authToken } = res.data;
        setUser(switchedUser);
        setToken(authToken);
        localStorage.setItem('smart_pm_token', authToken);
        localStorage.setItem('smart_pm_user', JSON.stringify(switchedUser));
        showToast(`Switched account to: ${switchedUser.name} (${role})`, 'success');
      }
    } catch (err: any) {
      showToast('Could not switch demo user', 'error');
    }
  };

  const updateUserContext = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('smart_pm_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        switchDemo,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
