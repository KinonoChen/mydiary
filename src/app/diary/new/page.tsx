'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { formatDate } from '@/lib/utils'
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

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取本地时区的日期字符串(YYYY-MM-DD)
function getLocalDateString(date: Date = new Date()): string {
  return formatDateToYYYYMMDD(date);
}

export default function NewDiaryPage() {
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [mood, setMood] = useState<string[]>([])
  const [weather, setWeather] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState(() => {
    // 默认为今天的日期，使用本地时区
    return getLocalDateString();
  })
  const [isLoading, setIsLoading] = useState(false)
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

    setIsLoading(true)
    setError('')

    try {
      // 构建完整的日期时间
      let selectedDateTime
      const today = getLocalDateString()
      
      if (selectedDate === today) {
        // 如果选择的是今天，使用当前时间
        selectedDateTime = new Date()
      } else {
        // 如果选择的是其他日期，使用22:00:00
        const [year, month, day] = selectedDate.split('-').map(Number)
        // 注意月份从0开始
        selectedDateTime = new Date(year, month - 1, day, 22, 0, 0)
      }
      
      // 只去除末尾的空白字符，保留开头的缩进
      const trimmedContent = content.replace(/\s+$/, '')
      
      const response = await fetch('/api/diaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: trimmedContent,
          tags,
          mood,
          weather,
          createdAt: selectedDateTime.toISOString(), // 添加自定义创建时间
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '发布失败')
      }

      // 发布成功，跳转到日记列表页
      router.push('/diary')
      router.refresh() // 刷新页面数据
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 格式化日期显示
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = getLocalDateString()
    
    // 计算昨天和明天的日期字符串，使用本地时区
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = getLocalDateString(yesterdayDate)
    
    const tomorrowDate = new Date()
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const tomorrow = getLocalDateString(tomorrowDate)

    if (dateStr === today) {
      return '今天'
    } else if (dateStr === yesterday) {
      return '昨天'
    } else if (dateStr === tomorrow) {
      return '明天'
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
      })
    }
  }

  // 处理Tab键缩进
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      
      // 插入Tab字符
      const newContent = content.substring(0, start) + '\t' + content.substring(end)
      setContent(newContent)
      
      // 恢复光标位置
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1
      }, 0)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            写新日记
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            记录今天的美好时光
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? '发布中...' : '发布日记'}
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
        {/* Date Picker */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📅 记录日期
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {/* 快捷日期选择按钮 */}
            {[
              { label: '今天', offset: 0, emoji: '📆' },
              { label: '昨天', offset: -1, emoji: '📋' },
              { label: '前天', offset: -2, emoji: '📄' }
            ].map(({ label, offset, emoji }) => {
              const date = new Date()
              date.setDate(date.getDate() + offset)
              const dateStr = getLocalDateString(date)
              const isSelected = selectedDate === dateStr
              
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1">{emoji}</span>
                  {label}
                </button>
              )
            })}
            
            {/* 自定义日期选择 */}
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
                  const today = getLocalDateString()
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="今天你想记录什么？可以是发生的事情、内心的感受、学到的东西..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            onKeyDown={handleKeyDown}
          />
          <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
              {content.length} 字
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 text-red-500 dark:text-red-400 text-sm">
            {error}
          </div>
        )}


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