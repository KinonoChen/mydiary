import { NextRequest, NextResponse } from 'next/server'
import {
  getTimezoneTime,
  formatTimezoneDate,
  formatTimezoneYearMonth,
  getTimezoneMonthRange
} from '@/lib/timezone-server'

// 测试时区功能的API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testTimezone = searchParams.get('timezone') || 'Asia/Shanghai'
    
    // 测试当前时间
    const now = new Date()
    const timezoneTime = getTimezoneTime(testTimezone)
    
    // 测试日期格式化
    const testDate = new Date('2024-01-15T10:30:00Z') // UTC时间
    const timezoneDate = formatTimezoneDate(testDate, testTimezone)
    const timezoneYearMonth = formatTimezoneYearMonth(testDate, testTimezone)
    
    // 测试月份范围
    const { start, end } = getTimezoneMonthRange(2024, 0, testTimezone) // 2024年1月
    
    // 测试浏览器时区检测（仅在客户端有效）
    const browserTimezone = 'N/A (服务端无法检测)'
    
    return NextResponse.json({
      testTimezone,
      currentTime: {
        utc: now.toISOString(),
        timezone: timezoneTime.toISOString(),
        timezoneLocal: timezoneTime.toLocaleString('zh-CN', { timeZone: testTimezone })
      },
      dateFormatting: {
        utcInput: testDate.toISOString(),
        timezoneDate,
        timezoneYearMonth,
        explanation: `UTC ${testDate.toISOString()} 在 ${testTimezone} 时区显示为 ${timezoneDate}`
      },
      monthRange: {
        input: '2024年1月',
        utcStart: start.toISOString(),
        utcEnd: end.toISOString(),
        explanation: `${testTimezone} 时区的2024年1月对应的UTC时间范围`
      },
      browserTimezone,
      examples: {
        'Asia/Shanghai': '中国标准时间 (UTC+8)',
        'America/New_York': '美国东部时间 (UTC-5/-4)',
        'Europe/London': '英国时间 (UTC+0/+1)',
        'UTC': '协调世界时'
      }
    })
    
  } catch (error) {
    console.error('Error in timezone test:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
