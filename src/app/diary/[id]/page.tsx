'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { formatDateTime, formatFullDateTime } from '@/lib/utils'

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
  mood?: string[]
  weather?: string[]
  createdAt: string
  updatedAt: string
}

export default function DiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [diary, setDiary] = useState<Diary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()
  
  // 用户标签
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
        
        // 获取心情和天气标签
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

  // 获取标签显示
  const getTagDisplay = (value: string, type: 'mood' | 'weather'): { text: string, icon: string } => {
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
    } else {
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
    }
  }

  useEffect(() => {
    if (session) {
      fetchDiary()
    }
  }, [session, resolvedParams.id])

  const fetchDiary = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/diaries/${resolvedParams.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('日记不存在')
        }
        throw new Error('获取日记失败')
      }

      const data = await response.json()
      setDiary(data)
    } catch (err) {
      console.error('Error fetching diary:', err)
      setError(err instanceof Error ? err.message : '获取日记失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/diary/edit/${resolvedParams.id}`)
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇日记吗？删除后无法恢复。')) {
      return
    }

    try {
      const response = await fetch(`/api/diaries/${resolvedParams.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      alert('日记已删除')
      router.push('/diary')
    } catch (err) {
      console.error('Error deleting diary:', err)
      alert('删除失败，请重试')
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  if (error || !diary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg text-red-600 dark:text-red-400 mb-4">
          {error || '日记不存在'}
        </div>
        <button
          onClick={() => router.push('/diary')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          返回日记列表
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-0 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span className="mr-2">←</span>
          返回
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            删除
          </button>
        </div>
      </div>

      {/* 日记内容 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {diary.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {formatDateTime(diary.createdAt)}
            </span>
            
            {diary.weather && diary.weather.length > 0 && (
              <span className="flex items-center gap-1" title={diary.weather.map(w => getTagDisplay(w, 'weather').text).join(', ')}>
                {diary.weather.map(w => {
                  const weather = getTagDisplay(w, 'weather');
                  return (
                    <span key={w} className="flex items-center gap-1 mr-2">
                      {weather.icon}
                      {weather.text}
                    </span>
                  );
                })}
              </span>
            )}
            
            {diary.mood && diary.mood.length > 0 && (
              <span className="flex items-center gap-1" title={diary.mood.map(m => getTagDisplay(m, 'mood').text).join(', ')}>
                {diary.mood.map(m => {
                  const mood = getTagDisplay(m, 'mood');
                  return (
                    <span key={m} className="flex items-center gap-1 mr-2">
                      {mood.icon}
                      {mood.text}
                    </span>
                  );
                })}
              </span>
            )}
            
            <span className="text-gray-500 dark:text-gray-400">
              约 {diary.content.length} 字
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap text-gray-900 dark:text-white leading-relaxed">
              {diary.content}
            </div>
          </div>
        </div>

        {diary.tags.length > 0 && (
          <div className="p-6 pt-0">
            <div className="flex flex-wrap gap-2">
              {diary.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {diary.updatedAt !== diary.createdAt && (
          <div className="px-6 pb-6">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              最后编辑于 {formatFullDateTime(diary.updatedAt)}
            </div>
          </div>
        )}
      </div>

      {/* 导航按钮 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => router.push('/diary')}
          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          所有日记
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          返回首页
        </button>
      </div>
    </div>
  )
} 
