import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parseISO, isValid, addMonths, subMonths, differenceInMonths, differenceInDays } from 'date-fns';
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
  faListAlt,
  faStream,
  faMobileAlt,
  faTabletAlt,
  faDesktop,
  faHeadphones,
  faCamera,
  faGamepad,
  faTv,
  faHdd,
  faKeyboard,
  faMouse,
  faPrint,
  faNetworkWired,
  faServer,
  faMemory,
  faTools
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

// 根據產品類別返回對應圖示
const getCategoryIcon = (category) => {
  const categoryMap = {
    '筆記型電腦': faLaptop,
    '智慧型手機': faMobileAlt,
    '平板電腦': faTabletAlt,
    '桌上型電腦': faDesktop,
    '耳機': faHeadphones,
    '相機': faCamera,
    '遊戲機': faGamepad,
    '電視': faTv,
    '硬碟': faHdd,
    '鍵盤': faKeyboard,
    '滑鼠': faMouse,
    '印表機': faPrint,
    '網路設備': faNetworkWired,
    '伺服器': faServer,
    '記憶體': faMemory,
    '周邊配件': faTools
  };
  
  return categoryMap[category] || faLaptop; // 如果找不到對應的圖示，預設使用筆電圖示
};

// 自定義時間軸組件
const WarrantyTimeline = ({ events, onSelectEvent }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon 
          icon={faInfoCircle} 
          className="text-gray-400 text-5xl mb-4" 
        />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          沒有找到保固事件
        </h3>
        <p className="text-gray-600">請嘗試更改搜索條件或添加產品</p>
      </div>
    );
  }

  // 按時間排序事件（從現在到最遠的未來，然後是從最近到最遠的過去）
  const sortedEvents = [...events].sort((a, b) => {
    // 先將已過期和未過期分開
    const aExpired = a.days < 0;
    const bExpired = b.days < 0;
    
    if (aExpired && !bExpired) return 1; // 已過期的放後面
    if (!aExpired && bExpired) return -1; // 未過期的放前面
    
    // 相同狀態的按天數排序
    if (aExpired && bExpired) {
      // 已過期的按照過期時間從新到舊（天數的絕對值從小到大）
      return Math.abs(a.days) - Math.abs(b.days);
    } else {
      // 未過期的按照到期時間從近到遠
      return a.days - b.days;
    }
  });

  // 獲取當前日期
  const today = new Date();
  
  return (
    <div className="warranty-timeline p-3 md:p-4">
      {/* 時間軸中心線 */}
      <div className="relative">
        {/* 今天標記 */}
        <div className="flex items-center mb-6">
          <div className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
            今天 ({format(today, 'yyyy/MM/dd', { locale: zhTW })})
          </div>
          <div className="ml-4 flex-grow h-1 bg-primary-200"></div>
        </div>
        
        {/* 未來保固時間軸 */}
        <div className="future-timeline mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-emerald-500 mr-2" />
            有效保固
          </h3>
          
          {/* 有效保固時間線 */}
          <div className="relative border-l-2 border-emerald-200 pl-10 md:pl-14 ml-3 md:ml-12">
            <div className="space-y-4 max-w-[calc(100%-80px)]">
              {sortedEvents.filter(event => event.days >= 0).map((event, index) => {
                // 計算時間點的顏色和大小
                const isFirstItem = index === 0;
                const timeDotColorClass = event.status === 'expiring-soon' ? 'bg-amber-500' : 'bg-emerald-500';
                const timeDotSizeClass = isFirstItem ? 'h-3.5 w-3.5 -left-[8px]' : 'h-3 w-3 -left-[7px]';
                
                return (
                  <div key={event.id} className="relative">
                    {/* 時間點 - 有效保固 */}
                    <div 
                      className={`absolute ${timeDotSizeClass} ${timeDotColorClass} rounded-full top-[50%] -translate-y-1/2 border-2 border-white shadow-sm z-20`}
                    ></div>
                    
                    {/* 時間線上的日期標籤 - 僅在較大屏幕上顯示 */}
                    <div className="hidden md:block absolute -left-[8.5rem] top-[50%] -translate-y-1/2 w-28 text-right">
                      <span className="text-sm text-gray-600 font-medium px-2 py-1 rounded-md">
                        {format(event.start, 'yy/MM/dd', { locale: zhTW })}
                      </span>
                    </div>
                    
                    {/* 卡片內容 */}
                    <div 
                      className={`relative z-10 flex flex-col md:flex-row items-start p-5 rounded-xl shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                        event.status === 'expiring-soon' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'
                      }`}
                      onClick={() => onSelectEvent(event)}
                    >
                      <div className="mr-5 flex-shrink-0 mb-4 md:mb-0">
                        <div className="relative">
                          <img
                            src={event.resource.images && event.resource.images[0] 
                              ? (event.resource.images[0].startsWith('http')
                                ? event.resource.images[0]
                                : `${process.env.REACT_APP_API_URL}${event.resource.images[0]}`)
                              : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`}
                            alt={event.title}
                            className="w-16 h-16 object-cover rounded-xl shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`;
                            }}
                          />
                          <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm
                            ${event.status === 'expiring-soon' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <FontAwesomeIcon icon={getCategoryIcon(event.resource.category)} className="text-sm" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between flex-wrap gap-2 mb-3">
                          <h4 className="text-xl font-medium text-gray-900 break-words pr-3">{event.title}</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-base font-medium
                            ${event.status === 'expiring-soon' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {event.status === 'expiring-soon' ? '即將到期' : '保固有效'}
                          </span>
                        </div>
                        <div className="text-base text-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 items-center mb-4">
                            <div className="col-span-1">
                              <span className="text-lg font-medium">{event.resource.brand}</span>
                            </div>
                            {event.resource.serialNumber && (
                              <div className="col-span-1">
                                <span className="text-gray-600">S/N: {event.resource.serialNumber}</span>
                              </div>
                            )}
                            {event.resource.model && (
                              <div className="col-span-1">
                                <span className="text-gray-600">型號: {event.resource.model}</span>
                              </div>
                            )}
                            {event.resource.purchaseDate && (
                              <div className="col-span-1">
                                <span className="text-gray-600">購買日期: {format(parseISO(event.resource.purchaseDate), 'yyyy/MM/dd', { locale: zhTW })}</span>
                              </div>
                            )}
                            {event.resource.category && (
                              <div className="col-span-1">
                                <span className="text-gray-600">類別: {event.resource.category}</span>
                              </div>
                            )}
                            {event.resource.vendor && (
                              <div className="col-span-1">
                                <span className="text-gray-600">銷售商: {event.resource.vendor}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-end border-t pt-3 mt-2">
                            <div className={`${event.status === 'expiring-soon' ? 'text-amber-600' : 'text-emerald-600'} font-medium text-lg`}>
                              剩餘 {event.days} 天
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {sortedEvents.filter(event => event.days >= 0).length === 0 && (
                <div className="py-6 px-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">沒有有效保固的產品</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 已過期分隔線 */}
        <div className="flex items-center my-8">
          <div className="flex-grow h-0.5 bg-gray-200"></div>
          <div className="mx-4 px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium shadow-sm">
            保固到期分隔線
          </div>
          <div className="flex-grow h-0.5 bg-gray-200"></div>
        </div>
        
        {/* 已過期保固時間軸 */}
        <div className="expired-timeline">
          <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
            已過期保固
          </h3>
          
          {/* 已過期保固時間線 */}
          <div className="relative border-l-2 border-red-200 pl-10 md:pl-14 ml-3 md:ml-12">
            <div className="space-y-4 max-w-[calc(100%-80px)]">
              {sortedEvents.filter(event => event.days < 0).map((event, index) => {
                // 計算相對過期時間的顏色深度
                const isFirstItem = index === 0;
                const timeDotSizeClass = isFirstItem ? 'h-3.5 w-3.5 -left-[8px]' : 'h-3 w-3 -left-[7px]';
                
                return (
                  <div key={event.id} className="relative">
                    {/* 時間點 - 已過期保固 */}
                    <div 
                      className={`absolute ${timeDotSizeClass} bg-red-500 rounded-full top-[50%] -translate-y-1/2 border-2 border-white shadow-sm z-20`}
                    ></div>
                    
                    {/* 時間線上的日期標籤 - 僅在較大屏幕上顯示 */}
                    <div className="hidden md:block absolute -left-[8.5rem] top-[50%] -translate-y-1/2 w-28 text-right">
                      <span className="text-sm text-gray-600 font-medium px-2 py-1 rounded-md">
                        {format(event.start, 'yy/MM/dd', { locale: zhTW })}
                      </span>
                    </div>
                    
                    {/* 卡片內容 */}
                    <div 
                      className="relative z-10 flex flex-col md:flex-row items-start p-5 rounded-xl shadow-sm border border-red-200 bg-red-50 transition-all hover:shadow-md cursor-pointer"
                      onClick={() => onSelectEvent(event)}
                    >
                      <div className="mr-5 flex-shrink-0 mb-4 md:mb-0">
                        <div className="relative">
                          <img
                            src={event.resource.images && event.resource.images[0] 
                              ? (event.resource.images[0].startsWith('http')
                                ? event.resource.images[0]
                                : `${process.env.REACT_APP_API_URL}${event.resource.images[0]}`)
                              : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`}
                            alt={event.title}
                            className="w-28 h-28 object-cover rounded-xl shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`;
                            }}
                          />
                          <div className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-sm bg-red-100 text-red-600">
                            <FontAwesomeIcon icon={faLaptop} className="text-base" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between flex-wrap gap-2 mb-3">
                          <h4 className="text-xl font-medium text-gray-900 break-words pr-3">{event.title}</h4>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-base font-medium bg-red-100 text-red-800">
                            已過期
                          </span>
                        </div>
                        <div className="text-base text-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 items-center mb-4">
                            <div className="col-span-1">
                              <span className="text-lg font-medium">{event.resource.brand}</span>
                            </div>
                            {event.resource.serialNumber && (
                              <div className="col-span-1">
                                <span className="text-gray-600">S/N: {event.resource.serialNumber}</span>
                              </div>
                            )}
                            {event.resource.model && (
                              <div className="col-span-1">
                                <span className="text-gray-600">型號: {event.resource.model}</span>
                              </div>
                            )}
                            {event.resource.purchaseDate && (
                              <div className="col-span-1">
                                <span className="text-gray-600">購買日期: {format(parseISO(event.resource.purchaseDate), 'yyyy/MM/dd', { locale: zhTW })}</span>
                              </div>
                            )}
                            {event.resource.category && (
                              <div className="col-span-1">
                                <span className="text-gray-600">類別: {event.resource.category}</span>
                              </div>
                            )}
                            {event.resource.vendor && (
                              <div className="col-span-1">
                                <span className="text-gray-600">銷售商: {event.resource.vendor}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-end border-t pt-3 mt-2">
                            <div className="text-red-600 font-medium text-lg">
                              已過期 {Math.abs(event.days)} 天
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {sortedEvents.filter(event => event.days < 0).length === 0 && (
                <div className="py-6 px-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">沒有過期保固的產品</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 橫向時間軸組件
const HorizontalTimeline = ({ events, onSelectEvent }) => {
  const containerRef = useRef(null);
  const [monthsRange, setMonthsRange] = useState([]);
  const [centerPosition, setCenterPosition] = useState(0);
  
  // 計算需要顯示的月份範圍
  useEffect(() => {
    if (!events || events.length === 0) return;
    
    // 找出最早和最晚的日期
    const today = new Date();
    
    // 尋找最早和最晚的保固到期日
    let earliestDate = today;
    let latestDate = today;
    
    events.forEach(event => {
      if (event.start < earliestDate) earliestDate = event.start;
      if (event.start > latestDate) latestDate = event.start;
    });
    
    // 確保範圍包括當前日期和前後至少6個月
    earliestDate = subMonths(earliestDate, 3);
    latestDate = addMonths(latestDate, 3);
    
    // 計算總月數
    const totalMonths = differenceInMonths(latestDate, earliestDate) + 1;
    
    // 生成月份數組
    const months = [];
    for (let i = 0; i < totalMonths; i++) {
      months.push(addMonths(earliestDate, i));
    }
    
    setMonthsRange(months);
    
    // 找出今天的位置，用於初始滾動
    const todayIndex = months.findIndex(month => {
      const nextMonth = addMonths(month, 1);
      return today >= month && today < nextMonth;
    });
    
    if (todayIndex !== -1 && containerRef.current) {
      const position = todayIndex * 120; // 假設每個月份寬度為120px
      setCenterPosition(position);
      setTimeout(() => {
        containerRef.current.scrollLeft = position - containerRef.current.offsetWidth / 2 + 60;
      }, 100);
    }
  }, [events]);
  
  // 如果沒有事件，顯示空白狀態
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon 
          icon={faInfoCircle} 
          className="text-gray-400 text-5xl mb-4" 
        />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          沒有找到保固事件
        </h3>
        <p className="text-gray-600">請嘗試更改搜索條件或添加產品</p>
      </div>
    );
  }
  
  // 計算每個事件在時間軸上的位置
  const plotEvent = (event) => {
    if (!monthsRange.length) return null;
    
    const firstMonth = monthsRange[0];
    const diffInDays = differenceInDays(event.start, firstMonth);
    const position = (diffInDays / 30) * 120; // 120px 為每個月的寬度
    
    return {
      ...event,
      position: Math.max(0, position)
    };
  };
  
  // 計算出每個事件的位置
  const positionedEvents = events.map(plotEvent).filter(e => e);
  
  // 今天的位置
  const today = new Date();
  const todayPosition = differenceInDays(today, monthsRange[0]) / 30 * 120;
  
  return (
    <div className="horizontal-timeline-container mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <FontAwesomeIcon icon={faStream} className="text-primary-600 mr-2" />
        保固時間軸
      </h3>
      
      {/* 時間軸容器 */}
      <div 
        ref={containerRef}
        className="relative overflow-x-auto pb-10 no-scrollbar" 
        style={{ overflowY: 'hidden' }}
      >
        {/* 時間軸本體 */}
        <div 
          className="relative h-[120px] flex items-center" 
          style={{ width: `${monthsRange.length * 120}px`, minWidth: '100%' }}
        >
          {/* 月份刻度 */}
          <div className="absolute bottom-0 left-0 right-0 h-[30px]">
            {monthsRange.map((month, index) => (
              <div 
                key={index} 
                className="absolute bottom-0 flex flex-col items-center"
                style={{ left: `${index * 120}px`, width: '120px' }}
              >
                <div className="h-4 border-l border-gray-300"></div>
                <div className="text-xs text-gray-500">
                  {format(month, 'yyyy年M月', { locale: zhTW })}
                </div>
              </div>
            ))}
          </div>
          
          {/* 今天的標記 */}
          <div 
            className="absolute top-0 bottom-[30px] flex flex-col items-center z-10"
            style={{ left: `${todayPosition}px` }}
          >
            <div className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
              今天
            </div>
            <div className="h-full w-0.5 bg-primary-500 mt-1"></div>
          </div>
          
          {/* 時間軸線 */}
          <div className="absolute h-0.5 bg-gray-200 left-0 right-0" style={{ top: '60px' }}></div>
          
          {/* 事件點 */}
          {positionedEvents.map((event) => (
            <div 
              key={event.id}
              className="absolute cursor-pointer transition-all duration-200 transform hover:scale-110"
              style={{ left: `${event.position}px`, top: event.days >= 0 ? '30px' : '70px' }}
              onClick={() => onSelectEvent(event)}
            >
              <div className="relative flex flex-col items-center">
                <div 
                  className={`w-5 h-5 rounded-full shadow-md flex items-center justify-center ${
                    event.status === 'expired' 
                      ? 'bg-red-500' 
                      : event.status === 'expiring-soon' 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                  }`}
                >
                </div>
                <div 
                  className={`mt-1 absolute px-3 py-1 rounded text-xs font-medium whitespace-nowrap -ml-[50%] ${
                    event.status === 'expired' 
                      ? 'bg-red-100 text-red-800' 
                      : event.status === 'expiring-soon' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                  }`}
                  style={{ top: event.days >= 0 ? '-25px' : '10px' }}
                >
                  {event.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 產品列表（分有效和已過期） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* 有效保固產品 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-emerald-500 mr-2" />
            有效保固
          </h3>
          <div className="space-y-3">
            {events.filter(event => event.days >= 0)
              .sort((a, b) => a.days - b.days)
              .map(event => (
                <div 
                  key={event.id} 
                  className={`p-3 rounded-lg cursor-pointer flex items-center border-l-4 ${
                    event.status === 'expiring-soon' ? 'border-amber-500 bg-amber-50' : 'border-emerald-500 bg-emerald-50'
                  }`}
                  onClick={() => onSelectEvent(event)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    event.status === 'expiring-soon' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <FontAwesomeIcon icon={faLaptop} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="text-sm text-gray-500">
                          {format(event.start, 'yyyy/MM/dd', { locale: zhTW })}
                        </div>
                      </div>
                      <div className={`${event.status === 'expiring-soon' ? 'text-amber-600' : 'text-emerald-600'} text-sm font-medium self-center`}>
                        剩餘 {event.days} 天
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {events.filter(event => event.days >= 0).length === 0 && (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">沒有有效保固的產品</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 已過期保固產品 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
            已過期保固
          </h3>
          <div className="space-y-3">
            {events.filter(event => event.days < 0)
              .sort((a, b) => Math.abs(a.days) - Math.abs(b.days))
              .map(event => (
                <div 
                  key={event.id} 
                  className="p-3 rounded-lg cursor-pointer flex items-center border-l-4 border-red-500 bg-red-50"
                  onClick={() => onSelectEvent(event)}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-red-100 text-red-700">
                    <FontAwesomeIcon icon={faLaptop} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="text-sm text-gray-500">
                          {format(event.start, 'yyyy/MM/dd', { locale: zhTW })}
                        </div>
                      </div>
                      <div className="text-red-600 text-sm font-medium self-center">
                        已過期 {Math.abs(event.days)} 天
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {events.filter(event => event.days < 0).length === 0 && (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">沒有過期保固的產品</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'horizontal', 'calendar'
  
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
          model: 'MPHG3TA/A',
          category: '筆記型電腦',
          purchaseDate: new Date(today.getFullYear() - 1, today.getMonth(), 15).toISOString(),
          vendor: '蘋果官方商店',
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
          model: 'MLVF3TA/A',
          category: '智慧型手機',
          purchaseDate: new Date(today.getFullYear() - 1, today.getMonth() - 10, 5).toISOString(),
          vendor: '燦坤3C',
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
          model: 'Gen 10',
          category: '筆記型電腦',
          purchaseDate: new Date(today.getFullYear() - 2, today.getMonth() - 1, 25).toISOString(),
          vendor: '聯想官方商店',
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
          model: 'MM9C3TA/A',
          category: '平板電腦',
          purchaseDate: new Date(today.getFullYear() - 1, today.getMonth() - 11, 15).toISOString(),
          vendor: '遠傳門市',
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
          model: 'SM-G991B',
          category: '智慧型手機',
          purchaseDate: new Date(today.getFullYear() - 2, today.getMonth() - 2, 10).toISOString(),
          vendor: '三星旗艦店',
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
            <FontAwesomeIcon icon={faStream} className="mr-3 text-primary-600" />
            保固時間軸
          </h1>
          <p className="text-gray-600">
            以時間軸方式查看所有產品的保固到期日，掌握產品保固狀態
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
      
      {/* 狀態指示器與視圖切換 */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-6 items-center">
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
          
          {/* 視圖切換 */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'timeline' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('timeline')}
            >
              <FontAwesomeIcon icon={faStream} className="mr-2" />
              垂直時間軸
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'horizontal' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('horizontal')}
            >
              <FontAwesomeIcon icon={faStream} className="mr-2 transform rotate-90" />
              水平時間軸
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'calendar' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('calendar')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              日曆視圖
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'timeline' && (
        <Card title="保固時間軸" 
              icon={<FontAwesomeIcon icon={faStream} className="text-primary-600" />}
              className="h-full">
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
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: '750px' }}>
              <WarrantyTimeline events={filteredEvents} onSelectEvent={handleSelectEvent} />
            </div>
          )}
        </Card>
      )}
      
      {viewMode === 'horizontal' && (
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
          ) : (
            <HorizontalTimeline events={filteredEvents} onSelectEvent={handleSelectEvent} />
          )}
        </Card>
      )}
      
      {viewMode === 'calendar' && (
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
      )}
    </div>
  );
};

export default WarrantyCalendar;
