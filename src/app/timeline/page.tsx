'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import TimelineContainer from '@/components/timeline/TimelineContainer'
import TimelineNavigation from '@/components/timeline/TimelineNavigation'
import { getCurrentTimezone } from '@/lib/timezone-client'

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

export default function TimelinePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [filteredDiaries, setFilteredDiaries] = useState<Diary[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 50, // 时间主线一次加载更多数据
    total: 0,
    pages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMonth, setCurrentMonth] = useState('')
  const isLoadingRef = useRef(false)
  
  // 用户标签
  const [userTags, setUserTags] = useState<Tag[]>([])
  const [userMoods, setUserMoods] = useState<Tag[]>([])
  const [userWeathers, setUserWeathers] = useState<Tag[]>([])

  // 加载用户标签
  useEffect(() => {
    const fetchTags = async () => {
      if (!session) return
      
      try {
        const response = await fetch('/api/tags')
        
        if (!response.ok) {
          throw new Error('获取标签失败')
        }

        const data = await response.json()
        
        setUserTags(data.tags.custom)
        setUserMoods(data.moods.custom)
        setUserWeathers(data.weathers.custom)
      } catch (error) {
        console.error('获取标签数据失败:', error)
      }
    }

    fetchTags()
  }, [session])

  // 加载日记数据
  const fetchDiaries = async (page: number = 1, append: boolean = false) => {
    try {
      // 并发防护，避免重复触发加载
      if (isLoadingRef.current) return
      isLoadingRef.current = true
      setIsLoading(true)
      const response = await fetch(`/api/diaries?page=${page}&limit=${pagination.limit}&sortBy=newest`)
      
      if (!response.ok) {
        throw new Error('获取日记列表失败')
      }

      const data = await response.json()
      
      setDiaries(prev => {
        const base = append ? prev : []
        const merged = [...base, ...data.data]
        // 去重：按 id 去重保持顺序
        const seen = new Set<string>()
        const unique: Diary[] = []
        for (let i = 0; i < merged.length; i++) {
          const item = merged[i]
          if (!seen.has(item.id)) {
            seen.add(item.id)
            unique.push(item)
          }
        }
        return unique
      })
      
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取日记列表失败')
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }

  useEffect(() => {
    if (session) {
      fetchDiaries()
    }
  }, [session])

  // 搜索和筛选逻辑
  useEffect(() => {
    let filtered = diaries

    // 搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(diary => 
        diary.title.toLowerCase().includes(query) ||
        diary.content.toLowerCase().includes(query)
      )
    }

    setFilteredDiaries(filtered)
  }, [diaries, searchQuery])

  // 获取标签、心情和天气的显示文本
  const getTagDisplay = (value: string, type: 'mood' | 'weather' | 'tag'): { text: string, icon?: string } => {
    if (type === 'mood') {
      const customMood = userMoods.find(m => m.value === value || m.label === value)
      if (customMood) {
        return { 
          text: customMood.label || customMood.value,
          icon: customMood.icon || '😐' 
        }
      }
      return { text: value, icon: '😐' }
    } else if (type === 'weather') {
      const customWeather = userWeathers.find(w => w.value === value || w.label === value)
      if (customWeather) {
        return { 
          text: customWeather.label || customWeather.value,
          icon: customWeather.icon || '🌤️' 
        }
      }
      return { text: value, icon: '🌤️' }
    } else {
      return { text: value }
    }
  }

  // 获取可用月份列表（使用用户时区）
  const getAvailableMonths = () => {
    const months = new Set<string>()
    const userTimezone = getCurrentTimezone()

    diaries.forEach(diary => {
      // 使用时区工具函数进行转换
      const date = new Date(diary.createdAt)
      const timezoneDate = new Date(date.toLocaleString("en-US", { timeZone: userTimezone }))
      const yearMonth = `${timezoneDate.getFullYear()}-${String(timezoneDate.getMonth() + 1).padStart(2, '0')}`
      months.add(yearMonth)
    })
    return Array.from(months).sort((a, b) => b.localeCompare(a))
  }

  // 跳转到指定月份
  const handleMonthSelect = (month: string) => {
    setCurrentMonth(month)

    // 使用setTimeout确保DOM已更新
    setTimeout(() => {
      // 尝试多种选择器来找到月份元素
      let monthElement = document.querySelector(`[data-month="${month}"]`)

      if (!monthElement) {
        // 如果没有找到，尝试查找包含该月份的元素
        const [year, monthNum] = month.split('-')
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long'
        })

        // 查找包含月份名称的标题元素
        const headings = document.querySelectorAll('h2, h3, .month-header')
        for (const heading of headings) {
          if (heading.textContent?.includes(monthName) || heading.textContent?.includes(month)) {
            monthElement = heading
            break
          }
        }
      }

      if (monthElement) {
        // 滚动到元素位置，留出一些顶部空间给导航栏
        const navHeight = 80 // 导航栏高度
        const elementTop = monthElement.getBoundingClientRect().top + window.scrollY - navHeight

        window.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        })
      } else {
        // 如果还是找不到，尝试根据日期筛选并滚动到第一个匹配的日记
        const targetDate = new Date(month + '-01')
        const diaryElements = document.querySelectorAll('[data-date]')

        for (const element of diaryElements) {
          const dateStr = element.getAttribute('data-date')
          if (dateStr) {
            const diaryDate = new Date(dateStr)
            if (diaryDate.getFullYear() === targetDate.getFullYear() &&
                diaryDate.getMonth() === targetDate.getMonth()) {
              const navHeight = 80
              const elementTop = element.getBoundingClientRect().top + window.scrollY - navHeight

              window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
              })
              break
            }
          }
        }
      }
    }, 100)
  }

  // 加载更多数据
  const handleLoadMore = () => {
    if (pagination.page < pagination.pages && !isLoadingRef.current) {
      fetchDiaries(pagination.page + 1, true)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-warm-gray dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">请登录后查看此页面</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-gray dark:bg-gray-900">
      {/* 导航栏 */}
      <TimelineNavigation
        availableMonths={getAvailableMonths()}
        currentMonth={currentMonth}
        onMonthSelect={handleMonthSelect}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        totalCount={pagination.total}
      />

      {/* 主内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <TimelineContainer
            diaries={filteredDiaries}
            getTagDisplay={getTagDisplay}
            showPreview={true}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            hasMore={pagination.page < pagination.pages}
          />
        )}
      </div>
    </div>
  )
}
