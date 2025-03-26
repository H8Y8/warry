import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, faLaptop, faHome, faBell,
  faRobot, faChartLine, faCog, faQuestionCircle, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
  const location = useLocation();

  // 監控 Sidebar 的 props 變化
  useEffect(() => {
    console.log('Sidebar props changed:', { isOpen });
  }, [isOpen]);

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Logo 區域 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faLaptop} className="h-6 w-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900">WARRY</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">產品保固管理系統</p>
      </div>

      {/* 導航連結 */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <Link
            to="/dashboard"
            onClick={isMobile ? onClose : undefined}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              location.pathname === '/dashboard'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
            }`}
          >
            <FontAwesomeIcon
              icon={faHome}
              className={`h-5 w-5 mr-3 ${
                location.pathname === '/dashboard' ? 'text-primary-500' : 'text-gray-400'
              }`}
            />
            <span>首頁</span>
          </Link>
          <Link
            to="/products"
            onClick={isMobile ? onClose : undefined}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              location.pathname.startsWith('/products')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
            }`}
          >
            <FontAwesomeIcon
              icon={faLaptop}
              className={`h-5 w-5 mr-3 ${
                location.pathname.startsWith('/products') ? 'text-primary-500' : 'text-gray-400'
              }`}
            />
            <span>產品管理</span>
          </Link>
          <Link
            to="/warranty-alerts"
            onClick={isMobile ? onClose : undefined}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              location.pathname === '/warranty-alerts'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
            }`}
          >
            <FontAwesomeIcon
              icon={faBell}
              className={`h-5 w-5 mr-3 ${
                location.pathname === '/warranty-alerts' ? 'text-primary-500' : 'text-gray-400'
              }`}
            />
            <span>保固提醒</span>
          </Link>
          <Link
            to="/ai-analysis"
            onClick={isMobile ? onClose : undefined}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              location.pathname === '/ai-analysis'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
            }`}
          >
            <FontAwesomeIcon
              icon={faRobot}
              className={`h-5 w-5 mr-3 ${
                location.pathname === '/ai-analysis' ? 'text-primary-500' : 'text-gray-400'
              }`}
            />
            <span>AI產品分析</span>
          </Link>
          <Link
            to="/analytics"
            onClick={isMobile ? onClose : undefined}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              location.pathname === '/analytics'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
            }`}
          >
            <FontAwesomeIcon
              icon={faChartLine}
              className={`h-5 w-5 mr-3 ${
                location.pathname === '/analytics' ? 'text-primary-500' : 'text-gray-400'
              }`}
            />
            <span>統計分析</span>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            支援
          </h3>
          <div className="mt-2 space-y-1">
            <Link
              to="/profile"
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                location.pathname === '/profile'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
              }`}
            >
              <FontAwesomeIcon
                icon={faCog}
                className={`h-5 w-5 mr-3 ${
                  location.pathname === '/profile' ? 'text-primary-500' : 'text-gray-400'
                }`}
              />
              <span>設定</span>
            </Link>
            <Link
              to="/help"
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                location.pathname === '/help'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
              }`}
            >
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className={`h-5 w-5 mr-3 ${
                  location.pathname === '/help' ? 'text-primary-500' : 'text-gray-400'
                }`}
              />
              <span>幫助中心</span>
            </Link>
            <button
              onClick={() => {
                onLogout();
                if (isMobile) onClose();
              }}
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-red-700"
            >
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className="h-5 w-5 mr-3 text-gray-400"
              />
              <span>登出</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* 側邊欄 */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } 2xl:translate-x-0 bg-white border-r border-gray-200 shadow-lg`}
      >
        {renderContent(true)}
      </div>

      {/* 背景遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              className="flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              onClick={onClose}
            >
              <span className="sr-only">關閉選單</span>
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
