'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const navigation = [
  {
    name: '仪表板',
    href: '/dashboard',
    icon: '📊',
    description: '查看数据概览'
  },
  {
    name: '所有日记',
    href: '/diary',
    icon: '📖',
    description: '浏览所有日记'
  },
  {
    name: '时间主线',
    href: '/timeline',
    icon: '📅',
    description: '时间轴视图'
  },
  {
    name: '写日记',
    href: '/diary/new',
    icon: '✍️',
    description: '记录新的想法',
    highlight: true
  },
  {
    name: '搜索',
    href: '/search',
    icon: '🔍',
    description: '查找日记内容'
  },
  {
    name: '标签',
    href: '/tags',
    icon: '🏷️',
    description: '管理标签系统'
  },
  {
    name: '设置',
    href: '/settings',
    icon: '⚙️',
    description: '个人偏好设置'
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out z-30 shadow-xl
        lg:translate-x-0 lg:static lg:z-0 lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all-smooth group-hover:scale-105">
                <span className="text-white font-bold text-xl">📔</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  MyDiary
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  记录美好时光
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 custom-scrollbar overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all-smooth cursor-pointer relative overflow-hidden animate-slide-in-up
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800'
                      : item.highlight
                        ? 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-700 dark:hover:text-blue-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-800'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => onClose()}
                >
                  <span className={`mr-3 text-lg transition-transform-smooth ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {item.icon}
                  </span>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs opacity-70 mt-0.5">{item.description}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow"></div>
                  )}
                  {isActive && (
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          {session?.user && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
              <div className="flex items-center space-x-3 group cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl p-3 transition-all-smooth">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-all-smooth">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name ?? 'User avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-lg">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {session.user.name || '用户'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 dark:text-green-400">在线</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 