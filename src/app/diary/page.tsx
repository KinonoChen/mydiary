'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import DiaryCard from '@/components/diary/DiaryCard'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'

// 标签类型
interface Tag {
  id: string
  type: 'tag' | 'mood' | 'weather'
  value: string
  label: string | null
  icon: string | null
}

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

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function DiaryPage() {
  const { data: session } = useSession()
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
  
  // 用户标签
  const [userTags, setUserTags] = useState<Tag[]>([])
  const [userMoods, setUserMoods] = useState<Tag[]>([])
  const [userWeathers, setUserWeathers] = useState<Tag[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(true)

  // 加载用户标签
  useEffect(() => {
    const fetchTags = async () => {
      if (!session) return
      
      try {
        setIsLoadingTags(true)
        const response = await fetch('/api/tags')
        
        if (!response.ok) {
          throw new Error('获取标签失败')
        }

        const data = await response.json()
        
        // 获取所有类型的标签数据
        setUserTags(data.tags.custom)
        setUserMoods(data.moods.custom)
        setUserWeathers(data.weathers.custom)
      } catch (error) {
        console.error('获取标签数据失败:', error)
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchTags()
  }, [session])

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
    if (session) {
      fetchDiaries(pagination.page)
    }
  }, [pagination.page, sortBy, selectedTag, session])

  const handleEdit = (id: string) => {
    router.push(`/diary/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这篇日记吗？此操作不可恢复。')) return

    try {
      const response = await fetch(`/api/diaries/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '删除失败')
      }

      // 删除成功，刷新列表
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
  // 格式化日期显示
  // const formatRelativeTime = (dateStr: string) => {
  //   const date = new Date(dateStr)
  //   const now = new Date()
  //   const diffMs = now.getTime() - date.getTime()
  //   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
  //   if (diffDays === 0) {
  //     return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  //   } else if (diffDays === 1) {
  //     return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  //   } else if (diffDays < 7) {
  //     return `${diffDays}天前`
  //   } else {
  //     return date.toLocaleDateString('zh-CN', { 
  //       year: 'numeric', 
  //       month: 'long', 
  //       day: 'numeric' 
  //     })
  //   }
  // }
  
  // // 新增：格式化完整日期时间
  // const formatDateTime = (dateStr: string) => {
  //   const date = new Date(dateStr)
  //   return date.toLocaleString('zh-CN', { 
  //     year: 'numeric', 
  //     month: 'long', 
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit' 
  //   })
  // }

  // 获取标签、心情和天气的显示文本
  const getTagDisplay = (value: string, type: 'mood' | 'weather' | 'tag'): { text: string, icon?: string } => {
    if (type === 'mood') {
      // 查找自定义心情
      const customMood = userMoods.find(m => m.value === value || m.label === value)
      if (customMood) {
        return { 
          text: customMood.label || customMood.value,
          icon: customMood.icon || '😐' 
        }
      }
      // 未找到则直接返回值
      return { text: value, icon: '😐' }
    } else if (type === 'weather') {
      // 查找自定义天气
      const customWeather = userWeathers.find(w => w.value === value || w.label === value)
      if (customWeather) {
        return { 
          text: customWeather.label || customWeather.value,
          icon: customWeather.icon || '🌤️' 
        }
      }
      // 未找到则直接返回值
      return { text: value, icon: '🌤️' }
    } else {
      // 标签类型，直接返回值
      return { text: value }
    }
  }
  
  if (!session) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">请登录后查看此页面</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">我的日记</h1>
        
        {/* 操作栏 */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              共 {pagination.total} 篇日记
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link 
              href="/diary/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              写新日记
            </Link>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
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
                {isLoadingTags ? (
                  <option disabled>加载中...</option>
                ) : (
                  userTags.map((tag) => (
                    <option key={tag.id} value={tag.value}>
                      {tag.value}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* 日记列表 */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 dark:text-gray-400">加载中...</p>
          </div>
        ) : diaries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📝</span>
              <p className="text-gray-500 dark:text-gray-400 mb-4">还没有日记</p>
              <button 
                onClick={() => router.push('/diary/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                写第一篇日记
              </button>
            </div>
          //</div>
        ) : (
          <div className="space-y-6">
            {diaries.map((diary) => (
              <DiaryCard 
                key={diary.id}
                diary={diary}
                onEdit={() => handleEdit(diary.id)}
                onDelete={() => handleDelete(diary.id)}
                formatRelativeTime={formatRelativeTime}
                formatDateTime={formatDateTime}
                getTagDisplay={getTagDisplay}
              />
            ))}
            
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
        )}
      </div>
    </div>
  )
} 
