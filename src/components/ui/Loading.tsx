'use client'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse'
  text?: string
  fullScreen?: boolean
}

export default function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  text,
  fullScreen = false 
}: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const SpinnerLoader = () => (
    <div className={`${sizes[size]} animate-spin`}>
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="32"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="24"
          className="opacity-75"
        />
      </svg>
    </div>
  )

  const DotsLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-current rounded-full animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )

  const PulseLoader = () => (
    <div className={`${sizes[size]} bg-current rounded-full animate-pulse-slow opacity-75`} />
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />
      case 'pulse':
        return <PulseLoader />
      default:
        return <SpinnerLoader />
    }
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="text-blue-600 dark:text-blue-400">
        {renderLoader()}
      </div>
      {text && (
        <p className={`${textSizes[size]} text-gray-600 dark:text-gray-400 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-warm-gray-80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        {content}
      </div>
    )
  }

  return content
}

// 骨架屏组件
export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  animation = true 
}: { 
  className?: string
  variant?: 'rectangular' | 'circular' | 'text'
  animation?: boolean
}) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  const animationClasses = animation ? 'animate-pulse' : ''
  
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4'
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses} ${className}`}
    />
  )
}

// 卡片骨架屏
export function CardSkeleton() {
  return (
    <div className="bg-warm-gray dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" variant="text" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" variant="text" />
            <Skeleton className="h-4 w-16" variant="text" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-5/6" variant="text" />
        <Skeleton className="h-4 w-4/6" variant="text" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
        <Skeleton className="h-4 w-16" variant="text" />
      </div>
    </div>
  )
}

// 列表骨架屏
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}
