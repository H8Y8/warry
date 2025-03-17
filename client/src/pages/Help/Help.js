import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faBell,
  faEnvelope,
  faCog,
  faQuestionCircle,
  faChevronRight,
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faCalendarAlt,
  faImage,
  faCheckCircle,
  faExclamationTriangle,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

// 導入插畫
import addProductIllustration from '../../assets/illustrations/add-product.svg';
import manageProductIllustration from '../../assets/illustrations/manage-product.svg';
import notificationIllustration from '../../assets/illustrations/notification.svg';

const StepCard = ({ number, title, description, icon, imageUrl }) => (
  <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
    <div className="absolute -left-4 -top-4 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold z-10">
      {number}
    </div>
    <div className="flex flex-col items-center">
      <div className="w-full aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden mb-6 p-6">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-contain" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FontAwesomeIcon icon={icon} size="3x" />
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
        {title}
      </h3>
      <p className="text-gray-600 text-center text-sm leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 p-6">
    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
      <FontAwesomeIcon icon={icon} size="lg" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const TipCard = ({ type, title, content }) => {
  const bgColor = type === 'tip' ? 'bg-blue-50' : 'bg-yellow-50';
  const iconColor = type === 'tip' ? 'text-blue-500' : 'text-yellow-500';
  const icon = type === 'tip' ? faCheckCircle : faExclamationTriangle;

  return (
    <div className={`${bgColor} rounded-lg p-4 flex items-start gap-3`}>
      <FontAwesomeIcon icon={icon} className={`${iconColor} mt-1`} />
      <div>
        <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{content}</p>
      </div>
    </div>
  );
};

const Help = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: '開始使用', icon: faChevronRight },
    { id: 'features', title: '主要功能', icon: faChevronRight },
    { id: 'tips', title: '使用技巧', icon: faChevronRight }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-primary-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <FontAwesomeIcon icon={faQuestionCircle} className="text-primary-600 text-4xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            歡迎使用電子產品保固記錄系統
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            這裡將幫助您了解如何使用系統的各項功能，輕鬆管理您的產品保固
          </p>
        </div>

        {/* 導航標籤 */}
        <div className="flex justify-center space-x-4 mb-12">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors
                ${activeSection === section.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* 內容區域 */}
        <div className="space-y-16">
          {/* 開始使用 */}
          {activeSection === 'getting-started' && (
            <div className="relative">
              {/* 連接線 */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <StepCard
                  number="1"
                  icon={faPlus}
                  title="新增產品"
                  description="點擊新增按鈕，輸入產品基本資料並上傳保固卡照片"
                  imageUrl={addProductIllustration}
                />
                <StepCard
                  number="2"
                  icon={faSearch}
                  title="查看管理"
                  description="在產品列表中查看所有產品的保固狀態，點擊可檢視詳細資訊"
                  imageUrl={manageProductIllustration}
                />
                <StepCard
                  number="3"
                  icon={faBell}
                  title="接收提醒"
                  description="系統自動追蹤保固期限，並在到期前主動通知提醒"
                  imageUrl={notificationIllustration}
                />
              </div>
            </div>
          )}

          {/* 主要功能 */}
          {activeSection === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={faBox}
                title="產品管理"
                description="輕鬆管理所有產品的保固資訊，支援批量導入和匯出功能。產品資訊一目了然，方便查詢和更新。"
              />
              <FeatureCard
                icon={faCalendarAlt}
                title="保固期限追蹤"
                description="系統自動計算每個產品的保固剩餘天數，並提供視覺化的時間軸顯示。您可以快速識別即將到期的產品。"
              />
              <FeatureCard
                icon={faImage}
                title="圖片與文件管理"
                description="為每個產品上傳多張圖片和文件，包括購買證明、保固卡等。所有資料都安全存儲，隨時可查。"
              />
              <FeatureCard
                icon={faBell}
                title="多重通知提醒"
                description="透過網站通知和電子郵件，及時獲知產品保固到期提醒。自訂提醒時間，不錯過任何重要期限。"
              />
              <FeatureCard
                icon={faEdit}
                title="資料編輯與更新"
                description="隨時編輯和更新產品資訊，包括延長保固期限、更新產品狀態等。操作簡單，一鍵保存。"
              />
              <FeatureCard
                icon={faTrash}
                title="資料備份與刪除"
                description="支援資料備份功能，確保您的產品資訊安全無虞。需要時也可以輕鬆刪除不需要的記錄。"
              />
            </div>
          )}

          {/* 使用技巧 */}
          {activeSection === 'tips' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <TipCard
                type="tip"
                title="批量新增產品"
                content="如果您有多個產品要同時登記，可以使用Excel檔案批量導入功能，節省手動輸入的時間。"
              />
              <TipCard
                type="warning"
                title="定期備份資料"
                content="建議定期將您的產品資料匯出備份，以防資料遺失。您可以在設置頁面中找到匯出功能。"
              />
              <TipCard
                type="tip"
                title="自訂通知時間"
                content="根據產品的重要性，設定不同的提醒時間。重要產品可以設定多個提醒點，確保不會錯過保固到期。"
              />
              <TipCard
                type="warning"
                title="保固卡保存"
                content="上傳保固卡照片時，請確保圖片清晰可見，重要資訊（如序號、購買日期）都能清楚辨識。"
              />
            </div>
          )}
        </div>

        {/* 聯絡支援 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700">
            <span>需要更多協助？</span>
            <a href="mailto:support@example.com" className="font-medium">
              聯絡客服支援
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help; 