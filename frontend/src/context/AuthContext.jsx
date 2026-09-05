import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCsrfToken = useCallback(async () => {
    try {
      await authApi.getCsrfToken();
    } catch {
      // CSRF token fetch failed, will retry on first API call
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await authApi.getMe({ skipAuthRedirect: true });
      setUser(res.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  const register = async (data) => {
    try {
      const res = await authApi.register(data);
      setUser(res.data.user);
      toast.success('Account created successfully!');
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const login = async (data) => {
    try {
      const res = await authApi.login(data);
      setUser(res.data.user);
      toast.success('Welcome back!');
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      setUser(null);
      toast.error('Logout failed');
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await authApi.updateProfile(data);
      setUser(res.data.user);
      toast.success('Profile updated');
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Update failed';
    }
  };

  const updatePassword = async (data) => {
    try {
      await authApi.updatePassword(data);
      toast.success('Password updated');
    } catch (error) {
      throw error.response?.data?.message || 'Password update failed';
    }
  };

  const forgotPassword = async (email) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword = async (resetToken, password) => {
    await authApi.resetPassword(resetToken, password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile, updatePassword, forgotPassword, resetPassword, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}