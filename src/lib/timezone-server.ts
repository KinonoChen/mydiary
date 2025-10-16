/**
 * 服务端时区工具函数
 * 专门用于服务端API中的时区处理
 */

/**
 * 获取指定时区的当前时间
 */
export function getTimezoneTime(timezone: string): Date {
  try {
    const now = new Date()

    // 使用 Intl.DateTimeFormat 获取时区时间的各个部分
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(now)
    const year = parseInt(parts.find(part => part.type === 'year')?.value || '0')
    const month = parseInt(parts.find(part => part.type === 'month')?.value || '1') - 1 // 月份从0开始
    const day = parseInt(parts.find(part => part.type === 'day')?.value || '1')
    const hour = parseInt(parts.find(part => part.type === 'hour')?.value || '0')
    const minute = parseInt(parts.find(part => part.type === 'minute')?.value || '0')
    const second = parseInt(parts.find(part => part.type === 'second')?.value || '0')

    // 创建时区时间（注意：这里创建的是本地时间，但数值上等于目标时区的时间）
    return new Date(year, month, day, hour, minute, second, now.getMilliseconds())
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
    // 使用 Intl.DateTimeFormat 获取时区时间的各个部分
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(utcDate)
    const year = parseInt(parts.find(part => part.type === 'year')?.value || '0')
    const month = parseInt(parts.find(part => part.type === 'month')?.value || '1') - 1 // 月份从0开始
    const day = parseInt(parts.find(part => part.type === 'day')?.value || '1')
    const hour = parseInt(parts.find(part => part.type === 'hour')?.value || '0')
    const minute = parseInt(parts.find(part => part.type === 'minute')?.value || '0')
    const second = parseInt(parts.find(part => part.type === 'second')?.value || '0')

    // 创建时区时间
    return new Date(year, month, day, hour, minute, second, utcDate.getMilliseconds())
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
    // 使用 Intl.DateTimeFormat 来获取正确的时区日期
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    return formatter.format(utcDate)
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
    // 使用 Intl.DateTimeFormat 来获取正确的时区年月
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit'
    })
    const parts = formatter.formatToParts(utcDate)
    const year = parts.find(part => part.type === 'year')?.value || ''
    const month = parts.find(part => part.type === 'month')?.value || ''
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
    const now = new Date()

    // 获取UTC时间
    const utcTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))

    // 获取目标时区时间
    const targetTime = convertToTimezone(now, timezone)

    // 计算偏移分钟数
    return (targetTime.getTime() - utcTime.getTime()) / (1000 * 60)
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
