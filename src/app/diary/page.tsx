'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Diary {
  id: string
  title: string
  content: string
  tags: string[]
  mood: string | null
  weather: string | null
  createdAt: string
  updatedAt: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

// 天气图标映射
const weatherIcons: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  windy: '💨'
}

// 心情图标映射
const moodIcons: Record<string, string> = {
  happy: '😊',
  excited: '🤩',
  calm: '😌',
  thoughtful: '🤔',
  sad: '😢',
  angry: '😠'
}

// 天气文字映射
const weatherText: Record<string, string> = {
  sunny: '晴天',
  cloudy: '多云',
  rainy: '雨天',
  snowy: '雪天',
  windy: '大风'
}

// 心情文字映射
const moodText: Record<string, string> = {
  happy: '开心',
  excited: '兴奋',
  calm: '平静',
  thoughtful: '沉思',
  sad: '难过',
  angry: '愤怒'
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedTag, setSelectedTag] = useState('')
  const router = useRouter()

  const fetchDiaries = async (page: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/diaries?page=${page}&limit=10&sortBy=${sortBy}&tag=${selectedTag}`)
      
      if (!response.ok) {
        throw new Error('获取日记列表失败')
      }

      const data = await response.json()
      setDiaries(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取日记列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDiaries(pagination.page)
  }, [pagination.page, sortBy, selectedTag])

  const handleEdit = (id: string) => {
    router.push(`/diary/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这篇日记吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/diaries/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      // 重新获取日记列表
      fetchDiaries(pagination.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败，请重试')
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            所有日记
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            管理和浏览你的所有日记
          </p>
        </div>
        <button 
          onClick={() => router.push('/diary/new')}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
        >
          写新日记
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div className="text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              排序：
            </label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">最新创建</option>
              <option value="oldest">最早创建</option>
              <option value="updated">最近更新</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              标签：
            </label>
            <select 
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">全部标签</option>
              <option value="生活">生活</option>
              <option value="工作">工作</option>
              <option value="旅行">旅行</option>
              <option value="学习">学习</option>
              <option value="美食">美食</option>
              <option value="运动">运动</option>
              <option value="读书">读书</option>
              <option value="电影">电影</option>
            </select>
          </div>
        </div>
      </div>

      {/* Diary List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <p className="text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        ) : diaries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              还没有日记
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              点击"写新日记"开始记录你的第一篇日记吧
            </p>
          </div>
        ) : (
          diaries.map((diary) => (
            <div 
              key={diary.id} 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
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
                    <span>
                      {new Date(diary.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    {diary.weather && (
                      <span className="flex items-center gap-1" title={weatherText[diary.weather]}>
                        {weatherIcons[diary.weather]}
                        {weatherText[diary.weather]}
                      </span>
                    )}
                    {diary.mood && (
                      <span className="flex items-center gap-1" title={moodText[diary.mood]}>
                        {moodIcons[diary.mood]}
                        {moodText[diary.mood]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(diary.id)}
                    className="group relative px-2 py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <span>编辑</span>
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      编辑这篇日记
                    </span>
                  </button>
                  <button 
                    onClick={() => handleDelete(diary.id)}
                    className="group relative px-2 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <span>删除</span>
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      删除这篇日记
                    </span>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
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
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && diaries.length > 0 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm rounded-md ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 