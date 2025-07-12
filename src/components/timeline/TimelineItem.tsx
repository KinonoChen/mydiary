'use client'

import { useRouter } from 'next/navigation'

interface TimelineItemProps {
  diary: {
    id: string
    title: string
    content: string
    tags: string[]
    mood: string[] | null
    weather: string[] | null
    createdAt: string
    updatedAt: string
  }
  getTagDisplay: (value: string, type: 'mood' | 'weather' | 'tag') => { text: string, icon?: string }
  showPreview?: boolean
}

export default function TimelineItem({ diary, getTagDisplay, showPreview = false }: TimelineItemProps) {
  const router = useRouter()
  
  // 从日期字符串中提取日期数字
  const getDateNumber = (dateString: string) => {
    const date = new Date(dateString)
    return date.getDate()
  }

  // 获取内容预览（前100个字符）
  const getContentPreview = (content: string) => {
    if (!showPreview || !content) return ''
    return content.length > 100 ? content.substring(0, 100) + '...' : content
  }



  const handleClick = () => {
    router.push(`/diary/${diary.id}`)
  }

  return (
    <div className="relative flex items-start group" data-date={diary.createdAt}>
      {/* 日期数字 */}
      <div className="flex-shrink-0 w-12 text-right mr-4">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {getDateNumber(diary.createdAt)}
        </span>
      </div>

      {/* 时间轴节点 */}
      <div className="relative flex-shrink-0 mr-4">
        {/* 节点圆点 */}
        <div className="relative z-10 flex items-center justify-center w-3 h-3 bg-orange-400 rounded-full border-2 border-white dark:border-gray-800">
        </div>
      </div>

      {/* 内容区域 */}
      <div 
        className="flex-1 min-w-0 pb-6 cursor-pointer"
        onClick={handleClick}
      >
        <div className="bg-warm-gray dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group-hover:border-orange-300 dark:group-hover:border-orange-600">
          {/* 标题和统计信息 */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
              {diary.title}
            </h3>
          </div>

          {/* 心情和天气标签 */}
          {(diary.mood?.length || diary.weather?.length) && (
            <div className="flex items-center gap-2 mb-2">
              {diary.mood?.map(m => {
                const mood = getTagDisplay(m, 'mood')
                return (
                  <span key={m} className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400">
                    {mood.icon} {mood.text}
                  </span>
                )
              })}
              {diary.weather?.map(w => {
                const weather = getTagDisplay(w, 'weather')
                return (
                  <span key={w} className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400">
                    {weather.icon} {weather.text}
                  </span>
                )
              })}
            </div>
          )}

          {/* 内容预览 */}
          {showPreview && getContentPreview(diary.content) && (
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {getContentPreview(diary.content).split('\n').map((line, index) => (
                <div key={index} className="mb-1">
                  {line || <br />}
                </div>
              ))}
            </div>
          )}

          {/* 标签 */}
          {diary.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {diary.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
              {diary.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{diary.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
