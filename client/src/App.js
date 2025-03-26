import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// 佈局組件
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// 頁面組件
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import Profile from './pages/Profile/Profile';
import WarrantyAlerts from './pages/Warranty/WarrantyAlerts';
import AIAnalysis from './pages/AIAnalysis/AIAnalysis';
import NotFound from './pages/NotFound';
import Help from './pages/Help/Help';

// 路由保護元件
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  const { checkAuthStatus } = useAuth();
  
  useEffect(() => {
    // 檢查用戶身份狀態
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <Routes>
      {/* 公開路由 */}
      <Route path="/" element={<Home />} />

      {/* 認證路由 */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* 受保護的路由 */}
      <Route 
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/edit/:id" element={<EditProduct />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/warranty-alerts" element={<WarrantyAlerts />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/help" element={<Help />} />
      </Route>

      {/* 404頁面 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
