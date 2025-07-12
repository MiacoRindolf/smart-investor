import React from 'react'
import { ComponentWithChildren, ComponentWithClassName } from '../../types'

interface ButtonProps extends ComponentWithChildren, ComponentWithClassName {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button'
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantClasses = {
    primary: `
      bg-blue-600 text-white border border-transparent
      hover:bg-blue-700 focus:ring-blue-500
      shadow-sm hover:shadow-md
      dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400
    `,
    secondary: `
      bg-gray-100 text-gray-900 border border-gray-300
      hover:bg-gray-200 focus:ring-gray-500
      dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-400
    `,
    outline: `
      bg-transparent text-blue-600 border border-blue-600
      hover:bg-blue-50 focus:ring-blue-500
      dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/30 dark:focus:ring-blue-300
    `,
    ghost: `
      bg-transparent text-gray-700 border border-transparent
      hover:bg-gray-100 focus:ring-gray-500
      dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-gray-400
    `,
    danger: `
      bg-red-600 text-white border border-transparent
      hover:bg-red-700 focus:ring-red-500
      shadow-sm hover:shadow-md
      dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-400
    `
  }

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const widthClasses = fullWidth ? 'w-full' : ''

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClasses}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={children ? 'mr-2' : ''}>{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={children ? 'ml-2' : ''}>{icon}</span>
          )}
        </>
      )}
    </button>
  )
}

export default Button 