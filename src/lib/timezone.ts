'use client'

/**
 * 时区管理工具
 * 提供统一的时区检测、存储和转换功能
 */

// 常用时区列表
export const COMMON_TIMEZONES = [
  { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)', offset: '+09:00' },
  { value: 'Asia/Seoul', label: '韩国标准时间 (UTC+9)', offset: '+09:00' },
  { value: 'Asia/Hong_Kong', label: '香港时间 (UTC+8)', offset: '+08:00' },
  { value: 'Asia/Taipei', label: '台北时间 (UTC+8)', offset: '+08:00' },
  { value: 'Asia/Singapore', label: '新加坡时间 (UTC+8)', offset: '+08:00' },
  { value: 'America/New_York', label: '美国东部时间 (UTC-5/-4)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: '美国西部时间 (UTC-8/-7)', offset: '-08:00' },
  { value: 'Europe/London', label: '英国时间 (UTC+0/+1)', offset: '+00:00' },
  { value: 'Europe/Paris', label: '欧洲中部时间 (UTC+1/+2)', offset: '+01:00' },
  { value: 'Australia/Sydney', label: '澳大利亚东部时间 (UTC+10/+11)', offset: '+10:00' },
] as const

// 本地存储键名
const TIMEZONE_STORAGE_KEY = 'user_timezone_preference'
const AUTO_DETECT_STORAGE_KEY = 'timezone_auto_detect'

/**
 * 获取用户浏览器的时区
 */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    console.warn('无法获取浏览器时区，使用默认时区:', error)
    return 'Asia/Shanghai' // 默认时区
  }
}

/**
 * 获取时区的UTC偏移量
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const date = new Date()
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const targetTime = new Date(utc + (getTimezoneOffsetMinutes(timezone) * 60000))
    
    const offset = -targetTime.getTimezoneOffset()
    const hours = Math.floor(Math.abs(offset) / 60)
    const minutes = Math.abs(offset) % 60
    const sign = offset >= 0 ? '+' : '-'
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  } catch (error) {
    console.warn('无法获取时区偏移量:', error)
    return '+08:00'
  }
}

/**
 * 获取时区偏移分钟数
 */
function getTimezoneOffsetMinutes(timezone: string): number {
  try {
    const date = new Date()
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const targetDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    
    return (targetDate.getTime() - utcDate.getTime()) / (1000 * 60)
  } catch (error) {
    console.warn('无法计算时区偏移:', error)
    return 480 // 默认+8小时
  }
}

/**
 * 保存用户时区偏好到本地存储
 */
export function saveUserTimezone(timezone: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TIMEZONE_STORAGE_KEY, timezone)
    }
  } catch (error) {
    console.warn('无法保存时区偏好:', error)
  }
}

/**
 * 从本地存储获取用户时区偏好
 */
export function getUserTimezone(): string {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TIMEZONE_STORAGE_KEY)
      if (saved) {
        return saved
      }
    }
  } catch (error) {
    console.warn('无法读取时区偏好:', error)
  }
  
  // 如果没有保存的偏好，返回浏览器时区
  return getBrowserTimezone()
}

/**
 * 设置是否自动检测时区
 */
export function setAutoDetectTimezone(autoDetect: boolean): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTO_DETECT_STORAGE_KEY, autoDetect.toString())
    }
  } catch (error) {
    console.warn('无法保存自动检测设置:', error)
  }
}

/**
 * 获取是否自动检测时区的设置
 */
export function getAutoDetectTimezone(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AUTO_DETECT_STORAGE_KEY)
      return saved !== 'false' // 默认为true
    }
  } catch (error) {
    console.warn('无法读取自动检测设置:', error)
  }
  
  return true // 默认自动检测
}

/**
 * 获取当前应该使用的时区
 * 根据用户设置决定是使用保存的时区还是自动检测的时区
 */
export function getCurrentTimezone(): string {
  const autoDetect = getAutoDetectTimezone()
  
  if (autoDetect) {
    return getBrowserTimezone()
  } else {
    return getUserTimezone()
  }
}

/**
 * 检查时区是否有效
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch (error) {
    return false
  }
}

/**
 * 获取时区的友好显示名称
 */
export function getTimezoneDisplayName(timezone: string): string {
  const commonTz = COMMON_TIMEZONES.find(tz => tz.value === timezone)
  if (commonTz) {
    return commonTz.label
  }
  
  try {
    const offset = getTimezoneOffset(timezone)
    return `${timezone} (UTC${offset})`
  } catch (error) {
    return timezone
  }
}
