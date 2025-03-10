import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faMobileAlt,
  faLaptop,
  faBell,
  faShieldAlt,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: faShieldAlt,
      title: '保固管理',
      description: '集中管理您所有電子產品的保固信息，避免遺失重要憑證。'
    },
    {
      icon: faBell,
      title: '到期提醒',
      description: '在保固到期前收到提醒，讓您有足夠的時間考慮維修或升級。'
    },
    {
      icon: faLaptop,
      title: '跨設備同步',
      description: '在桌面電腦、平板和手機上訪問您的保固記錄，隨時查看。'
    },
    {
      icon: faRobot,
      title: 'AI產品識別',
      description: '只需上傳產品照片，AI就能自動識別產品型號並填寫詳細資訊。'
    }
  ];

  return (
    <div className="bg-white">
      {/* 頁眉 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faLaptop} className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">電子產品保固記錄</h1>
          </div>
          <div className="flex space-x-4">
            {isAuthenticated ? (
              <Button to="/dashboard" variant="primary">
                進入系統
              </Button>
            ) : (
              <>
                <Button to="/login" variant="light">
                  登入
                </Button>
                <Button to="/register" variant="primary">
                  註冊帳戶
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 英雄區塊 */}
      <div className="relative bg-primary-700 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-primary-700 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 xl:pt-24">
              <div className="text-center md:text-left mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">不再錯過</span>
                  <span className="block text-primary-300">保固到期時間</span>
                </h2>
                <p className="mt-3 max-w-md mx-auto md:mx-0 text-base text-primary-200 sm:text-lg md:mt-5 md:text-xl">
                  集中管理您所有電子產品的保固信息，接收到期提醒，避免錯過維修機會，讓您的投資更有保障。
                </p>
                <div className="mt-10 sm:flex sm:justify-center md:justify-start">
                  <div className="rounded-md shadow">
                    <Button 
                      to={isAuthenticated ? "/dashboard" : "/register"} 
                      variant="light" 
                      size="xl"
                    >
                      {isAuthenticated ? "進入儀表板" : "免費註冊"}
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button 
                      to="/products" 
                      variant="primary" 
                      size="xl"
                      className="border-primary-400 text-primary-100 bg-primary-800"
                    >
                      了解更多
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80"
            alt="電子產品展示"
          />
        </div>
      </div>

      {/* 功能區塊 */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">功能特點</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              更智能的保固管理方式
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              無論是智能手機、筆記本電腦還是家用電器，我們都能幫助您追踪保固期限，避免額外維修費用。
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <FontAwesomeIcon icon={feature.icon} className="h-6 w-6" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 使用步驟 */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">簡單三步驟</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              開始使用非常簡單
            </p>
          </div>
          <div className="mt-16">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              {/* 步驟 1 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 text-primary-600 mx-auto">
                  <span className="text-3xl font-bold">1</span>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">註冊帳戶</h3>
                <p className="mt-2 text-base text-gray-500">
                  創建一個免費帳戶，只需幾秒鐘，您就可以開始追踪您的產品保固。
                </p>
              </div>

              {/* 步驟 2 */}
              <div className="mt-10 lg:mt-0 text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 text-primary-600 mx-auto">
                  <span className="text-3xl font-bold">2</span>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">添加您的產品</h3>
                <p className="mt-2 text-base text-gray-500">
                  手動輸入產品信息或使用我們的AI圖片識別功能自動識別您的產品。
                </p>
              </div>

              {/* 步驟 3 */}
              <div className="mt-10 lg:mt-0 text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 text-primary-600 mx-auto">
                  <span className="text-3xl font-bold">3</span>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">接收保固提醒</h3>
                <p className="mt-2 text-base text-gray-500">
                  系統將在保固到期前自動提醒您，讓您做好準備，不錯過任何重要日期。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 行動召喚 */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">準備開始管理您的產品保固了嗎？</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            立即註冊免費帳戶，開始追踪您所有的電子產品保固期限，再也不會錯過重要的日期。
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 sm:w-auto"
          >
            {isAuthenticated ? "進入儀表板" : "立即開始 - 免費"}
          </Link>
        </div>
      </div>

      {/* 頁腳 */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-10">
            <a href="#" className="text-gray-400 hover:text-gray-500">關於我們</a>
            <a href="#" className="text-gray-400 hover:text-gray-500">使用條款</a>
            <a href="#" className="text-gray-400 hover:text-gray-500">隱私政策</a>
            <a href="#" className="text-gray-400 hover:text-gray-500">幫助中心</a>
            <a href="#" className="text-gray-400 hover:text-gray-500">聯繫我們</a>
          </div>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} 電子產品保固記錄服務. 保留所有權利.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 