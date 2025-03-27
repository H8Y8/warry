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
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LineShareButton,
} from 'react-share';
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
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('文件大小不能超過5MB');
      return;
    }
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setProduct(response.data.data.product);
      setUploadLoading(false);
    } catch (error) {
      setUploadError(error.response?.data?.message || '上傳文件失敗，請稍後再試');
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

  const generateScreenshot = async () => {
    if (!shareCardRef.current) return;
    setScreenshotLoading(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      const imageUrl = canvas.toDataURL('image/png');
      setScreenshotUrl(imageUrl);
      setScreenshotLoading(false);
    } catch (error) {
      console.error('生成截圖錯誤:', error);
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

  const openShareModal = async () => {
    setShowShareModal(true);
    setTimeout(() => generateScreenshot(), 100); // 延遲確保 DOM 已渲染
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
                    : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.svg`
                }
                alt={product?.name}
                className="w-full h-full object-cover"
                onError={(e) =>
                  (e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.svg`)
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
                      (e.target.src = `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.svg`)
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
                            <a
                              href={`${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/${receipt.replace(
                                /^\//,
                                ''
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              查看
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={faTimes}
                              onClick={() => handleDeleteFileConfirm(index, 'receipt')}
                              disabled={deleteFileLoading}
                              className="text-red-600 hover:text-red-700"
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
                            <a
                              href={`${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/${doc.replace(
                                /^\//,
                                ''
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              查看
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={faTimes}
                              onClick={() => handleDeleteFileConfirm(index, 'warranty')}
                              disabled={deleteFileLoading}
                              className="text-red-600 hover:text-red-700"
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
        {showShareModal && (
          <div className="fixed -top-full left-0">
            <div
              ref={shareCardRef}
              className="w-[400px] bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-primary-600 text-xl" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-bold text-xl">保固卡</h3>
                    <p className="text-primary-200 text-sm">WARRY</p>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded-md">
                  <h4 className="text-white text-sm">保固狀態</h4>
                  <span
                    className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${
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
              <div className="mb-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <img
                    src={
                      product?.images?.[0]
                        ? product.images[0].startsWith('http')
                          ? product.images[0]
                          : `${process.env.REACT_APP_API_URL}/uploads/products/${product.images[0].split('/').pop()}`
                        : `${process.env.REACT_APP_API_URL}/uploads/products/default-product-image.svg`
                    }
                    alt={product?.name}
                    className="object-cover w-full h-32 rounded-md"
                  />
                  <h2 className="mt-3 text-white font-bold text-xl truncate">
                    {product?.name || '未知產品'}
                  </h2>
                </div>
              </div>
              {product?.description && (
                <div className="mb-4">
                  <h4 className="text-primary-200 text-xs">描述</h4>
                  <p className="text-white text-sm">
                    {product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white bg-opacity-10 p-3 rounded-md">
                  <h4 className="text-primary-200 text-xs">品牌</h4>
                  <p className="text-white font-medium truncate">{product?.brand || '未知'}</p>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded-md">
                  <h4 className="text-primary-200 text-xs">型號</h4>
                  <p className="text-white font-medium truncate">{product?.model || '未知'}</p>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded-md">
                  <h4 className="text-primary-200 text-xs">類型</h4>
                  <p className="text-white font-medium truncate">{product?.type || '未知'}</p>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded-md">
                  <h4 className="text-primary-200 text-xs">購買日期</h4>
                  <p className="text-white font-medium">
                    {product?.purchaseDate ? formatDate(product.purchaseDate) : '未知'}
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded-md">
                  <h4 className="text-primary-200 text-xs">保固到期</h4>
                  <p className="text-white font-medium">
                    {product?.warrantyEndDate ? formatDate(product.warrantyEndDate) : '未知'}
                  </p>
                </div>
                {product?.serialNumber && (
                  <div className="bg-white bg-opacity-10 p-3 rounded-md">
                    <h4 className="text-primary-200 text-xs">序號</h4>
                    <p className="text-white font-medium">{product.serialNumber}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-4">
                <div className="text-primary-200 text-xs">
                  由 WARRY 生成 • {new Date().toLocaleDateString('zh-TW')}
                </div>
                <div className="flex space-x-1">
                  <div className="bg-white h-1 w-8 rounded opacity-70"></div>
                  <div className="bg-white h-1 w-3 rounded opacity-40"></div>
                  <div className="bg-white h-1 w-1 rounded opacity-20"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 分享模態框 */}
        {showShareModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">分享產品保固卡</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex justify-center">
                  {screenshotLoading ? (
                    <div className="flex justify-center items-center h-64 w-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                  ) : screenshotUrl ? (
                    <img
                      src={screenshotUrl}
                      alt="產品保固卡"
                      className="max-w-full rounded-lg shadow-lg"
                    />
                  ) : (
                    <p className="text-gray-500">正在生成截圖...</p>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">分享到社交媒體</h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <FacebookShareButton
                      url={window.location.href}
                      title={`查看我的產品保固卡：${product?.name || '我的產品'}`}
                      className="w-full"
                    >
                      <button className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-blue-50">
                        <FontAwesomeIcon icon={faFacebook} className="text-blue-600 mr-2" />
                        Facebook
                      </button>
                    </FacebookShareButton>
                    <TwitterShareButton
                      url={window.location.href}
                      title={`查看我的產品保固卡：${product?.name || '我的產品'}`}
                      className="w-full"
                    >
                      <button className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-blue-50">
                        <FontAwesomeIcon icon={faTwitter} className="text-blue-400 mr-2" />
                        Twitter
                      </button>
                    </TwitterShareButton>
                    <WhatsappShareButton
                      url={window.location.href}
                      title={`查看我的產品保固卡：${product?.name || '我的產品'}`}
                      className="w-full"
                    >
                      <button className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-green-50">
                        <FontAwesomeIcon icon={faWhatsapp} className="text-green-500 mr-2" />
                        WhatsApp
                      </button>
                    </WhatsappShareButton>
                    <LineShareButton
                      url={window.location.href}
                      title={`查看我的產品保固卡：${product?.name || '我的產品'}`}
                      className="w-full"
                    >
                      <button className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-green-50">
                        <FontAwesomeIcon icon={faLine} className="text-green-600 mr-2" />
                        LINE
                      </button>
                    </LineShareButton>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">保存圖片</h4>
                    <div className="space-y-3">
                      <button
                        onClick={downloadScreenshot}
                        disabled={!screenshotUrl || screenshotLoading}
                        className="flex items-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FontAwesomeIcon icon={faDownload} className="text-gray-600 mr-2" />
                        下載保固卡圖片
                      </button>
                      <button
                        onClick={generateScreenshot}
                        disabled={screenshotLoading}
                        className="flex items-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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