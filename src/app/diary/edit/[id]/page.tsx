'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// 标签类型
interface Tag {
  id: string
  type: 'tag' | 'mood' | 'weather'
  value: string
  label: string | null
  icon: string | null
}

// 标签分类
interface TagsData {
  tags: Tag[]
  moods: Tag[]
  weathers: Tag[]
}

interface Diary {
  id: string
  title: string
  content: string
  tags: string[]
  mood: string | string[] | null // 支持旧的单个字符串mood和新的字符串数组mood
  weather: string | string[] | null // 支持旧的单个字符串weather和新的字符串数组weather
  createdAt: string
  updatedAt: string
}

export default function EditDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const [diary, setDiary] = useState<Diary | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [mood, setMood] = useState<string[]>([]) // 改为 string[]
  const [weather, setWeather] = useState<string[]>([]) // 改为 string[]
  const [selectedDate, setSelectedDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  // 用于存储从数据库加载的标签数据
  const [tagsData, setTagsData] = useState<TagsData>({
    tags: [],
    moods: [],
    weathers: []
  })
  const [isLoadingTags, setIsLoadingTags] = useState(true)

  // 加载标签数据
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
        
        // 处理标签数据，将默认标签和自定义标签合并
        setTagsData({
          tags: [...data.tags.custom],
          moods: [...data.moods.custom],
          weathers: [...data.weathers.custom]
        })
      } catch (error) {
        console.error('获取标签数据失败:', error)
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchTags()
  }, [session])

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/diaries/${resolvedParams.id}`)
        
        if (!response.ok) {
          throw new Error('获取日记失败')
        }

        const data = await response.json()
        setDiary(data)
        setTitle(data.title)
        setContent(data.content)
        setTags(data.tags)
        // 初始化 mood，兼容旧数据（字符串）和新数据（数组）
        if (Array.isArray(data.mood)) {
          setMood(data.mood)
        } else if (data.mood) {
          setMood([data.mood])
        } else {
          setMood([])
        }
        // 初始化 weather，兼容旧数据（字符串）和新数据（数组）
        if (Array.isArray(data.weather)) {
          setWeather(data.weather)
        } else if (data.weather) {
          setWeather([data.weather])
        } else {
          setWeather([])
        }
        // 设置日期，从createdAt中提取日期部分
        const createdDate = new Date(data.createdAt)
        setSelectedDate(createdDate.toISOString().split('T')[0])
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取日记失败')
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchDiary()
    }
  }, [resolvedParams.id, session])

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleToggleSelection = (
    item: Tag,
    currentSelection: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    // 确保使用label，如果为空则使用value
    const tagLabel = item.label || item.value;
    if (currentSelection.includes(tagLabel)) {
      setter(currentSelection.filter((i) => i !== tagLabel));
    } else {
      setter([...currentSelection, tagLabel]);
    }
  };

  const handleSubmit = async () => {
    // 验证逻辑与后端保持一致
    if (!title.trim() || !content.replace(/\s+$/, '').trim()) {
      setError('标题和内容不能为空')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      // 构建完整的日期时间
      let selectedDateTime
      const today = new Date().toISOString().split('T')[0]
      
      if (selectedDate === today) {
        // 如果选择的是今天，使用当前时间
        selectedDateTime = new Date()
      } else {
        // 如果选择的是其他日期，使用22:00:00
        selectedDateTime = new Date(`${selectedDate}T22:00:00`)
      }
      
      // 只去除末尾的空白字符，保留开头的缩进
      const trimmedContent = content.replace(/\s+$/, '')
      
      const response = await fetch(`/api/diaries/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: trimmedContent,
          tags,
          mood,
          weather,
          createdAt: selectedDateTime.toISOString(), // 自定义创建时间
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '更新失败')
      }

      // 更新成功，跳转到日记详情页
      router.push(`/diary/${resolvedParams.id}`)
      router.refresh() // 刷新页面数据
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  // 格式化日期显示
  const formatDateDisplay = (dateString: string) => {
    try {
      if (!dateString) return '无日期';
      
      const date = new Date(dateString);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '无效日期';
      }
      
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      };
      return new Intl.DateTimeFormat('zh-CN', options).format(date);
    } catch (error) {
      console.error('日期格式化错误:', error);
      return '日期错误';
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center min-h-[300px]">
            <p className="text-gray-500 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !diary) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">编辑日记</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          {/* Date Picker */}
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              日期
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              
              {/* 时间显示 */}
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <span className="font-medium">{formatDateDisplay(selectedDate)}</span>
                <span className="ml-2 flex items-center">
                  🕘 {(() => {
                    const today = new Date().toISOString().split('T')[0]
                    if (selectedDate === today) {
                      return '当前时间'
                    } else {
                      return '22:00'
                    }
                  })()}
                </span>
              </span>
            </div>
          </div>

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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                心情
              </label>
              <div className="flex flex-wrap gap-2">
                {isLoadingTags ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400">加载中...</span>
                ) : (
                  tagsData.moods.map((moodOption) => (
                    <button
                      key={moodOption.id}
                      onClick={() => handleToggleSelection(moodOption, mood, setMood)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        mood.includes(moodOption.label || moodOption.value)
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {moodOption.icon} {moodOption.label || moodOption.value}
                    </button>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                天气
              </label>
              <div className="flex flex-wrap gap-2">
                {isLoadingTags ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400">加载中...</span>
                ) : (
                  tagsData.weathers.map((weatherOption) => (
                    <button
                      key={weatherOption.id}
                      onClick={() => handleToggleSelection(weatherOption, weather, setWeather)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        weather.includes(weatherOption.label || weatherOption.value)
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {weatherOption.icon} {weatherOption.label || weatherOption.value}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="记录你的想法、心情和一天的经历..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? '保存中...' : '保存修改'}
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-6">
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
              {isLoadingTags ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">加载中...</span>
              ) : (
                tagsData.tags.map((tagOption) => (
                  <button
                    key={tagOption.id}
                    onClick={() => handleAddTag(tagOption.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      tags.includes(tagOption.value)
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    disabled={tags.includes(tagOption.value)}
                  >
                    {tagOption.value}
                  </button>
                ))
              )}
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