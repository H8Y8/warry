import React, { useState, useReducer, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';


// 定義錯誤狀態reducer
const errorReducer = (state, action) => {
  console.log('dispatchError called with action:', action);
  switch (action.type) {
    case 'SET_PASSWORD_ERROR':
      return { ...state, password: action.payload };
    case 'SET_EMAIL_ERROR':
      return { ...state, email: action.payload };
    case 'CLEAR_ERROR':
      const newState = { ...state };
      delete newState[action.field];
      return newState;
    case 'CLEAR_ALL':
      return {};
    default:
      return state;
  }
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, dispatchError] = useReducer(errorReducer, {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error: authError } = useAuth();

  // 監聽 authError 的變化
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  // 檢查組件是否被掛載或重掛載
  useEffect(() => {
    console.log('Login component mounted');
    return () => {
      console.log('Login component unmounted');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      dispatchError({ type: 'CLEAR_ERROR', field: name });
    }
    
    if (loginError) {
      setLoginError(null);
    }
  };

  const validateForm = () => {
    let hasError = false;
    
    if (!formData.email) {
      dispatchError({ type: 'SET_EMAIL_ERROR', payload: '請輸入電子郵件' });
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      dispatchError({ type: 'SET_EMAIL_ERROR', payload: '請輸入有效的電子郵件地址' });
      hasError = true;
    }
    
    if (!formData.password) {
      dispatchError({ type: 'SET_PASSWORD_ERROR', payload: '請輸入密碼' });
      hasError = true;
    } else if (formData.password.length < 6) {
      dispatchError({ type: 'SET_PASSWORD_ERROR', payload: '密碼長度至少需要6個字符' });
      hasError = true;
    }
    
    return !hasError;
  };

  const navigate = useNavigate();

  // 防抖提交處理
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
    
    console.log('[Login] Submit attempt:', {
      email: formData.email,
      timestamp: new Date().toISOString()
    });
    
    setIsSubmitting(true);
    setLoginError(null);
    dispatchError({ type: 'CLEAR_ALL' });
  
    try {
      const response = await login(formData.email, formData.password);
      console.log('[Login] Submit response:', {
        success: response.success,
        type: response.type,
        timestamp: new Date().toISOString()
      });
      
      if (response.success) {
        navigate('/dashboard');
        return;
      }
      
      // 處理錯誤情況
      const { type, message } = response;
      console.log('[Login] Handling error:', { type, message });
      
      switch (type) {
        case 'password':
          dispatchError({ type: 'SET_PASSWORD_ERROR', payload: message });
          break;
        case 'email':
          dispatchError({ type: 'SET_EMAIL_ERROR', payload: message });
          break;
        default:
          setLoginError(message || '登入失敗，請稍後再試');
      }
    } catch (error) {
      console.error('[Login] Unexpected error:', error);
      setLoginError('發生未預期的錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="h-[50vh] w-full flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* 背景卡片（僅在中大型裝置上顯示） */}
      <div className="hidden md:block absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-lg mx-auto bg-gradient-to-r from-blue-300 to-purple-300 rounded-2xl shadow-lg opacity-20 transform scale-105"></div>
      </div>

      {/* 前方的登入資訊卡片 */}
      <div className="relative w-full max-w-md mx-auto bg-white p-4 shadow rounded-2xl flex flex-col max-h-[85vh] overflow-y-auto space-y-4">
        <div className="mb-2 flex flex-col items-center">
          <div className="bg-primary-100 p-1.5 rounded-full">
            <FontAwesomeIcon icon={faShieldAlt} className="text-primary-600 text-lg" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mt-1">歡迎回來</h2>
          <p className="text-sm text-gray-600">請登入您的帳戶以繼續</p>
        </div>

        {/* 一般錯誤提示區域 */}
        {loginError && (
          <Alert 
            variant="error" 
            title="登入失敗" 
            className="mb-2"
            dismissible
            onDismiss={() => setLoginError(null)}
          >
            <div className="font-medium">{loginError}</div>
          </Alert>
        )}
        
        <form className="space-y-2 flex-1" onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            label="電子郵件"
            value={formData.email}
            onChange={handleChange}
            placeholder="your-email@example.com"
            required
            icon={faEnvelope}
            error={errors.email}
            autoComplete="email"
            containerClassName="mb-0"
          />

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="密碼"
              value={formData.password}
              onChange={handleChange}
              placeholder="您的密碼"
              required
              icon={faLock}
              error={errors.password}
              autoComplete="current-password"
              containerClassName="mb-0"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>

          {/* 表單錯誤訊息顯示區域 */}
          <div className={`text-xs rounded-md p-2 mt-2 transition-all duration-200 ${
            errors.password || errors.email 
              ? 'text-red-500 bg-red-50 border border-red-200' 
              : 'text-gray-400 bg-gray-50'
          }`}>
            {errors.password && (
              <div className="flex items-center mb-1 p-1 bg-red-100 rounded">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">密碼錯誤: </span>
                <span className="ml-1 text-red-700">{errors.password}</span>
              </div>
            )}
            {errors.email && (
              <div className="flex items-center mb-1 p-1 bg-red-100 rounded">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">郵箱錯誤: </span>
                <span className="ml-1 text-red-700">{errors.email}</span>
              </div>
            )}
            {!errors.password && !errors.email && !loginError && (
              <div className="text-gray-500 text-center py-1">
                <span className="inline-block mr-1">👋</span>
                請輸入您的登入資訊
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                記住我
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                忘記密碼？
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full py-2 rounded-lg mt-1.5 transition transform hover:-translate-y-0.5 hover:shadow-md"
          >
            {isSubmitting ? '登入中...' : '登入'}
          </Button>

          <div className="text-center mt-3">
            <p className="text-sm text-gray-600">
              還沒有帳戶？{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                立即註冊
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
