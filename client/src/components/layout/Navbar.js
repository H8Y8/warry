import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faBell, faUser, faSignOutAlt, 
  faCog, faQuestionCircle, faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ onToggleSidebar, user, onLogout }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const { logout, isAuthenticated } = useAuth();

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

  // 模擬通知數據
  const notifications = [
    { id: 1, text: 'iPhone 13的保固即將到期', time: '2小時前', read: false },
    { id: 2, text: '您的MacBook Pro保固將在7天後到期', time: '1天前', read: true },
    { id: 3, text: '新增了智慧型手錶的保固記錄', time: '3天前', read: true },
  ];

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
                className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-full hover:bg-gray-100"
              >
                <span className="relative">
                  <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </span>
              </button>

              {/* 通知下拉菜單 */}
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">通知</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-2 text-sm text-gray-500">沒有新通知</p>
                      ) : (
                        notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            to="/warranty-alerts"
                            className={`block px-4 py-3 hover:bg-gray-50 transition ${
                              notification.read ? 'bg-white' : 'bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                  {notification.text}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    <div className="border-t border-gray-200">
                      <Link
                        to="/warranty-alerts"
                        className="block px-4 py-2 text-sm text-primary-600 text-center font-medium"
                      >
                        查看所有通知
                      </Link>
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