'use client'

import { useState } from 'react'

interface TimelineNavigationProps {
  availableMonths: string[] // 格式: ["2025-06", "2025-05", ...]
  currentMonth?: string
  onMonthSelect: (month: string) => void
  onSearch: (query: string) => void
  searchQuery: string
  totalCount: number
}

export default function TimelineNavigation({
  availableMonths,
  currentMonth,
  onMonthSelect,
  onSearch,
  searchQuery,
  totalCount
}: TimelineNavigationProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // 格式化月份显示
  const formatMonthDisplay = (month: string) => {
    const [year, monthNum] = month.split('-')
    return `${year}年${parseInt(monthNum)}月`
  }

  // 获取年份列表
  const getAvailableYears = () => {
    const years = [...new Set(availableMonths.map(month => month.split('-')[0]))]
    return years.sort((a, b) => b.localeCompare(a))
  }

  // 根据年份获取月份
  const getMonthsByYear = (year: string) => {
    return availableMonths
      .filter(month => month.startsWith(year))
      .sort((a, b) => b.localeCompare(a))
  }

  const years = getAvailableYears()

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* 左侧：标题和统计 */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              时间主线
            </h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              共 {totalCount} 篇日记
            </span>
          </div>

          {/* 右侧：搜索和导航 */}
          <div className="flex items-center space-x-3">
            {/* 搜索框 */}
            <div className="relative">
              <button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {isSearchExpanded && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                  <input
                    type="text"
                    placeholder="搜索日记标题或内容..."
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* 月份快速跳转 */}
            <div className="relative">
              <select
                value={currentMonth || ''}
                onChange={(e) => e.target.value && onMonthSelect(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">跳转到月份</option>
                {years.map(year => (
                  <optgroup key={year} label={`${year}年`}>
                    {getMonthsByYear(year).map(month => (
                      <option key={month} value={month}>
                        {formatMonthDisplay(month)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 搜索结果提示 */}
        {searchQuery && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            搜索 "{searchQuery}" 的结果
          </div>
        )}
      </div>
    </div>
  )
}
