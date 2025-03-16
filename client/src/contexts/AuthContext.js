import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 檢查用戶是否已登入
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/api/auth/me');
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('認證檢查失敗:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, []);

  // 登入
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || '登入失敗，請檢查您的憑證';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 註冊
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    console.log('開始註冊流程，請求數據:', userData);
    try {
      const response = await api.post('/api/auth/register', userData);
      console.log('註冊成功，響應:', response.data);
      const { token } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      console.error('註冊錯誤詳情:', error);
      const message = error.response?.data?.error || '註冊失敗，請稍後再試';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = async () => {
    setLoading(true);
    try {
      await api.get('/api/auth/logout');
    } catch (error) {
      console.error('登出錯誤:', error);
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  };

  // 忘記密碼
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || '請求密碼重置失敗，請稍後再試';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 重置密碼
  const resetPassword = async (token, password) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/api/auth/reset-password/${token}`, { password });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || '密碼重置失敗，請稍後再試';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 更新密碼
  const updatePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      await api.put('/api/auth/update-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || '密碼更新失敗，請稍後再試';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 更新用戶資料
  const updateUserProfile = async (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  // 檢查token是否有效
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
    updateUserProfile,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 