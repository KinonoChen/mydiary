'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  
  // 检查是否为认证页面
  const isAuthPage = pathname?.startsWith('/auth/')

  // 如果是认证页面，返回简单布局
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all-smooth">
      {/* Header */}
      <div className="lg:hidden">
        <Header />
      </div>

      <div className="flex h-screen lg:h-auto">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
          {/* Desktop Header */}
          <div className="hidden lg:block animate-slide-in-down">
            <Header />
          </div>

          {/* Page content */}
          <main className="flex-1 px-4 py-6 lg:px-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  © 2024 MyDiary. 用心记录生活的每一天。
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    用心制作
                  </span>
                  <span>•</span>
                  <span>安全私密</span>
                  <span>•</span>
                  <span>持续改进</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile menu button - floating */}
      <button
        type="button"
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all-smooth hover-lift animate-scale-in"
        onClick={() => setSidebarOpen(true)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  )
} 