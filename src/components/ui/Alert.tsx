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
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
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

// Specialized Rate Limit Alert Component
interface RateLimitAlertProps {
  countdown: string
  onRetry?: () => void
  className?: string
}

export const RateLimitAlert: React.FC<RateLimitAlertProps> = ({
  countdown,
  onRetry,
  className = ''
}) => (
  <Alert
    variant="warning"
    size="lg"
    title="API Rate Limit Reached"
    icon={<Clock className="h-6 w-6" />}
    className={className}
  >
    <div className="space-y-4">
      <p>
        You've reached the 25 requests per day limit for Alpha Vantage's free tier.
      </p>
      
      {/* Countdown Timer */}
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <Clock className="h-5 w-5 mr-2" />
          <span className="font-mono text-lg font-bold">
            {countdown}
          </span>
        </div>
        <div className="text-center text-sm mt-1">
          until reset (Midnight Eastern Time)
        </div>
      </div>

      {/* Solutions */}
      <div className="bg-yellow-100 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Available Options:</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2">⏳</span>
            <span>Wait for the countdown above to reach zero (free)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">💳</span>
            <span>
              <a 
                href="https://www.alphavantage.co/premium/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline font-medium"
              >
                Upgrade to Alpha Vantage Premium
              </a>
              {' '}for unlimited requests
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎮</span>
            <span>Continue using the app in demo mode</span>
          </li>
        </ul>
      </div>

      {/* Conservation Mode Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center text-green-800 text-sm">
          <span className="mr-2">🌱</span>
          <strong>Conservation Mode Active:</strong>
          <span className="ml-1">
            The app now uses 5-minute caching and reduced API calls to preserve your quota.
          </span>
        </div>
      </div>

      {/* Actions */}
      <Alert.Actions>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </button>
        )}
      </Alert.Actions>

      {/* API Key Info */}
      <div className="text-xs text-yellow-600 pt-2 border-t border-yellow-200">
        <strong>API Key:</strong> your_alpha_vantage_api_key_here
      </div>
    </div>
  </Alert>
)

export default Alert 