import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

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
    
    if (!formData.password) {
      newErrors.password = '請輸入密碼';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要6個字符';
    }
    
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
    setResetError(null);
    
    try {
      const result = await resetPassword(token, formData.password);
      if (result.success) {
        setSuccess(true);
        // 3秒後跳轉到登入頁面
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setResetError(result.message);
      }
    } catch (error) {
      setResetError('重置密碼時發生錯誤，請稍後再試');
      console.error('Reset password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">重置密碼</h2>
        <p className="mt-2 text-sm text-gray-600">
          請輸入您的新密碼
        </p>
      </div>
      
      {resetError && (
        <Alert 
          variant="error" 
          className="mb-4"
          dismissible
          onDismiss={() => setResetError(null)}
        >
          {resetError}
        </Alert>
      )}
      
      {success ? (
        <Alert 
          variant="success" 
          title="密碼重置成功" 
          className="mb-4"
        >
          <p>您的密碼已成功重置。</p>
          <p className="mt-2">即將跳轉到登入頁面...</p>
        </Alert>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            id="password"
            name="password"
            type="password"
            label="新密碼"
            value={formData.password}
            onChange={handleChange}
            placeholder="至少6個字符"
            required
            icon={faLock}
            error={errors.password}
            helper="密碼長度至少6個字符"
            autoComplete="new-password"
          />
          
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="確認新密碼"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="再次輸入密碼"
            required
            icon={faLock}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              重置密碼
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              返回登入
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPassword; 