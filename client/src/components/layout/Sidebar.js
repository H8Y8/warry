import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ isOpen, onClose, menuItems, onLogout }) => {
  const location = useLocation();

  return (
    <>
      {/* 桌面側邊欄 */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
                <h1 className="text-xl font-bold text-primary-600">電子產品保固記錄</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={item.icon}
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        location.pathname === item.path
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={onLogout}
                className="flex-shrink-0 w-full group flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <FontAwesomeIcon
                  icon={faSignOutAlt}
                  className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                />
                登出
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 手機側邊欄 */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 flex z-40">
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={onClose}
          ></div>

          {/* 側邊欄面板 */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={onClose}
              >
                <span className="sr-only">關閉側邊欄</span>
                <FontAwesomeIcon icon={faTimes} className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
              <h1 className="text-xl font-bold text-primary-600">電子產品保固記錄</h1>
            </div>

            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-4 py-2 text-base font-medium rounded-md ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={onClose}
                  >
                    <FontAwesomeIcon
                      icon={item.icon}
                      className={`mr-4 flex-shrink-0 h-5 w-5 ${
                        location.pathname === item.path
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex-shrink-0 w-full group flex items-center px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <FontAwesomeIcon
                  icon={faSignOutAlt}
                  className="mr-4 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                />
                登出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar; 