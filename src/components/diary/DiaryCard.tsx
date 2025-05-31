'use client'

import { useRouter } from 'next/navigation'

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
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
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="group relative px-2 py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            <span>编辑</span>
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              编辑这篇日记
            </span>
          </button>
          <button
            onClick={onDelete}
            className="group relative px-2 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
          >
            <span>删除</span>
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              删除这篇日记
            </span>
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 whitespace-pre-wrap">
        {diary.content}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {diary.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          约 {diary.content.length} 字
        </span>
      </div>
    </div>
  )
} 