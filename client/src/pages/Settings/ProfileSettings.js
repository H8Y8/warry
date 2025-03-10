import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faGlobe,
  faBell,
  faShieldAlt,
  faExclamationTriangle,
  faCheckCircle,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile, account, security
  const [avatar, setAvatar] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    language: 'zh-TW',
    emailNotifications: true,
    pushNotifications: true,
    twoFactorEnabled: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 獲取用戶數據
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // 在實際應用中，這裡會調用API
        // const response = await api.get('/user/profile');
        
        // 模擬API請求
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模擬用戶數據
        const mockUser = {
          name: '王小明',
          email: 'xiaoming.wang@example.com',
          phone: '0912345678',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          language: 'zh-TW',
          emailNotifications: true,
          pushNotifications: true,
          twoFactorEnabled: false
        };

        setFormData(prev => ({
          ...prev,
          ...mockUser
        }));
        setAvatar(mockUser.avatar);
        setLoading(false);
      } catch (error) {
        console.error('獲取用戶數據錯誤:', error);
        setError('獲取用戶數據時發生錯誤，請稍後再試');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 處理表單輸入變更
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 處理頭像上傳
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('頭像圖片大小不能超過5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 處理個人信息更新
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 在實際應用中，這裡會調用API
      // await api.put('/user/profile', {
      //   name: formData.name,
      //   phone: formData.phone,
      //   avatar: avatar
      // });
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('個人信息更新成功');
      setSaving(false);
    } catch (error) {
      console.error('更新個人信息錯誤:', error);
      setError('更新個人信息時發生錯誤，請稍後再試');
      setSaving(false);
    }
  };

  // 處理賬戶設置更新
  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 在實際應用中，這裡會調用API
      // await api.put('/user/account', {
      //   language: formData.language,
      //   emailNotifications: formData.emailNotifications,
      //   pushNotifications: formData.pushNotifications
      // });
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('賬戶設置更新成功');
      setSaving(false);
    } catch (error) {
      console.error('更新賬戶設置錯誤:', error);
      setError('更新賬戶設置時發生錯誤，請稍後再試');
      setSaving(false);
    }
  };

  // 處理密碼更新
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('新密碼與確認密碼不符');
      }

      // 在實際應用中，這裡會調用API
      // await api.put('/user/password', {
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // });
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('密碼更新成功');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSaving(false);
    } catch (error) {
      console.error('更新密碼錯誤:', error);
      setError(error.message || '更新密碼時發生錯誤，請稍後再試');
      setSaving(false);
    }
  };

  // 處理雙重認證開關
  const handleTwoFactorToggle = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 在實際應用中，這裡會調用API
      // await api.put('/user/two-factor', {
      //   enabled: !formData.twoFactorEnabled
      // });
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFormData(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled
      }));
      setSuccess(`雙重認證已${!formData.twoFactorEnabled ? '啟用' : '停用'}`);
      setSaving(false);
    } catch (error) {
      console.error('更新雙重認證設置錯誤:', error);
      setError('更新雙重認證設置時發生錯誤，請稍後再試');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* 頁面標題 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">個人設置</h1>
        <p className="text-gray-600">
          管理您的個人信息、賬戶設置和安全選項
        </p>
      </div>

      {error && (
        <Alert
          variant="error"
          className="mb-6"
          icon={faExclamationTriangle}
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          variant="success"
          className="mb-6"
          icon={faCheckCircle}
          dismissible
          onDismiss={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* 標籤導航 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            個人信息
          </button>
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'account'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('account')}
          >
            賬戶設置
          </button>
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('security')}
          >
            安全設置
          </button>
        </nav>
      </div>

      {/* 個人信息 */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate}>
          <Card>
            <div className="space-y-6">
              {/* 頭像 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  頭像
                </label>
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={avatar}
                      alt="用戶頭像"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50">
                      <FontAwesomeIcon icon={faCamera} className="h-4 w-4 text-gray-600" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <p className="ml-4 text-sm text-gray-500">
                    建議使用正方形圖片，大小不超過5MB
                  </p>
                </div>
              </div>

              {/* 姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              {/* 電子郵件 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  如需更改郵箱地址，請聯繫客服
                </p>
              </div>

              {/* 手機號碼 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手機號碼
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
              >
                保存更改
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* 賬戶設置 */}
      {activeTab === 'account' && (
        <form onSubmit={handleAccountUpdate}>
          <Card>
            <div className="space-y-6">
              {/* 語言設置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  界面語言
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="zh-TW">繁體中文</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              {/* 通知設置 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">通知設置</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                      <span>電子郵件通知</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        className="sr-only peer"
                        checked={formData.emailNotifications}
                        onChange={handleInputChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faBell} className="text-gray-400" />
                      <span>推送通知</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        className="sr-only peer"
                        checked={formData.pushNotifications}
                        onChange={handleInputChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
              >
                保存更改
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* 安全設置 */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* 更改密碼 */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">更改密碼</h3>
            <form onSubmit={handlePasswordUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    當前密碼
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    新密碼
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    確認新密碼
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                >
                  更新密碼
                </Button>
              </div>
            </form>
          </Card>

          {/* 雙重認證 */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">雙重認證</h3>
                <p className="text-gray-600">
                  啟用雙重認證以提高賬戶安全性。每次登錄時都需要輸入驗證碼。
                </p>
              </div>
              <Button
                variant={formData.twoFactorEnabled ? 'danger' : 'primary'}
                onClick={handleTwoFactorToggle}
                loading={saving}
              >
                {formData.twoFactorEnabled ? '停用' : '啟用'}
              </Button>
            </div>
          </Card>

          {/* 登錄設備 */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">登錄設備</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faGlobe} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Chrome · macOS</p>
                    <p className="text-sm text-gray-500">台北市 · 最後登錄於 2023/07/20 14:30</p>
                  </div>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  當前設備
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings; 