import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faLaptop,
  faPlus,
  faBell,
  faCalendarAlt,
  faExclamationTriangle,
  faSearch,
  faRobot,
  faHome,
  faQuestionCircle,
  faChartLine,
  faCog,
  faSignOutAlt,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    expiringProducts: 0,
    expiredProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [upcomingWarranties, setUpcomingWarranties] = useState([]);

  useEffect(() => {
    // 從後端 API 獲取儀表板數據
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 獲取產品統計數據
        const statsResponse = await api.get('/api/products/stats');
        setStats(statsResponse.data.data);

        // 獲取最近添加的產品
        const recentResponse = await api.get('/api/products', {
          params: {
            sort: '-createdAt',
            limit: 3
          }
        });

        // 計算每個產品的保固剩餘天數
        const productsWithDaysLeft = recentResponse.data.data.map(product => {
          const today = new Date();
          const endDate = new Date(product.warrantyEndDate);
          const diffTime = endDate - today;
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            ...product,
            daysLeft
          };
        });
        
        setRecentProducts(productsWithDaysLeft);

        // 獲取即將到期的保固
        const warrantiesResponse = await api.get('/api/products', {
          params: {
            sort: 'warrantyEndDate',
            warranty: 'expiring',
            limit: 5
          }
        });

        // 計算即將到期產品的剩餘天數
        const warrantiesWithDaysLeft = warrantiesResponse.data.data.map(product => {
          const today = new Date();
          const endDate = new Date(product.warrantyEndDate);
          const diffTime = endDate - today;
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            ...product,
            daysLeft
          };
        });

        setUpcomingWarranties(warrantiesWithDaysLeft);
        setError(null);
      } catch (error) {
        console.error('獲取儀表板數據錯誤:', error);
        setError('獲取數據時發生錯誤，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  // 根據剩餘天數獲取狀態顏色
  const getStatusColor = (daysLeft) => {
    if (daysLeft <= 0) return 'text-red-600';
    if (daysLeft <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="mb-4">
        {error}
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 歡迎區域 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 truncate">歡迎回來，{user?.fullName || user?.username || '用戶'}</h1>
          <p className="text-gray-600 text-sm truncate">這是您的產品保固儀表板，您可以在這裡查看和管理您的所有產品保固資訊。</p>
        </div>
        <div className="mt-4 md:mt-0 flex-shrink-0">
          <Button
            to="/products/add"
            variant="primary"
            className="w-full md:w-auto whitespace-nowrap"
            icon={faPlus}
          >
            添加新產品
          </Button>
        </div>
      </div>

      {/* 狀態卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 mr-4 flex-shrink-0">
              <FontAwesomeIcon icon={faLaptop} className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">總產品數量</p>
              <p className="text-2xl font-semibold text-gray-900 truncate">{stats.totalProducts}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600 mr-4 flex-shrink-0">
              <FontAwesomeIcon icon={faCalendarAlt} className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">即將到期產品</p>
              <p className="text-2xl font-semibold text-gray-900 truncate">{stats.expiringProducts}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-red-50 text-red-600 mr-4 flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">已過期產品</p>
              <p className="text-2xl font-semibold text-gray-900 truncate">{stats.expiredProducts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 主要內容區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側：即將到期的保固 */}
        <div className="lg:col-span-2">
          <Card 
            title="即將到期的保固" 
            subtitle="請注意這些產品的保固期限"
            icon={<FontAwesomeIcon icon={faBell} className="h-5 w-5 text-yellow-500" />}
            extra={
              <Link to="/warranty-alerts" className="text-sm font-medium text-primary-600 hover:text-primary-500 whitespace-nowrap">
                查看全部
              </Link>
            }
            className="h-full"
          >
            {upcomingWarranties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 whitespace-nowrap">沒有即將到期的保固</p>
                <Button
                  to="/products/add"
                  variant="primary"
                  size="sm"
                  className="mt-4 whitespace-nowrap"
                  icon={faPlus}
                >
                  添加產品
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        產品名稱
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        類型
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        到期日期
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        剩餘天數
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingWarranties.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link 
                            to={`/products/${product._id}`}
                            className="text-primary-600 hover:text-primary-900 font-medium truncate block"
                          >
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.type}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(product.warrantyEndDate)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.daysLeft)} bg-opacity-10 whitespace-nowrap`}>
                            {product.daysLeft <= 0 ? '已過期' : `${product.daysLeft} 天`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* 右側：最近添加的產品和快速操作 */}
        <div className="space-y-8">
          {/* 快速操作 */}
          <Card className="bg-white">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">快速操作</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  to="/ai-analysis"
                  variant="secondary"
                  className="w-full min-h-[2.5rem] text-sm flex items-center justify-center"
                  icon={faRobot}
                >
                  AI產品分析
                </Button>
                <Button
                  to="/products"
                  variant="light"
                  className="w-full min-h-[2.5rem] text-sm flex items-center justify-center"
                  icon={faLaptop}
                >
                  查看所有產品
                </Button>
                <Button
                  to="/warranty-alerts"
                  variant="light"
                  className="w-full min-h-[2.5rem] text-sm flex items-center justify-center"
                  icon={faBell}
                >
                  保固提醒
                </Button>
                <Button
                  to="/calendar"
                  variant="light"
                  className="w-full min-h-[2.5rem] text-sm flex items-center justify-center"
                  icon={faCalendarAlt}
                >
                  保固日曆
                </Button>
              </div>
            </div>
          </Card>

          {/* 最近添加的產品 */}
          <Card
            title="最近添加的產品"
            subtitle="您最近添加的產品列表"
            icon={<FontAwesomeIcon icon={faLaptop} className="h-5 w-5 text-primary-500" />}
            extra={
              <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                查看全部
              </Link>
            }
          >
            {recentProducts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 whitespace-nowrap">尚未添加產品</p>
                <Button
                  to="/products/add"
                  variant="primary"
                  size="sm"
                  className="mt-2 whitespace-nowrap"
                  icon={faPlus}
                >
                  添加產品
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={product.images && product.images.length > 0
                          ? product.images[0].startsWith('http')
                            ? product.images[0]
                            : `${process.env.REACT_APP_API_URL}${product.images[0]}`
                          : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${product._id}`}
                        className="text-sm font-medium text-gray-900 truncate block hover:text-primary-600"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-gray-500 truncate">{product.brand} · {product.type}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-xs font-medium ${getStatusColor(product.daysLeft)} whitespace-nowrap`}>
                        {product.daysLeft <= 0 ? '已過期' : `${product.daysLeft} 天`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* AI提示信息 */}
          <Alert
            variant="info"
            title="AI產品分析"
            icon={faRobot}
            dismissible
            className="bg-blue-50 border-blue-100"
          >
            <p className="text-sm text-blue-700 leading-relaxed">使用AI快速識別產品並創建保固記錄。只需上傳產品照片，我們的AI將自動辨識產品資訊。</p>
            <div className="mt-3">
              <Button 
                to="/ai-analysis" 
                variant="primary" 
                size="sm" 
                icon={faRobot}
                className="bg-blue-600 hover:bg-blue-700 text-sm flex items-center justify-center"
              >
                開始使用
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
