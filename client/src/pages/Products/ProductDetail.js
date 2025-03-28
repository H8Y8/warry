import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  faSpinner,
  faTimes,
  faShareAlt,
  faDownload,
  faShieldAlt,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faTwitter,
  faWhatsapp,
  faLine,
} from '@fortawesome/free-brands-svg-icons';
import html2canvas from 'html2canvas';
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
  const shareCardRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFileConfirm, setShowDeleteFileConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [deleteFileLoading, setDeleteFileLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/products/${id}`);
        const productData = response.data.data || response.data;
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
        setError(
          error.response
            ? `獲取產品詳情失敗: ${error.response.data.message || '未知錯誤'}`
            : error.request
            ? '服務器無響應，請檢查後端服務是否正常運行'
            : '請求配置錯誤，請聯繫技術支持'
        );
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  const handleDeleteProduct = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${id}`);
      navigate('/products', { replace: true });
    } catch (error) {
      setError('刪除產品時發生錯誤，請稍後再試');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusStyle = (daysLeft) => {
    if (daysLeft <= 0) return 'bg-red-100 text-red-700 border-red-200';
    if (daysLeft <= 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const handleFileUpload = async (event, type) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // 檢查文件大小
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setUploadError('文件大小不能超過5MB');
      return;
    }

    // 檢查文件類型
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setUploadError('不支持的文件格式。請上傳 PDF、DOC、DOCX 或圖片格式的文件。');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      
      // 添加所有文件到FormData
      files.forEach(file => {
        formData.append(type === 'receipt' ? 'receipt' : 'warrantyDocument', file);
      });

      console.log('正在上傳文件...');
      console.log('文件數量:', files.length);
      console.log('文件類型:', type);

      const response = await api.post(
        `/api/products/${id}/upload-${type === 'receipt' ? 'receipt' : 'warranty'}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('上傳進度:', percentCompleted + '%');
          }
        }
      );

      console.log('上傳響應:', response.data);
      
      if (response.data.success) {
        setProduct(response.data.data.product);
        setUploadError(null);
      } else {
        setUploadError(response.data.error || '上傳文件失敗');
      }
    } catch (error) {
      console.error('文件上傳錯誤:', error);
      setUploadError(error.response?.data?.message || '上傳文件失敗，請稍後再試');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteFileConfirm = (fileIndex, type) => {
    setFileToDelete({ fileIndex, type });
    setShowDeleteFileConfirm(true);
  };

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
      setUploadError('刪除文件失敗，請稍後再試');
      setDeleteFileLoading(false);
      setShowDeleteFileConfirm(false);
      setFileToDelete(null);
    }
  };

  const openShareModal = async () => {
    setShowShareModal(true);
    
    // 等待模態框渲染
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (shareCardRef.current) {
      // 將卡片移動到可見區域以便截圖
      const card = shareCardRef.current;
      const originalStyles = {
        position: card.style.position,
        top: card.style.top,
        left: card.style.left,
        visibility: card.style.visibility,
        display: card.style.display,
        zIndex: card.style.zIndex
      };
      
      // 臨時將卡片移動到頁面頂部可見區域
      document.body.appendChild(card);
      card.style.position = 'fixed';
      card.style.top = '0';
      card.style.left = '0';
      card.style.visibility = 'visible';
      card.style.display = 'block';
      card.style.zIndex = '9999';
      
      // 再次等待確保樣式已應用
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        generateScreenshot();
      } catch (error) {
        console.error('無法生成截圖:', error);
        setUploadError('生成截圖失敗，請稍後再試');
      } finally {
        // 恢復原始位置和樣式
        card.style.position = originalStyles.position;
        card.style.top = originalStyles.top;
        card.style.left = originalStyles.left;
        card.style.visibility = originalStyles.visibility;
        card.style.display = originalStyles.display;
        card.style.zIndex = originalStyles.zIndex;
      }
    } else {
      console.error('無法找到要截圖的元素');
    }
  };

  const generateScreenshot = async () => {
    if (!shareCardRef.current) {
      console.error('無法找到要截圖的元素');
      return;
    }

    setScreenshotLoading(true);
    try {
      // 等待所有圖片加載完成
      const images = shareCardRef.current.getElementsByTagName('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = resolve; // 即使圖片加載失敗也繼續
              }
            })
        )
      );

      const canvas = await html2canvas(shareCardRef.current, {
        scale: 1.2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
      });

      const imageUrl = canvas.toDataURL('image/png');
      setScreenshotUrl(imageUrl);
    } catch (error) {
      console.error('生成截圖錯誤:', error);
      setUploadError('生成截圖失敗，請稍後再試');
    } finally {
      setScreenshotLoading(false);
    }
  };

  const downloadScreenshot = () => {
    if (!screenshotUrl) return;
    const link = document.createElement('a');
    link.href = screenshotUrl;
    link.download = `${product.name}-保固卡.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="error" className="mb-4">{error}</Alert>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            to="/products"
            variant="ghost"
            className="rounded-full"
            icon={faArrowLeft}
          >
            返回產品列表
          </Button>
        </div>

        {/* Product Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/3 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full">
            <div className="h-[235px] h-full w-full">
              <img
                src={
                  product?.images?.[0]
                    ? product.images[0].startsWith('http')
                      ? product.images[0]
                      : `${process.env.REACT_APP_API_URL}/uploads/products/${product.images[0].split('/').pop()}`
                    : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`
                }
                alt={product?.name}
                className="w-full h-full object-cover"
                onError={(e) =>
                  (e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`)
                }
              />
            </div>
            {product?.images?.length > 1 && (
              <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={
                      image.startsWith('http')
                        ? image
                        : `${process.env.REACT_APP_API_URL}/uploads/products/${image.split('/').pop()}`
                    }
                    alt={`${product.name} ${index + 1}`}
                    className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 hover:border-primary-500 cursor-pointer"
                    onError={(e) =>
                      (e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-2/3">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">{product?.name}</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  icon={faShareAlt}
                  onClick={openShareModal}
                >
                  分享
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  icon={faEdit}
                  to={`/products/edit/${id}`}
                >
                  編輯
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  icon={faTrash}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  刪除
                </Button>
              </div>
            </div>

            {/* 保固狀態卡片 */}
            <Card className="mb-6">
              <div className="p-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <h3 className="text-lg font-semibold">保固狀態</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      product?.daysLeft <= 0
                        ? 'bg-red-500 text-white'
                        : product?.daysLeft <= 30
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {product?.daysLeft <= 0 ? '已過期' : `剩餘 ${product?.daysLeft} 天`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 mb-1">購買日期</span>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {product?.purchaseDate ? formatDate(product.purchaseDate) : '未知'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 mb-1">保固到期</span>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {product?.warrantyEndDate ? formatDate(product.warrantyEndDate) : '未知'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 text-base py-3 ${
                activeTab === 'details'
                  ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              產品詳情
            </button>
            <button
              className={`flex-1 text-base py-3 ${
                activeTab === 'documents'
                  ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              相關文件
            </button>
          </nav>

          {activeTab === 'details' ? (
            <Card>
              <div className="p-6">
                <div className="space-y-6">
                  {/* 基本信息整合至此 */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">基本信息</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                      <div>
                        <span className="text-sm text-gray-500 mb-1">品牌</span>
                        <span className="font-medium block">{product?.brand || '未知'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 mb-1">類型</span>
                        <span className="font-medium block">{product?.type || '未知'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 mb-1">型號</span>
                        <span className="font-medium block">{product?.model || '未知'}</span>
                      </div>
                      {product?.serialNumber && (
                        <div>
                          <span className="text-sm text-gray-500 mb-1">序號</span>
                          <span className="font-medium block">{product.serialNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6"></div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">產品描述</h3>
                    <p className="text-gray-700">
                      {product?.description || '沒有提供產品描述'}
                    </p>
                  </div>

                  {product?.notes && (
                    <>
                      <div className="border-t border-gray-200 pt-6"></div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">備註</h3>
                        <p className="text-gray-700">{product.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">收據</h3>
                    <input
                      type="file"
                      id="receipt-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => handleFileUpload(e, 'receipt')}
                      disabled={uploadLoading || deleteFileLoading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={uploadLoading ? faSpinner : faPlus}
                      onClick={() => document.getElementById('receipt-upload').click()}
                      disabled={uploadLoading || deleteFileLoading}
                      className="w-[167px]"
                    >
                      上傳收據
                    </Button>
                  </div>
                  {uploadError && (
                    <Alert variant="error" className="mb-4" icon={faExclamationTriangle}>
                      {uploadError}
                    </Alert>
                  )}
                  {product?.receipts?.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {product.receipts.map((receipt, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3"
                        >
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3">
                              <FontAwesomeIcon icon={receipt.endsWith('.pdf') ? faFileAlt : faFile} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">收據 {index + 1}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(product.updatedAt).toLocaleDateString('zh-TW')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`${process.env.REACT_APP_API_URL}${receipt}`, '_blank')}
                              className="text-gray-600 hover:text-gray-700 w-[80px]"
                            >
                              <FontAwesomeIcon icon={faFile} className="mr-1" />
                              查看
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={faTimes}
                              onClick={() => handleDeleteFileConfirm(index, 'receipt')}
                              disabled={deleteFileLoading}
                              className="text-gray-600 hover:text-gray-700 w-[80px]"
                            >
                              刪除
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FontAwesomeIcon icon={faFile} className="text-gray-400 text-3xl mb-2" />
                      <p>尚未上傳收據</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">保固文件</h3>
                    <input
                      type="file"
                      id="warranty-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => handleFileUpload(e, 'warrantyDocument')}
                      disabled={uploadLoading || deleteFileLoading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={uploadLoading ? faSpinner : faPlus}
                      onClick={() => document.getElementById('warranty-upload').click()}
                      disabled={uploadLoading || deleteFileLoading}
                      className="w-[167px]"
                    >
                      上傳文件
                    </Button>
                  </div>
                  {uploadError && (
                    <Alert variant="error" className="mb-4" icon={faExclamationTriangle}>
                      {uploadError}
                    </Alert>
                  )}
                  {product?.warrantyDocuments?.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {product.warrantyDocuments.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3"
                        >
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600 mr-3">
                              <FontAwesomeIcon icon={doc.endsWith('.pdf') ? faFileAlt : faFile} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">保固文件 {index + 1}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(product.updatedAt).toLocaleDateString('zh-TW')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={faFile}
                              onClick={() => window.open(`${process.env.REACT_APP_API_URL}${doc}`, '_blank')}
                              className="text-gray-600 hover:text-gray-700 w-[80px]"
                            >
                              查看
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={faTimes}
                              onClick={() => handleDeleteFileConfirm(index, 'warranty')}
                              disabled={deleteFileLoading}
                              className="text-red-600 hover:text-red-700 w-[80px]"
                            >
                              刪除
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FontAwesomeIcon icon={faFile} className="text-gray-400 text-3xl mb-2" />
                      <p>尚未上傳保固文件</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Warranty Alerts */}
        {product?.daysLeft > 0 && product?.daysLeft <= 30 && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex gap-3 mb-6">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-700 mb-1">保固即將到期</h3>
              <p className="text-yellow-600 text-sm">
                此產品的保固將在 {product.daysLeft} 天後到期。請考慮聯繫製造商了解延長保固的選項。
              </p>
            </div>
          </div>
        )}
        {product?.daysLeft <= 0 && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-3 mb-6">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-700 mb-1">保固已過期</h3>
              <p className="text-red-600 text-sm">
                此產品的保固已經過期。任何維修或更換可能需要額外費用。
              </p>
            </div>
          </div>
        )}

        {/* 隱藏的分享卡片區域，用於生成截圖 */}
        <div className="fixed -top-full left-0 opacity-0 pointer-events-none">
          <div
            ref={shareCardRef}
            className="w-[400px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
          >
            {/* 頂部標題區域 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-primary-500 rounded-full p-2 flex items-center justify-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-white h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">保固卡</h2>
                  <p className="text-xs text-gray-500">WARRY™</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500 mb-1">保固狀態</span>
                <span
                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                    product?.daysLeft <= 0
                      ? 'bg-red-500 text-white'
                      : product?.daysLeft <= 30
                      ? 'bg-yellow-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {product?.daysLeft <= 0 ? '已過期' : `剩餘 ${product?.daysLeft} 天`}
                </span>
              </div>
            </div>

            {/* 產品圖片區域 */}
            <div className="relative bg-gray-100 aspect-video flex items-center justify-center">
              <img
                src={
                  product?.images?.[0]
                    ? product.images[0].startsWith('http')
                      ? product.images[0]
                      : `${process.env.REACT_APP_API_URL}/uploads/products/${product.images[0].split('/').pop()}`
                    : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.jpg`
                }
                alt={product?.name}
                className="h-full object-contain"
                crossOrigin="anonymous"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3">
                <h3 className="font-bold text-lg">{product?.name || '未知產品'}</h3>
              </div>
            </div>

            {/* 主要內容區域 */}
            <div className="p-4 space-y-5">
              {/* 產品資訊區塊 */}
              <section>
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3 text-primary-500">
                  <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
                  產品資訊
                </h3>

                <div className="space-y-3">
                  {product?.description && (
                    <div>
                      <h4 className="text-xs uppercase text-gray-500 mb-1.5">產品描述</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
                        {product.description.length > 100
                          ? `${product.description.substring(0, 100)}...`
                          : product.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <span className="text-xs text-gray-500 block mb-1">品牌</span>
                      <span className="font-medium">{product?.brand || '未知'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <span className="text-xs text-gray-500 block mb-1">型號</span>
                      <span className="font-medium">{product?.model || '未知'}</span>
                    </div>
                  </div>

                  {product?.serialNumber && (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center">
                      <span className="text-xs text-gray-500">序號</span>
                      <span className="font-mono text-sm">{product.serialNumber}</span>
                    </div>
                  )}
                </div>
              </section>

              <div className="border-t border-gray-200 my-2"></div>

              {/* 保固詳情區塊 */}
              <section>
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3 text-primary-500">
                  <FontAwesomeIcon icon={faShieldAlt} className="h-4 w-4" />
                  保固詳情
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <span className="text-xs text-gray-500 block mb-1">購買日期</span>
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCalendarAlt} className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">
                          {product?.purchaseDate ? formatDate(product.purchaseDate) : '未知'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <span className="text-xs text-gray-500 block mb-1">保固到期</span>
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCalendarAlt} className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">
                          {product?.warrantyEndDate ? formatDate(product.warrantyEndDate) : '未知'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {product?.warrantyEndDate && product?.purchaseDate && (
                    <div className="bg-primary-50 border border-primary-200 p-4 rounded-md">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">保固期間</span>
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            product?.daysLeft <= 0
                              ? 'bg-red-500 text-white'
                              : product?.daysLeft <= 30
                              ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {product?.daysLeft <= 0 ? '已過期' : '有效'}
                        </span>
                      </div>
                      {/* 進度條 */}
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            product?.daysLeft <= 0
                              ? 'bg-red-500'
                              : product?.daysLeft <= 30
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`} 
                          style={{ 
                            width: `${Math.max(0, Math.min(100, (product.daysLeft / 365) * 100))}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-gray-500">
                          {product?.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString('zh-TW') : ''}
                        </span>
                        <span className="font-medium">
                          {product?.daysLeft > 0 ? `${product.daysLeft} 天剩餘` : '已過期'}
                        </span>
                        <span className="text-gray-500">
                          {product?.warrantyEndDate ? new Date(product.warrantyEndDate).toLocaleDateString('zh-TW') : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* 底部資訊 */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                由 WARRY 生成 • {new Date().toLocaleDateString('zh-TW')}
              </div>
            </div>
          </div>
        </div>

        {/* 分享模態框 */}
        {showShareModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">分享產品保固卡</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex justify-center items-center bg-gray-50 rounded-lg p-3 overflow-hidden">
                  {screenshotLoading ? (
                    <div className="flex justify-center items-center h-64 w-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                  ) : screenshotUrl ? (
                    <img
                      src={screenshotUrl}
                      alt="產品保固卡"
                      className="max-h-[400px] object-contain w-auto rounded-lg shadow-lg"
                    />
                  ) : (
                    <p className="text-gray-500">正在生成截圖...</p>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">分享到社交媒體</h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent(`查看我的產品保固卡：${product?.name || '我的產品'}`);
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
                      }}
                      className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <FontAwesomeIcon icon={faFacebook} className="text-blue-600 mr-2" />
                      <span>Facebook</span>
                    </button>

                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent(`查看我的產品保固卡：${product?.name || '我的產品'}`);
                        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                      }}
                      className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTwitter} className="text-blue-400 mr-2" />
                      <span>Twitter</span>
                    </button>

                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent(`查看我的產品保固卡：${product?.name || '我的產品'}`);
                        window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
                      }}
                      className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-green-50 transition-colors"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className="text-green-500 mr-2" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent(`查看我的產品保固卡：${product?.name || '我的產品'}`);
                        window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank');
                      }}
                      className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-green-50 transition-colors"
                    >
                      <FontAwesomeIcon icon={faLine} className="text-green-600 mr-2" />
                      <span>LINE</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">保存圖片</h4>
                    <div className="space-y-3">
                      <button
                        onClick={downloadScreenshot}
                        disabled={!screenshotUrl || screenshotLoading}
                        className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FontAwesomeIcon icon={faDownload} className="text-gray-600 mr-2" />
                        下載保固卡圖片
                      </button>
                      <button
                        onClick={generateScreenshot}
                        disabled={screenshotLoading}
                        className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FontAwesomeIcon icon={faCamera} className="text-gray-600 mr-2" />
                        重新生成圖片
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 刪除文件確認對話框 */}
        {showDeleteFileConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">確認刪除文件</h3>
              <p className="text-gray-600 mb-6">
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
                  onClick={handleDeleteFile}
                  icon={faTrash}
                >
                  確認刪除
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;