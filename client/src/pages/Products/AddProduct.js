import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUpload,
  faImage,
  faTimes,
  faSpinner,
  faExclamationTriangle,
  faInfoCircle,
  faCalendarAlt,
  faBarcode,
  faBriefcase,
  faMobileAlt,
  faFileAlt,
  faStickyNote,
  faCheck,
  faLaptop
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
  const [currentStep, setCurrentStep] = useState(1);
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

  // 保固期限選項
  const warrantyOptions = [
    { value: '3', label: '3個月' },
    { value: '6', label: '6個月' },
    { value: '12', label: '1年' },
    { value: '24', label: '2年' },
    { value: '36', label: '3年' },
    { value: '60', label: '5年' },
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

  // 前往下一步
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  // 返回上一步
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // 檢查當前步驟是否完成
  const isStepComplete = (step) => {
    if (step === 1) {
      return formData.name && formData.type && formData.brand && formData.model;
    } else if (step === 2) {
      return formData.purchaseDate && formData.warrantyPeriod;
    }
    return true; // 第三步可選
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

      // 創建 FormData 對象來處理圖片上傳
      const formDataToSend = new FormData();

      // 添加產品基本信息
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // 計算並添加保固到期日期
      const purchaseDate = new Date(formData.purchaseDate);
      const warrantyDays = parseInt(formData.warrantyPeriod) * 30.4167; // 平均每月天數
      const warrantyEndDate = new Date(purchaseDate);
      warrantyEndDate.setDate(warrantyEndDate.getDate() + Math.floor(warrantyDays) - 1); // 減一天，因為保固到當天結束
      formDataToSend.append('warrantyEndDate', warrantyEndDate.toISOString().split('T')[0]);

      // 添加圖片文件
      if (images.length > 0) {
        images.forEach((image, index) => {
          formDataToSend.append('productImages', image.file);
        });
      }

      console.log('正在發送的數據：', {
        name: formDataToSend.get('name'),
        type: formDataToSend.get('type'),
        brand: formDataToSend.get('brand'),
        model: formDataToSend.get('model'),
        purchaseDate: formDataToSend.get('purchaseDate'),
        warrantyEndDate: formDataToSend.get('warrantyEndDate'),
        imagesCount: images.length
      });

      // 發送請求到後端 API
      const response = await api.post('/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('產品創建成功：', response.data);

      if (response.data) {
        // 添加成功後導航到產品列表頁面
        navigate('/products', { 
          state: { 
            message: '產品添加成功！',
            type: 'success' 
          }
        });
      }
    } catch (error) {
      console.error('添加產品錯誤:', error);
      const errorMessage = error.response?.data?.message || error.message || '添加產品時發生錯誤，請稍後再試';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // 獲取產品類型圖標
  const getTypeIcon = (type) => {
    switch (type) {
      case '智慧型手機': return faMobileAlt;
      case '筆記型電腦': return faLaptop;
      default: return faLaptop;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 標題導航 */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center">
          <Button
            to="/products"
            variant="light"
            className="mr-4"
            icon={faArrowLeft}
          >
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">添加新產品</h1>
        </div>
        <div className="mt-4 sm:mt-0 text-sm text-gray-500">
          <span>添加產品及保固信息，以便追踪保固期限</span>
        </div>
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

      {/* 步驟指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex-1 flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <span className="text-sm font-medium">1</span>
            </div>
            <span className="ml-2 text-sm font-medium">基本信息</span>
          </div>
          <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <span className="text-sm font-medium">2</span>
            </div>
            <span className="ml-2 text-sm font-medium">保固信息</span>
          </div>
          <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <span className="text-sm font-medium">3</span>
            </div>
            <span className="ml-2 text-sm font-medium">其他信息</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 步驟 1: 產品基本信息 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card className="p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FontAwesomeIcon icon={faLaptop} className="mr-2 text-blue-600" />
                產品基本信息
              </h2>
              
              <div className="grid gap-x-6 gap-y-8 grid-cols-1 md:grid-cols-2">
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                    placeholder="例如：MacBook Pro 14-inch"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                    required
                  >
                    <option value="">選擇產品類型</option>
                    {productTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                    placeholder="例如：Apple"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                    placeholder="例如：M2, 2023"
                    required
                  />
                </div>

                {/* 序號 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    序號
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faBarcode} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                      placeholder="選填，如：FVFXCXXXXXX"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">可在產品背面或包裝盒上找到</p>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={handleNextStep}
                disabled={!isStepComplete(1)}
                className="px-6"
              >
                下一步：保固信息
              </Button>
            </div>
          </div>
        )}

        {/* 步驟 2: 保固信息 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card className="p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-blue-600" />
                保固信息
              </h2>
              
              <div className="grid gap-x-6 gap-y-8 grid-cols-1 md:grid-cols-2">
                {/* 購買日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    購買日期 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                    required
                  >
                    {warrantyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 保固到期預覽 */}
                {formData.purchaseDate && formData.warrantyPeriod && (
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-800 flex items-center">
                      <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                      根據您提供的信息，此產品的保固將於 
                      <span className="font-bold mx-1">
                        {(() => {
                          const purchaseDate = new Date(formData.purchaseDate);
                          const warrantyDays = parseInt(formData.warrantyPeriod) * 30.4167; // 平均每月天數
                          const warrantyEndDate = new Date(purchaseDate);
                          warrantyEndDate.setDate(warrantyEndDate.getDate() + Math.floor(warrantyDays) - 1); // 減一天，因為保固到當天結束
                          return warrantyEndDate.toLocaleDateString('zh-TW');
                        })()}
                      </span>
                      到期
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="light"
                onClick={handlePrevStep}
                className="px-6"
              >
                返回：基本信息
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleNextStep}
                disabled={!isStepComplete(2)}
                className="px-6"
              >
                下一步：其他信息
              </Button>
            </div>
          </div>
        )}

        {/* 步驟 3: 其他信息 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* 左側：產品描述和備註 */}
              <div className="lg:col-span-2">
                <Card className="p-6 shadow-sm border border-gray-200 h-full">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-blue-600" />
                    產品描述與備註
                  </h2>
                  
                  {/* 產品描述 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      產品描述
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                      placeholder="添加產品描述、配置、顏色等（選填）"
                    ></textarea>
                  </div>

                  {/* 備註 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      備註
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 text-gray-400">
                        <FontAwesomeIcon icon={faStickyNote} />
                      </div>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="4"
                        className="block w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                        placeholder="添加任何其他重要信息（選填）"
                      ></textarea>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 右側：圖片上傳 */}
              <div className="lg:col-span-3">
                <Card className="p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <FontAwesomeIcon icon={faImage} className="mr-2 text-blue-600" />
                    產品圖片
                  </h2>
                  
                  {/* 圖片上傳區域 */}
                  <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {images.length === 0 ? (
                        <div className="sm:col-span-3">
                          <label className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                            <div className="flex flex-col items-center pt-5 pb-6">
                              <FontAwesomeIcon icon={faUpload} className="h-10 w-10 text-gray-400 mb-3" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">點擊上傳</span> 或拖放
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG 或 WEBP (最大 5MB)
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                      ) : (
                        <>
                          {images.map((image, index) => (
                            <div key={index} className="relative aspect-w-1 aspect-h-1">
                              <img
                                src={image.preview}
                                alt={`產品圖片 ${index + 1}`}
                                className="object-cover rounded-lg shadow-sm h-48 w-full"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-all"
                              >
                                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          
                          {images.length < 5 && (
                            <div className="aspect-w-1 aspect-h-1">
                              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <FontAwesomeIcon icon={faImage} className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">添加更多圖片</span>
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
                        </>
                      )}
                    </div>
                    {imageError && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                        {imageError}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-gray-500">
                      上傳產品圖片、收據或保固文件，以便日後查閱
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="light"
                onClick={handlePrevStep}
                className="px-6"
              >
                返回：保固信息
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                className="px-10"
                icon={loading ? faSpinner : faCheck}
              >
                {loading ? '添加中...' : '添加產品'}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* 底部信息 */}
      <div className="mt-10 text-center text-sm text-gray-500">
        <p>添加後，您可以隨時編輯產品信息和上傳更多文件</p>
      </div>
    </div>
  );
};

export default AddProduct; 