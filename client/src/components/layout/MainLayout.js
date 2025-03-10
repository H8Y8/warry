import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faTimes, faHome, faLaptop, faCog, 
  faBell, faSignOutAlt, faRobot 
} from '@fortawesome/free-solid-svg-icons';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';

// 側邊欄菜單項目
const menuItems = [
  { path: '/dashboard', label: '儀表板', icon: faHome },
  { path: '/products', label: '產品列表', icon: faLaptop },
  { path: '/warranty-alerts', label: '保固提醒', icon: faBell },
  { path: '/ai-analysis', label: 'AI產品分析', icon: faRobot },
  { path: '/profile', label: '個人設置', icon: faCog },
];

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 側邊欄 */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar}
        menuItems={menuItems}
        onLogout={handleLogout}
      />

      {/* 主內容區 */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* 導航欄 */}
        <Navbar 
          onToggleSidebar={toggleSidebar}
          user={user}
          onLogout={handleLogout}
        />

        {/* 頁面內容 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>

        {/* 頁腳 */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout; 