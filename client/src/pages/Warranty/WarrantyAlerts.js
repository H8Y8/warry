import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faExclamationTriangle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const WarrantyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // 模擬從 API 獲取保固提醒
    const fetchAlerts = async () => {
      setLoading(true);
      
      // 延遲以模擬 API 請求
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模擬數據
      const mockAlerts = [
        {
          id: 1,
          productName: 'Apple iPhone 13',
          warrantyEndDate: '2024-04-15',
          daysRemaining: 30,
          status: 'upcoming',
          image: 'https://via.placeholder.com/50'
        },
        {
          id: 2,
          productName: 'Dell XPS 15 筆記型電腦',
          warrantyEndDate: '2024-03-10',
          daysRemaining: -5,
          status: 'expired',
          image: 'https://via.placeholder.com/50'
        },
        {
          id: 3,
          productName: 'Samsung 4K 智能電視',
          warrantyEndDate: '2024-05-22',
          daysRemaining: 67,
          status: 'upcoming',
          image: 'https://via.placeholder.com/50'
        },
        {
          id: 4,
          productName: 'Bose 耳機',
          warrantyEndDate: '2024-02-28',
          daysRemaining: -15,
          status: 'expired',
          image: 'https://via.placeholder.com/50'
        },
        {
          id: 5,
          productName: 'Sony PlayStation 5',
          warrantyEndDate: '2025-01-10',
          daysRemaining: 300,
          status: 'active',
          image: 'https://via.placeholder.com/50'
        }
      ];
      
      setAlerts(mockAlerts);
      setLoading(false);
    };
    
    fetchAlerts();
  }, []);

  const filteredAlerts = () => {
    if (filter === 'all') return alerts;
    return alerts.filter(alert => alert.status === filter);
  };

  const markAsRead = (id) => {
    // 在實際應用中，這將是一個 API 請求
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const getStatusBadge = (status, daysRemaining) => {
    if (status === 'expired') {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
          已過期 ({Math.abs(daysRemaining)} 天前)
        </span>
      );
    } else if (daysRemaining <= 30) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
          <FontAwesomeIcon icon={faBell} className="mr-1" />
          即將到期 ({daysRemaining} 天)
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
          有效 ({daysRemaining} 天)
        </span>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">保固提醒</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex flex-wrap items-center space-x-2 mb-4 md:mb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md ${filter === 'upcoming' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              即將到期
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-md ${filter === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              已過期
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              有效
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAlerts().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            沒有找到符合條件的保固提醒
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">產品</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保固期限</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts().map(alert => (
                  <tr key={alert.id} className={`hover:bg-gray-50 ${!alert.isRead ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={alert.image} alt={alert.productName} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{alert.productName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{alert.warrantyEndDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(alert.status, alert.daysRemaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyAlerts; 