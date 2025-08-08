'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

interface DiaryCardProps {
  diary: Diary
  onEdit: () => void
  onDelete: () => void
  formatRelativeTime: (dateStr: string) => string
  formatDateTime: (dateStr: string) => string
  getTagDisplay: (value: string, type: 'mood' | 'weather' | 'tag') => { text: string, icon?: string }
}

export default function DiaryCard({
  diary,
  onEdit,
  onDelete,
  formatRelativeTime,
  formatDateTime,
  getTagDisplay
}: DiaryCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group bg-warm-gray dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover-lift transition-all-smooth animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 
            className="text-lg font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => router.push(`/diary/${diary.id}`)}
          >
            {diary.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span title={formatDateTime(diary.createdAt)}>
              {formatRelativeTime(diary.createdAt)}
            </span>
            {diary.weather && diary.weather.length > 0 && (
              <span className="flex items-center gap-1">
                {diary.weather.map(w => {
                  const weather = getTagDisplay(w, 'weather')
                  return (
                    <span key={w} className="flex items-center gap-1">
                      {weather.icon} {weather.text}
                    </span>
                  )
                })}
              </span>
            )}
            {diary.mood && diary.mood.length > 0 && (
              <span className="flex items-center gap-1">
                {diary.mood.map(m => {
                  const mood = getTagDisplay(m, 'mood')
                  return (
                    <span key={m} className="flex items-center gap-1">
                      {mood.icon} {mood.text}
                    </span>
                  )
                })}
              </span>
            )}
          </div>
        </div>
        <div className={`flex space-x-2 transition-all-smooth ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
          <button
            onClick={onEdit}
            className="group relative px-3 py-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all-smooth"
          >
            <span className="text-sm font-medium">编辑</span>
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-10 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              编辑日记
            </span>
          </button>
          <button
            onClick={onDelete}
            className="group relative px-3 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all-smooth"
          >
            <span className="text-sm font-medium">删除</span>
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-10 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              删除日记
            </span>
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 whitespace-pre-wrap">
        {diary.content}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {diary.tags.map((tag, index) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:shadow-sm transition-all-smooth animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            约 {diary.content.length} 字
          </span>
        </div>
      </div>
    </div>
  )
} 