import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
  faExclamationCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const variants = {
  info: {
    icon: faInfoCircle,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    iconClass: 'text-blue-400'
  },
  success: {
    icon: faCheckCircle,
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    iconClass: 'text-green-400'
  },
  warning: {
    icon: faExclamationTriangle,
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    iconClass: 'text-yellow-400'
  },
  error: {
    icon: faExclamationCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    iconClass: 'text-red-400'
  }
};

const Alert = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon = null,
  className = '',
  autoClose = false,
  autoCloseTime = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const variantStyles = variants[variant] || variants.info;
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoCloseTime);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoClose, autoCloseTime]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`rounded-md border p-4 ${variantStyles.bg} ${variantStyles.border} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <FontAwesomeIcon 
            icon={icon || variantStyles.icon} 
            className={`h-5 w-5 ${variantStyles.iconClass}`}
          />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${variantStyles.text}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${variantStyles.text} ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className={`inline-flex rounded-md p-1.5 ${variantStyles.bg} ${variantStyles.text} hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${variant}-50 focus:ring-${variant}-600`}
              >
                <span className="sr-only">關閉</span>
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert; 