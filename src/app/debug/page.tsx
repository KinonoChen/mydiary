'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEnvVars = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/env-test')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : '未知错误' })
    }
    setLoading(false)
  }

  const testDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : '未知错误' })
    }
    setLoading(false)
  }

  const createTestUser = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/create-user', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : '未知错误' })
    }
    setLoading(false)
  }

  const testRegistration = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'debuguser',
          email: 'debug@example.com',
          password: 'password123'
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : '未知错误' })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        调试页面
      </h1>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={testEnvVars}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试环境变量'}
          </button>

          <button
            onClick={testDatabase}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试数据库连接'}
          </button>

          <button
            onClick={createTestUser}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建测试用户'}
          </button>

          <button
            onClick={testRegistration}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? '注册中...' : '测试用户注册'}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            测试结果:
          </h2>
          <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          💡 调试说明
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>测试环境变量</strong>: 检查 .env 文件是否正确加载</li>
          <li>• <strong>测试数据库连接</strong>: 验证 Prisma 数据库连接</li>
          <li>• <strong>创建测试用户</strong>: 直接测试用户创建功能</li>
          <li>• <strong>测试用户注册</strong>: 完整的注册流程测试</li>
        </ul>
      </div>
    </div>
  )
} 