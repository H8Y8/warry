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
        // 在實際應用中，這裡會調用API
        // const response = await api.get('/products', {
        //   params: {
        //     ...filters,
        //     sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
        //   }
        // });

        // 模擬API請求
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模擬產品數據
        const mockProducts = [
          {
            id: 1,
            name: 'iPhone 13 Pro',
            type: '智慧型手機',
            brand: 'Apple',
            model: 'A2483',
            purchaseDate: '2021-09-30',
            warrantyEndDate: '2023-09-30',
            daysLeft: 92,
            image: 'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aXBob25lJTIwMTN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 2,
            name: 'MacBook Pro 14"',
            type: '筆記型電腦',
            brand: 'Apple',
            model: 'A2442',
            purchaseDate: '2021-11-20',
            warrantyEndDate: '2023-11-20',
            daysLeft: 143,
            image: 'https://images.unsplash.com/photo-1639249227523-86c063f75d20?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fG1hY2Jvb2slMjBwcm98ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 3,
            name: 'Galaxy Watch 4',
            type: '智慧型手錶',
            brand: 'Samsung',
            model: 'SM-R860',
            purchaseDate: '2022-02-15',
            warrantyEndDate: '2023-07-15',
            daysLeft: 15,
            image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGdhbGF4eSUyMHdhdGNofGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 4,
            name: 'Bose QuietComfort 45',
            type: '耳機',
            brand: 'Bose',
            model: 'QC45',
            purchaseDate: '2022-01-10',
            warrantyEndDate: '2023-08-10',
            daysLeft: 41,
            image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8aGVhZHBob25lc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 5,
            name: 'iPad Pro 12.9"',
            type: '平板電腦',
            brand: 'Apple',
            model: 'A2378',
            purchaseDate: '2021-06-15',
            warrantyEndDate: '2023-06-15',
            daysLeft: -15,
            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8aXBhZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 6,
            name: 'Sony α7 IV',
            type: '相機',
            brand: 'Sony',
            model: 'ILCE-7M4',
            purchaseDate: '2022-03-20',
            warrantyEndDate: '2024-03-20',
            daysLeft: 264,
            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtZXJhfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
          }
        ];

        // 提取可用的過濾選項
        const types = [...new Set(mockProducts.map(p => p.type))];
        const brands = [...new Set(mockProducts.map(p => p.brand))];
        setAvailableFilters({
          types,
          brands
        });

        // 過濾產品
        let filteredProducts = [...mockProducts];
        
        if (filters.type) {
          filteredProducts = filteredProducts.filter(p => p.type === filters.type);
        }
        
        if (filters.brand) {
          filteredProducts = filteredProducts.filter(p => p.brand === filters.brand);
        }
        
        if (filters.status) {
          if (filters.status === 'active') {
            filteredProducts = filteredProducts.filter(p => p.daysLeft > 0);
          } else if (filters.status === 'expiring') {
            filteredProducts = filteredProducts.filter(p => p.daysLeft > 0 && p.daysLeft <= 30);
          } else if (filters.status === 'expired') {
            filteredProducts = filteredProducts.filter(p => p.daysLeft <= 0);
          }
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.brand.toLowerCase().includes(searchLower) ||
            p.model.toLowerCase().includes(searchLower)
          );
        }

        // 排序產品
        filteredProducts.sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'brand':
              comparison = a.brand.localeCompare(b.brand);
              break;
            case 'type':
              comparison = a.type.localeCompare(b.type);
              break;
            case 'warrantyEndDate':
              comparison = new Date(a.warrantyEndDate) - new Date(b.warrantyEndDate);
              break;
            case 'purchaseDate':
              comparison = new Date(a.purchaseDate) - new Date(b.purchaseDate);
              break;
            default:
              comparison = a.id - b.id;
          }
          
          return sortOrder === 'asc' ? comparison : -comparison;
        });

        setProducts(filteredProducts);
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
    return (
      <Card
        key={product.id}
        hoverable
        bordered
        shadowSize="sm"
        to={`/products/${product.id}`}
        className="overflow-hidden"
      >
        <div className="aspect-w-16 aspect-h-9 mb-4 -mx-4 -mt-4">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-40"
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