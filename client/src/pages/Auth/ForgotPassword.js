import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!email) {
      setError('請輸入電子郵件');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('請輸入有效的電子郵件地址');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('請求重置密碼時發生錯誤，請稍後再試');
      console.error('Forgot password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">忘記密碼</h2>
        <p className="mt-2 text-sm text-gray-600">
          請輸入您的註冊電子郵件，我們將向您發送重置密碼的鏈接
        </p>
      </div>
      
      {error && (
        <Alert 
          variant="error" 
          className="mb-4"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success ? (
        <Alert variant="success" className="mb-4">
          <p>重置密碼鏈接已發送到您的電子郵件。請檢查您的收件箱，並按照指示重置密碼。</p>
          <p className="mt-3">
            沒有收到郵件？請檢查您的垃圾郵件文件夾，或{' '}
            <button 
              className="text-green-700 font-medium underline"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              重新發送
            </button>
          </p>
        </Alert>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            label="電子郵件"
            value={email}
            onChange={handleChange}
            placeholder="您的註冊電子郵件"
            required
            icon={faEnvelope}
            error={error}
            autoComplete="email"
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
              發送重置鏈接
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

export default ForgotPassword; 