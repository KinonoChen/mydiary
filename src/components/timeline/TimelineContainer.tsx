'use client'

import { useState, useEffect, useMemo } from 'react'
import TimelineMonth from './TimelineMonth'
import { getCurrentTimezone, formatTimezoneYearMonth } from '@/lib/timezone-client'

interface Diary {
  id: string
  title: string
  content: string
  tags: string[]
  mood: string[] | null
  weather: string[] | null
  createdAt: string
  updatedAt: string
}

interface TimelineContainerProps {
  diaries: Diary[]
  getTagDisplay: (value: string, type: 'mood' | 'weather' | 'tag') => { text: string, icon?: string }
  showPreview?: boolean
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function TimelineContainer({ 
  diaries, 
  getTagDisplay, 
  showPreview = false,
  isLoading = false,
  onLoadMore,
  hasMore = false
}: TimelineContainerProps) {
  
  // 按月分组数据（使用用户时区）
  const groupedDiaries = useMemo(() => {
    const groups: { [key: string]: Diary[] } = {}
    const userTimezone = getCurrentTimezone()

    diaries.forEach(diary => {
      const yearMonth = formatTimezoneYearMonth(new Date(diary.createdAt), userTimezone)

      if (!groups[yearMonth]) {
        groups[yearMonth] = []
      }
      groups[yearMonth].push(diary)
    })
    
    // 按日期排序每个月内的日记
    Object.keys(groups).forEach(month => {
      groups[month].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })
    
    // 按月份排序（最新的在前）
    const sortedMonths = Object.keys(groups).sort((a, b) => b.localeCompare(a))
    
    return sortedMonths.map(month => ({
      month,
      diaries: groups[month]
    }))
  }, [diaries])

  // 滚动到底部加载更多
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoading || !onLoadMore) return
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        onLoadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoading, onLoadMore])

  if (diaries.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          还没有日记
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          开始写第一篇日记，创建属于你的时间主线
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* 时间主线内容 */}
      <div className="space-y-8">
        {groupedDiaries.map(({ month, diaries: monthDiaries }, index) => (
          <TimelineMonth
            key={month}
            month={month}
            diaries={monthDiaries}
            getTagDisplay={getTagDisplay}
            showPreview={showPreview}
            defaultExpanded={index < 3} // 默认展开前3个月
          />
        ))}
      </div>

      {/* 加载更多指示器 */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>加载中...</span>
          </div>
        </div>
      )}

      {/* 没有更多数据提示 */}
      {!hasMore && diaries.length > 0 && !isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            已显示全部 {diaries.length} 篇日记
          </div>
        </div>
      )}

      {/* 时间主线结束标记 */}
      {diaries.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-sm">时间主线开始</span>
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  )
}
