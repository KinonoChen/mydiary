/**
 * 服务端时区工具函数
 * 专门用于服务端API中的时区处理
 */

/**
 * 获取指定时区的当前时间
 */
export function getTimezoneTime(timezone: string): Date {
  try {
    return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }))
  } catch (error) {
    console.warn('无法获取指定时区时间，使用本地时间:', error)
    return new Date()
  }
}

/**
 * 将UTC时间转换为指定时区的时间
 */
export function convertToTimezone(utcDate: Date, timezone: string): Date {
  try {
    return new Date(utcDate.toLocaleString("en-US", { timeZone: timezone }))
  } catch (error) {
    console.warn('无法转换时区，使用原始时间:', error)
    return utcDate
  }
}

/**
 * 将UTC时间转换为指定时区的日期字符串 (YYYY-MM-DD)
 */
export function formatTimezoneDate(utcDate: Date, timezone: string): string {
  try {
    return new Date(utcDate.toLocaleString("en-US", { timeZone: timezone }))
      .toISOString().split('T')[0]
  } catch (error) {
    console.warn('无法格式化时区日期，使用UTC日期:', error)
    return utcDate.toISOString().split('T')[0]
  }
}

/**
 * 将UTC时间转换为指定时区的年月字符串 (YYYY-MM)
 */
export function formatTimezoneYearMonth(utcDate: Date, timezone: string): string {
  try {
    const timezoneDate = new Date(utcDate.toLocaleString("en-US", { timeZone: timezone }))
    const year = timezoneDate.getFullYear()
    const month = String(timezoneDate.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  } catch (error) {
    console.warn('无法格式化时区年月，使用UTC年月:', error)
    const year = utcDate.getFullYear()
    const month = String(utcDate.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
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
    return 0 // 默认UTC
  }
}

/**
 * 获取指定时区的月份开始和结束时间（UTC格式，用于数据库查询）
 */
export function getTimezoneMonthRange(year: number, month: number, timezone: string): { start: Date, end: Date } {
  try {
    // 创建指定时区的月份开始和结束时间
    const timezoneMonthStart = new Date(year, month, 1)
    const timezoneMonthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)
    
    // 获取时区偏移量（分钟）
    const offsetMinutes = getTimezoneOffsetMinutes(timezone)
    
    // 转换为UTC时间用于数据库查询
    const utcMonthStart = new Date(timezoneMonthStart.getTime() - offsetMinutes * 60 * 1000)
    const utcMonthEnd = new Date(timezoneMonthEnd.getTime() - offsetMinutes * 60 * 1000)
    
    return { start: utcMonthStart, end: utcMonthEnd }
  } catch (error) {
    console.warn('无法计算时区月份范围，使用UTC时间:', error)
    const utcMonthStart = new Date(year, month, 1)
    const utcMonthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)
    return { start: utcMonthStart, end: utcMonthEnd }
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

// 兼容性函数 - 保持向后兼容
/**
 * @deprecated 请使用 getTimezoneTime('Asia/Shanghai') 替代
 */
export function getChinaTime(): Date {
  return getTimezoneTime('Asia/Shanghai')
}

/**
 * @deprecated 请使用 formatTimezoneDate(date, 'Asia/Shanghai') 替代
 */
export function formatChinaDate(utcDate: Date): string {
  return formatTimezoneDate(utcDate, 'Asia/Shanghai')
}

/**
 * @deprecated 请使用 formatTimezoneYearMonth(date, 'Asia/Shanghai') 替代
 */
export function formatChinaYearMonth(utcDate: Date): string {
  return formatTimezoneYearMonth(utcDate, 'Asia/Shanghai')
}
