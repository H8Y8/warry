import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });
  const { register } = useAuth();

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
    // 清除全局註冊錯誤
    if (registerError) {
      setRegisterError(null);
    }

    // 即時驗證確認密碼
    if (name === 'password' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: '兩次輸入的密碼不一致'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: null
        }));
      }
    }
    if (name === 'confirmPassword' && value) {
      if (value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: '兩次輸入的密碼不一致'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: null
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 用戶名驗證
    if (!formData.username) {
      newErrors.username = '請輸入用戶名';
    } else if (formData.username.length < 3) {
      newErrors.username = '用戶名至少需要3個字符';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '用戶名只能包含字母、數字和底線';
    }
    
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
      newErrors.password = '密碼至少需要6個字符';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = '密碼需要包含至少一個小寫字母';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = '密碼需要包含至少一個大寫字母';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密碼需要包含至少一個數字';
    }
    
    // 確認密碼驗證
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '請確認密碼';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = '兩次輸入的密碼不一致';
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
    setRegisterError(null);
    
    const { username, email, password } = formData;
    
    try {
      const result = await register({ username, email, password });
      if (!result.success) {
        if (result.message.includes('username')) {
          setErrors(prev => ({
            ...prev,
            username: '此用戶名已被使用'
          }));
        } else if (result.message.includes('email')) {
          setErrors(prev => ({
            ...prev,
            email: '此電子郵件已被註冊'
          }));
        } else {
          setRegisterError(result.message || '註冊失敗，請稍後再試');
        }
      }
    } catch (error) {
      setRegisterError('註冊過程中發生錯誤，請稍後再試');
      console.error('Register error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">註冊新帳戶</h2>
        <p className="mt-2 text-sm text-gray-600">
          或{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            登入現有帳戶
          </Link>
        </p>
      </div>
      
      {registerError && (
        <Alert 
          variant="error" 
          title="註冊失敗" 
          className="mb-4"
          dismissible
          onDismiss={() => setRegisterError(null)}
        >
          {registerError}
        </Alert>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          id="username"
          name="username"
          type="text"
          label="用戶名"
          value={formData.username}
          onChange={handleChange}
          placeholder="請輸入3個字符以上的用戶名"
          required
          icon={faUser}
          error={errors.username}
          autoComplete="username"
          className={errors.username ? 'border-red-500' : ''}
          helper="用戶名只能包含字母、數字和底線"
        />
        
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
            type={showPasswords.password ? "text" : "password"}
            label="密碼"
            value={formData.password}
            onChange={handleChange}
            placeholder="至少6個字符"
            required
            icon={faLock}
            error={errors.password}
            helper="密碼需要包含大小寫字母和數字"
            autoComplete="new-password"
            className={errors.password ? 'border-red-500' : ''}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('password')}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <FontAwesomeIcon icon={showPasswords.password ? faEyeSlash : faEye} />
          </button>
        </div>
        
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPasswords.confirmPassword ? "text" : "password"}
            label="確認密碼"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="再次輸入密碼"
            required
            icon={faLock}
            error={errors.confirmPassword}
            autoComplete="new-password"
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirmPassword')}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <FontAwesomeIcon icon={showPasswords.confirmPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        
        <div className="mt-1">
          <p className="text-xs text-gray-500">
            點擊註冊，表示您同意我們的{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
              使用條款
            </Link>{' '}
            和{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
              隱私政策
            </Link>
            。
          </p>
        </div>
        
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? '註冊中...' : '註冊'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Register; 