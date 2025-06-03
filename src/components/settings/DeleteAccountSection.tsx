'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface DeleteAccountSectionProps {
  userEmail: string
}

export default function DeleteAccountSection({ userEmail }: DeleteAccountSectionProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (confirmText !== '删除我的账号') {
      setError('请输入正确的确认文字')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '删除账号失败')
      }

      // 账号删除成功，退出登录并跳转到首页
      await signOut({ 
        redirect: false,
        callbackUrl: '/' 
      })
      
      // 显示成功消息并跳转
      alert('账号已成功注销，所有数据已清除')
      router.push('/')

    } catch (error: any) {
      setError(error.message || '删除账号失败，请重试')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
          危险区域
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-red-800 dark:text-red-200 mb-2">
              注销账号
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              注销账号将永久删除您的所有数据，包括：
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 mb-4 ml-4 list-disc">
              <li>所有日记内容</li>
              <li>个人标签和设置</li>
              <li>账号信息</li>
              <li>登录会话</li>
            </ul>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4 font-medium">
              ⚠️ 此操作不可撤销，请谨慎操作！
            </p>
          </div>
          
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            注销账号
          </button>
        </div>
      </div>

      {/* 确认对话框 */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              确认注销账号
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                您即将注销账号 <strong>{userEmail}</strong>
              </p>
              
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                此操作将永久删除您的所有数据，且无法恢复！
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  请输入 "删除我的账号" 来确认：
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="删除我的账号"
                />
              </div>
              
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmDialog(false)
                  setConfirmText('')
                  setError('')
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== '删除我的账号'}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors"
              >
                {isDeleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
