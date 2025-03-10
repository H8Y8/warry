import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faCheckCircle,
  faFilter,
  faSort,
  faBell,
  faClock,
  faCalendarAlt,
  faEnvelope,
  faMobile,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

const WarrantyAlerts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, expiring, expired
  const [sortBy, setSortBy] = useState('daysLeft'); // daysLeft, productName
  const [sortOrder, setSortOrder] = useState('asc');
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    daysBeforeExpiry: 30
  });
  const [showSettings, setShowSettings] = useState(false);

  // 獲取保固提醒數據
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        // 在實際應用中，這裡會調用API
        // const response = await api.get('/warranty-alerts');
        
        // 模擬API請求
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模擬提醒數據
        const mockAlerts = [
          {
            id: 1,
            productId: 1,
            productName: 'iPhone 13 Pro',
            brand: 'Apple',
            type: '智慧型手機',
            purchaseDate: '2021-09-30',
            warrantyEndDate: '2023-09-30',
            daysLeft: 15,
            image: 'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aXBob25lJTIwMTN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 2,
            productId: 2,
            productName: 'MacBook Pro 14"',
            brand: 'Apple',
            type: '筆記型電腦',
            purchaseDate: '2021-11-20',
            warrantyEndDate: '2023-11-20',
            daysLeft: 45,
            image: 'https://images.unsplash.com/photo-1639249227523-86c063f75d20?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fG1hY2Jvb2slMjBwcm98ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 3,
            productId: 3,
            productName: 'Galaxy Watch 4',
            brand: 'Samsung',
            type: '智慧型手錶',
            purchaseDate: '2022-02-15',
            warrantyEndDate: '2023-07-15',
            daysLeft: -15,
            image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGdhbGF4eSUyMHdhdGNofGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
          }
        ];

        setAlerts(mockAlerts);
        setLoading(false);
      } catch (error) {
        console.error('獲取保固提醒錯誤:', error);
        setError('獲取保固提醒時發生錯誤，請稍後再試');
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // 處理排序
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // 更新通知設置
  const handleSettingsUpdate = async () => {
    setLoading(true);
    try {
      // 在實際應用中，這裡會調用API
      // await api.put('/notification-settings', notificationSettings);
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSettings(false);
      setLoading(false);
    } catch (error) {
      console.error('更新通知設置錯誤:', error);
      setError('更新通知設置時發生錯誤，請稍後再試');
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  // 獲取狀態樣式
  const getStatusStyle = (daysLeft) => {
    if (daysLeft <= 0) return 'bg-red-100 text-red-700 border-red-200';
    if (daysLeft <= 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  // 過濾和排序提醒
  const filteredAndSortedAlerts = [...alerts]
    .filter(alert => {
      if (filter === 'expired') return alert.daysLeft <= 0;
      if (filter === 'expiring') return alert.daysLeft > 0 && alert.daysLeft <= 30;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'daysLeft') {
        comparison = a.daysLeft - b.daysLeft;
      } else if (sortBy === 'productName') {
        comparison = a.productName.localeCompare(b.productName);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">保固提醒</h1>
          <Button
            variant="secondary"
            icon={faBell}
            onClick={() => setShowSettings(!showSettings)}
          >
            通知設置
          </Button>
        </div>
        <p className="text-gray-600">
          追蹤您的產品保固狀態，及時獲取到期提醒
        </p>
      </div>

      {error && (
        <Alert
          variant="error"
          className="mb-6"
          icon={faExclamationTriangle}
        >
          {error}
        </Alert>
      )}

      {/* 通知設置面板 */}
      {showSettings && (
        <Card className="mb-6">
          <h2 className="font-medium text-lg text-gray-900 mb-4">通知設置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                <span>電子郵件通知</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationSettings.email}
                  onChange={e => setNotificationSettings(prev => ({
                    ...prev,
                    email: e.target.checked
                  }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faMobile} className="text-gray-400" />
                <span>推送通知</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationSettings.push}
                  onChange={e => setNotificationSettings(prev => ({
                    ...prev,
                    push: e.target.checked
                  }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                <span>提前提醒天數</span>
              </div>
              <select
                className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={notificationSettings.daysBeforeExpiry}
                onChange={e => setNotificationSettings(prev => ({
                  ...prev,
                  daysBeforeExpiry: parseInt(e.target.value)
                }))}
              >
                <option value={7}>7天</option>
                <option value={15}>15天</option>
                <option value={30}>30天</option>
                <option value={60}>60天</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowSettings(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSettingsUpdate}
                loading={loading}
              >
                保存設置
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 過濾和排序 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <select
          className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">全部狀態</option>
          <option value="expiring">即將到期</option>
          <option value="expired">已過期</option>
        </select>

        <Button
          variant="secondary"
          icon={faSort}
          onClick={() => handleSort('daysLeft')}
        >
          {sortBy === 'daysLeft' ? (
            sortOrder === 'asc' ? '剩餘天數 (升序)' : '剩餘天數 (降序)'
          ) : '排序'}
        </Button>
      </div>

      {/* 提醒列表 */}
      {filteredAndSortedAlerts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有保固提醒</h3>
            <p className="text-gray-600">
              目前沒有即將到期或已過期的產品保固
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedAlerts.map(alert => (
            <Card
              key={alert.id}
              hoverable
              to={`/products/${alert.productId}`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-24 h-24">
                  <img
                    src={alert.image}
                    alt={alert.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="ml-6 flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {alert.productName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {alert.brand} · {alert.type}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(alert.daysLeft)}`}>
                      {alert.daysLeft <= 0 ? '已過期' : `剩餘 ${alert.daysLeft} 天`}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">購買日期</p>
                      <p className="font-medium">{formatDate(alert.purchaseDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">保固到期</p>
                      <p className="font-medium">{formatDate(alert.warrantyEndDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 提示信息 */}
      <Alert
        variant="info"
        className="mt-6"
        icon={faInfoCircle}
      >
        我們會在產品保固即將到期時通過您設置的方式發送提醒。建議定期檢查此頁面以了解產品保固狀態。
      </Alert>
    </div>
  );
};

export default WarrantyAlerts; 