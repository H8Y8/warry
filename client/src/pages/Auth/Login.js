import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
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
    
    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setLoginError(result.message);
      }
    } catch (error) {
      setLoginError('登入過程中發生錯誤，請稍後再試');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
      
      <form className="space-y-6" onSubmit={handleSubmit}>
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
        />
        
        <Input
          id="password"
          name="password"
          type="password"
          label="密碼"
          value={formData.password}
          onChange={handleChange}
          placeholder="您的密碼"
          required
          icon={faLock}
          error={errors.password}
          autoComplete="current-password"
        />
        
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
            登入
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Login; 