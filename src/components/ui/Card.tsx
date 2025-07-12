import React from 'react'
import { ComponentWithChildren, ComponentWithClassName } from '../../types'

interface CardProps extends ComponentWithChildren, ComponentWithClassName {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

interface CardHeaderProps extends ComponentWithChildren, ComponentWithClassName {
  divider?: boolean
}

interface CardContentProps extends ComponentWithChildren, ComponentWithClassName {}

interface CardFooterProps extends ComponentWithChildren, ComponentWithClassName {
  divider?: boolean
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>
  Content: React.FC<CardContentProps>
  Footer: React.FC<CardFooterProps>
} = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
  padding = 'md',
  hover = false 
}) => {
  const baseClasses = 'rounded-lg transition-all duration-200'
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    elevated: 'bg-white shadow-lg border-0 dark:bg-gray-800 dark:shadow-xl',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg dark:bg-gray-800/80 dark:border-gray-700/40 dark:shadow-xl'
  }
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const hoverClasses = hover ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : ''
  
  return (
    <div className={`
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${paddingClasses[padding]}
      ${hoverClasses}
      ${className}
    `}>
      {children}
    </div>
  )
}

const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '', 
  divider = false 
}) => (
  <div className={`
    ${divider ? 'border-b border-gray-200 pb-4 mb-4 dark:border-gray-700' : 'mb-4'}
    ${className}
  `}>
    {children}
  </div>
)

const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={className}>
    {children}
  </div>
)

const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '', 
  divider = false 
}) => (
  <div className={`
    ${divider ? 'border-t border-gray-200 pt-4 mt-4 dark:border-gray-700' : 'mt-4'}
    ${className}
  `}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Content = CardContent
Card.Footer = CardFooter

export default Card 