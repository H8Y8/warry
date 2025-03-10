import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUpload,
  faImage,
  faTimes,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyPeriod: '12',
    description: '',
    notes: ''
  });

  // 產品類型選項
  const productTypes = [
    '智慧型手機',
    '筆記型電腦',
    '平板電腦',
    '耳機',
    '桌上型電腦',
    '相機',
    '智慧型手錶',
    '其他'
  ];

  // 處理表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理圖片上傳
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // 驗證文件
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setImageError('請只上傳圖片文件（JPG、PNG等）');
      return;
    }

    // 驗證文件大小
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setImageError('圖片大小不能超過5MB');
      return;
    }

    // 驗證圖片數量
    if (images.length + files.length > 5) {
      setImageError('最多只能上傳5張圖片');
      return;
    }

    setImageError(null);

    // 創建圖片預覽
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  // 移除圖片
  const handleRemoveImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 驗證必填字段
      const requiredFields = ['name', 'type', 'brand', 'model', 'purchaseDate'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error('請填寫所有必填字段');
      }

      // 計算保固到期日期
      const purchaseDate = new Date(formData.purchaseDate);
      const warrantyEndDate = new Date(purchaseDate);
      warrantyEndDate.setMonth(warrantyEndDate.getMonth() + parseInt(formData.warrantyPeriod));

      // 在實際應用中，這裡會上傳圖片並獲取URL
      const imageUrls = images.map(image => URL.createObjectURL(image.file));

      // 準備產品數據
      const productData = {
        ...formData,
        warrantyEndDate: warrantyEndDate.toISOString().split('T')[0],
        images: imageUrls
      };

      // 在實際應用中，這裡會調用API
      // const response = await api.post('/products', productData);
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 導航到產品列表頁面
      navigate('/products');
    } catch (error) {
      console.error('添加產品錯誤:', error);
      setError(error.message || '添加產品時發生錯誤，請稍後再試');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 標題導航 */}
      <div className="mb-6 flex items-center">
        <Button
          to="/products"
          variant="light"
          className="mr-4"
          icon={faArrowLeft}
        >
          返回產品列表
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">添加新產品</h1>
      </div>

      {error && (
        <Alert
          variant="error"
          className="mb-6"
          icon={faExclamationTriangle}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：產品圖片上傳 */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="font-medium text-lg text-gray-900 mb-4">產品圖片</h2>
              
              {/* 圖片上傳區域 */}
              <div className="mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-w-16 aspect-h-9">
                      <img
                        src={image.preview}
                        alt={`產品圖片 ${index + 1}`}
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <div className="aspect-w-16 aspect-h-9">
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50">
                        <FontAwesomeIcon icon={faImage} className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">點擊上傳圖片</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
                {imageError && (
                  <p className="mt-2 text-sm text-red-600">{imageError}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  最多可上傳5張圖片，每張大小不超過5MB
                </p>
              </div>
            </Card>
          </div>

          {/* 右側：產品信息表單 */}
          <div>
            <Card>
              <h2 className="font-medium text-lg text-gray-900 mb-4">產品信息</h2>
              
              <div className="space-y-4">
                {/* 產品名稱 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    產品名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* 產品類型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    產品類型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    <option value="">請選擇產品類型</option>
                    {productTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* 品牌 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    品牌 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* 型號 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    型號 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* 序號 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    序號
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                {/* 購買日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    購買日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* 保固期限 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    保固期限 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="warrantyPeriod"
                    value={formData.warrantyPeriod}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    <option value="12">1年</option>
                    <option value="24">2年</option>
                    <option value="36">3年</option>
                    <option value="48">4年</option>
                    <option value="60">5年</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* 產品描述 */}
            <Card className="mt-6">
              <h2 className="font-medium text-lg text-gray-900 mb-4">產品描述</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="輸入產品描述..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備註
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="添加備註..."
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/products')}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            保存產品
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct; 