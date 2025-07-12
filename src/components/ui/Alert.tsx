import React from 'react'
import { ComponentWithChildren, ComponentWithClassName } from '../../types'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X,
  Clock,
  RefreshCw
} from 'lucide-react'

interface AlertProps extends ComponentWithChildren, ComponentWithClassName {
  variant?: 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode | boolean
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  actions?: React.ReactNode
}

interface AlertActionsProps extends ComponentWithChildren, ComponentWithClassName {}

const Alert: React.FC<AlertProps> & {
  Actions: React.FC<AlertActionsProps>
} = ({
  children,
  className = '',
  variant = 'info',
  size = 'md',
  icon = true,
  title,
  dismissible = false,
  onDismiss,
  actions
}) => {
  const baseClasses = 'rounded-lg border flex'
  
  const variantClasses = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
  }
  
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm',
    lg: 'p-6 text-base'
  }
  
  const iconMap = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    info: Info
  }
  
  const IconComponent = iconMap[variant]
  
  return (
    <div className={`
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {/* Icon */}
      {icon && (
        <div className="flex-shrink-0">
          {React.isValidElement(icon) ? (
            icon
          ) : (
            <IconComponent className="h-5 w-5" />
          )}
        </div>
      )}
      
      {/* Content */}
      <div className={`flex-1 ${icon ? 'ml-3' : ''}`}>
        {title && (
          <h3 className="font-semibold mb-1">
            {title}
          </h3>
        )}
        <div className="text-sm">
          {children}
        </div>
        {actions && (
          <div className="mt-3">
            {actions}
          </div>
        )}
      </div>
      
      {/* Dismiss button */}
      {dismissible && onDismiss && (
        <div className="flex-shrink-0 ml-4">
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

const AlertActions: React.FC<AlertActionsProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`flex space-x-3 ${className}`}>
    {children}
  </div>
)

Alert.Actions = AlertActions

export default Alert 