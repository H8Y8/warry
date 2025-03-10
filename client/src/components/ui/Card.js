import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({
  children,
  title,
  subtitle,
  icon,
  extra,
  footer,
  onClick,
  to,
  className = '',
  hoverable = false,
  bordered = true,
  shadowSize = 'md',
}) => {
  const cardClasses = `
    bg-white rounded-lg overflow-hidden
    ${bordered ? 'border border-gray-200' : ''}
    ${
      shadowSize === 'none'
        ? ''
        : shadowSize === 'sm'
        ? 'shadow-sm'
        : shadowSize === 'md'
        ? 'shadow'
        : shadowSize === 'lg'
        ? 'shadow-lg'
        : 'shadow'
    }
    ${hoverable ? 'transition-shadow duration-300 hover:shadow-lg' : ''}
    ${onClick || to ? 'cursor-pointer' : ''}
    ${className}
  `;

  const cardContent = (
    <>
      {(title || subtitle || icon || extra) && (
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div className="px-4 py-4">{children}</div>
      {footer && <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">{footer}</div>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cardClasses}>
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div className={cardClasses} onClick={onClick} role="button" tabIndex={0}>
        {cardContent}
      </div>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
};

export default Card; 