import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faArrowLeft,
  faCalendarAlt,
  faExclamationTriangle,
  faInfoCircle,
  faCamera,
  faFile,
  faFileAlt,
  faPlus,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // 獲取產品詳情
  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        // 在實際應用中，這裡會調用API
        // const response = await api.get(`/products/${id}`);
        
        // 模擬API請求
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模擬產品數據
        const mockProduct = {
          id: parseInt(id),
          name: 'iPhone 13 Pro',
          type: '智慧型手機',
          brand: 'Apple',
          model: 'A2483',
          serialNumber: 'FVFDY2XYN77P',
          purchaseDate: '2021-09-30',
          warrantyEndDate: '2023-09-30',
          daysLeft: 92,
          description: '128GB, 石墨色, A15晶片, 支持5G網絡',
          notes: '購買於Apple官方網站，延長保固至2年',
          images: [
            'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aXBob25lJTIwMTN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
            'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aXBob25lJTIwMTMlMjBwcm98ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
          ],
          receipts: [
            {
              id: 1,
              name: '購買收據.pdf',
              url: '#',
              uploadDate: '2021-09-30',
              type: 'pdf'
            }
          ],
          warrantyDocuments: [
            {
              id: 1,
              name: '保固卡.pdf',
              url: '#',
              uploadDate: '2021-09-30',
              type: 'pdf'
            }
          ],
          createdAt: '2021-09-30T12:30:00Z',
          updatedAt: '2022-10-15T09:45:00Z'
        };
        
        setProduct(mockProduct);
        setLoading(false);
      } catch (error) {
        console.error('獲取產品詳情錯誤:', error);
        setError('獲取產品詳情時發生錯誤，請稍後再試');
        setLoading(false);
      }
    };
    
    fetchProductDetail();
  }, [id]);
  
  // 處理產品刪除
  const handleDeleteProduct = async () => {
    setDeleteLoading(true);
    try {
      // 在實際應用中，這裡會調用API
      // await api.delete(`/products/${id}`);
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/products', { replace: true });
    } catch (error) {
      console.error('刪除產品錯誤:', error);
      setError('刪除產品時發生錯誤，請稍後再試');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };
  
  // 根據剩餘天數獲取狀態顏色
  const getStatusStyle = (daysLeft) => {
    if (daysLeft <= 0) return 'bg-red-100 text-red-700 border-red-200';
    if (daysLeft <= 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
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
    <div>
      {/* 標題導航 */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <Button
            to="/products"
            variant="light"
            className="mr-4"
            icon={faArrowLeft}
          >
            返回產品列表
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            to={`/products/edit/${id}`}
            variant="secondary"
            icon={faEdit}
          >
            編輯產品
          </Button>
          <Button
            variant="danger"
            icon={faTrash}
            onClick={() => setShowDeleteConfirm(true)}
          >
            刪除
          </Button>
        </div>
      </div>

      {/* 刪除確認彈窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">確認刪除產品</h3>
            <p className="text-gray-600 mb-4">
              您確定要刪除 "{product.name}" 嗎？此操作不可撤銷，產品的所有資訊將被永久刪除。
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                取消
              </Button>
              <Button
                variant="danger"
                loading={deleteLoading}
                disabled={deleteLoading}
                onClick={handleDeleteProduct}
                icon={faTrash}
              >
                確認刪除
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 產品圖片 */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 mb-4 -mx-4 -mt-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover w-full h-64"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex mt-2 space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 border-gray-200 hover:border-primary-500 cursor-pointer"
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                  <button className="flex-shrink-0 w-20 h-20 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400">
                    <FontAwesomeIcon icon={faPlus} className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div>
          {/* 保固狀態卡片 */}
          <Card className="mb-6">
            <div className="text-center">
              <h3 className="font-medium text-lg text-gray-900 mb-2">保固狀態</h3>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyle(product.daysLeft)}`}>
                {product.daysLeft <= 0 ? '已過期' : `剩餘 ${product.daysLeft} 天`}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">購買日期</p>
                  <p className="font-medium">{formatDate(product.purchaseDate)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">保固到期</p>
                  <p className="font-medium">{formatDate(product.warrantyEndDate)}</p>
                </div>
              </div>
            </div>
          </Card>
          
          {/* 基本信息 */}
          <Card>
            <h3 className="font-medium text-lg text-gray-900 mb-4">基本信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">品牌</span>
                <span className="font-medium text-gray-900">{product.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">類型</span>
                <span className="font-medium text-gray-900">{product.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">型號</span>
                <span className="font-medium text-gray-900">{product.model}</span>
              </div>
              {product.serialNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">序號</span>
                  <span className="font-medium text-gray-900">{product.serialNumber}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* 標籤導航 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            產品詳情
          </button>
          <button
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            相關文件
          </button>
        </nav>
      </div>
      
      {/* 標籤內容 */}
      {activeTab === 'details' ? (
        <div>
          {/* 產品描述 */}
          <Card className="mb-6">
            <h3 className="font-medium text-lg text-gray-900 mb-4">產品描述</h3>
            <p className="text-gray-700">{product.description || '沒有提供產品描述'}</p>
          </Card>
          
          {/* 備註 */}
          {product.notes && (
            <Card className="mb-6">
              <h3 className="font-medium text-lg text-gray-900 mb-4">備註</h3>
              <p className="text-gray-700">{product.notes}</p>
            </Card>
          )}
        </div>
      ) : (
        <div>
          {/* 收據 */}
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg text-gray-900">收據</h3>
              <Button variant="light" size="sm" icon={faPlus}>
                上傳收據
              </Button>
            </div>
            {product.receipts && product.receipts.length > 0 ? (
              <div className="space-y-2">
                {product.receipts.map(receipt => (
                  <div
                    key={receipt.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded text-blue-600 mr-3">
                        <FontAwesomeIcon icon={receipt.type === 'pdf' ? faFileAlt : faFile} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{receipt.name}</p>
                        <p className="text-sm text-gray-500">上傳於 {formatDate(receipt.uploadDate)}</p>
                      </div>
                    </div>
                    <Button variant="light" size="sm">
                      查看
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <FontAwesomeIcon icon={faFile} className="text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500">尚未上傳收據</p>
              </div>
            )}
          </Card>
          
          {/* 保固文件 */}
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg text-gray-900">保固文件</h3>
              <Button variant="light" size="sm" icon={faPlus}>
                上傳文件
              </Button>
            </div>
            {product.warrantyDocuments && product.warrantyDocuments.length > 0 ? (
              <div className="space-y-2">
                {product.warrantyDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded text-green-600 mr-3">
                        <FontAwesomeIcon icon={doc.type === 'pdf' ? faFileAlt : faFile} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">上傳於 {formatDate(doc.uploadDate)}</p>
                      </div>
                    </div>
                    <Button variant="light" size="sm">
                      查看
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <FontAwesomeIcon icon={faFile} className="text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500">尚未上傳保固文件</p>
              </div>
            )}
          </Card>
        </div>
      )}
      
      {/* 提示 */}
      {product.daysLeft > 0 && product.daysLeft <= 30 && (
        <Alert
          variant="warning"
          title="保固即將到期"
          icon={faExclamationTriangle}
          className="mt-6"
        >
          此產品的保固將在 {product.daysLeft} 天後到期。請考慮聯繫製造商了解延長保固的選項。
        </Alert>
      )}
      
      {product.daysLeft <= 0 && (
        <Alert
          variant="error"
          title="保固已過期"
          icon={faExclamationTriangle}
          className="mt-6"
        >
          此產品的保固已經過期。任何維修或更換可能需要額外費用。
        </Alert>
      )}
    </div>
  );
};

export default ProductDetail; 