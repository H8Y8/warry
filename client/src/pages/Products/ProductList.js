import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faFilter,
  faSort,
  faEllipsisV,
  faLaptop,
  faMobileAlt,
  faHeadphones,
  faTabletAlt,
  faDesktop,
  faCamera,
  faRobot,
  faTimes,
  faSortAmountDown,
  faSortAmountUp,
  faTag,
  faGamepad,
  faClock,
  faCalendarAlt,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

// 產品類型圖標映射
const typeIcons = {
  '智慧型手機': faMobileAlt,
  '筆記型電腦': faLaptop,
  '平板電腦': faTabletAlt,
  '耳機': faHeadphones,
  '桌上型電腦': faDesktop,
  '相機': faCamera,
  '智慧型手錶': faRobot,
};

// 獲取產品類型圖標
const getTypeIcon = (type) => {
  return typeIcons[type] || faLaptop;
};

// 產品狀態標籤樣式
const getStatusStyle = (daysLeft) => {
  if (daysLeft <= 0) return 'bg-red-100 text-red-700';
  if (daysLeft <= 30) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    brand: '',
    status: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    types: [],
    brands: []
  });

  // 獲取產品列表
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // 構建查詢參數
        const params = {};
        if (filters.type) params.type = filters.type;
        if (filters.brand) params.brand = filters.brand;
        if (filters.status) params.warranty = filters.status;
        if (filters.search) params.search = filters.search;
        if (sortBy) {
          params.sort = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
        }

        // 從後端 API 獲取產品列表
        const response = await api.get('/api/products', { params });
        const { data } = response.data;

        // 提取可用的過濾選項
        const types = [...new Set(data.map(p => p.type))];
        const brands = [...new Set(data.map(p => p.brand))];
        setAvailableFilters({
          types,
          brands
        });

        // 計算每個產品的保固剩餘天數
        const productsWithDaysLeft = data.map(product => {
          const today = new Date();
          const endDate = new Date(product.warrantyEndDate);
          const diffTime = endDate - today;
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            ...product,
            daysLeft: daysLeft > 0 ? daysLeft : 0
          };
        });

        setProducts(productsWithDaysLeft);
        setLoading(false);
      } catch (error) {
        console.error('獲取產品數據錯誤:', error);
        setError('獲取產品數據時發生錯誤，請稍後再試');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, sortBy, sortOrder]);

  // 處理過濾器變更
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理排序變更
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // 清除所有過濾器
  const clearFilters = () => {
    setFilters({
      type: '',
      brand: '',
      status: '',
      search: ''
    });
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  // 渲染產品卡片
  const renderProductCard = (product) => {
    // 獲取第一張圖片的URL，確保路徑正確
    const imageUrl = product.images && product.images.length > 0
      ? product.images[0].startsWith('http')
        ? product.images[0]
        : `${process.env.REACT_APP_API_URL}/uploads/products/${product.images[0]}`
      : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`;

    return (
      <Card
        key={product._id}
        hoverable
        bordered
        shadowSize="sm"
        to={`/products/${product._id}`}
        className="overflow-hidden"
      >
        <div className="aspect-w-16 aspect-h-9 mb-4 -mx-4 -mt-4">
          <img
            src={imageUrl}
            alt={product.name}
            className="object-cover w-full h-40"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${process.env.REACT_APP_API_URL}/uploads/default-product-image.jpg`;
            }}
          />
        </div>
        <div className="flex items-start mb-2">
          <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md mr-3">
            <FontAwesomeIcon icon={getTypeIcon(product.type)} className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-lg text-gray-900">{product.name}</h3>
            <p className="text-gray-500 text-sm">{product.brand} · {product.model}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <div>購買: {formatDate(product.purchaseDate)}</div>
            <div>到期: {formatDate(product.warrantyEndDate)}</div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(product.daysLeft)}`}>
            {product.daysLeft <= 0 ? '已過期' : `剩餘 ${product.daysLeft} 天`}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的產品</h1>
          <p className="text-sm text-gray-600">管理您的所有電子產品及其保固資訊</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            to="/ai-analysis" 
            variant="secondary"
            icon={faRobot}
          >
            AI產品分析
          </Button>
          <Button 
            to="/products/add" 
            variant="primary"
            icon={faPlus}
          >
            添加產品
          </Button>
        </div>
      </div>

      {/* 搜索和過濾器 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="搜索產品名稱、品牌或型號..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FontAwesomeIcon icon={faSearch} />
            </div>
          </div>
          <Button
            variant="secondary"
            icon={faFilter}
            onClick={() => setShowFilters(!showFilters)}
          >
            過濾器
          </Button>
          <Button
            variant="secondary"
            icon={faSort}
            onClick={() => handleSortChange('warrantyEndDate')}
          >
            {sortBy === 'warrantyEndDate' ? (
              sortOrder === 'asc' ? '到期日 (升序)' : '到期日 (降序)'
            ) : '排序'}
          </Button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">產品類型</label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">全部類型</option>
                  {availableFilters.types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                >
                  <option value="">全部品牌</option>
                  {availableFilters.brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">保固狀態</label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">全部狀態</option>
                  <option value="active">有效保固</option>
                  <option value="expiring">即將到期 (30天內)</option>
                  <option value="expired">已過期</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              >
                清除過濾器
              </Button>
            </div>
          </div>
        )}

        {/* 顯示活躍的過濾器 */}
        {(filters.type || filters.brand || filters.status) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.type && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                類型: {filters.type}
                <button
                  className="ml-2 text-blue-600 hover:text-blue-800"
                  onClick={() => handleFilterChange('type', '')}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.brand && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                品牌: {filters.brand}
                <button
                  className="ml-2 text-green-600 hover:text-green-800"
                  onClick={() => handleFilterChange('brand', '')}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.status && (
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                狀態: {
                  filters.status === 'active' ? '有效保固' :
                  filters.status === 'expiring' ? '即將到期' :
                  '已過期'
                }
                <button
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                  onClick={() => handleFilterChange('status', '')}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert 
          variant="error" 
          className="mb-4"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FontAwesomeIcon icon={faLaptop} className="text-gray-400 text-5xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有添加產品</h3>
          <p className="text-gray-600 mb-6">
            開始添加您的電子產品以追踪保固期限，避免錯過重要的維修機會。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              to="/products/add" 
              variant="primary"
              icon={faPlus}
            >
              手動添加產品
            </Button>
            <Button 
              to="/ai-analysis" 
              variant="secondary"
              icon={faRobot}
            >
              使用AI分析添加
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(renderProductCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList; 
