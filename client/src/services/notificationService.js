import api from './api';

export const getNotificationCounts = async () => {
  try {
    const response = await api.get('/api/products/warranty-alerts');
    if (response.data.success) {
      const alerts = response.data.data;
      const upcomingAlerts = alerts.filter(alert => 
        !alert.read && 
        alert.daysLeft > 0 && 
        alert.daysLeft <= 30
      );
      
      return {
        total: upcomingAlerts.length,
        alerts: alerts.map(alert => ({
          id: alert.id,
          productId: alert.productId,
          productName: alert.productName,
          daysLeft: alert.daysLeft,
          warrantyEndDate: alert.warrantyEndDate,
          read: alert.read || false
        }))
      };
    }
    return { total: 0, alerts: [] };
  } catch (error) {
    console.error('獲取通知數量失敗:', error);
    return { total: 0, alerts: [] };
  }
};

export const markNotificationAsRead = async (productId) => {
  try {
    await api.post(`/api/products/${productId}/mark-read`);
    return true;
  } catch (error) {
    console.error('標記通知已讀失敗:', error);
    return false;
  }
};

export const subscribeToNotifications = (callback) => {
  // 這裡可以實現 WebSocket 或輪詢機制來即時更新通知
  const interval = setInterval(async () => {
    const counts = await getNotificationCounts();
    callback(counts);
  }, 300000); // 每5分鐘更新一次

  return () => clearInterval(interval);
}; 