/**
 * 时区管理工具 - 通用版本
 *
 * 注意：这个文件已被拆分为客户端和服务端专用版本：
 * - 客户端组件请使用 @/lib/timezone-client
 * - 服务端API请使用 @/lib/timezone-server
 *
 * 此文件保留用于向后兼容
 */

// 重新导出客户端函数（用于向后兼容）
export {
  COMMON_TIMEZONES,
  getBrowserTimezone,
  getCurrentTimezone,
  getUserTimezone,
  saveUserTimezone,
  getAutoDetectTimezone,
  setAutoDetectTimezone,
  isValidTimezone,
  getTimezoneDisplayName,
  getTimezoneOffset
} from './timezone-client'

// 重新导出服务端函数（用于向后兼容）
export {
  getTimezoneTime,
  convertToTimezone,
  formatTimezoneDate,
  formatTimezoneYearMonth,
  getTimezoneMonthRange,
  getChinaTime,
  formatChinaDate,
  formatChinaYearMonth
} from './timezone-server'



