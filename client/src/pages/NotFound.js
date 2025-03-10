import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-yellow-500 text-5xl mb-4"
          />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-bold text-gray-800 mb-4">頁面未找到</h2>
          <p className="text-gray-600 mb-6">
            您訪問的頁面不存在或已被移除。
          </p>
          <div className="flex justify-center">
            <Button to="/" variant="primary" icon={faHome}>
              返回首頁
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 