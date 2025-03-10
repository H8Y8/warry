import React, { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Input = forwardRef(({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  required = false,
  disabled = false,
  error = null,
  icon = null,
  iconPosition = 'left',
  helper = null,
  className = '',
  containerClassName = '',
  ...rest
}, ref) => {
  const inputClasses = `
    block w-full rounded-md shadow-sm 
    ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
    ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
    ${icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `;

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={id || name} 
          className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'} mb-1`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon 
              icon={icon} 
              className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} 
            />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helper ? `${name}-helper` : undefined}
          {...rest}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FontAwesomeIcon 
              icon={icon} 
              className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} 
            />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
          {error}
        </p>
      )}
      
      {!error && helper && (
        <p className="mt-1 text-xs text-gray-500" id={`${name}-helper`}>
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 