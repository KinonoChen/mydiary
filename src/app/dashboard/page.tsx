'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface DiaryStats {
  total: number
  streak: number
  totalWords: number
  currentMonthWords: number
  currentMonthCount: number
  mood: Array<{ mood: string; count: number }>
  weather: Array<{ weather: string; count: number }>
  monthly: Array<{ month: string; count: number }>
  tags: Array<{ tag: string; count: number }>
  averagePerMonth: number
}

interface Diary {
  id: string
  title: string
  content: string
  tags: string[]
  mood?: string
  weather?: string
  createdAt: string
  updatedAt: string
}

interface DiariesResponse {
  data: Diary[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [stats, setStats] = useState<DiaryStats | null>(null)
  const [recentDiaries, setRecentDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/diaries/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('获取统计数据失败')
    }
  }

  // 获取最近的日记
  const fetchRecentDiaries = async () => {
    try {
      const response = await fetch('/api/diaries?limit=3&page=1')
      if (!response.ok) {
        throw new Error('Failed to fetch recent diaries')
      }
      const data: DiariesResponse = await response.json()
      setRecentDiaries(data.data)
    } catch (err) {
      console.error('Error fetching recent diaries:', err)
      setError('获取最近日记失败')
    }
  }

  useEffect(() => {
    if (session) {
      Promise.all([fetchStats(), fetchRecentDiaries()])
        .finally(() => setLoading(false))
    }
  }, [session])

  // 计算总字数
  const getTotalWords = () => {
    return stats?.totalWords || 0
  }

  // 格式化字数显示
  const formatWords = (words: number) => {
    if (words >= 10000) {
      return `${(words / 10000).toFixed(1)}万`
    } else if (words >= 1000) {
      return `${(words / 1000).toFixed(1)}k`
    }
    return words.toString()
  }

  // 获取本月统计
  const getCurrentMonthStats = () => {
    // 直接使用API提供的准确本月数据
    const monthCount = stats?.currentMonthCount || 0
    const monthWords = stats?.currentMonthWords || 0
    
    return {
      count: monthCount,
      words: monthWords
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
      </div>
    )
  }

  const monthStats = getCurrentMonthStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            仪表板
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            欢迎回来！这里是你的日记概览
          </p>
        </div>
        <button 
          onClick={() => router.push('/diary/new')} 
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer">
          写新日记
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">总日记数</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.streak || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">连续天数</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <span className="text-2xl">🏷️</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.tags?.length || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">使用标签</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatWords(getTotalWords())}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">总字数</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Diaries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            最近的日记
          </h2>
        </div>
        <div className="p-6">
          {recentDiaries.length > 0 ? (
            <div className="space-y-4">
              {recentDiaries.map((diary) => (
                <div 
                  key={diary.id} 
                  onClick={() => router.push(`/diary/${diary.id}`)}
                  className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📖</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {diary.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 whitespace-pre-wrap">
                      {diary.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(diary.createdAt)}
                      </span>
                      {diary.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {diary.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              {tag}
                            </span>
                          ))}
                          {diary.tags.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{diary.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500">
                    →
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
          
          {recentDiaries.length > 0 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => router.push('/diary')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
              >
                查看所有日记
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            快速操作
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/diary/new')}
              className="w-full flex items-center justify-start px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
            >
              <span className="mr-3 text-xl">✍️</span>
              <span className="text-blue-700 dark:text-blue-300 font-medium">写新日记</span>
            </button>
            <button 
              onClick={() => router.push('/search')}
              className="w-full flex items-center justify-start px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
            >
              <span className="mr-3 text-xl">🔍</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">搜索日记</span>
            </button>
            <button 
              onClick={() => router.push('/tags')}
              className="w-full flex items-center justify-start px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
            >
              <span className="mr-3 text-xl">🏷️</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">管理标签</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            本月统计
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">本月日记</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{monthStats.count}篇</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">本月字数</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{formatWords(monthStats.words)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">最长连续</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats?.streak || 0}天</span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">本月进度</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{width: `${Math.min((monthStats.count / 10) * 100, 100)}%`}}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">目标：每月10篇</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 