'use client'

import { useState, useEffect } from 'react'
import {
  COMMON_TIMEZONES,
  getCurrentTimezone,
  saveUserTimezone,
  getAutoDetectTimezone,
  setAutoDetectTimezone,
  getBrowserTimezone,
  getTimezoneDisplayName
} from '@/lib/timezone-client'

export default function TimezoneSettings() {
  const [currentTimezone, setCurrentTimezone] = useState('')
  const [autoDetect, setAutoDetect] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初始化设置
    const initSettings = () => {
      const timezone = getCurrentTimezone()
      const autoDetectSetting = getAutoDetectTimezone()
      
      setCurrentTimezone(timezone)
      setAutoDetect(autoDetectSetting)
      setIsLoading(false)
    }

    initSettings()
  }, [])

  const handleTimezoneChange = (timezone: string) => {
    setCurrentTimezone(timezone)
    saveUserTimezone(timezone)
    
    // 如果选择了手动时区，关闭自动检测
    if (autoDetect) {
      setAutoDetect(false)
      setAutoDetectTimezone(false)
    }
  }

  const handleAutoDetectChange = (enabled: boolean) => {
    setAutoDetect(enabled)
    setAutoDetectTimezone(enabled)
    
    if (enabled) {
      // 如果启用自动检测，使用浏览器时区
      const browserTimezone = getBrowserTimezone()
      setCurrentTimezone(browserTimezone)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          时区设置
        </h3>
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        时区设置
      </h3>
      
      <div className="space-y-4">
        {/* 自动检测选项 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="auto-detect"
            checked={autoDetect}
            onChange={(e) => handleAutoDetectChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="auto-detect" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            自动检测时区
          </label>
        </div>

        {/* 当前时区显示 */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="text-sm text-gray-600 dark:text-gray-400">当前时区：</div>
          <div className="font-medium text-gray-900 dark:text-white">
            {getTimezoneDisplayName(currentTimezone)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            当前时间: {new Date().toLocaleString('zh-CN', { 
              timeZone: currentTimezone,
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>

        {/* 手动选择时区 */}
        {!autoDetect && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择时区
            </label>
            <select
              value={currentTimezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 说明文字 */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {autoDetect ? (
            <>
              系统将自动使用您浏览器的时区设置。所有时间显示都会根据您的本地时区进行调整。
            </>
          ) : (
            <>
              您已选择手动设置时区。所有时间显示都会根据所选时区进行调整。
            </>
          )}
        </div>
      </div>
    </div>
  )
}
