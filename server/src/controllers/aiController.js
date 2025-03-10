/**
 * AI分析控制器
 * 處理產品圖片分析功能
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { ErrorResponse } = require('../middleware/error');

/**
 * 分析產品圖片
 * @route POST /api/ai/analyze
 * @access Private
 */
exports.analyzeProductImage = async (req, res, next) => {
  try {
    // 檢查是否上傳了文件
    if (!req.file) {
      return next(new ErrorResponse('請上傳產品圖片', 400));
    }
    
    // 獲取文件路徑
    const filePath = req.file.path;
    
    // 讀取文件
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    
    // 調用AI分析API
    try {
      // 在實際應用中，這裡應該調用真實的AI服務API
      // 這裡使用模擬數據進行演示
      
      // const response = await axios.post(
      //   process.env.AI_API_URL,
      //   {
      //     image: base64Image
      //   },
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${process.env.AI_API_KEY}`
      //     }
      //   }
      // );
      
      // 模擬AI分析結果
      const mockAnalysisResult = getMockAnalysisResult();
      
      // 返回分析結果
      res.status(200).json({
        success: true,
        data: mockAnalysisResult
      });
    } catch (error) {
      console.error('AI分析API調用失敗:', error);
      return next(new ErrorResponse('AI分析服務暫時不可用，請稍後再試', 503));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 獲取模擬的AI分析結果
 * 在實際應用中，這個函數將被替換為真實的AI服務調用
 */
function getMockAnalysisResult() {
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
} 