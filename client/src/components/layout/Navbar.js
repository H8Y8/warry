import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faBell, faUser, faSignOutAlt, 
  faCog, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getNotificationCounts, markNotificationAsRead, subscribeToNotifications } from '../../services/notificationService';
import { format, isValid, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const Navbar = ({ onToggleSidebar, user, onLogout }) => {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const { logout } = useAuth();
  const [notificationData, setNotificationData] = useState({
    total: 0,
    alerts: []
  });

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (profileDropdownOpen) setProfileDropdownOpen(false);
  };

  // 點擊外部關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
      
      if (
        notificationsRef.current && 
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await getNotificationCounts();
      setNotificationData(data);
    };

    loadNotifications();
    const unsubscribe = subscribeToNotifications(setNotificationData);
    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (productId) => {
    await markNotificationAsRead(productId);
    setNotificationData(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.productId === productId ? { ...alert, read: true } : alert
      ),
      total: prev.total - 1
    }));
    setNotificationsOpen(false);
    navigate(`/products/${productId}`);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getAvatarContent = () => {
    if (user?.username) {
      return (
        <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
          {user.username.charAt(0).toUpperCase()}
        </div>
      );
    }
    
    return (
      <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-gray-500" />
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* 手機版漢堡選單 */}
            <div className="flex items-center md:hidden">
              <button
                onClick={onToggleSidebar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-md"
                aria-label="開啟側邊欄選單"
              >
                <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center ml-4 md:ml-0">
              <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                電子產品保固記錄
              </Link>
            </div>
          </div>

          {/* 右側工具欄 */}
          <div className="flex items-center">
            {/* 通知鈴鐺 */}
            <div className="relative ml-3" ref={notificationsRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faBell} className="text-xl" />
                {notificationData.total > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                    {notificationData.total}
                  </span>
                )}
              </button>

              {/* 通知下拉菜單 */}
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">產品保固提醒</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationData.alerts
                        .filter(alert => !alert.read && alert.daysLeft > 0 && alert.daysLeft <= 30)
                        .map((alert) => {
                          const endDate = new Date(alert.warrantyEndDate);
                          const formattedDate = !isNaN(endDate.getTime())
                            ? format(endDate, 'yyyy年MM月dd日', { locale: zhTW })
                            : '日期無效';

                          return (
                            <button
                              key={alert.id}
                              onClick={() => handleNotificationClick(alert.productId)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">
                                  {alert.productName}
                                </span>
                                <span className="text-sm text-yellow-600 mt-1 flex items-center">
                                  <FontAwesomeIcon icon={faBell} className="mr-1" />
                                  將在 {alert.daysLeft} 天後到期
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                  到期日期：{formattedDate}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      {notificationData.alerts.filter(alert => !alert.read && alert.daysLeft > 0 && alert.daysLeft <= 30).length === 0 && (
                        <p className="px-4 py-3 text-sm text-gray-500">沒有新通知</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 用戶頭像與下拉菜單 */}
            <div className="relative ml-3" ref={profileDropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-full hover:bg-gray-100"
              >
                <span className="sr-only">打開用戶菜單</span>
                <div className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden">
                  {getAvatarContent()}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.fullName || user?.username || '用戶'}
                </span>
              </button>

              {/* 個人資料下拉菜單 */}
              {profileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faUser} className="mr-2" />
                      個人資料
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faCog} className="mr-2" />
                      設置
                    </Link>
                    <Link
                      to="/help"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
                      幫助
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                      登出
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 