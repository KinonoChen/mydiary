import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // 按月统计日记数量
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as count
      FROM diaries 
      WHERE userId = ${user.id}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
      LIMIT 12
    ` as Array<{ month: string; count: bigint }>

    // 将BigInt转换为普通数字
    const processedMonthlyStats = monthlyStats.map(item => ({
      month: item.month,
      count: Number(item.count)
    }))

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

    // 计算连续写日记天数（简化版本）
    const recentDiaries = await prisma.diary.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        createdAt: true
      }
    })

    let streakDays = 0
    if (recentDiaries.length > 0) {
      const today = new Date()
      const dates = recentDiaries.map(d => 
        new Date(d.createdAt).toDateString()
      )
      const uniqueDates = [...new Set(dates)]
      
      // 检查连续天数
      for (let i = 0; i < uniqueDates.length; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        
        if (uniqueDates.includes(checkDate.toDateString())) {
          streakDays++
        } else {
          break
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

    // 计算本月字数和数量
    const currentMonth = new Date()
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999)
    
    const currentMonthDiaries = await prisma.diary.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      },
      select: {
        content: true,
        id: true
      }
    })

    const currentMonthWords = currentMonthDiaries.reduce((sum, diary) => sum + diary.content.length, 0)
    const currentMonthCount = currentMonthDiaries.length

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