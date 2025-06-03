import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取中国时区的当前时间
function getChinaTime() {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
}

// 获取中国时区的某个日期
function getChinaDate(date: Date) {
  return new Date(date.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
}

// 将UTC时间转换为中国时区的日期字符串 (YYYY-MM-DD)
function formatChinaDate(utcDate: Date) {
  return new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
    .toISOString().split('T')[0]
}

// 将UTC时间转换为中国时区的年月字符串 (YYYY-MM)
function formatChinaYearMonth(utcDate: Date) {
  const chinaDate = new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
  const year = chinaDate.getFullYear()
  const month = String(chinaDate.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// GET /api/diaries/stats - 获取用户日记统计信息
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 基础统计
    const totalDiaries = await prisma.diary.count({
      where: { userId: user.id }
    })

    // 心情分布统计
    const moodStats = await prisma.diary.groupBy({
      by: ['mood'],
      where: {
        userId: user.id,
        mood: { not: null }
      },
      _count: true,
      orderBy: {
        _count: {
          mood: 'desc'
        }
      }
    })

    // 天气分布统计
    const weatherStats = await prisma.diary.groupBy({
      by: ['weather'],
      where: {
        userId: user.id,
        weather: { not: null }
      },
      _count: true,
      orderBy: {
        _count: {
          weather: 'desc'
        }
      }
    })

    // 获取所有日记进行时区转换后的按月统计
    const allDiaries = await prisma.diary.findMany({
      where: { userId: user.id },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 按中国时区的月份分组统计
    const monthlyStatsMap: { [key: string]: number } = {}
    allDiaries.forEach(diary => {
      const chinaYearMonth = formatChinaYearMonth(diary.createdAt)
      monthlyStatsMap[chinaYearMonth] = (monthlyStatsMap[chinaYearMonth] || 0) + 1
    })

    // 转换为数组并排序，取最近12个月
    const processedMonthlyStats = Object.entries(monthlyStatsMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12)

    // 获取所有日记的标签并统计
    const diariesWithTags = await prisma.diary.findMany({
      where: {
        userId: user.id,
        tags: { not: '' }
      },
      select: {
        tags: true
      }
    })

    // 处理标签统计
    const tagsCount: { [key: string]: number } = {}
    diariesWithTags.forEach(diary => {
      if (diary.tags) {
        try {
          const tags = JSON.parse(diary.tags) as string[]
          tags.forEach(tag => {
            tagsCount[tag] = (tagsCount[tag] || 0) + 1
          })
        } catch (error) {
          console.error('Error parsing tags:', error)
        }
      }
    })

    // 将标签转换为数组并按使用频率排序
    const tagsArray = Object.entries(tagsCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // 取前20个最常用标签

    // 计算连续写日记天数（基于中国时区）
    const recentDiaries = await prisma.diary.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100, // 取更多数据以确保准确性
      select: {
        createdAt: true
      }
    })

    let streakDays = 0
    if (recentDiaries.length > 0) {
      const today = getChinaTime()
      today.setHours(0, 0, 0, 0) // 设为当天00:00:00

      // 将所有日记的创建时间转换为中国时区的日期字符串并排序
      const dates = recentDiaries.map(d => formatChinaDate(d.createdAt))
      const uniqueDates = [...new Set(dates)].sort((a, b) => b.localeCompare(a)) // 降序排列

      if (uniqueDates.length > 0) {
        // 获取最近有日记的日期
        const latestDiaryDate = uniqueDates[0]
        const latestDate = new Date(latestDiaryDate)

        // 检查最近的日记是否是今天或昨天（允许1天的容错）
        const todayStr = today.toISOString().split('T')[0]
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        // 如果最近的日记不是今天或昨天，连续天数为0
        if (latestDiaryDate !== todayStr && latestDiaryDate !== yesterdayStr) {
          streakDays = 0
        } else {
          // 从最近有日记的日期开始往前计算连续天数
          let currentCheckDate = new Date(latestDate)

          for (const dateStr of uniqueDates) {
            const checkDateStr = currentCheckDate.toISOString().split('T')[0]

            if (dateStr === checkDateStr) {
              streakDays++
              // 往前推一天
              currentCheckDate.setDate(currentCheckDate.getDate() - 1)
            } else {
              // 如果当前检查的日期没有日记，结束连续计算
              break
            }
          }
        }
      }
    }

    // 计算总字数 - 获取所有日记内容来计算字数
    const allContents = await prisma.diary.findMany({
      where: { userId: user.id },
      select: {
        content: true
      }
    })

    const totalWords = allContents.reduce((sum, diary) => sum + diary.content.length, 0)

    // 计算本月字数和数量（基于中国时区）
    const chinaToday = getChinaTime()
    const currentYear = chinaToday.getFullYear()
    const currentMonth = chinaToday.getMonth()
    
    // 获取中国时区的本月开始和结束时间
    const chinaMonthStart = new Date(currentYear, currentMonth, 1)
    const chinaMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)
    
    // 转换为UTC时间用于数据库查询
    // 中国时间减8小时得到UTC时间
    const utcMonthStart = new Date(chinaMonthStart.getTime() - 8 * 60 * 60 * 1000)
    const utcMonthEnd = new Date(chinaMonthEnd.getTime() - 8 * 60 * 60 * 1000)
    
    const currentMonthDiaries = await prisma.diary.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: utcMonthStart,
          lte: utcMonthEnd
        }
      },
      select: {
        content: true,
        id: true,
        createdAt: true
      }
    })

    // 进一步过滤，确保转换到中国时区后确实在当月
    const filteredCurrentMonthDiaries = currentMonthDiaries.filter(diary => {
      const chinaYearMonth = formatChinaYearMonth(diary.createdAt)
      const currentYearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
      return chinaYearMonth === currentYearMonth
    })

    const currentMonthWords = filteredCurrentMonthDiaries.reduce((sum, diary) => sum + diary.content.length, 0)
    const currentMonthCount = filteredCurrentMonthDiaries.length

    const stats = {
      total: totalDiaries,
      streak: streakDays,
      totalWords: totalWords,
      currentMonthWords: currentMonthWords,
      currentMonthCount: currentMonthCount,
      mood: moodStats.map(item => ({
        mood: item.mood,
        count: item._count
      })),
      weather: weatherStats.map(item => ({
        weather: item.weather,
        count: item._count
      })),
      monthly: processedMonthlyStats,
      tags: tagsArray,
      averagePerMonth: processedMonthlyStats.length > 0 
        ? Math.round(processedMonthlyStats.reduce((sum, item) => sum + item.count, 0) / processedMonthlyStats.length)
        : 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching diary stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 