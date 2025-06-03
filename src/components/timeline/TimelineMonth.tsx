'use client'

import { useState } from 'react'
import TimelineItem from './TimelineItem'

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

interface TimelineMonthProps {
  month: string
  diaries: Diary[]
  getTagDisplay: (value: string, type: 'mood' | 'weather' | 'tag') => { text: string, icon?: string }
  showPreview?: boolean
  defaultExpanded?: boolean
}

export default function TimelineMonth({ 
  month, 
  diaries, 
  getTagDisplay, 
  showPreview = false,
  defaultExpanded = true 
}: TimelineMonthProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // 格式化月份显示
  const formatMonth = (monthStr: string) => {
    // monthStr 格式: "2025-06"
    return monthStr
  }

  // 获取月份统计信息
  const getMonthStats = () => {
    const totalDiaries = diaries.length
    const totalWords = diaries.reduce((sum, diary) => sum + diary.content.length, 0)
    return { totalDiaries, totalWords }
  }

  const stats = getMonthStats()

  return (
    <div className="relative">
      {/* 月份标题 */}
      <div 
        className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-700 px-4 py-3 mb-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {formatMonth(month)}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{stats.totalDiaries} 篇</span>
              <span>{stats.totalWords.toLocaleString()} 字</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 展开/折叠图标 */}
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 时间轴连接线 - 月份标题下方 */}
      {isExpanded && diaries.length > 0 && (
        <div className="absolute left-16 top-16 bottom-0 w-0.5 bg-orange-400"></div>
      )}

      {/* 日记列表 */}
      {isExpanded && (
        <div className="space-y-0">
          {diaries.length > 0 ? (
            diaries.map((diary, index) => (
              <div key={diary.id} className="relative">
                <TimelineItem 
                  diary={diary}
                  getTagDisplay={getTagDisplay}
                  showPreview={showPreview}
                />
                
                {/* 最后一个项目的连接线结束 */}
                {index === diaries.length - 1 && (
                  <div className="absolute left-16 top-8 w-0.5 h-6 bg-orange-400"></div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              这个月还没有日记
            </div>
          )}
        </div>
      )}

      {/* 折叠状态下的简要信息 */}
      {!isExpanded && diaries.length > 0 && (
        <div className="ml-4 pb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {diaries.slice(0, 3).map(diary => diary.title).join('、')}
            {diaries.length > 3 && '...'}
          </div>
        </div>
      )}
    </div>
  )
}
