'use client'

import { useState, useEffect } from 'react'
import { getCurrentTimezone, getBrowserTimezone, COMMON_TIMEZONES } from '@/lib/timezone-client'

interface TimezoneTestResult {
  testTimezone: string
  currentTime: {
    utc: string
    timezone: string
    timezoneLocal: string
  }
  dateFormatting: {
    utcInput: string
    timezoneDate: string
    timezoneYearMonth: string
    explanation: string
  }
  monthRange: {
    input: string
    utcStart: string
    utcEnd: string
    explanation: string
  }
  browserTimezone: string
  examples: Record<string, string>
}

export default function TimezoneTestPage() {
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Shanghai')
  const [testResult, setTestResult] = useState<TimezoneTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 获取客户端时区信息
  const [clientInfo, setClientInfo] = useState({
    browserTimezone: '',
    currentTimezone: '',
    autoDetect: false
  })

  useEffect(() => {
    // 客户端时区检测
    setClientInfo({
      browserTimezone: getBrowserTimezone(),
      currentTimezone: getCurrentTimezone(),
      autoDetect: true
    })
  }, [])

  const testTimezone = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/test/timezone?timezone=${encodeURIComponent(selectedTimezone)}`)
      if (!response.ok) {
        throw new Error('测试失败')
      }
      const data = await response.json()
      setTestResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '测试失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          时区功能测试
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          测试新的时区处理功能，验证统计数据是否正确使用用户时区而不是固定的中国时区。
        </p>

        {/* 客户端时区信息 */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">客户端时区信息</h3>
          <div className="space-y-1 text-sm">
            <div><strong>浏览器时区:</strong> {clientInfo.browserTimezone}</div>
            <div><strong>当前使用时区:</strong> {clientInfo.currentTimezone}</div>
            <div><strong>自动检测:</strong> {clientInfo.autoDetect ? '是' : '否'}</div>
          </div>
        </div>

        {/* 时区选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择测试时区:
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {COMMON_TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
            <option value="UTC">UTC (协调世界时)</option>
          </select>
        </div>

        <button
          onClick={testTimezone}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          {loading ? '测试中...' : '开始测试'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* 测试结果 */}
      {testResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            测试结果 - {testResult.testTimezone}
          </h2>

          <div className="space-y-6">
            {/* 当前时间对比 */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">当前时间对比</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm space-y-1">
                <div><strong>UTC时间:</strong> {testResult.currentTime.utc}</div>
                <div><strong>时区时间:</strong> {testResult.currentTime.timezone}</div>
                <div><strong>本地显示:</strong> {testResult.currentTime.timezoneLocal}</div>
              </div>
            </div>

            {/* 日期格式化 */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">日期格式化测试</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm space-y-1">
                <div><strong>输入UTC时间:</strong> {testResult.dateFormatting.utcInput}</div>
                <div><strong>时区日期:</strong> {testResult.dateFormatting.timezoneDate}</div>
                <div><strong>时区年月:</strong> {testResult.dateFormatting.timezoneYearMonth}</div>
                <div className="text-blue-600 dark:text-blue-400">{testResult.dateFormatting.explanation}</div>
              </div>
            </div>

            {/* 月份范围计算 */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">月份范围计算</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm space-y-1">
                <div><strong>输入:</strong> {testResult.monthRange.input}</div>
                <div><strong>UTC开始:</strong> {testResult.monthRange.utcStart}</div>
                <div><strong>UTC结束:</strong> {testResult.monthRange.utcEnd}</div>
                <div className="text-blue-600 dark:text-blue-400">{testResult.monthRange.explanation}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 说明 */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">重要说明</h3>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• 统计API现在支持 <code>timezone</code> 参数，用于正确计算基于时区的数据</li>
          <li>• 连续天数、月度统计等功能现在使用用户实际时区而不是固定的中国时区</li>
          <li>• 时间主线页面也会根据用户时区正确分组显示日记</li>
          <li>• 这确保了全球用户都能获得准确的统计数据</li>
        </ul>
      </div>
    </div>
  )
}
