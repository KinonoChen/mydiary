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

export default function EditDiaryPage({ params }: { params: { id: string } }) {
  const [diary, setDiary] = useState<Diary | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [mood, setMood] = useState('')
  const [weather, setWeather] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/diaries/${params.id}`)
        
        if (!response.ok) {
          throw new Error('获取日记失败')
        }

        const data = await response.json()
        setDiary(data)
        setTitle(data.title)
        setContent(data.content)
        setTags(data.tags)
        setMood(data.mood || '')
        setWeather(data.weather || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取日记失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiary()
  }, [params.id])

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/diaries/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags,
          mood,
          weather,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '保存失败')
      }

      // 保存成功，返回日记列表页
      router.push('/diary')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!diary && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            找不到日记
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            这篇日记可能已经被删除了
          </p>
          <button
            onClick={() => router.push('/diary')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            返回日记列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            编辑日记
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            修改你的日记内容
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div className="text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="今天发生了什么特别的事情？"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mood" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                心情
              </label>
              <select
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">选择心情</option>
                <option value="happy">😊 开心</option>
                <option value="excited">🤩 兴奋</option>
                <option value="calm">😌 平静</option>
                <option value="thoughtful">🤔 沉思</option>
                <option value="sad">😢 难过</option>
                <option value="angry">😠 愤怒</option>
              </select>
            </div>
            <div>
              <label htmlFor="weather" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                天气
              </label>
              <select
                id="weather"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">选择天气</option>
                <option value="sunny">☀️ 晴天</option>
                <option value="cloudy">☁️ 多云</option>
                <option value="rainy">🌧️ 雨天</option>
                <option value="snowy">❄️ 雪天</option>
                <option value="windy">💨 大风</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="今天你想记录什么？可以是发生的事情、内心的感受、学到的东西..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
              {content.length} 字
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {['生活', '工作', '学习', '旅行', '美食', '运动', '读书', '电影'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  disabled={tags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        💾 自动保存已开启，你的内容不会丢失
      </div>
    </div>
  )
} 