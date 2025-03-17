import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
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
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
    if (loginError) setLoginError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = '請輸入電子郵件';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
    }
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
    if (!validateForm()) return;
    setIsSubmitting(true);
    setLoginError(null);
    setErrors({});
    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        const errorMessage = result.message;
        if (errorMessage.includes('密碼錯誤')) {
          setErrors((prev) => ({ ...prev, password: '密碼錯誤' }));
          setFormData((prev) => ({ ...prev, password: '' }));
        } else if (errorMessage.includes('找不到此電子郵件')) {
          setErrors((prev) => ({ ...prev, email: '找不到此電子郵件帳號' }));
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
    <div className="h-[50vh] w-full flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* 背景卡片（僅在中大型裝置上顯示） */}
      <div className="hidden md:block absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-lg mx-auto bg-gradient-to-r from-blue-300 to-purple-300 rounded-2xl shadow-lg opacity-20 transform scale-105"></div>
      </div>

      {/* 前方的登入資訊卡片 */}
      <div className="relative w-full max-w-md mx-auto bg-white p-4 shadow rounded-2xl flex flex-col max-h-[85vh] overflow-y-auto">
        <div className="mb-2 flex flex-col items-center">
          <div className="bg-primary-100 p-1.5 rounded-full">
            <FontAwesomeIcon icon={faShieldAlt} className="text-primary-600 text-lg" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mt-1">歡迎回來</h2>
          <p className="text-sm text-gray-600">請登入您的帳戶以繼續</p>
        </div>

        {loginError && (
          <Alert 
            variant="error" 
            title="登入失敗" 
            className="mb-2"
            dismissible
            onDismiss={() => setLoginError(null)}
          >
            {loginError}
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
