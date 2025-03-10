import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop } from '@fortawesome/free-solid-svg-icons';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center">
            <FontAwesomeIcon icon={faLaptop} className="text-primary-600 h-8 w-8 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">電子產品保固記錄</h2>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} 電子產品保固記錄服務. 保留所有權利.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 