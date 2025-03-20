import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
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
  faReceipt,
  faBox,
  faEye,
  faFileAlt,
  faHdd
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

const typeIcons = {
  '智慧型手機': faMobileAlt,
  '筆記型電腦': faLaptop,
  '平板電腦': faTabletAlt,
  '耳機': faHeadphones,
  '桌上型電腦': faDesktop,
  '相機': faCamera,
  '智慧型手錶': faRobot,
};

const getTypeIcon = (type) => {
  return typeIcons[type] || faLaptop;
};

const getStatusStyle = (daysLeft) => {
  if (daysLeft <= 0) return 'bg-red-100 text-red-700';
  if (daysLeft <= 30) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
};

const getStatusText = (daysLeft) => {
  if (daysLeft <= 0) return '已過期';
  if (daysLeft <= 30) return `即將到期 (${daysLeft}天)`;
  return `有效 (${daysLeft}天)`;
};

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    brand: '',
    status: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('warrantyEndDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [availableFilters, setAvailableFilters] = useState({
    types: [],
    brands: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 0,  // 設為 0 表示不限制數量
    total: 0,
    pages: 0
  });

  const fetchProducts = async (search = '') => {
    setLoading(true);
    try {
      console.log('=== 開始獲取產品數據 ===');
  const requestParams = {
    search,
    sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
    type: filters.type,
    brand: filters.brand,
    warranty: filters.status || ''
  };
  console.log('API 請求參數:', requestParams);
  console.log('保固狀態篩選:', filters.status);
      
      // 構建查詢參數
      const queryParams = {
        ...requestParams,
        page: pagination.page,
        limit: pagination.limit || 100
      };
      console.log('發送請求參數:', queryParams);
      
      const response = await api.get('/api/products', {
        params: queryParams
      });

      const { data } = response.data;

      console.log('=== API 響應數據 ===');
      console.log('原始數據數量:', data.length);
      
      console.log('=== 開始處理產品數據 ===');
      const productsWithDaysLeft = [...data].map((product, index) => {
        // 設置為當天開始時間
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const endDate = new Date(product.warrantyEndDate);
        endDate.setHours(0, 0, 0, 0);
        
        const diffTime = endDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log(`產品 ${product.name} 的保固天數計算:`, {
          warrantyEndDate: product.warrantyEndDate,
          daysLeft,
          endDate: endDate.toISOString(),
          today: today.toISOString()
        });

        const enhancedProduct = {
          ...product,
          _id: product._id, // 確保ID被正確複製
          name: product.name,
          brand: product.brand,
          model: product.model,
          type: product.type,
          images: Array.isArray(product.images) ? [...product.images] : [],
          receipts: Array.isArray(product.receipts) ? [...product.receipts] : [],
          warrantyDocuments: Array.isArray(product.warrantyDocuments) ? [...product.warrantyDocuments] : [],
          purchaseDate: product.purchaseDate,
          warrantyEndDate: product.warrantyEndDate,
          daysLeft,
          warrantyStatus: daysLeft <= 0 ? 'expired' : 
                         daysLeft <= 30 ? 'expiring' : 
                         'active'
        };

        return enhancedProduct;
      });

      const types = [...new Set(productsWithDaysLeft.map(product => product.type))].filter(Boolean);
      const brands = [...new Set(productsWithDaysLeft.map(product => product.brand))].filter(Boolean);
      
      setAvailableFilters({
        types,
        brands
      });

      let filteredProducts = [...productsWithDaysLeft];
      if (filters.status) {
        filteredProducts = filteredProducts.filter(product => product.warrantyStatus === filters.status);
      }

      // 移除無效的產品
      const validProducts = filteredProducts.filter(product => product && product._id);

      // 排序
      const sortedProducts = [...filteredProducts].sort((a, b) => {
        let compareResult;

        // 處理日期欄位的特殊排序
        if (sortBy === 'warrantyEndDate' || sortBy === 'purchaseDate') {
          const dateA = new Date(a[sortBy]).getTime();
          const dateB = new Date(b[sortBy]).getTime();
          compareResult = dateA - dateB;
        }
        // 處理狀態欄位的特殊排序
        else if (sortBy === 'warrantyStatus') {
          const statusOrder = { expired: 2, expiring: 1, active: 0 };
          const statusA = statusOrder[a.warrantyStatus] || 0;
          const statusB = statusOrder[b.warrantyStatus] || 0;
          compareResult = statusA - statusB;
        }
        // 處理一般欄位的排序
        else {
          if (a[sortBy] === undefined || b[sortBy] === undefined) {
            compareResult = 0;
          } else if (typeof a[sortBy] === 'string') {
            compareResult = a[sortBy].localeCompare(b[sortBy]);
          } else {
            compareResult = a[sortBy] < b[sortBy] ? -1 : a[sortBy] > b[sortBy] ? 1 : 0;
          }
        }

        // 如果是降序，反轉比較結果
        return sortOrder === 'desc' ? compareResult * -1 : compareResult;
      });

      console.log('=== 排序完成 ===');
      console.log('處理後數據數量:', sortedProducts.length);
      
      setProducts(sortedProducts);
      
      // 更新分頁信息
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination,
          limit: response.data.pagination.limit || prev.limit
        }));
      }
    } catch (error) {
      console.error('獲取產品列表失敗:', error);
      setError('獲取產品列表時發生錯誤');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // 重置分頁
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    
    const timeoutId = setTimeout(() => {
      fetchProducts(value);
    }, 500);
    
    setSearchTimeout(timeoutId);
  };
  
  useEffect(() => {
    const cleanup = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
    
    fetchProducts(searchTerm);
    return cleanup;
  }, [sortBy, sortOrder, filters, searchTerm, pagination.page]); // 添加分頁依賴

  const handleFilterChange = (name, value) => {
    console.log('更改過濾條件:', { name, value });
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // 重置分頁到第一頁
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleSortChange = (field) => {
    console.log(`切換排序: ${field} (當前: ${sortBy}, ${sortOrder})`);
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    // 重置分頁到第一頁
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      brand: '',
      status: '',
      search: ''
    });
    // 重置分頁
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return null;
    return (
      <FontAwesomeIcon
        icon={sortOrder === 'asc' ? faSortAmountUp : faSortAmountDown}
        className="ml-1 text-gray-400"
      />
    );
  };
  
  const renderProductList = () => {
    return (
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
        <table className="min-w-full divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                類型
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('name')}
              >
                <div className="flex items-center">
                  產品名稱
                  {renderSortIcon('name')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('brand')}
              >
                <div className="flex items-center">
                  品牌/型號
                  {renderSortIcon('brand')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('purchaseDate')}
              >
                <div className="flex items-center">
                  購買日期
                  {renderSortIcon('purchaseDate')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('warrantyEndDate')}
              >
                <div className="flex items-center">
                  保固到期
                  {renderSortIcon('warrantyEndDate')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('warrantyStatus')}
              >
                <div className="flex items-center">
                  狀態
                  {renderSortIcon('warrantyStatus')}
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                相關文件
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr 
                key={product._id} 
                className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md flex items-center justify-center">
                    <FontAwesomeIcon icon={getTypeIcon(product.type)} className="h-5 w-5 text-blue-600" />
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          className="h-10 w-10 rounded-md object-cover"
                          src={product.images[0].startsWith('http') 
                            ? product.images[0] 
                            : `${process.env.REACT_APP_API_URL}${product.images[0]}`}
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`;
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                          <FontAwesomeIcon icon={getTypeIcon(product.type)} className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.brand}</div>
                  <div className="text-sm text-gray-500">{product.model}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(product.purchaseDate)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(product.warrantyEndDate)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(product.daysLeft)}`}>
                    {getStatusText(product.daysLeft)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(product.receipts?.length > 0 || product.warrantyDocuments?.length > 0) && (
                    <div className="flex items-center space-x-3">
                      {product.receipts?.length > 0 && (
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faReceipt} className="text-blue-500 mr-1" />
                          <span>{product.receipts.length}</span>
                        </div>
                      )}
                      {product.warrantyDocuments?.length > 0 && (
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faFileAlt} className="text-green-500 mr-1" />
                          <span>{product.warrantyDocuments.length}</span>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-3 grid grid-cols-3 gap-4">
            <div>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2"
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
              <select
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2"
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
              <select
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2"
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
          <div className="relative md:col-span-1">
            <input
              type="text"
              placeholder="搜索產品名稱、品牌或型號..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FontAwesomeIcon icon={faSearch} />
            </div>
          </div>
        </div>

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
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                品牌: {filters.brand}
                <button
                  className="ml-2 text-blue-600 hover:text-blue-800"
                  onClick={() => handleFilterChange('brand', '')}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.status && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                filters.status === 'active' ? 'bg-green-100 text-green-800' :
                filters.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                狀態: {
                  filters.status === 'active' ? '有效保固' :
                  filters.status === 'expiring' ? '即將到期' :
                  '已過期'
                }
                <button
                  className={`ml-2 ${
                    filters.status === 'active' ? 'text-green-600 hover:text-green-800' :
                    filters.status === 'expiring' ? 'text-yellow-600 hover:text-yellow-800' :
                    'text-red-600 hover:text-red-800'
                  }`}
                  onClick={() => handleFilterChange('status', '')}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </div>
            )}
            {(filters.type || filters.brand || filters.status) && (
              <button
                className="text-gray-500 hover:text-gray-700 text-sm"
                onClick={clearFilters}
              >
                清除所有篩選
              </button>
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
          <FontAwesomeIcon icon={faBox} className="text-gray-400 text-5xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? '沒有找到符合條件的產品' : '還沒有添加任何產品'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? '請嘗試使用其他關鍵字搜尋' : '點擊右上角的按鈕開始添加產品'}
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-center gap-4">
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
        </div>
      ) : (
        renderProductList()
      )}
      
      {/* 分頁控制 */}
      {!loading && products.length > 0 && pagination.pages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            共 {pagination.total} 個產品，第 {pagination.page} / {pagination.pages} 頁
          </div>
          <div className="flex gap-2">
            {pagination.prev && (
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
              >
                上一頁
              </button>
            )}
            {pagination.next && (
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
              >
                下一頁
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
