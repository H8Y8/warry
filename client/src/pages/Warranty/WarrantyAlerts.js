import React, { useState, useEffect, useCallback } from 'react';
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
  faSave,
  faFilter,
  faSearch
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

  // 格式化日期 (只顯示 yyyy/mm/dd)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await api.get('/api/products/warranty-alerts');
      if (response.data.success) {
        const processedAlerts = response.data.data.map(alert => ({
          ...alert,
          image: alert.image ? 
            (alert.image.startsWith('http') ? 
              alert.image : 
              `${process.env.REACT_APP_API_URL}/uploads/products/${alert.image.split('/').pop()}`) : 
            null,
          warrantyEndDate: formatDate(alert.warrantyEndDate),
          daysRemaining: alert.daysLeft
        }));
        setAlerts(processedAlerts);
      } else {
        console.error('獲取保固提醒失敗:', response.data.message);
        setAlerts([]);
      }
    } catch (error) {
      console.error('獲取保固提醒失敗:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchNotificationSettings();
  }, [fetchAlerts]);

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get('/api/users/notification-settings');
      if (response.data.success) {
        setNotificationSettings(response.data.data);
        setShowSettings(response.data.data.enabled);
      } else {
        console.error('獲取通知設定失敗:', response.data.message);
      }
    } catch (error) {
      console.error('獲取通知設定失敗:', error);
    }
  };

  const handleNotificationSettingsChange = async (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'enabled') {
      // 立即更新 UI 狀態
      setNotificationSettings(prev => ({
        ...prev,
        enabled: checked
      }));
      
      // 儲存設定到後端
      try {
        const response = await api.put('/api/users/notification-settings', {
          ...notificationSettings,
          enabled: checked
        });
        
        if (response.data.success) {
          setSettingsMessage({
            type: 'success',
            text: checked ? '已啟用電子郵件通知' : '已停用電子郵件通知'
          });
        } else {
          // 如果儲存失敗，恢復原狀態
          setNotificationSettings(prev => ({
            ...prev,
            enabled: !checked
          }));
          setSettingsMessage({
            type: 'error',
            text: response.data.message || '更新通知設定失敗'
          });
        }
      } catch (error) {
        // 如果發生錯誤，恢復原狀態
        setNotificationSettings(prev => ({
          ...prev,
          enabled: !checked
        }));
        setSettingsMessage({
          type: 'error',
          text: error.response?.data?.message || '更新通知設定失敗'
        });
      }
    } else {
      setNotificationSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
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
    
    return alerts.filter(alert => {
      if (filter === 'expired') {
        return alert.daysRemaining <= 0;
      } else if (filter === 'upcoming') {
        return alert.daysRemaining > 0 && alert.daysRemaining <= 30;
      } else if (filter === 'active') {
        return alert.daysRemaining > 30;
      }
      return true;
    });
  };

  const getStatusBadge = (status, daysRemaining) => {
    if (daysRemaining <= 0) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 頁面標題區域 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">保固提醒</h1>
            <p className="mt-2 text-sm text-gray-600">管理您的產品保固狀態，及時獲取到期提醒</p>
          </div>
        </div>
      </div>

      {/* 通知設定面板 */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-900">電子郵件通知設定</h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{notificationSettings.enabled ? '已啟用通知' : '未啟用通知'}</span>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={notificationSettings.enabled}
                  onChange={handleNotificationSettingsChange}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
            
          {notificationSettings.enabled && (
            <>
              {settingsMessage.text && (
                <div className={`p-3 mb-6 rounded-md flex items-center text-sm ${
                  settingsMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <FontAwesomeIcon 
                    icon={settingsMessage.type === 'success' ? faCheckCircle : faExclamationTriangle} 
                    className="mr-2" 
                  />
                  <span>{settingsMessage.text}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* 通知郵箱 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4">
                      <label className="flex items-center text-gray-700 font-medium">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-blue-500" />
                        通知郵箱
                      </label>
                      <div className="mt-3 space-y-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="useAccountEmail"
                            checked={notificationSettings.useAccountEmail}
                            onChange={handleNotificationSettingsChange}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2">使用帳戶郵箱接收通知</span>
                        </label>
                        {!notificationSettings.useAccountEmail && (
                          <input
                            type="email"
                            name="notificationEmail"
                            value={notificationSettings.notificationEmail}
                            onChange={handleNotificationSettingsChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="自定義通知郵箱"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 提前通知時間 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-center text-gray-700 font-medium mb-3">
                      <FontAwesomeIcon icon={faClock} className="mr-3 text-orange-500" />
                      提前通知時間
                    </label>
                    <div className="space-y-2">
                      <select
                        name="notifyBefore"
                        value={notificationSettings.notifyBefore}
                        onChange={handleNotificationSettingsChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="7">7 天前</option>
                        <option value="14">14 天前</option>
                        <option value="30">30 天前</option>
                        <option value="60">60 天前</option>
                        <option value="90">90 天前</option>
                      </select>
                      <p className="text-sm text-gray-500">系統將在保固到期前設定的天數發送提醒</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* 通知頻率 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-center text-gray-700 font-medium mb-3">
                      <FontAwesomeIcon icon={faSync} className="mr-3 text-purple-500" />
                      通知頻率
                    </label>
                    <div className="space-y-2">
                      <select
                        name="frequency"
                        value={notificationSettings.frequency}
                        onChange={handleNotificationSettingsChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="once">僅通知一次</option>
                        <option value="daily">每天通知</option>
                        <option value="weekly">每週通知</option>
                      </select>
                      <p className="text-sm text-gray-500">選擇「僅通知一次」將只在設定的提前時間通知一次</p>
                    </div>
                  </div>
                  
                  {/* 額外通知選項 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-center text-gray-700 font-medium mb-3">
                      <FontAwesomeIcon icon={faBell} className="mr-3 text-yellow-500" />
                      額外通知選項
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          name="notifyOnExpiry"
                          checked={notificationSettings.notifyOnExpiry}
                          onChange={handleNotificationSettingsChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">
                          <span className="block font-medium">保固過期後通知</span>
                          <span className="block text-sm text-gray-500">在保固已過期時仍然發送提醒</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 保存按鈕 */}
              <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={saveNotificationSettings}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={settingsLoading}
                >
                  {settingsLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  ) : (
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                  )}
                  {settingsLoading ? '儲存中...' : '儲存設定'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 過濾器區域 */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === 'all' 
                ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-600 ring-offset-2' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === 'upcoming'
                ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-600 ring-offset-2'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faBell} className="mr-2" />
              即將到期
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === 'expired'
                ? 'bg-red-100 text-red-800 ring-2 ring-red-600 ring-offset-2'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              已過期
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === 'active'
                ? 'bg-green-100 text-green-800 ring-2 ring-green-600 ring-offset-2'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              有效
            </button>
          </div>
          <button
            onClick={fetchAlerts}
            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faSync} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '更新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 提醒列表 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          </div>
        ) : filteredAlerts().length === 0 ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-gray-100 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faBell} className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有保固提醒</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {filter === 'all' 
                ? '目前沒有任何產品的保固提醒' 
                : '沒有找到符合當前篩選條件的保固提醒'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    產品資訊
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    保固期限
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts().map(alert => (
                  <tr 
                    key={alert.id} 
                    className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            className="h-full w-full object-cover" 
                            src={alert.image || `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`}
                            alt={alert.productName}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 mb-1">{alert.productName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <span className="inline-block">{alert.brand}</span>
                            <span className="mx-2 text-gray-300">·</span>
                            <span className="inline-block">{alert.type}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-2" />
                        {alert.warrantyEndDate}
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
    </div>
  );
};

export default WarrantyAlerts; 