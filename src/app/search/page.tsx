'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Loading, { ListSkeleton } from '@/components/ui/Loading'
import { debounce } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  content: string
  tags: string[]
  mood: string | null
  weather: string | null
  createdAt: string
  updatedAt: string
  highlightedTitle?: string
  highlightedContent?: string
}

interface UserTag {
  id: string
  type: string
  value: string
  label: string | null
  icon: string | null
}

interface TagsData {
  tags: {
    default: UserTag[]
    custom: UserTag[]
  }
  moods: {
    default: UserTag[]
    custom: UserTag[]
  }
  weathers: {
    default: UserTag[]
    custom: UserTag[]
  }
}

interface SearchResponse {
  data: SearchResult[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  searchInfo: {
    query: string
    tags: string[]
    mood: string | null
    weather: string | null
    dateFrom: string | null
    dateTo: string | null
    sortBy: string
    sortOrder: string
  }
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedWeather, setSelectedWeather] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [tagsData, setTagsData] = useState<TagsData | null>(null)
  const [tagsLoading, setTagsLoading] = useState(true)
  const router = useRouter()

  // 获取用户标签数据
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true)
        const response = await fetch('/api/tags')
        if (response.ok) {
          const data = await response.json()
          setTagsData(data)
        } else {
          console.error('获取标签失败')
        }
      } catch (error) {
        console.error('获取标签失败:', error)
      } finally {
        setTagsLoading(false)
      }
    }

    fetchTags()
  }, [])

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const getDateRange = () => {
    const now = new Date()
    switch (dateRange) {
      case 'all':
        return { from: null, to: null }
      case 'today':
        return {
          from: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
          to: new Date(now.setHours(23, 59, 59, 999)).toISOString()
        }
      case 'week':
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return {
          from: weekAgo.toISOString(),
          to: now.toISOString()
        }
      case 'month':
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return {
          from: monthAgo.toISOString(),
          to: now.toISOString()
        }
      case 'year':
        const yearAgo = new Date(now)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        return {
          from: yearAgo.toISOString(),
          to: now.toISOString()
        }
      default:
        return undefined
    }
  }

  const handleSearch = async () => {
    const dateRangeResult = getDateRange();
    const isDateRangeSelected = dateRangeResult !== undefined;

    if (!searchQuery.trim() && selectedTags.length === 0 && !selectedMood && !selectedWeather && !isDateRangeSelected) {
      setError('请输入搜索内容或选择筛选条件');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/diaries/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
          tags: selectedTags,
          mood: selectedMood || null,
          weather: selectedWeather || null,
          dateFrom: isDateRangeSelected ? dateRangeResult.from : null,
          dateTo: isDateRangeSelected ? dateRangeResult.to : null,
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      });

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '搜索失败')
      }

      const data: SearchResponse = await response.json()
      setSearchResults(data.data)
      setTotalResults(data.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败，请重试')
      setSearchResults([])
      setTotalResults(0)
    } finally {
      setIsLoading(false)
    }
  }

  // 当搜索条件改变时自动搜索
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const dateRangeResult = getDateRange();
      const isDateRangeSelected = dateRangeResult !== undefined;

      if (isDateRangeSelected && (searchQuery.trim() || selectedTags.length > 0 || selectedMood || selectedWeather)) {
        handleSearch();
      } else {
        // 清空搜索结果时不显示loading状态，避免闪烁
        setSearchResults([]);
        setTotalResults(0);
        setError('');
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedTags, selectedMood, selectedWeather, dateRange]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-in-up">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔍 搜索日记
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          在时光的长河中找到你想要的回忆
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-warm-gray dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover-lift transition-all-smooth animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Main Search */}
        <div className="mb-8">
          <label htmlFor="search" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🔍 搜索内容
          </label>
          <div className="relative group">
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索日记标题、内容..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-warm-gray dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all-smooth text-lg"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标签筛选
            </label>
            {tagsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">加载标签中...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tagsData && [...tagsData.tags.custom].map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedTags.includes(tag.value)
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tag.label || tag.value}
                  </button>
                ))}
                {(!tagsData || tagsData.tags.custom.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    暂无可用标签，请先在<span className="text-blue-600 dark:text-blue-400">标签管理</span>中添加标签
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              时间范围
            </label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-warm-gray dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">请选择时间</option>
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
              <option value="year">最近一年</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 flex justify-center">
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? '搜索中...' : '开始搜索'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="bg-warm-gray dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            搜索结果
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            找到 {totalResults} 条相关日记
          </p>
        </div>
        
        {/* 为搜索结果区域设置最小高度，避免布局跳动 */}
        <div className="p-8 min-h-[400px]">
          {isLoading ? (
            <div className="space-y-6">
              <Loading text="正在搜索中..." size="lg" />
              <ListSkeleton count={3} />
            </div>
          ) : (
            <div className="space-y-6">
              {searchResults.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => router.push(`/diary/${result.id}`)}
                  className="group cursor-pointer bg-warm-gray dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all-smooth hover-lift animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: result.highlightedTitle || result.title }}
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ml-4">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(result.createdAt).toLocaleString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <p
                    className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: result.highlightedContent || result.content }}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {result.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        >
                          #{tag}
                        </span>
                      ))}
                      {result.tags.length > 3 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          +{result.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      约 {result.content.length} 字
                    </div>
                  </div>
                </div>
              ))}

              {searchResults.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery || selectedTags.length > 0 || dateRange
                      ? '未找到相关日记'
                      : '开始搜索你的日记'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery || selectedTags.length > 0 || dateRange
                      ? '试试更换关键词或筛选条件'
                      : '输入关键词或选择标签来查找相关的日记内容'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          💡 搜索小贴士
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• 支持搜索日记标题和内容</li>
          <li>• 可以组合多个标签进行精确筛选</li>
          <li>• 使用时间范围快速定位特定时期的日记</li>
          <li>• 搜索结果会高亮显示匹配的关键词</li>
        </ul>
      </div>
    </div>
  )
} 