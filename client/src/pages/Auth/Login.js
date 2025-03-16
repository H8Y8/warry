import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // 清除對應字段的錯誤
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
    // 清除全局登入錯誤
    if (loginError) {
      setLoginError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // 電子郵件驗證
    if (!formData.email) {
      newErrors.email = '請輸入電子郵件';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
    }
    
    // 密碼驗證
    if (!formData.password) {
      newErrors.password = '請輸入密碼';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼長度至少需要6個字符';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setLoginError(null);
    setErrors({});
    
    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        const errorMessage = result.message;
        if (errorMessage.includes('密碼錯誤')) {
          setErrors(prev => ({
            ...prev,
            password: '密碼錯誤'
          }));
          // 只清除密碼欄位
          setFormData(prev => ({
            ...prev,
            password: ''
          }));
        } else if (errorMessage.includes('找不到此電子郵件')) {
          setErrors(prev => ({
            ...prev,
            email: '找不到此電子郵件帳號'
          }));
        } else {
          setLoginError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('登入過程中發生錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">登入帳戶</h2>
        <p className="mt-2 text-sm text-gray-600">
          或{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            註冊新帳戶
          </Link>
        </p>
      </div>
      
      {loginError && (
        <Alert 
          variant="error" 
          title="登入失敗" 
          className="mb-4"
          dismissible
          onDismiss={() => setLoginError(null)}
        >
          {loginError}
        </Alert>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
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
          className={errors.email ? 'border-red-500' : ''}
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
            className={errors.password ? 'border-red-500' : ''}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              記住我
            </label>
          </div>
          
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
              忘記密碼？
            </Link>
          </div>
        </div>
        
        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? '登入中...' : '登入'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Login; 