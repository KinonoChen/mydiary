'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Loading, { Skeleton, CardSkeleton } from '@/components/ui/Loading'
import { Avatar } from '@/components/ui/OptimizedImage'

export default function UXShowcasePage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('components')

  const handleLoadingDemo = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
  }

  return (
    <div className="min-h-screen py-8 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-slide-in-up">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎨 UX 优化展示
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            MyDiary 用户体验优化成果展示 - 精致设计 · 流畅交互 · 优雅动画
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
            {[
              { id: 'components', label: '🧩 组件展示', icon: '🧩' },
              { id: 'animations', label: '🎬 动画效果', icon: '🎬' },
              { id: 'interactions', label: '🎯 交互体验', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all-smooth ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'components' && (
            <div className="space-y-8">
              {/* Button Showcase */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover-lift">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">按钮组件</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">变体展示</h4>
                    <div className="space-y-3">
                      <Button variant="primary">主要按钮</Button>
                      <Button variant="secondary">次要按钮</Button>
                      <Button variant="outline">边框按钮</Button>
                      <Button variant="ghost">幽灵按钮</Button>
                      <Button variant="danger">危险按钮</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">尺寸展示</h4>
                    <div className="space-y-3">
                      <Button size="sm">小按钮</Button>
                      <Button size="md">中按钮</Button>
                      <Button size="lg">大按钮</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">状态展示</h4>
                    <div className="space-y-3">
                      <Button loading>加载中</Button>
                      <Button disabled>禁用状态</Button>
                      <Button 
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                      >
                        带图标
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading Showcase */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover-lift">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">加载组件</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">加载指示器</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Loading variant="spinner" size="sm" />
                        <span className="text-sm">小型旋转器</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Loading variant="dots" size="md" />
                        <span className="text-sm">点状加载</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Loading variant="pulse" size="lg" />
                        <span className="text-sm">脉冲效果</span>
                      </div>
                    </div>
                    
                    <Button onClick={handleLoadingDemo} disabled={loading}>
                      {loading ? '演示中...' : '演示全屏加载'}
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">骨架屏</h4>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10" variant="circular" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar Showcase */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover-lift">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">头像组件</h3>
                <div className="flex items-center gap-6">
                  <Avatar alt="小头像" size="sm" />
                  <Avatar alt="中头像" size="md" />
                  <Avatar alt="大头像" size="lg" />
                  <Avatar alt="超大头像" size="xl" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'animations' && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">动画效果展示</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: '淡入效果', class: 'animate-fade-in', delay: '0s' },
                    { title: '上滑进入', class: 'animate-slide-in-up', delay: '0.1s' },
                    { title: '下滑进入', class: 'animate-slide-in-down', delay: '0.2s' },
                    { title: '缩放进入', class: 'animate-scale-in', delay: '0.3s' },
                    { title: '悬停上浮', class: 'hover-lift', delay: '0.4s' },
                    { title: '脉冲效果', class: 'animate-pulse-slow', delay: '0.5s' }
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 ${item.class}`}
                      style={{ animationDelay: item.delay }}
                    >
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">{item.title}</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        CSS 类: {item.class}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">交互体验展示</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">悬停效果</h4>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all-smooth cursor-pointer">
                        悬停我试试
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">焦点效果</h4>
                      <input
                        type="text"
                        placeholder="点击输入框"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus-ring bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <Loading fullScreen text="正在演示全屏加载效果..." size="lg" />
        )}
      </div>
    </div>
  )
}
