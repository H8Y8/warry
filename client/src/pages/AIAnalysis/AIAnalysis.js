import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudUploadAlt,
  faSpinner,
  faTimes,
  faCheckCircle,
  faExclamationCircle,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import api from '../../services/api';

const AIAnalysis = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    purchaseDate: '',
    warrantyEndDate: '',
    serialNumber: '',
    description: ''
  });

  // 處理文件上傳
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    // 檢查文件類型
    if (!selectedFile.type.match('image.*')) {
      setError('請上傳有效的圖片文件（JPG、PNG、WEBP 等）');
      return;
    }
    
    // 檢查文件大小 (5MB 限制)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('文件大小不能超過 5MB');
      return;
    }
    
    // 更新文件狀態
    setFile(selectedFile);
    setError(null);
    
    // 創建預覽
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // 處理拖放
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-primary-500', 'bg-primary-50');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary-500', 'bg-primary-50');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary-500', 'bg-primary-50');
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      
      // 檢查文件類型
      if (!droppedFile.type.match('image.*')) {
        setError('請上傳有效的圖片文件（JPG、PNG、WEBP 等）');
        return;
      }
      
      // 檢查文件大小
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('文件大小不能超過 5MB');
        return;
      }
      
      // 更新文件狀態
      setFile(droppedFile);
      setError(null);
      
      // 創建預覽
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  // 重置上傳界面
  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 發送分析請求
  const analyzeImage = async () => {
    if (!file) {
      setError('請先上傳產品圖片');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 創建表單數據
      const formData = new FormData();
      formData.append('aiAnalysisImage', file);
      
      // 發送請求
      // 在真實環境中，這裡會調用實際的API
      // const response = await api.post('/ai/analyze', formData);
      // const result = response.data.data;
      
      // 模擬API響應
      // 延遲3秒模擬處理時間
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 模擬分析結果
      const mockResult = getMockAnalysisResult();
      setAnalysisResult(mockResult);
      
      // 預填表單
      setFormData({
        name: `${mockResult.brand.value} ${mockResult.model.value}`,
        type: mockResult.productType.value,
        brand: mockResult.brand.value,
        model: mockResult.model.value,
        purchaseDate: getPastDate(180), // 假設購買日期為6個月前
        warrantyEndDate: getFutureDate(180), // 假設保固期限為一年
        serialNumber: '',
        description: `${mockResult.model.value}, 由AI分析識別`
      });
      
    } catch (error) {
      console.error('AI分析錯誤:', error);
      setError('分析圖片時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 獲取模擬分析結果
  const getMockAnalysisResult = () => {
    // 隨機選擇一個產品類型
    const productTypes = [
      { type: '智慧型手機', confidence: 0.95 },
      { type: '筆記型電腦', confidence: 0.92 },
      { type: '平板電腦', confidence: 0.88 },
      { type: '智慧型手錶', confidence: 0.85 },
      { type: '無線耳機', confidence: 0.82 }
    ];
    
    // 根據產品類型提供相應的品牌和型號
    const productBrands = {
      '智慧型手機': [
        { brand: 'Apple', confidence: 0.94, models: ['iPhone 13 Pro', 'iPhone 12', 'iPhone SE'] },
        { brand: 'Samsung', confidence: 0.92, models: ['Galaxy S21', 'Galaxy Note 20', 'Galaxy A52'] },
        { brand: 'Google', confidence: 0.88, models: ['Pixel 6', 'Pixel 5a', 'Pixel 4'] }
      ],
      '筆記型電腦': [
        { brand: 'Apple', confidence: 0.93, models: ['MacBook Pro', 'MacBook Air', 'MacBook'] },
        { brand: 'Dell', confidence: 0.90, models: ['XPS 13', 'Inspiron 15', 'Latitude 7420'] },
        { brand: 'Lenovo', confidence: 0.87, models: ['ThinkPad X1', 'Yoga 9i', 'IdeaPad 5'] }
      ],
      '平板電腦': [
        { brand: 'Apple', confidence: 0.95, models: ['iPad Pro', 'iPad Air', 'iPad mini'] },
        { brand: 'Samsung', confidence: 0.91, models: ['Galaxy Tab S7', 'Galaxy Tab A7', 'Galaxy Tab S6 Lite'] },
        { brand: 'Microsoft', confidence: 0.86, models: ['Surface Pro', 'Surface Go', 'Surface Book'] }
      ],
      '智慧型手錶': [
        { brand: 'Apple', confidence: 0.96, models: ['Apple Watch Series 7', 'Apple Watch SE', 'Apple Watch Series 6'] },
        { brand: 'Samsung', confidence: 0.89, models: ['Galaxy Watch 4', 'Galaxy Watch Active 2', 'Galaxy Fit 2'] },
        { brand: 'Garmin', confidence: 0.85, models: ['Venu 2', 'Forerunner 945', 'Fenix 6'] }
      ],
      '無線耳機': [
        { brand: 'Apple', confidence: 0.94, models: ['AirPods Pro', 'AirPods (3rd gen)', 'AirPods Max'] },
        { brand: 'Sony', confidence: 0.91, models: ['WF-1000XM4', 'WH-1000XM4', 'LinkBuds'] },
        { brand: 'Bose', confidence: 0.88, models: ['QuietComfort Earbuds', 'Sport Earbuds', 'SoundLink'] }
      ]
    };
    
    // 隨機選擇產品類型
    const randomTypeIndex = Math.floor(Math.random() * productTypes.length);
    const selectedType = productTypes[randomTypeIndex];
    
    // 根據選擇的類型獲取品牌列表
    const brandsForType = productBrands[selectedType.type];
    
    // 隨機選擇品牌
    const randomBrandIndex = Math.floor(Math.random() * brandsForType.length);
    const selectedBrand = brandsForType[randomBrandIndex];
    
    // 隨機選擇型號
    const randomModelIndex = Math.floor(Math.random() * selectedBrand.models.length);
    const selectedModel = selectedBrand.models[randomModelIndex];
    
    // 生成隨機的購買日期範圍（過去1-3年內）
    const currentYear = new Date().getFullYear();
    const randomYearsAgo = Math.floor(Math.random() * 3) + 1;
    const purchaseYearStart = currentYear - randomYearsAgo;
    const purchaseYearEnd = purchaseYearStart + 1;
    
    // 生成隨機的保固期限（1-3年）
    const warrantyYears = Math.floor(Math.random() * 3) + 1;
    
    // 返回分析結果
    return {
      productType: {
        value: selectedType.type,
        confidence: selectedType.confidence
      },
      brand: {
        value: selectedBrand.brand,
        confidence: selectedBrand.confidence
      },
      model: {
        value: selectedModel,
        confidence: 0.75 // 型號識別通常較低的置信度
      },
      purchaseDateRange: {
        value: `${purchaseYearStart}年 - ${purchaseYearEnd}年`,
        confidence: 0.6 // 購買日期是推測的，置信度較低
      },
      warrantyPeriod: {
        value: `${warrantyYears}年官方保固`,
        confidence: 0.65 // 保固期限也是推測的，置信度較低
      }
    };
  };

  // 處理表單字段更改
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 處理表單提交
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 在真實環境中，這裡會調用實際的API
      // const response = await api.post('/products', formData);
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 跳轉到產品列表頁面
      navigate('/products');
    } catch (error) {
      console.error('保存產品錯誤:', error);
      setError('保存產品時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 獲取置信度標籤顏色
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-50 text-green-700 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // 獲取置信度標籤文字
  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return '高';
    if (confidence >= 0.6) return '中';
    return '低';
  };

  // 獲取過去日期，用於默認購買日期
  const getPastDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  // 獲取將來日期，用於默認保固到期日期
  const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI產品圖片分析</h1>
        <p className="text-gray-600">上傳產品圖片，AI將自動識別產品並幫助您創建保固記錄。</p>
      </div>

      {error && (
        <Alert 
          variant="error" 
          className="mb-4"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 上傳區域 */}
        <Card title="上傳產品圖片" className="mb-6 lg:mb-0">
          {!preview ? (
            <div 
              className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-gray-400 mb-3" />
              <p className="mb-2 text-gray-700">拖放圖片至此處或點擊上傳</p>
              <p className="text-xs text-gray-500">支援 JPG, PNG, WEBP 格式，大小不超過 5MB</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          ) : (
            <div className="mt-4">
              <div className="relative">
                <img 
                  src={preview} 
                  alt="產品預覽" 
                  className="w-full h-auto rounded-lg mb-4 max-h-64 object-contain" 
                />
                <button 
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-red-600"
                  onClick={resetUpload}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="mr-2"
                  onClick={resetUpload}
                >
                  重新上傳
                </Button>
                <Button 
                  type="button" 
                  variant="primary" 
                  size="sm"
                  loading={loading}
                  disabled={loading}
                  onClick={analyzeImage}
                >
                  {loading ? '分析中...' : '開始分析'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* 分析結果 */}
        {analysisResult && (
          <Card 
            title="AI分析結果" 
            subtitle="AI識別的產品信息，置信度越高表示識別結果越可靠"
            className="mb-6"
          >
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">產品類型</h3>
                  <p className="text-lg font-semibold text-gray-900">{analysisResult.productType.value}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getConfidenceColor(analysisResult.productType.confidence)}`}>
                  信心度: {getConfidenceLabel(analysisResult.productType.confidence)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">品牌</h3>
                  <p className="text-lg font-semibold text-gray-900">{analysisResult.brand.value}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getConfidenceColor(analysisResult.brand.confidence)}`}>
                  信心度: {getConfidenceLabel(analysisResult.brand.confidence)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">型號</h3>
                  <p className="text-lg font-semibold text-gray-900">{analysisResult.model.value}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getConfidenceColor(analysisResult.model.confidence)}`}>
                  信心度: {getConfidenceLabel(analysisResult.model.confidence)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">可能的購買日期區間</h3>
                  <p className="text-lg font-semibold text-gray-900">{analysisResult.purchaseDateRange.value}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getConfidenceColor(analysisResult.purchaseDateRange.confidence)}`}>
                  信心度: {getConfidenceLabel(analysisResult.purchaseDateRange.confidence)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">預估保固期限</h3>
                  <p className="text-lg font-semibold text-gray-900">{analysisResult.warrantyPeriod.value}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getConfidenceColor(analysisResult.warrantyPeriod.confidence)}`}>
                  信心度: {getConfidenceLabel(analysisResult.warrantyPeriod.confidence)}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 根據分析結果創建產品表單 */}
      {analysisResult && (
        <Card 
          title="創建產品記錄" 
          subtitle="請檢查並補充以下信息"
          className="mt-6"
        >
          <form onSubmit={handleFormSubmit} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="產品名稱"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="產品類型"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="品牌"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="型號"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
              />
              
              <Input
                label="購買日期"
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="保固到期日"
                id="warrantyEndDate"
                name="warrantyEndDate"
                type="date"
                value={formData.warrantyEndDate}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="序號 (可選)"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="產品序號，如有"
                className="md:col-span-2"
              />
              
              <Input
                label="產品描述 (可選)"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="產品的顏色、容量等其他詳情"
                className="md:col-span-2"
              />
            </div>
            
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
                icon={faPlus}
              >
                創建產品記錄
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default AIAnalysis; 