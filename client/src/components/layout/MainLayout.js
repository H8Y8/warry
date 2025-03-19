import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // 監控側邊欄狀態變化
  useEffect(() => {
    console.log('Sidebar state changed:', sidebarOpen);
  }, [sidebarOpen]);

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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* 側邊欄 */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={user}
        onLogout={handleLogout}
      />
      
      {/* 主內容區 */}
      <div className="flex flex-col flex-1 w-0 min-w-0 overflow-hidden 2xl:ml-64 transition-all duration-300">
        {/* 導航欄 */}
        <Navbar 
          onToggleSidebar={toggleSidebar}
          user={user}
          onLogout={handleLogout}
        />

        {/* 頁面內容 */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
          <div className="mx-auto max-w-full">
            <Outlet />
          </div>
        </main>

        {/* 頁腳 */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
