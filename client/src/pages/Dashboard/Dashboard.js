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
  faUserCircle,
  faArrowRight,
  faClock,
  faShieldAlt,
  faBox,
  faCheckCircle,
  faTag,
  faHistory,
  faFilter,
  faSort,
  faCalendarDay
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
    validProducts: 0,
    expiredProducts: 0,
  });
  const [joke, setJoke] = useState('');
  const [showJoke, setShowJoke] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [upcomingWarranties, setUpcomingWarranties] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'expired', 'expiring', 'valid'

  // 獲取笑話的函數
  const fetchJoke = async () => {
    try {
      const response = await api.post('/api/joke');
      
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error('API 響應格式不正確');
      }

      setJoke(response.data.choices[0].message.content);
      setShowJoke(true);
    } catch (error) {
      console.error('獲取笑話失敗:', error);
      setJoke('');
      setShowJoke(false);
    }
  };

  useEffect(() => {
    // 從後端 API 獲取儀表板數據
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 獲取產品統計數據
        const statsResponse = await api.get('/api/products/stats');
        console.log('統計數據響應:', statsResponse.data);
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
            limit: 8
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
    fetchJoke(); // 獲取笑話
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  // 根據剩餘天數獲取狀態顏色
  const getStatusColor = (daysLeft) => {
    if (daysLeft <= 0) return 'text-red-600 bg-red-50';
    if (daysLeft <= 30) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  // 獲取產品狀態標籤
  const getStatusLabel = (daysLeft) => {
    if (daysLeft <= 0) return '已過期';
    if (daysLeft <= 30) return '即將到期';
    if (daysLeft <= 90) return '保固中';
    return '保固中';
  };

  // 根據保固狀態篩選產品
  const getFilteredWarranties = () => {
    if (filterStatus === 'all') return upcomingWarranties;
    if (filterStatus === 'expired') return upcomingWarranties.filter(p => p.daysLeft <= 0);
    if (filterStatus === 'expiring') return upcomingWarranties.filter(p => p.daysLeft > 0 && p.daysLeft <= 30);
    if (filterStatus === 'valid') return upcomingWarranties.filter(p => p.daysLeft > 30);
    return upcomingWarranties;
  };

  // 獲取保固狀態的分佈數據
  const getStatusDistribution = () => {
    const expired = upcomingWarranties.filter(p => p.daysLeft <= 0).length;
    const expiring = upcomingWarranties.filter(p => p.daysLeft > 0 && p.daysLeft <= 30).length;
    const valid = upcomingWarranties.filter(p => p.daysLeft > 30).length;
    return { expired, expiring, valid };
  };

  const filteredWarranties = getFilteredWarranties();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="m-6">
        {error}
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 頂部區域 - 時間敏感信息 */}
      <div className="mb-8">
        <div className="space-y-4">
          {/* 歡迎卡片 */}
          <div className="w-full">
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white h-full shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold mb-2">你好，{user?.fullName || user?.username || '用戶'}</h1>
                    {joke && (
                      <div className={`transition-opacity duration-500 ${showJoke ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-blue-100">{joke}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      to="/products/add"
                      variant="light"
                      className="bg-white text-blue-700 hover:bg-blue-50 shadow-md"
                      icon={faPlus}
                    >
                      添加產品
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 緊急提醒卡片 */}
          {upcomingWarranties.length > 0 && upcomingWarranties[0]?.daysLeft <= 7 && (
            <div className="p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg bg-red-500/20 mr-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-700">緊急提醒</h3>
              </div>
              <p className="mb-3 text-gray-700">
                <span className="font-bold text-red-600">{upcomingWarranties[0].name}</span> 的保固將在 
                <span className="font-bold text-red-600 mx-1">{upcomingWarranties[0].daysLeft}</span> 
                天內到期！
              </p>
              <Button
                to={`/products/${upcomingWarranties[0]._id}`}
                variant="light"
                className="bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 text-sm px-4 py-2 shadow-sm"
                size="sm"
              >
                查看詳情
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center p-2">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4 flex-shrink-0">
                <FontAwesomeIcon icon={faBox} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1">總產品數量</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center p-2">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4 flex-shrink-0">
                <FontAwesomeIcon icon={faShieldAlt} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1">有效保固產品</p>
                <p className="text-2xl font-bold text-gray-900">{stats.validProducts}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center p-2">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4 flex-shrink-0">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1">已過期產品</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiredProducts}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 保固到期日程 - 重新設計的區域 */}
        <div className="lg:col-span-8">
          <Card 
            title="保固到期日程"
            subtitle="管理您的產品保固情況"
            icon={<FontAwesomeIcon icon={faCalendarAlt} className="h-5 w-5 text-primary-500" />}
            extra={
              <Link to="/warranty-alerts" className="text-sm font-medium text-primary-600 hover:text-primary-500 hover:underline flex items-center">
                查看全部
                <FontAwesomeIcon icon={faArrowRight} className="ml-1 h-3 w-3" />
              </Link>
            }
            className="bg-white shadow-md hover:shadow-lg transition-all duration-300 h-full"
          >
            {upcomingWarranties.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <div className="bg-blue-50 inline-flex p-4 rounded-full mb-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-gray-600 text-lg mb-4">目前沒有即將到期的保固</p>
                <Button
                  to="/products/add"
                  variant="primary"
                  size="sm"
                  className="shadow-md hover:shadow-lg"
                  icon={faPlus}
                >
                  添加新產品
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWarranties.length > 0 ? (
                  filteredWarranties.map((product) => (
                    <div 
                      key={product._id}
                      className={`relative overflow-hidden p-4 border rounded-lg transition-all hover:shadow-md ${
                        product.daysLeft <= 0 ? 'border-l-4 border-l-red-500' : 
                        product.daysLeft <= 30 ? 'border-l-4 border-l-amber-400' : 'border-gray-100'
                      }`}
                    >
                      <Link 
                        to={`/products/${product._id}`}
                        className="block group"
                      >
                        <div className="flex items-start">
                          <img
                            src={product.images && product.images.length > 0
                              ? product.images[0].startsWith('http')
                                ? product.images[0]
                                : `${process.env.REACT_APP_API_URL}${product.images[0]}`
                              : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`}
                            alt={product.name}
                            className="h-16 w-16 rounded-md object-cover mr-4 border border-gray-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`;
                            }}
                          />

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-base font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                {product.name}
                              </h3>
                              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(product.daysLeft)}`}>
                                {getStatusLabel(product.daysLeft)}
                              </span>
                            </div>
                            
                            <div className="mt-1 flex items-center text-gray-500 text-sm">
                              <FontAwesomeIcon icon={faTag} className="mr-1 h-3 w-3" />
                              <span className="mr-3">{product.brand}</span>
                              <FontAwesomeIcon icon={faLaptop} className="mr-1 h-3 w-3" />
                              <span>{product.type}</span>
                            </div>
                            
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex items-center mr-4">
                                  <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5 h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">到期: {formatDate(product.warrantyEndDate)}</span>
                                </div>
                              </div>
                              
                              <div className={`text-sm font-medium ${
                                product.daysLeft <= 0 ? 'text-red-600' : 
                                product.daysLeft <= 30 ? 'text-amber-600' : 'text-gray-700'
                              }`}>
                                {product.daysLeft <= 0 ? '已過期' : `${product.daysLeft} 天`}
                              </div>
                            </div>
                            
                            {product.daysLeft <= 30 && product.daysLeft > 0 && (
                              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    product.daysLeft <= 7 ? 'bg-red-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(100, 100-(product.daysLeft / 30) * 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FontAwesomeIcon icon={faFilter} className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">沒有符合篩選條件的產品</p>
                    <Button
                      onClick={() => setFilterStatus('all')}
                      variant="text"
                      size="sm"
                      className="mt-2"
                    >
                      查看全部產品
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* 右側: 最近添加的產品 */}
        <div className="lg:col-span-4 space-y-6">
          {/* 最近添加的產品 */}
          <Card
            title="最近添加"
            icon={<FontAwesomeIcon icon={faLaptop} className="h-5 w-5 text-primary-500" />}
            extra={
              <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-500 hover:underline flex items-center">
                查看全部
                <FontAwesomeIcon icon={faArrowRight} className="ml-1 h-3 w-3" />
              </Link>
            }
            className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            {recentProducts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="bg-blue-50 inline-flex p-4 rounded-full mb-4">
                  <FontAwesomeIcon icon={faLaptop} className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-gray-600 mb-4">尚未添加產品</p>
                <Button
                  to="/products/add"
                  variant="primary"
                  size="sm"
                  className="shadow-md hover:shadow-lg"
                  icon={faPlus}
                >
                  添加產品
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="block group"
                  >
                    <div className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-primary-100 hover:bg-gray-50 transition-all">
                      <img
                        src={product.images && product.images.length > 0
                          ? product.images[0].startsWith('http')
                            ? product.images[0]
                            : `${process.env.REACT_APP_API_URL}${product.images[0]}`
                          : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`}
                        alt={product.name}
                        className="h-12 w-12 rounded-md object-cover mr-3 border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {product.brand} · {product.type}
                        </p>
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(product.daysLeft)}`}>
                          {product.daysLeft <= 0 ? '已過期' : `${product.daysLeft} 天`}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
