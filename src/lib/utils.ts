/**
 * 格式化日期时间到中国时区
 * @param dateString ISO 8601 格式的日期字符串
 * @param includeTime 是否包含时间，默认为 true
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(dateString: string, includeTime: boolean = true): string {
  const date = new Date(dateString)
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Shanghai', // 中国时区
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
 * @returns 格式化后的简短日期字符串 (例: 2024年12月15日)
 */
export function formatDate(dateString: string): string {
  return formatDateTime(dateString, false)
}

/**
 * 格式化为相对时间 (例: 2小时前, 3天前)
 * @param dateString ISO 8601 格式的日期字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string): string {
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
    return formatDate(dateString)
  }
}

/**
 * 格式化为详细的日期时间 (例: 2024年12月15日 14:30)
 * @param dateString ISO 8601 格式的日期字符串
 * @returns 详细的日期时间字符串
 */
export function formatFullDateTime(dateString: string): string {
  return formatDateTime(dateString, true)
} 