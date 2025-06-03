import { getCurrentTimezone } from './timezone'

/**
 * 格式化日期时间到用户时区
 * @param dateString ISO 8601 格式的日期字符串
 * @param includeTime 是否包含时间，默认为 true
 * @param timezone 可选的时区，如果不提供则使用用户当前时区
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(dateString: string, includeTime: boolean = true, timezone?: string): string {
  const date = new Date(dateString)
  const userTimezone = timezone || getCurrentTimezone()

  const options: Intl.DateTimeFormatOptions = {
    timeZone: userTimezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
    options.hour12 = false // 使用24小时制
  }

  return date.toLocaleString('zh-CN', options)
}

/**
 * 格式化为简短的日期格式
 * @param dateString ISO 8601 格式的日期字符串
 * @param timezone 可选的时区，如果不提供则使用用户当前时区
 * @returns 格式化后的简短日期字符串 (例: 2024年12月15日)
 */
export function formatDate(dateString: string, timezone?: string): string {
  return formatDateTime(dateString, false, timezone)
}

/**
 * 格式化为相对时间 (例: 2小时前, 3天前)
 * @param dateString ISO 8601 格式的日期字符串
 * @param timezone 可选的时区，如果不提供则使用用户当前时区
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string, timezone?: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分钟前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}小时前`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}天前`
  } else {
    // 超过一周就显示具体日期
    return formatDate(dateString, timezone)
  }
}

/**
 * 格式化为详细的日期时间 (例: 2024年12月15日 14:30)
 * @param dateString ISO 8601 格式的日期字符串
 * @param timezone 可选的时区，如果不提供则使用用户当前时区
 * @returns 详细的日期时间字符串
 */
export function formatFullDateTime(dateString: string, timezone?: string): string {
  return formatDateTime(dateString, true, timezone)
}

/**
 * 获取用户时区的本地日期字符串 (YYYY-MM-DD)
 * @param date 日期对象，默认为当前时间
 * @param timezone 可选的时区，如果不提供则使用用户当前时区
 * @returns 格式化后的日期字符串
 */
export function getLocalDateString(date: Date = new Date(), timezone?: string): string {
  const userTimezone = timezone || getCurrentTimezone()

  try {
    // 使用用户时区格式化日期
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: userTimezone }))
    const year = localDate.getFullYear()
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0')
    const day = localDate.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    console.warn('时区转换失败，使用本地时间:', error)
    // 回退到本地时间
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

/**
 * 格式化日期显示 (今天、昨天、明天或具体日期)
 * @param dateStr 日期字符串 (YYYY-MM-DD)
 * @param timezone 可选的时区，如果不提供则使用用户当前时区
 * @returns 格式化后的日期显示
 */
export function formatDateDisplay(dateStr: string, timezone?: string): string {
  const userTimezone = timezone || getCurrentTimezone()
  const date = new Date(dateStr)
  const today = getLocalDateString(new Date(), userTimezone)

  // 计算昨天和明天的日期字符串，使用用户时区
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = getLocalDateString(yesterdayDate, userTimezone)

  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = getLocalDateString(tomorrowDate, userTimezone)

  if (dateStr === today) {
    return '今天'
  } else if (dateStr === yesterday) {
    return '昨天'
  } else if (dateStr === tomorrow) {
    return '明天'
  } else {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        timeZone: userTimezone,
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })
    } catch (error) {
      console.warn('日期格式化失败:', error)
      return dateStr
    }
  }
}