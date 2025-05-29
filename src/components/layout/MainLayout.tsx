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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          <div className="hidden lg:block">
            <Header />
          </div>

          {/* Page content */}
          <main className="flex-1 px-4 py-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                © 2024 MyDiary. 用心记录生活的每一天。
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile menu button - floating */}
      <button
        type="button"
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="text-xl">☰</span>
      </button>
    </div>
  )
} 