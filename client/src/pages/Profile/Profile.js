import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faSave, 
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faKey
} from '@fortawesome/free-solid-svg-icons';
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
  const [loading, setLoading] = useState({
    profile: false,
    password: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // 獲取用戶資料
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/users/profile');
        const { fullName, email, username } = response.data.data;
        setUser(prevUser => ({
          ...prevUser,
          fullName,
          email,
          username
        }));
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || '獲取個人資料失敗'
        });
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
    // 清除之前的錯誤消息
    setMessage({ type: '', text: '' });
    
    // 清除密碼相關錯誤
    if (e.target.name.includes('Password')) {
      setPasswordErrors(prev => ({
        ...prev,
        [e.target.name]: null
      }));
      
      // 即時驗證確認密碼
      if (e.target.name === 'newPassword' && user.confirmPassword) {
        if (e.target.value !== user.confirmPassword) {
          setPasswordErrors(prev => ({
            ...prev,
            confirmPassword: '兩次輸入的密碼不一致'
          }));
        } else {
          setPasswordErrors(prev => ({
            ...prev,
            confirmPassword: null
          }));
        }
      }
      
      if (e.target.name === 'confirmPassword' && e.target.value) {
        if (e.target.value !== user.newPassword) {
          setPasswordErrors(prev => ({
            ...prev,
            confirmPassword: '兩次輸入的密碼不一致'
          }));
        } else {
          setPasswordErrors(prev => ({
            ...prev,
            confirmPassword: null
          }));
        }
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!user.oldPassword) {
      errors.oldPassword = '請輸入當前密碼';
    }
    
    if (!user.newPassword) {
      errors.newPassword = '請輸入新密碼';
    } else if (user.newPassword.length < 6) {
      errors.newPassword = '密碼至少需要6個字符';
    } else if (!/(?=.*[a-z])/.test(user.newPassword)) {
      errors.newPassword = '密碼需要包含至少一個小寫字母';
    } else if (!/(?=.*[A-Z])/.test(user.newPassword)) {
      errors.newPassword = '密碼需要包含至少一個大寫字母';
    } else if (!/(?=.*\d)/.test(user.newPassword)) {
      errors.newPassword = '密碼需要包含至少一個數字';
    }
    
    if (!user.confirmPassword) {
      errors.confirmPassword = '請確認新密碼';
    } else if (user.confirmPassword !== user.newPassword) {
      errors.confirmPassword = '兩次輸入的密碼不一致';
    }
    
    if (user.oldPassword === user.newPassword) {
      errors.newPassword = '新密碼不能與當前密碼相同';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    setMessage({ type: '', text: '' });

    try {
      // 準備更新數據
      const updateData = {
        fullName: user.fullName,
        email: user.email
      };

      // 發送更新請求
      const response = await api.put('/api/users/profile', updateData);

      // 更新成功
      setMessage({
        type: 'success',
        text: '個人資料已成功更新'
      });

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || '更新個人資料失敗'
      });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setLoading(prev => ({ ...prev, password: true }));
    setMessage({ type: '', text: '' });

    try {
      // 準備更新數據
      const updateData = {
        oldPassword: user.oldPassword,
        newPassword: user.newPassword
      };

      // 發送更新請求
      const response = await api.put('/api/users/profile', updateData);

      // 更新成功
      setMessage({
        type: 'success',
        text: '密碼已成功更新'
      });

      // 清除密碼字段
      setUser(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setIsChangingPassword(false);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || '更新密碼失敗'
      });
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">個人資料</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded flex items-start ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <FontAwesomeIcon 
            icon={message.type === 'success' ? faSave : faExclamationTriangle} 
            className="mt-1 mr-3"
          />
          <span>{message.text}</span>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <form onSubmit={handleProfileSubmit}>
          {/* 基本資料部分 */}
          <h2 className="text-xl font-semibold mb-6">基本資料</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  required
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
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="您的電子郵件"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="username">
                用戶名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={user.username}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">用戶名無法修改</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading.profile}
            >
              {loading.profile ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <FontAwesomeIcon icon={faSave} className="mr-2" />
              )}
              {loading.profile ? '儲存中...' : '儲存個人資料'}
            </button>
          </div>
        </form>
      </div>
      
      {/* 密碼部分 - 獨立表單 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">密碼設定</h2>
          <button
            type="button"
            onClick={() => {
              setIsChangingPassword(!isChangingPassword);
              if (!isChangingPassword) {
                setUser(prev => ({
                  ...prev,
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                }));
                setPasswordErrors({});
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
          >
            {isChangingPassword ? '取消更改密碼' : '更改密碼'}
          </button>
        </div>

        {isChangingPassword ? (
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="oldPassword">
                  當前密碼 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.oldPassword ? "text" : "password"}
                    id="oldPassword"
                    name="oldPassword"
                    value={user.oldPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${passwordErrors.oldPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="請輸入當前密碼"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => togglePasswordVisibility('oldPassword')}
                  >
                    <FontAwesomeIcon icon={showPasswords.oldPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.oldPassword}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="newPassword">
                    新密碼 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                    </div>
                    <input
                      type={showPasswords.newPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={user.newPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-2 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="請輸入新密碼"
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      onClick={() => togglePasswordVisibility('newPassword')}
                    >
                      <FontAwesomeIcon icon={showPasswords.newPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {passwordErrors.newPassword ? (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">密碼需要包含大小寫字母和數字，至少6個字符</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                    確認新密碼 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                    </div>
                    <input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={user.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-2 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="請再次輸入新密碼"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                    >
                      <FontAwesomeIcon icon={showPasswords.confirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading.password}
                >
                  {loading.password ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FontAwesomeIcon icon={faKey} className="mr-2" />
                  )}
                  {loading.password ? '更新中...' : '更新密碼'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <p className="text-gray-500">如需更改密碼，請點擊「更改密碼」按鈕。</p>
        )}
      </div>
    </div>
  );
};

export default Profile; 