'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all-smooth focus-ring',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95'
    ]

    const variants = {
      primary: [
        'bg-blue-600 text-white shadow-sm',
        'hover:bg-blue-700 hover:shadow-md',
        'focus:bg-blue-700'
      ],
      secondary: [
        'bg-gray-100 text-gray-900 shadow-sm',
        'hover:bg-gray-200 hover:shadow-md',
        'focus:bg-gray-200',
        'dark:bg-gray-800 dark:text-gray-100',
        'dark:hover:bg-gray-700 dark:focus:bg-gray-700'
      ],
      outline: [
        'border border-gray-300 bg-white text-gray-700 shadow-sm',
        'hover:bg-gray-50 hover:border-gray-400',
        'focus:bg-gray-50 focus:border-gray-400',
        'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
        'dark:hover:bg-gray-700 dark:hover:border-gray-500'
      ],
      ghost: [
        'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        'focus:bg-gray-100 focus:text-gray-900',
        'dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
      ],
      danger: [
        'bg-red-600 text-white shadow-sm',
        'hover:bg-red-700 hover:shadow-md',
        'focus:bg-red-700'
      ]
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5'
    }

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className={cn('animate-spin', iconSizes[size])}>
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="32"
                strokeDashoffset="32"
                className="animate-pulse-slow"
              />
            </svg>
          </div>
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className={iconSizes[size]}>{icon}</span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className={iconSizes[size]}>{icon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
