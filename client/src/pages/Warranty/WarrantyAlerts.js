import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faCheckCircle, 
  faExclamationTriangle, 
  faCalendarAlt,
  faCog,
  faEnvelope,
  faClock,
  faSync,
  faToggleOn,
  faToggleOff,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const WarrantyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    notificationEmail: '',
    useAccountEmail: true,
    notifyBefore: 30, // 預設提前30天通知
    frequency: 'once', // once, daily, weekly
    notifyOnExpiry: true,
    notifyAfterExpiry: true
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAlerts();
    fetchNotificationSettings();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    
    try {
      const response = await api.get('/api/warranties/alerts');
      if (response.data.success) {
        setAlerts(response.data.data);
      } else {
        console.error('獲取保固提醒失敗:', response.data.message);
        // 如果請求成功但處理失敗，顯示空數據
        setAlerts([]);
      }
    } catch (error) {
      console.error('獲取保固提醒失敗:', error);
      // 如果請求失敗，顯示空數據
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get('/api/users/notification-settings');
      if (response.data.success) {
        setNotificationSettings(response.data.data);
      } else {
        console.error('獲取通知設定失敗:', response.data.message);
      }
    } catch (error) {
      console.error('獲取通知設定失敗:', error);
    }
  };

  const handleNotificationSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 如果選擇使用帳戶郵箱，則重置自定義郵箱
    if (name === 'useAccountEmail' && checked) {
      setNotificationSettings(prev => ({
        ...prev,
        notificationEmail: ''
      }));
    }
  };

  const saveNotificationSettings = async () => {
    setSettingsLoading(true);
    setSettingsMessage({ type: '', text: '' });
    
    try {
      const response = await api.put('/api/users/notification-settings', notificationSettings);
      
      if (response.data.success) {
        setSettingsMessage({
          type: 'success',
          text: '通知設定已成功更新'
        });
      } else {
        setSettingsMessage({
          type: 'error',
          text: response.data.message || '更新通知設定失敗'
        });
      }
    } catch (error) {
      console.error('更新通知設定失敗:', error);
      setSettingsMessage({
        type: 'error',
        text: error.response?.data?.message || '更新通知設定失敗'
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const filteredAlerts = () => {
    if (filter === 'all') return alerts;
    return alerts.filter(alert => alert.status === filter);
  };

  const getStatusBadge = (status, daysRemaining) => {
    if (status === 'expired') {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
          已過期 ({Math.abs(daysRemaining)} 天前)
        </span>
      );
    } else if (daysRemaining <= 30) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
          <FontAwesomeIcon icon={faBell} className="mr-1" />
          即將到期 ({daysRemaining} 天)
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
          有效 ({daysRemaining} 天)
        </span>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">保固提醒</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          <FontAwesomeIcon icon={faCog} className="mr-2" />
          {showSettings ? '隱藏設定' : '通知設定'}
        </button>
      </div>
      
      {/* 郵件通知設定部分 */}
      {showSettings && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 border-b pb-3">電子郵件通知設定</h2>
          
          {settingsMessage.text && (
            <div className={`p-4 mb-6 rounded flex items-center ${settingsMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <FontAwesomeIcon 
                icon={settingsMessage.type === 'success' ? faSave : faExclamationTriangle} 
                className="mr-2" 
              />
              <span>{settingsMessage.text}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
              {/* 啟用電子郵件通知 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center text-gray-700 font-medium">
                    <FontAwesomeIcon icon={notificationSettings.enabled ? faToggleOn : faToggleOff} 
                      className={`mr-3 text-xl ${notificationSettings.enabled ? 'text-green-500' : 'text-gray-400'}`} 
                    />
                    啟用電子郵件通知
                  </label>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="enabled"
                      id="enabled"
                      checked={notificationSettings.enabled}
                      onChange={handleNotificationSettingsChange}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label
                      htmlFor="enabled"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        notificationSettings.enabled ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    ></label>
                  </div>
                </div>
                <p className="text-sm text-gray-500 ml-7">啟用後，系統將根據您的設定發送保固相關提醒</p>
              </div>
              
              {/* 通知郵箱 */}
              <div className={`p-4 rounded-lg ${notificationSettings.enabled ? 'bg-white border border-gray-200' : 'bg-gray-100 opacity-60'}`}>
                <label className="flex items-center text-gray-700 font-medium mb-3">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-blue-500" />
                  通知郵箱
                </label>
                <div className="mb-3 ml-7">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="useAccountEmail"
                      checked={notificationSettings.useAccountEmail}
                      onChange={handleNotificationSettingsChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      disabled={!notificationSettings.enabled}
                    />
                    <span className="ml-2">使用帳戶郵箱接收通知</span>
                  </label>
                </div>
                {!notificationSettings.useAccountEmail && (
                  <div className="ml-7">
                    <input
                      type="email"
                      name="notificationEmail"
                      value={notificationSettings.notificationEmail}
                      onChange={handleNotificationSettingsChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="自定義通知郵箱"
                      disabled={!notificationSettings.enabled}
                    />
                  </div>
                )}
              </div>
              
              {/* 提前通知時間 */}
              <div className={`p-4 rounded-lg ${notificationSettings.enabled ? 'bg-white border border-gray-200' : 'bg-gray-100 opacity-60'}`}>
                <label className="flex items-center text-gray-700 font-medium mb-3">
                  <FontAwesomeIcon icon={faClock} className="mr-3 text-orange-500" />
                  提前通知時間
                </label>
                <div className="ml-7">
                  <select
                    name="notifyBefore"
                    value={notificationSettings.notifyBefore}
                    onChange={handleNotificationSettingsChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={!notificationSettings.enabled}
                  >
                    <option value="7">7 天前</option>
                    <option value="14">14 天前</option>
                    <option value="30">30 天前</option>
                    <option value="60">60 天前</option>
                    <option value="90">90 天前</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">系統將在保固到期前設定的天數發送提醒</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* 通知頻率 */}
              <div className={`p-4 rounded-lg ${notificationSettings.enabled ? 'bg-white border border-gray-200' : 'bg-gray-100 opacity-60'}`}>
                <label className="flex items-center text-gray-700 font-medium mb-3">
                  <FontAwesomeIcon icon={faSync} className="mr-3 text-purple-500" />
                  通知頻率
                </label>
                <div className="ml-7">
                  <select
                    name="frequency"
                    value={notificationSettings.frequency}
                    onChange={handleNotificationSettingsChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={!notificationSettings.enabled}
                  >
                    <option value="once">僅通知一次</option>
                    <option value="daily">每天通知</option>
                    <option value="weekly">每週通知</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">選擇「僅通知一次」將只在設定的提前時間通知一次</p>
                </div>
              </div>
              
              {/* 額外通知選項 */}
              <div className={`p-4 rounded-lg ${notificationSettings.enabled ? 'bg-white border border-gray-200' : 'bg-gray-100 opacity-60'}`}>
                <label className="flex items-center text-gray-700 font-medium mb-3">
                  <FontAwesomeIcon icon={faBell} className="mr-3 text-yellow-500" />
                  額外通知選項
                </label>
                <div className="ml-7 space-y-3">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="notifyOnExpiry"
                      checked={notificationSettings.notifyOnExpiry}
                      onChange={handleNotificationSettingsChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mt-1"
                      disabled={!notificationSettings.enabled}
                    />
                    <span className="ml-2">
                      <span className="block font-medium">保固到期當天通知</span>
                      <span className="block text-sm text-gray-500">在保固到期當天發送提醒</span>
                    </span>
                  </label>
                  
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="notifyAfterExpiry"
                      checked={notificationSettings.notifyAfterExpiry}
                      onChange={handleNotificationSettingsChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mt-1"
                      disabled={!notificationSettings.enabled}
                    />
                    <span className="ml-2">
                      <span className="block font-medium">保固過期後通知</span>
                      <span className="block text-sm text-gray-500">在保固已過期時仍然發送提醒</span>
                    </span>
                  </label>
                </div>
              </div>
              
              {/* 保存按鈕 */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={saveNotificationSettings}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={settingsLoading}
                >
                  {settingsLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                  )}
                  {settingsLoading ? '儲存中...' : '儲存設定'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex flex-wrap items-center space-x-2 mb-4 md:mb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md ${filter === 'upcoming' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              即將到期
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-md ${filter === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              已過期
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              有效
            </button>
          </div>
          
          <button
            onClick={fetchAlerts}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            <FontAwesomeIcon icon={faSync} className="mr-2" />
            刷新
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAlerts().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            沒有找到符合條件的保固提醒
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">產品</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保固期限</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts().map(alert => (
                  <tr key={alert.id} className={`hover:bg-gray-50 ${!alert.isRead ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={alert.image || `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.svg`} 
                            alt={alert.productName}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.svg`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{alert.productName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{alert.warrantyEndDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(alert.status, alert.daysRemaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style jsx="true">{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #2563eb;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #2563eb;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #d1d5db;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: all 0.3s;
          height: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default WarrantyAlerts; 