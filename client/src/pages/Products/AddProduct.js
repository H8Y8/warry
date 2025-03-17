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
  const [receipts, setReceipts] = useState([]);
  const [warrantyDocs, setWarrantyDocs] = useState([]);
  const [docError, setDocError] = useState(null);

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

  // 處理文件上傳
  const handleDocUpload = (e, type) => {
    const files = Array.from(e.target.files);
    
    // 驗證文件
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setDocError('請上傳 PDF、DOC、DOCX 或圖片格式的文件');
      return;
    }

    // 驗證文件大小
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setDocError('文件大小不能超過5MB');
      return;
    }

    setDocError(null);

    // 創建文件預覽
    const newFiles = files.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      type: file.type
    }));

    if (type === 'receipt') {
      setReceipts(prev => [...prev, ...newFiles]);
    } else {
      setWarrantyDocs(prev => [...prev, ...newFiles]);
    }
  };

  // 移除文件
  const handleRemoveDoc = (index, type) => {
    if (type === 'receipt') {
      setReceipts(prev => {
        const newDocs = [...prev];
        if (newDocs[index].preview) {
          URL.revokeObjectURL(newDocs[index].preview);
        }
        newDocs.splice(index, 1);
        return newDocs;
      });
    } else {
      setWarrantyDocs(prev => {
        const newDocs = [...prev];
        if (newDocs[index].preview) {
          URL.revokeObjectURL(newDocs[index].preview);
        }
        newDocs.splice(index, 1);
        return newDocs;
      });
    }
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

  // 修改表單提交處理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('開始提交表單...');
      
      // 驗證必填字段
      const requiredFields = ['name', 'type', 'brand', 'model', 'purchaseDate'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`請填寫以下必填字段：${missingFields.join(', ')}`);
      }

      // 創建 FormData 對象
      const formDataToSend = new FormData();

      // 添加產品基本信息
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
        console.log(`添加字段 ${key}:`, formData[key]);
      });

      // 計算並添加保固到期日期
      const purchaseDate = new Date(formData.purchaseDate);
      const warrantyDays = parseInt(formData.warrantyPeriod) * 30.4167;
      const warrantyEndDate = new Date(purchaseDate);
      warrantyEndDate.setDate(warrantyEndDate.getDate() + Math.floor(warrantyDays) - 1);
      formDataToSend.append('warrantyEndDate', warrantyEndDate.toISOString().split('T')[0]);

      // 添加產品圖片
      if (images.length > 0) {
        console.log(`準備上傳 ${images.length} 張產品圖片`);
        images.forEach((image, index) => {
          formDataToSend.append('productImages', image.file);
          console.log(`添加圖片 ${index + 1}:`, image.file.name);
        });
      }

      // 添加收據
      if (receipts.length > 0) {
        console.log(`準備上傳 ${receipts.length} 份收據`);
        receipts.forEach((receipt, index) => {
          formDataToSend.append('receipt', receipt.file);
          console.log(`添加收據 ${index + 1}:`, receipt.file.name);
        });
      }

      // 添加保固文件
      if (warrantyDocs.length > 0) {
        console.log(`準備上傳 ${warrantyDocs.length} 份保固文件`);
        warrantyDocs.forEach((doc, index) => {
          formDataToSend.append('warrantyDocument', doc.file);
          console.log(`添加保固文件 ${index + 1}:`, doc.file.name);
        });
      }

      console.log('開始發送請求...');
      const response = await api.post('/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`上傳進度: ${percentCompleted}%`);
        }
      });

      console.log('請求成功，響應數據:', response.data);
      
      // 成功後導航到產品詳情頁
      navigate(`/products/${response.data.data._id}`);
    } catch (error) {
      console.error('創建產品時發生錯誤:', error);
      console.error('錯誤詳情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError(
        error.response?.data?.message || 
        error.message || 
        '創建產品時發生錯誤，請檢查所有必填字段和文件大小'
      );
    } finally {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 標題導航 - 現代化設計 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                to="/products"
                variant="light"
                className="hover:bg-gray-100 transition-all duration-200"
                icon={faArrowLeft}
              >
                返回
              </Button>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-500">
                添加新產品
              </h1>
            </div>
            <p className="mt-4 sm:mt-0 text-sm text-gray-500 max-w-lg">
              添加產品及保固信息，以便追踪保固期限
            </p>
          </div>
        </div>

        {error && (
          <Alert
            variant="error"
            className="mb-6 animate-fade-in"
            icon={faExclamationTriangle}
          >
            {error}
          </Alert>
        )}

        {/* 步驟指示器 - 現代化設計 */}
        <div className="mb-12">
          <div className="relative">
            {/* 步驟圖標 */}
            <div className="relative flex justify-between items-center">
              {/* 背景連接線 - 橫穿所有圖標 */}
              <div className="absolute top-8 left-[8%] right-[8%] h-1.5 bg-gray-200 rounded-full z-0" />
              
              {/* 進度連接線 - 根據當前步驟顯示進度 */}
              <div 
                className={`
                  absolute top-8 left-[8%] h-1.5 rounded-full
                  bg-gradient-to-r from-blue-500 via-primary-500 to-indigo-500
                  transition-all duration-500 ease-in-out z-0
                `}
                style={{
                  width: currentStep === 1 ? '0%' : currentStep === 2 ? '45%' : '89%'
                }}
              />

              {[
                { 
                  step: 1, 
                  title: '基本信息',
                  icon: faLaptop,
                  description: '填寫產品名稱、類型等基本資料',
                  iconBg: 'from-blue-500 to-primary-500'
                },
                { 
                  step: 2, 
                  title: '保固信息',
                  icon: faCalendarAlt,
                  description: '設定購買日期和保固期限',
                  iconBg: 'from-primary-500 to-indigo-500'
                },
                { 
                  step: 3, 
                  title: '其他信息',
                  icon: faFileAlt,
                  description: '上傳圖片和相關文件',
                  iconBg: 'from-indigo-500 to-blue-500'
                }
              ].map(({ step, title, icon, description, iconBg }) => (
                <div
                  key={step}
                  className={`flex flex-col items-center group relative ${
                    currentStep >= step
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                >
                  {/* 步驟提示 */}
                  <div className={`
                    absolute -top-14 left-1/2 transform -translate-x-1/2
                    bg-gradient-to-r from-primary-600 to-blue-600
                    text-white text-xs py-2 px-4 rounded-xl whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-all duration-300
                    pointer-events-none shadow-lg z-10
                    before:content-[''] before:absolute before:top-full before:left-1/2
                    before:-translate-x-1/2 before:border-8 before:border-transparent
                    before:border-t-primary-600
                  `}>
                    步驟 {step}
                  </div>

                  {/* 步驟圖標 */}
                  <div
                    className={`
                      relative flex items-center justify-center w-16 h-16 rounded-2xl z-10
                      ${
                        currentStep > step
                          ? `bg-gradient-to-br ${iconBg} text-white shadow-lg shadow-primary-100`
                          : currentStep === step
                          ? 'bg-white text-primary-600 ring-4 ring-primary-100 shadow-lg'
                          : 'bg-white text-gray-400 ring-4 ring-gray-100'
                      }
                      transform transition-all duration-300 ease-in-out
                      ${currentStep >= step ? 'scale-100' : 'scale-90'}
                      group-hover:scale-105
                    `}
                  >
                    {currentStep > step ? (
                      <div className="relative">
                        <FontAwesomeIcon 
                          icon={faCheck} 
                          className="w-7 h-7 animate-scale-check" 
                        />
                        <div className="absolute inset-0 bg-white rounded-full animate-ring-expand opacity-0"></div>
                      </div>
                    ) : (
                      <FontAwesomeIcon 
                        icon={icon} 
                        className={`w-7 h-7 transform transition-transform duration-300 ${
                          currentStep === step ? 'scale-110' : 'scale-100'
                        } group-hover:scale-110`}
                      />
                    )}
                  </div>

                  {/* 步驟標題和描述 */}
                  <div className="mt-4 space-y-2 text-center">
                    <p className={`text-sm font-bold transition-colors duration-300 ${
                      currentStep >= step ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {title}
                    </p>
                    <p className={`text-xs max-w-[120px] transition-colors duration-300 ${
                      currentStep >= step ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 步驟 1: 產品基本信息 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 bg-white rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <FontAwesomeIcon icon={faLaptop} className="mr-3 text-primary-600" />
                  產品基本信息
                </h2>
                
                <div className="grid gap-x-8 gap-y-6 grid-cols-1 md:grid-cols-2">
                  {/* 產品名稱 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      產品名稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="例如：MacBook Pro 14-inch"
                      required
                    />
                  </div>

                  {/* 產品類型 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      產品類型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      品牌 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="例如：Apple"
                      required
                    />
                  </div>

                  {/* 型號 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      型號 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="例如：M2, 2023"
                      required
                    />
                  </div>

                  {/* 序號 */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      序號
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faBarcode} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleInputChange}
                        className="block w-full pl-12 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="選填，如：FVFXCXXXXXX"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                      可在產品背面或包裝盒上找到
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={!isStepComplete(1)}
                  className="px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  下一步：保固信息
                </Button>
              </div>
            </div>
          )}

          {/* 步驟 2: 保固信息 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 bg-white rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-primary-600" />
                  保固信息
                </h2>
                
                <div className="grid gap-x-8 gap-y-6 grid-cols-1 md:grid-cols-2">
                  {/* 購買日期 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      購買日期 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleInputChange}
                        className="block w-full pl-12 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* 保固期限 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      保固期限 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="warrantyPeriod"
                      value={formData.warrantyPeriod}
                      onChange={handleInputChange}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                    <div className="md:col-span-2">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-800 flex items-center">
                          <FontAwesomeIcon icon={faInfoCircle} className="mr-3 text-blue-500" />
                          根據您提供的信息，此產品的保固將於 
                          <span className="font-bold mx-2 text-primary-600">
                            {(() => {
                              const purchaseDate = new Date(formData.purchaseDate);
                              const warrantyDays = parseInt(formData.warrantyPeriod) * 30.4167;
                              const warrantyEndDate = new Date(purchaseDate);
                              warrantyEndDate.setDate(warrantyEndDate.getDate() + Math.floor(warrantyDays) - 1);
                              return warrantyEndDate.toLocaleDateString('zh-TW');
                            })()}
                          </span>
                          到期
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="light"
                  onClick={handlePrevStep}
                  className="px-8 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  返回：基本信息
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={!isStepComplete(2)}
                  className="px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  下一步：其他信息
                </Button>
              </div>
            </div>
          )}

          {/* 步驟 3: 其他信息 */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {/* 產品描述和備註 */}
              <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white mr-4">
                    <FontAwesomeIcon icon={faFileAlt} className="text-lg" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                    產品描述與備註
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 產品描述 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      產品描述
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="5"
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="添加產品描述、配置、顏色等（選填）"
                    ></textarea>
                  </div>

                  {/* 備註 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      備註
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-4 text-gray-400">
                        <FontAwesomeIcon icon={faStickyNote} />
                      </div>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="5"
                        className="block w-full pl-12 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="添加任何其他重要信息（選填）"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 產品圖片上傳 */}
              <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white rounded-2xl overflow-hidden">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-primary-500 flex items-center justify-center text-white mr-4">
                    <FontAwesomeIcon icon={faImage} className="text-lg" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-primary-500">
                    產品圖片
                  </span>
                </h2>
                
                {/* 圖片上傳區域 */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
                    {images.length === 0 ? (
                      <div className="sm:col-span-3 md:col-span-5">
                        <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-primary-500 transition-all duration-300 group">
                          <div className="flex flex-col items-center pt-5 pb-6">
                            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-50 transition-all duration-300">
                              <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-gray-400 group-hover:text-primary-500 transition-colors duration-300" />
                            </div>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold text-primary-600">點擊上傳</span> 或拖放
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
                          <div key={index} className="relative group">
                            <div className="aspect-w-1 aspect-h-1 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                              <img
                                src={image.preview}
                                alt={`產品圖片 ${index + 1}`}
                                className="object-cover w-full h-full"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 hover:bg-red-600 shadow-lg transform scale-90 hover:scale-100 transition-all duration-300"
                            >
                              <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        
                        {images.length < 5 && (
                          <div className="aspect-w-1 aspect-h-1">
                            <label className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-300">
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
                    <p className="mt-3 text-sm text-red-600 flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                      {imageError}
                    </p>
                  )}
                </div>
              </Card>

              {/* 文件上傳區域 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 收據上傳 */}
                <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white rounded-2xl overflow-hidden">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-indigo-500 flex items-center justify-center text-white mr-3">
                      <FontAwesomeIcon icon={faFileAlt} className="text-sm" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500">
                      收據
                    </span>
                  </h2>
                  
                  <div className="space-y-4">
                    {receipts.map((doc, index) => (
                      <div key={index} className="relative group">
                        <div className="p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all duration-300">
                          <div className="flex items-center">
                            <div className="bg-primary-100 p-3 rounded-lg text-primary-600 mr-4">
                              <FontAwesomeIcon icon={doc.type.startsWith('image/') ? faImage : faFileAlt} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(index, 'receipt')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 hover:bg-red-600 shadow-lg transform scale-90 hover:scale-100 transition-all duration-300"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 group">
                        <div className="w-10 h-10 mb-2 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-50 transition-all duration-300">
                          <FontAwesomeIcon icon={faFileAlt} className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-300" />
                        </div>
                        <span className="text-sm text-gray-500">上傳收據</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                          multiple
                          onChange={(e) => handleDocUpload(e, 'receipt')}
                        />
                      </label>
                    </div>
                  </div>
                </Card>

                {/* 保固文件上傳 */}
                <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white rounded-2xl overflow-hidden">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white mr-3">
                      <FontAwesomeIcon icon={faFileAlt} className="text-sm" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-500">
                      保固文件
                    </span>
                  </h2>
                  
                  <div className="space-y-4">
                    {warrantyDocs.map((doc, index) => (
                      <div key={index} className="relative group">
                        <div className="p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all duration-300">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg text-green-600 mr-4">
                              <FontAwesomeIcon icon={doc.type.startsWith('image/') ? faImage : faFileAlt} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(index, 'warranty')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 hover:bg-red-600 shadow-lg transform scale-90 hover:scale-100 transition-all duration-300"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-300 group">
                        <div className="w-10 h-10 mb-2 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-green-50 transition-all duration-300">
                          <FontAwesomeIcon icon={faFileAlt} className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                        </div>
                        <span className="text-sm text-gray-500">上傳保固文件</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                          multiple
                          onChange={(e) => handleDocUpload(e, 'warranty')}
                        />
                      </label>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="light"
                  onClick={handlePrevStep}
                  className="px-8 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300"
                >
                  返回：保固信息
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                  className="px-10 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                  icon={loading ? faSpinner : faCheck}
                >
                  {loading ? '添加中...' : '添加產品'}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* 底部信息 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 bg-gray-50 inline-block px-6 py-3 rounded-full">
            添加後，您可以隨時編輯產品信息和上傳更多文件
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddProduct; 