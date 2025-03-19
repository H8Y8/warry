import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parseISO, isValid } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faFilter, 
  faSearch,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faLaptop,
  faInfoCircle,
  faSyncAlt,
  faClock,
  faAngleRight,
  faShieldAlt,
  faListAlt
} from '@fortawesome/free-solid-svg-icons';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

// 日曆本地化
import moment from 'moment';
import 'moment/locale/zh-tw';
moment.locale('zh-tw');
const localizer = momentLocalizer(moment);

// 自定義事件樣式
const eventStyleGetter = (event) => {
  let style = {
    borderRadius: '5px',
    opacity: 0.8,
    color: 'white',
    border: '0',
    display: 'block',
    fontWeight: 'bold',
    padding: '4px 8px'
  };
  
  if (event.status === 'expired') {
    style.backgroundColor = '#ef4444'; // 紅色，已過期
  } else if (event.status === 'expiring-soon') {
    style.backgroundColor = '#f59e0b'; // 黃色，即將過期
  } else {
    style.backgroundColor = '#10b981'; // 綠色，正常
  }
  
  return { style };
};

// 自定義時間格式化 - 只顯示日期，不顯示時間
const formats = {
  dateFormat: 'dd',
  dayFormat: 'dd',
  monthHeaderFormat: 'yyyy年 MMMM',
  dayHeaderFormat: 'M月d日 dddd',
  dayRangeHeaderFormat: ({ start, end }) => 
    `${format(start, 'M月d日', { locale: zhTW })} - ${format(end, 'M月d日', { locale: zhTW })}`,
  agendaDateFormat: 'M月d日',
  agendaHeaderFormat: ({ start, end }) => 
    `${format(start, 'M月d日', { locale: zhTW })} - ${format(end, 'M月d日', { locale: zhTW })}`,
};

const WarrantyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const productListRef = useRef(null);
  const [activeProductIndex, setActiveProductIndex] = useState(-1);
  
  // 獲取所有產品保固數據
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // 嘗試不同的 API 端點路徑，優先使用 /api/products
        let response;
        try {
          // 首先嘗試正確的端點
          response = await api.get('/api/products');
        } catch (firstError) {
          console.log('嘗試 /api/products 端點失敗，嘗試替代路徑...');
          try {
            response = await api.get('/products');
          } catch (secondError) {
            console.log('兩個 API 路徑都失敗，使用測試數據');
            throw secondError;
          }
        }
        
        // 檢查 API 響應結構，獲取正確的產品數據
        const products = response.data.data || response.data;
        console.log('獲取的產品數據:', products);
        
        if (!Array.isArray(products)) {
          throw new Error('API 返回的數據格式不正確');
        }
        
        // 轉換產品數據為日曆事件
        const calendarEvents = products.map(product => {
          const warrantyEndDate = parseISO(product.warrantyEndDate);
          
          // 計算距離保固到期的天數
          const today = new Date();
          const timeDiff = warrantyEndDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          // 確定保固狀態
          let status = 'active';
          if (daysDiff < 0) {
            status = 'expired';
          } else if (daysDiff <= 30) {
            status = 'expiring-soon';
          }
          
          return {
            id: product._id,
            title: product.name,
            start: new Date(warrantyEndDate.setHours(0, 0, 0, 0)), // 只保留日期，移除時間
            end: new Date(warrantyEndDate.setHours(23, 59, 59, 999)), // 結束時間設為當天最後一刻
            allDay: true,
            resource: product,
            status: status,
            days: daysDiff
          };
        });
        
        setEvents(calendarEvents);
        setLoading(false);
      } catch (err) {
        console.error('獲取產品數據失敗:', err);
        
        // 添加測試數據用於演示
        const testData = generateTestData();
        setEvents(testData);
        setError('無法連接到伺服器，顯示測試數據。');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // 生成測試數據
  const generateTestData = () => {
    const today = new Date();
    
    // 生成未來、即將到期和已過期的產品範例
    const testProducts = [
      {
        id: 'test-1',
        title: 'MacBook Pro 2023',
        start: new Date(today.getFullYear(), today.getMonth() + 8, 15),
        end: new Date(today.getFullYear(), today.getMonth() + 8, 15),
        allDay: true,
        resource: {
          _id: 'test-1',
          name: 'MacBook Pro 2023',
          brand: 'Apple',
          serialNumber: 'FVFDJ567890',
        },
        status: 'active',
        days: 240
      },
      {
        id: 'test-2',
        title: 'iPhone 13 Pro',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20),
        allDay: true,
        resource: {
          _id: 'test-2',
          name: 'iPhone 13 Pro',
          brand: 'Apple',
          serialNumber: 'C79PJ123456',
        },
        status: 'expiring-soon',
        days: 20
      },
      {
        id: 'test-3',
        title: 'ThinkPad X1 Carbon',
        start: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() - 5),
        end: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() - 5),
        allDay: true,
        resource: {
          _id: 'test-3',
          name: 'ThinkPad X1 Carbon',
          brand: 'Lenovo',
          serialNumber: 'LNV98765432',
        },
        status: 'expired',
        days: -35
      },
      {
        id: 'test-4',
        title: 'iPad Air',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
        allDay: true,
        resource: {
          _id: 'test-4',
          name: 'iPad Air',
          brand: 'Apple',
          serialNumber: 'IPAD87654321',
        },
        status: 'expiring-soon',
        days: 10
      },
      {
        id: 'test-5',
        title: 'Galaxy S22',
        start: new Date(today.getFullYear(), today.getMonth() - 2, 10),
        end: new Date(today.getFullYear(), today.getMonth() - 2, 10),
        allDay: true,
        resource: {
          _id: 'test-5',
          name: 'Galaxy S22',
          brand: 'Samsung',
          serialNumber: 'SM-G9982345',
        },
        status: 'expired',
        days: -60
      }
    ];
    
    return testProducts;
  };
  
  // 根據搜索詞和過濾條件過濾事件
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.resource.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.resource.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'active' && event.status === 'active') ||
        (filterStatus === 'expiring-soon' && event.status === 'expiring-soon') ||
        (filterStatus === 'expired' && event.status === 'expired');
      
      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, filterStatus]);
  
  // 按照保固到期日排序的事件列表
  const sortedEvents = useMemo(() => {
    // 複製一份過濾後的事件，避免直接修改原始數據
    return [...filteredEvents].sort((a, b) => {
      // 首先按照過期狀態排序：已過期 -> 即將到期 -> 有效
      if (a.status !== b.status) {
        if (a.status === 'expired') return -1;
        if (b.status === 'expired') return 1;
        if (a.status === 'expiring-soon') return -1;
        if (b.status === 'expiring-soon') return 1;
      }
      
      // 然後按照天數排序
      return a.days - b.days;
    });
  }, [filteredEvents]);
  
  // 滾動監聽效果
  useEffect(() => {
    const productList = productListRef.current;
    if (!productList) return;
    
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7 // 元素必須有 70% 在視口內
    };
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setActiveProductIndex(index);
        }
      });
    }, options);
    
    // 觀察所有產品項目
    const productItems = productList.querySelectorAll('.product-item');
    productItems.forEach(item => {
      observer.observe(item);
    });
    
    return () => {
      productItems.forEach(item => {
        observer.unobserve(item);
      });
    };
  }, [filteredEvents]);
  
  // 點擊事件處理
  const handleSelectEvent = (event) => {
    // 使用 id 或 _id，確保導航到正確的產品詳情頁
    const productId = event.id || event.resource._id || event.resource.id;
    if (productId) {
      console.log('導航到產品詳情頁:', productId);
      window.location.href = `/products/${productId}`;
    } else {
      console.error('無法找到有效的產品 ID');
    }
  };
  
  // 自定義工具欄
  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
      <div className="flex items-center">
        <Button 
          variant="light" 
          className="mr-1 rounded-full w-9 h-9 flex items-center justify-center"
          onClick={() => onNavigate('PREV')}
        >
          &#8249;
        </Button>
        <Button 
          variant="light" 
          className="mr-4 px-4"
          onClick={() => onNavigate('TODAY')}
        >
          今天
        </Button>
        <Button 
          variant="light" 
          className="mr-1 rounded-full w-9 h-9 flex items-center justify-center"
          onClick={() => onNavigate('NEXT')}
        >
          &#8250;
        </Button>
        <span className="ml-2 text-lg font-semibold">{label}</span>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant={view === 'month' ? 'primary' : 'light'} 
          className="mr-1 rounded-lg px-4"
          onClick={() => onView('month')}
        >
          月
        </Button>
        <Button 
          variant={view === 'week' ? 'primary' : 'light'} 
          className="mr-1 rounded-lg px-4"
          onClick={() => onView('week')}
        >
          週
        </Button>
        <Button 
          variant={view === 'day' ? 'primary' : 'light'} 
          className="mr-1 rounded-lg px-4"
          onClick={() => onView('day')}
        >
          日
        </Button>
        <Button 
          variant={view === 'agenda' ? 'primary' : 'light'} 
          className="mr-1 rounded-lg px-4"
          onClick={() => onView('agenda')}
        >
          議程
        </Button>
      </div>
    </div>
  );
  
  // 狀態指示器顏色
  const statusColors = {
    active: { bg: 'bg-emerald-500', text: 'text-emerald-800', bgLight: 'bg-emerald-50' },
    'expiring-soon': { bg: 'bg-amber-500', text: 'text-amber-800', bgLight: 'bg-amber-50' },
    expired: { bg: 'bg-red-500', text: 'text-red-800', bgLight: 'bg-red-50' }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* 頁面標題 */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-primary-600" />
            保固日曆
          </h1>
          <p className="text-gray-600">
            以日曆方式查看所有產品的保固到期日，掌握產品保固狀態
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="搜尋產品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">所有狀態</option>
            <option value="active">保固有效</option>
            <option value="expiring-soon">即將到期</option>
            <option value="expired">已到期</option>
          </select>
        </div>
      </div>
      
      {/* 狀態指示器 */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 transition-all duration-300">
        <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-emerald-500 mr-2"></span>
            <span>保固有效</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-amber-500 mr-2"></span>
            <span>即將到期（30天內）</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-red-500 mr-2"></span>
            <span>已到期</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側產品排序列表 */}
        <div className="lg:col-span-1">
          <Card title="產品保固列表" 
                icon={<FontAwesomeIcon icon={faListAlt} className="text-primary-600" />}
                className="h-full"
                extra={
                  <div className="text-sm text-gray-600">
                    <FontAwesomeIcon icon={faClock} className="mr-1" /> 按到期日排序
                  </div>
                }>
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="text-primary-600 text-3xl animate-spin" 
                  />
                </div>
              ) : error ? (
                <Alert variant="danger" title="錯誤" icon={faExclamationTriangle}>
                  {error}
                </Alert>
              ) : sortedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon 
                    icon={faInfoCircle} 
                    className="text-gray-400 text-3xl mb-3" 
                  />
                  <p className="text-gray-500">沒有找到符合條件的產品</p>
                </div>
              ) : (
                <div className="space-y-1" ref={productListRef}>
                  {sortedEvents.map((event, index) => (
                    <div 
                      key={event.id} 
                      data-index={index}
                      className={`product-item p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-50 ${
                        activeProductIndex === index 
                          ? `border-l-4 ${statusColors[event.status].bg} shadow-sm` 
                          : 'border-l-4 border-transparent'
                      }`}
                      onClick={() => handleSelectEvent(event)}
                    >
                      <div className={`flex justify-between items-start transition-all duration-500 ${
                        activeProductIndex === index ? 'text-gray-900 font-medium' : 'text-gray-600'
                      }`}>
                        <div>
                          <h3 className={`font-medium transition-all duration-500 ${
                            activeProductIndex === index ? 'text-primary-700 text-base' : 'text-gray-700 text-sm'
                          }`}>
                            {event.title}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <span>{event.resource.brand}</span>
                            {event.resource.serialNumber && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="text-gray-400 text-xs">{event.resource.serialNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[event.status].bgLight
                          } ${statusColors[event.status].text}`}>
                            {event.status === 'active' && '有效'}
                            {event.status === 'expiring-soon' && '即將到期'}
                            {event.status === 'expired' && '已到期'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center text-sm">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-1" />
                          <span className="text-gray-500">
                            {format(event.start, 'yyyy/MM/dd', { locale: zhTW })}
                          </span>
                        </div>
                        <div className={`text-sm ${
                          event.status === 'expired' 
                            ? 'text-red-600' 
                            : event.status === 'expiring-soon' 
                              ? 'text-amber-600' 
                              : 'text-emerald-600'
                        }`}>
                          {event.days < 0 
                            ? `已過期 ${Math.abs(event.days)} 天` 
                            : `剩餘 ${event.days} 天`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* 右側日曆卡片 */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FontAwesomeIcon 
                  icon={faSpinner} 
                  className="text-primary-600 text-3xl animate-spin" 
                />
                <span className="ml-2 text-gray-600">載入中...</span>
              </div>
            ) : error && filteredEvents.length === 0 ? (
              <Alert
                variant="danger"
                title="錯誤"
                icon={faExclamationTriangle}
              >
                {error}
              </Alert>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon 
                  icon={faInfoCircle} 
                  className="text-gray-400 text-5xl mb-4" 
                />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  沒有找到保固事件
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' ? 
                    '請嘗試更改搜索條件或過濾器' : 
                    '添加產品以在日曆中查看保固到期日期'
                  }
                </p>
                {searchTerm || filterStatus !== 'all' ? (
                  <Button 
                    variant="light"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
                    重置過濾器
                  </Button>
                ) : (
                  <Button 
                    to="/products/add" 
                    variant="primary"
                    className="mt-4"
                  >
                    <FontAwesomeIcon icon={faLaptop} className="mr-2" />
                    添加產品
                  </Button>
                )}
              </div>
            ) : (
              <div className="h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={filteredEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  views={['month', 'week', 'day', 'agenda']}
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  components={{
                    toolbar: CustomToolbar
                  }}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={handleSelectEvent}
                  popup
                  formats={formats}
                  messages={{
                    showMore: total => `+${total} 更多`
                  }}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WarrantyCalendar; 