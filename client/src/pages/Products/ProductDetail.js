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
  faEllipsisV,
  faSpinner,
  faTimes
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
  const [showDeleteFileConfirm, setShowDeleteFileConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [deleteFileLoading, setDeleteFileLoading] = useState(false);
  
  // 獲取產品詳情
  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        console.log('正在獲取產品詳情，ID:', id);
        const response = await api.get(`/api/products/${id}`);
        console.log('獲取產品詳情成功:', response.data);
        
        // 檢查響應格式並提取產品數據
        const productData = response.data.data || response.data;
        
        // 計算保固剩餘天數
        if (productData.warrantyEndDate) {
          const today = new Date();
          const endDate = new Date(productData.warrantyEndDate);
          const diffTime = endDate - today;
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          productData.daysLeft = daysLeft;
        }
        
        setProduct(productData);
        setLoading(false);
      } catch (error) {
        console.error('獲取產品詳情錯誤:', error);
        if (error.response) {
          console.error('錯誤響應:', error.response.data);
          setError(`獲取產品詳情失敗: ${error.response.data.message || '未知錯誤'}`);
        } else if (error.request) {
          console.error('無響應:', error.request);
          setError('服務器無響應，請檢查後端服務是否正常運行');
        } else {
          console.error('請求配置錯誤:', error.message);
          setError('請求配置錯誤，請聯繫技術支持');
        }
        setLoading(false);
      }
    };
    
    fetchProductDetail();
  }, [id]);
  
  // 處理產品刪除
  const handleDeleteProduct = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${id}`);
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
  
  // 處理文件上傳
  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // 驗證文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('文件大小不能超過5MB');
      return;
    }

    // 驗證文件類型
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('不支持的文件格式。請上傳 PDF、DOC、DOCX 或圖片格式的文件。');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append(type === 'receipt' ? 'receipt' : 'warrantyDocument', file);

      const response = await api.post(
        `/api/products/${id}/upload-${type === 'receipt' ? 'receipt' : 'warranty'}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // 更新產品數據
      setProduct(response.data.data.product);
      setUploadLoading(false);
    } catch (error) {
      console.error('上傳文件錯誤:', error);
      setUploadError(error.response?.data?.message || '上傳文件失敗，請稍後再試');
      setUploadLoading(false);
    }
  };
  
  // 處理文件刪除確認
  const handleDeleteFileConfirm = (fileIndex, type) => {
    setFileToDelete({ fileIndex, type });
    setShowDeleteFileConfirm(true);
  };

  // 處理文件刪除
  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    const { fileIndex, type } = fileToDelete;
    setDeleteFileLoading(true);
    try {
      const response = await api.delete(`/api/products/${id}/files/${type}/${fileIndex}`);
      setProduct(response.data.data);
      setDeleteFileLoading(false);
      setShowDeleteFileConfirm(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('刪除文件錯誤:', error);
      setUploadError('刪除文件失敗，請稍後再試');
      setDeleteFileLoading(false);
      setShowDeleteFileConfirm(false);
      setFileToDelete(null);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">{product?.name}</h1>
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

      {/* 刪除文件確認對話框 */}
      {showDeleteFileConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">確認刪除文件</h3>
            <p className="text-gray-600 mb-4">
              您確定要刪除這個{fileToDelete?.type === 'receipt' ? '收據' : '保固文件'}嗎？此操作不可撤銷。
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteFileConfirm(false);
                  setFileToDelete(null);
                }}
                disabled={deleteFileLoading}
              >
                取消
              </Button>
              <Button
                variant="danger"
                loading={deleteFileLoading}
                disabled={deleteFileLoading}
                onClick={handleDeleteFile}
                icon={faTrash}
              >
                確認刪除
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 產品圖片和基本信息 */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
        <div className="lg:col-span-1 h-full">
          <Card className="overflow-hidden h-full">
            <div className="relative h-full flex flex-col">
              <div className="flex-1 -mx-4 -mt-4 min-h-[300px]">
                <img
                  src={product?.images?.[0] ? 
                    (product.images[0].startsWith('http') ? 
                      product.images[0] : 
                      `${process.env.REACT_APP_API_URL}/uploads/products/${product.images[0].split('/').pop()}`) : 
                    null}
                  alt={product?.name}
                  className="object-cover w-30 h-30"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.svg`;
                  }}
                />
              </div>
              
              {product?.images?.length > 1 && (
                <div className="flex mt-2 space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 border-gray-200 hover:border-primary-500 cursor-pointer"
                    >
                      <img
                        src={image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL}/uploads/products/${image.split('/').pop()}`}
                        alt={`${product.name} ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.svg`;
                        }}
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
        
        <div className="h-full flex flex-col">
          {/* 保固狀態卡片 */}
          <Card className="mb-6 flex-1">
            <div className="h-full flex flex-col justify-center">
              <div className="text-center">
                <h3 className="font-medium text-lg text-gray-900 mb-2">保固狀態</h3>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyle(product?.daysLeft)}`}>
                  {product?.daysLeft <= 0 ? '已過期' : `剩餘 ${product?.daysLeft} 天`}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">購買日期</p>
                    <p className="font-medium">{product?.purchaseDate ? formatDate(product.purchaseDate) : '未知'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">保固到期</p>
                    <p className="font-medium">{product?.warrantyEndDate ? formatDate(product.warrantyEndDate) : '未知'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* 基本信息 */}
          <Card className="flex-1">
            <div className="h-full flex flex-col">
              <h3 className="font-medium text-lg text-gray-900 mb-4">基本信息</h3>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <div className="flex justify-between">
                  <span className="text-gray-500">品牌</span>
                  <span className="font-medium text-gray-900">{product?.brand || '未知'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">類型</span>
                  <span className="font-medium text-gray-900">{product?.type || '未知'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">型號</span>
                  <span className="font-medium text-gray-900">{product?.model || '未知'}</span>
                </div>
                {product?.serialNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">序號</span>
                    <span className="font-medium text-gray-900">{product.serialNumber}</span>
                  </div>
                )}
              </div>
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
            <p className="text-gray-700">{product?.description || '沒有提供產品描述'}</p>
          </Card>
          
          {/* 備註 */}
          {product?.notes && (
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
              <div className="relative">
                <input
                  type="file"
                  id="receipt-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => handleFileUpload(e, 'receipt')}
                  disabled={uploadLoading || deleteFileLoading}
                />
                <Button
                  variant="light"
                  size="sm"
                  icon={uploadLoading ? faSpinner : faPlus}
                  onClick={() => document.getElementById('receipt-upload').click()}
                  disabled={uploadLoading || deleteFileLoading}
                >
                  上傳收據
                </Button>
              </div>
            </div>
            {uploadError && (
              <Alert
                variant="error"
                className="mb-4"
                icon={faExclamationTriangle}
              >
                {uploadError}
              </Alert>
            )}
            {product?.receipts?.length > 0 ? (
              <div className="space-y-2">
                {product.receipts.map((receipt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded text-blue-600 mr-3">
                        <FontAwesomeIcon icon={receipt.endsWith('.pdf') ? faFileAlt : faFile} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">收據 {index + 1}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(product.updatedAt).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/${receipt.replace(/^\//, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                      >
                        查看
                      </a>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={faTimes}
                        onClick={() => handleDeleteFileConfirm(index, 'receipt')}
                        disabled={deleteFileLoading}
                      >
                        刪除
                      </Button>
                    </div>
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
              <div className="relative">
                <input
                  type="file"
                  id="warranty-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => handleFileUpload(e, 'warrantyDocument')}
                  disabled={uploadLoading || deleteFileLoading}
                />
                <Button
                  variant="light"
                  size="sm"
                  icon={uploadLoading ? faSpinner : faPlus}
                  onClick={() => document.getElementById('warranty-upload').click()}
                  disabled={uploadLoading || deleteFileLoading}
                >
                  上傳文件
                </Button>
              </div>
            </div>
            {uploadError && (
              <Alert
                variant="error"
                className="mb-4"
                icon={faExclamationTriangle}
              >
                {uploadError}
              </Alert>
            )}
            {product?.warrantyDocuments?.length > 0 ? (
              <div className="space-y-2">
                {product.warrantyDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded text-green-600 mr-3">
                        <FontAwesomeIcon icon={doc.endsWith('.pdf') ? faFileAlt : faFile} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">保固文件 {index + 1}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(product.updatedAt).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/${doc.replace(/^\//, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                      >
                        查看
                      </a>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={faTimes}
                        onClick={() => handleDeleteFileConfirm(index, 'warranty')}
                        disabled={deleteFileLoading}
                      >
                        刪除
                      </Button>
                    </div>
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
      {product?.daysLeft > 0 && product?.daysLeft <= 30 && (
        <Alert
          variant="warning"
          title="保固即將到期"
          icon={faExclamationTriangle}
          className="mt-6"
        >
          此產品的保固將在 {product.daysLeft} 天後到期。請考慮聯繫製造商了解延長保固的選項。
        </Alert>
      )}
      
      {product?.daysLeft <= 0 && (
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