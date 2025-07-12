'use client'

import { useSession } from 'next-auth/react'
import TimezoneSettings from '@/components/settings/TimezoneSettings'
import DeleteAccountSection from '@/components/settings/DeleteAccountSection'

export default function SettingsPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen bg-warm-gray dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">请登录后查看此页面</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-gray dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">设置</h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理您的个人偏好和应用设置
          </p>
        </div>

        {/* 时区设置 */}
        <TimezoneSettings />

        {/* 账户信息 */}
        <div className="bg-warm-gray dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            账户信息
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                邮箱
              </label>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {session.user?.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                用户名
              </label>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {session.user?.name || '未设置'}
              </div>
            </div>
          </div>
        </div>

        {/* 账号注销 */}
        <DeleteAccountSection userEmail={session.user?.email || ''} />
      </div>
    </div>
  )
}
