'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'

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
  tags: {
    default: string[]
    custom: Tag[]
  }
  moods: {
    default: { value: string, label: string }[]
    custom: Tag[]
  }
  weathers: {
    default: { value: string, label: string }[]
    custom: Tag[]
  }
}

export default function TagsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [tagsData, setTagsData] = useState<TagsData | null>(null)
  
  const [newTag, setNewTag] = useState('')
  const [newMood, setNewMood] = useState({ label: '', icon: '' })
  const [newWeather, setNewWeather] = useState({ label: '', icon: '' })
  
  const [activeTab, setActiveTab] = useState<'tag' | 'mood' | 'weather'>('tag')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 获取所有标签数据
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/tags')
        
        if (!response.ok) {
          throw new Error('获取标签失败')
        }

        const data = await response.json()
        setTagsData(data)
      } catch (error) {
        console.error('获取标签数据失败:', error)
        toast.error('获取标签数据失败')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchTags()
    }
  }, [session])

  // 添加标签
  const handleAddTag = async () => {
    if (!newTag.trim()) {
      toast.error('标签不能为空')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'tag',
          value: newTag.trim()
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '添加标签失败')
      }

      const addedTag = await response.json()
      
      // 更新本地状态
      setTagsData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          tags: {
            ...prev.tags,
            custom: [addedTag, ...prev.tags.custom]
          }
        }
      })
      
      setNewTag('')
      toast.success('标签添加成功')
    } catch (error) {
      console.error('添加标签失败:', error)
      toast.error(error instanceof Error ? error.message : '添加标签失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 添加心情
  const handleAddMood = async () => {
    if (!newMood.label.trim()) {
      toast.error('心情名称不能为空')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'mood',
          value: newMood.label.trim(),
          label: newMood.label.trim(),
          icon: newMood.icon
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '添加心情失败')
      }

      const addedMood = await response.json()
      
      // 更新本地状态
      setTagsData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          moods: {
            ...prev.moods,
            custom: [addedMood, ...prev.moods.custom]
          }
        }
      })
      
      setNewMood({ label: '', icon: '' })
      toast.success('心情添加成功')
    } catch (error) {
      console.error('添加心情失败:', error)
      toast.error(error instanceof Error ? error.message : '添加心情失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 添加天气
  const handleAddWeather = async () => {
    if (!newWeather.label.trim()) {
      toast.error('天气名称不能为空')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'weather',
          value: newWeather.label.trim(),
          label: newWeather.label.trim(),
          icon: newWeather.icon
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '添加天气失败')
      }

      const addedWeather = await response.json()
      
      // 更新本地状态
      setTagsData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          weathers: {
            ...prev.weathers,
            custom: [addedWeather, ...prev.weathers.custom]
          }
        }
      })
      
      setNewWeather({ label: '', icon: '' })
      toast.success('天气添加成功')
    } catch (error) {
      console.error('添加天气失败:', error)
      toast.error(error instanceof Error ? error.message : '添加天气失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除标签
  const handleDeleteTag = async (id: string, type: 'tag' | 'mood' | 'weather') => {
    if (!confirm('确定要删除这个标签吗？')) return

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '删除标签失败')
      }

      // 更新本地状态
      setTagsData(prev => {
        if (!prev) return prev

        if (type === 'tag') {
          return {
            ...prev,
            tags: {
              ...prev.tags,
              custom: prev.tags.custom.filter(tag => tag.id !== id)
            }
          }
        } else if (type === 'mood') {
          return {
            ...prev,
            moods: {
              ...prev.moods,
              custom: prev.moods.custom.filter(mood => mood.id !== id)
            }
          }
        } else {
          return {
            ...prev,
            weathers: {
              ...prev.weathers,
              custom: prev.weathers.custom.filter(weather => weather.id !== id)
            }
          }
        }
      })
      
      toast.success('删除成功')
    } catch (error) {
      console.error('删除标签失败:', error)
      toast.error(error instanceof Error ? error.message : '删除标签失败')
    }
  }

  // 标签Tab
  const renderTagsTab = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">标签管理</h3>
      
      {/* 添加新标签 */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="输入新标签"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleAddTag}
            disabled={isSubmitting || !newTag.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 系统预设标签 */}
        {/* <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">系统预设标签</h4>
          <div className="flex flex-wrap gap-2">
            {tagsData?.tags.default.map((tag) => (
              <span 
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div> */}

        {/* 自定义标签 */}
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">自定义标签</h4>
          {tagsData?.tags.custom.length ? (
            <div className="flex flex-wrap gap-2">
              {tagsData.tags.custom.map((tag) => (
                <span 
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                >
                  {tag.value}
                  <button
                    onClick={() => handleDeleteTag(tag.id, 'tag')}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">暂无自定义标签</p>
          )}
        </div>
      </div>
    </div>
  )

  // 心情Tab
  const renderMoodTab = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">心情管理</h3>
      
      {/* 添加新心情 */}
      <div className="mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={newMood.label}
            onChange={(e) => setNewMood({...newMood, label: e.target.value})}
            placeholder="心情名称 (如: 兴奋)"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            value={newMood.icon}
            onChange={(e) => setNewMood({...newMood, icon: e.target.value})}
            placeholder="图标 (如: 🤩)"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <button
            onClick={handleAddMood}
            disabled={isSubmitting || !newMood.label.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加心情
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 系统预设心情 */}
        {/* <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">系统预设心情</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {tagsData?.moods.default.map((mood) => (
              <span 
                key={mood.value}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {mood.label}
              </span>
            ))}
          </div>
        </div> */}

        {/* 自定义心情 */}
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">自定义心情</h4>
          {tagsData?.moods.custom.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {tagsData.moods.custom.map((mood) => (
                <div 
                  key={mood.id}
                  className="inline-flex items-center justify-between px-3 py-2 rounded-md text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                >
                  <span>{mood.icon} {mood.label}</span>
                  <button
                    onClick={() => handleDeleteTag(mood.id, 'mood')}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">暂无自定义心情</p>
          )}
        </div>
      </div>
    </div>
  )

  // 天气Tab
  const renderWeatherTab = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">天气管理</h3>
      
      {/* 添加新天气 */}
      <div className="mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={newWeather.label}
            onChange={(e) => setNewWeather({...newWeather, label: e.target.value})}
            placeholder="天气名称 (如: 雾天)"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            value={newWeather.icon}
            onChange={(e) => setNewWeather({...newWeather, icon: e.target.value})}
            placeholder="图标 (如: 🌫️)"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <button
            onClick={handleAddWeather}
            disabled={isSubmitting || !newWeather.label.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加天气
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 系统预设天气 */}
        {/* <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">系统预设天气</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {tagsData?.weathers.default.map((weather) => (
              <span 
                key={weather.value}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {weather.label}
              </span>
            ))}
          </div>
        </div> */}

        {/* 自定义天气 */}
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">自定义天气</h4>
          {tagsData?.weathers.custom.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {tagsData.weathers.custom.map((weather) => (
                <div 
                  key={weather.id}
                  className="inline-flex items-center justify-between px-3 py-2 rounded-md text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                >
                  <span>{weather.icon} {weather.label}</span>
                  <button
                    onClick={() => handleDeleteTag(weather.id, 'weather')}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">暂无自定义天气</p>
          )}
        </div>
      </div>
    </div>
  )

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">标签管理</h1>
        
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        ) : (
          <>
            {/* 标签类型选择器 */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'tag'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('tag')}
              >
                标签
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'mood'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('mood')}
              >
                心情
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'weather'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('weather')}
              >
                天气
              </button>
            </div>

            {/* 内容区域 */}
            <div className="bg-warm-gray dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              {activeTab === 'tag' && renderTagsTab()}
              {activeTab === 'mood' && renderMoodTab()}
              {activeTab === 'weather' && renderWeatherTab()}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 