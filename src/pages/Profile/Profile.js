import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const [user, setUser] = useState({
    fullName: '',
    email: '',
    username: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { updateUserProfile } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/auth/me');
      const userData = response.data.data;
      setUser(prev => ({
        ...prev,
        fullName: userData.fullName,
        email: userData.email,
        username: userData.username
      }));
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      setMessage({
        type: 'error',
        text: '獲取用戶資料失敗'
      });
    }
  };

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/api/users/profile', {
        fullName: user.fullName
      });
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: '個人資料已成功更新'
        });
        // 更新全局用戶狀態
        updateUserProfile(response.data.data);
      }
    } catch (error) {
      console.error('更新個人資料失敗:', error);
      setMessage({
        type: 'error',
        text: '更新個人資料失敗'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">個人資料</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-primary-600 text-white text-4xl font-bold">
              {user.username ? user.username.charAt(0).toUpperCase() : (
                <FontAwesomeIcon icon={faUser} className="text-white text-4xl" />
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="fullName">
                姓名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={user.fullName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="您的姓名"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                電子郵件
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">電子郵件無法修改</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">更改密碼</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="oldPassword">
                當前密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  value={user.oldPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="您的當前密碼"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="newPassword">
                新密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={user.newPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="您的新密碼"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                確認新密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={user.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="確認您的新密碼"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <FontAwesomeIcon icon={faSave} className="mr-2" />
              )}
              {loading ? '儲存中...' : '儲存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 