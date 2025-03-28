import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditProduct = () => {
  const { id } = useParams();
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

  // 獲取產品數據
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/products/${id}`);
        const productData = response.data.data || response.data;
        
        // 計算保固期限（月數）
        const purchaseDate = new Date(productData.purchaseDate);
        const warrantyEndDate = new Date(productData.warrantyEndDate);
        const monthDiff = (warrantyEndDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
                         (warrantyEndDate.getMonth() - purchaseDate.getMonth());

        // 設置表單數據
        setFormData({
          name: productData.name || '',
          type: productData.type || '',
          brand: productData.brand || '',
          model: productData.model || '',
          serialNumber: productData.serialNumber || '',
          purchaseDate: productData.purchaseDate ? new Date(productData.purchaseDate).toISOString().split('T')[0] : '',
          warrantyPeriod: monthDiff.toString() || '12',
          description: productData.description || '',
          notes: productData.notes || ''
        });

        // 設置圖片
        if (productData.images && productData.images.length > 0) {
          setImages(productData.images.map(image => ({
            preview: image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL}${image}`,
            isExisting: true
          })));
        }

        setLoading(false);
      } catch (error) {
        console.error('獲取產品數據錯誤:', error);
        setError('獲取產品數據時發生錯誤，請稍後再試');
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

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
      if (!newImages[index].isExisting) {
        URL.revokeObjectURL(newImages[index].preview);
      }
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
      const warrantyDays = parseInt(formData.warrantyPeriod) * 30.4167; // 平均每月天數
      warrantyEndDate.setDate(warrantyEndDate.getDate() + Math.floor(warrantyDays) - 1); // 減一天，因為保固到當天結束

      // 準備表單數據
      const formDataToSend = new FormData();
      
      // 添加基本信息
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // 添加保固到期日期
      formDataToSend.append('warrantyEndDate', warrantyEndDate.toISOString().split('T')[0]);

      // 添加現有圖片
      const existingImages = images
        .filter(image => image.isExisting)
        .map(image => image.preview.replace(`${process.env.REACT_APP_API_URL}`, ''));
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      // 添加新圖片
      images
        .filter(image => !image.isExisting)
        .forEach(image => {
          formDataToSend.append('images', image.file);
        });

      // 發送更新請求
      await api.put(`/api/products/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 導航到產品詳情頁面
      navigate(`/products/${id}`);
    } catch (error) {
      console.error('更新產品錯誤:', error);
      setError(error.response?.data?.message || error.message || '更新產品時發生錯誤，請稍後再試');
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center">
        <Button
          to={`/products/${id}`}
          variant="light"
          className="mr-4"
          icon={faArrowLeft}
        >
          返回產品詳情
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">編輯產品</h1>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" icon={faExclamationTriangle}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* 左側圖片上傳區塊 */}
          <Card>
            <h2 className="font-medium text-lg text-gray-900 mb-4">產品圖片</h2>
            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
              {images[0] ? (
                <img src={images[0].preview} className="object-contain max-h-full max-w-full" />
              ) : (
                <label className="flex flex-col items-center text-gray-400 cursor-pointer">
                  <FontAwesomeIcon icon={faImage} className="h-12 w-12 mb-2" />
                  <span className="text-sm">點擊上傳圖片</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-4">
              {images.slice(1).map((image, index) => (
                <div key={index} className="relative w-16 h-16 rounded overflow-hidden border">
                  <img src={image.preview} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index + 1)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer hover:border-primary-500">
                  <FontAwesomeIcon icon={faUpload} className="text-gray-400" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">最多可上傳5張圖片，每張大小不超過5MB</p>
            {imageError && (
              <p className="text-sm text-red-600 mt-1">{imageError}</p>
            )}
          </Card>

          {/* 右側表單資訊 */}
          <div className="flex flex-col gap-6">
            <Card>
              <h2 className="font-medium text-lg text-gray-900 mb-4">產品資訊</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">產品名稱 <span className="text-red-500">*</span></label>
                  <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">產品類型 <span className="text-red-500">*</span></label>
                  <select name="type" value={formData.type} onChange={handleInputChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="">請選擇</option>
                    {productTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品牌 <span className="text-red-500">*</span></label>
                  <input name="brand" value={formData.brand} onChange={handleInputChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">型號 <span className="text-red-500">*</span></label>
                  <input name="model" value={formData.model} onChange={handleInputChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">序號</label>
                  <input name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">購買日期 <span className="text-red-500">*</span></label>
                  <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">保固期限 <span className="text-red-500">*</span></label>
                  <select name="warrantyPeriod" value={formData.warrantyPeriod} onChange={handleInputChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="12">1年</option>
                    <option value="24">2年</option>
                    <option value="36">3年</option>
                    <option value="48">4年</option>
                    <option value="60">5年</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-medium text-lg text-gray-900 mb-4">其他資訊</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">產品描述</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate(`/products/${id}`)}>取消</Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>保存更改</Button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;