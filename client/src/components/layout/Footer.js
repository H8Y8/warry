import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900">
            使用條款
          </Link>
          <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
            隱私政策
          </Link>
          <Link to="/help" className="text-sm text-gray-500 hover:text-gray-900">
            幫助中心
          </Link>
        </div>
        <div className="mt-2 md:mt-0 md:order-1">
          <p className="text-center text-sm text-gray-500">
            &copy; {currentYear} 電子產品保固記錄服務. 保留所有權利.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 