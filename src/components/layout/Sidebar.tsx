'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const navigation = [
  { name: '仪表板', href: '/dashboard', icon: '📊' },
  { name: '所有日记', href: '/diary', icon: '📖' },
  { name: '时间主线', href: '/timeline', icon: '📅' },
  { name: '写日记', href: '/diary/new', icon: '✍️' },
  { name: '搜索', href: '/search', icon: '🔍' },
  { name: '标签', href: '/tags', icon: '🏷️' },
  { name: '设置', href: '/settings', icon: '⚙️' },
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
        fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out z-30
        lg:translate-x-0 lg:static lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📔</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                MyDiary
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  onClick={() => onClose()}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          {session?.user && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name ?? 'User avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session.user.name || '用户'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 