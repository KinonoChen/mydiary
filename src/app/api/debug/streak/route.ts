import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getChinaTime, formatChinaDate } from '@/lib/timezone'

// 调试连续天数计算的API
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

    // 获取所有日记
    const allDiaries = await prisma.diary.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    })

    // 转换为中国时区的日期
    const diariesWithChinaDate = allDiaries.map(diary => ({
      id: diary.id,
      title: diary.title,
      createdAt: diary.createdAt,
      chinaDate: formatChinaDate(diary.createdAt),
      chinaDateTime: new Date(diary.createdAt.getTime() + 8 * 60 * 60 * 1000).toLocaleString('zh-CN')
    }))

    // 按日期分组
    const dateGroups: { [key: string]: typeof diariesWithChinaDate } = {}
    diariesWithChinaDate.forEach(diary => {
      const date = diary.chinaDate
      if (!dateGroups[date]) {
        dateGroups[date] = []
      }
      dateGroups[date].push(diary)
    })

    // 获取唯一日期并排序
    const uniqueDates = [...new Set(diariesWithChinaDate.map(d => d.chinaDate))]
      .sort((a, b) => b.localeCompare(a)) // 降序排列

    // 计算连续天数（复制原逻辑）
    let streakDays = 0
    const today = getChinaTime()
    today.setHours(0, 0, 0, 0)
    
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let debugInfo = {
      todayStr,
      yesterdayStr,
      latestDiaryDate: uniqueDates[0] || null,
      isLatestToday: false,
      isLatestYesterday: false,
      calculationSteps: [] as any[]
    }

    if (uniqueDates.length > 0) {
      const latestDiaryDate = uniqueDates[0]
      debugInfo.isLatestToday = latestDiaryDate === todayStr
      debugInfo.isLatestYesterday = latestDiaryDate === yesterdayStr

      // 如果最近的日记不是今天或昨天，连续天数为0
      if (latestDiaryDate !== todayStr && latestDiaryDate !== yesterdayStr) {
        streakDays = 0
        debugInfo.calculationSteps.push({
          step: 'initial_check',
          message: '最近的日记不是今天或昨天，连续天数为0',
          latestDiaryDate,
          todayStr,
          yesterdayStr
        })
      } else {
        // 从最近有日记的日期开始往前计算连续天数
        const latestDate = new Date(latestDiaryDate)
        let currentCheckDate = new Date(latestDate)

        for (const dateStr of uniqueDates) {
          const checkDateStr = currentCheckDate.toISOString().split('T')[0]
          
          debugInfo.calculationSteps.push({
            step: 'checking',
            dateStr,
            checkDateStr,
            matches: dateStr === checkDateStr,
            currentStreak: streakDays
          })

          if (dateStr === checkDateStr) {
            streakDays++
            // 往前推一天
            currentCheckDate.setDate(currentCheckDate.getDate() - 1)
          } else {
            // 如果当前检查的日期没有日记，结束连续计算
            debugInfo.calculationSteps.push({
              step: 'break',
              message: '发现不连续的日期，停止计算',
              dateStr,
              checkDateStr
            })
            break
          }
        }
      }
    }

    return NextResponse.json({
      totalDiaries: allDiaries.length,
      uniqueDatesCount: uniqueDates.length,
      streakDays,
      debugInfo,
      uniqueDates,
      dateGroups: Object.entries(dateGroups).map(([date, diaries]) => ({
        date,
        count: diaries.length,
        diaries: diaries.map(d => ({
          id: d.id,
          title: d.title,
          chinaDateTime: d.chinaDateTime
        }))
      })).sort((a, b) => b.date.localeCompare(a.date)),
      diariesWithChinaDate: diariesWithChinaDate.slice(0, 10) // 只返回前10条用于调试
    })

  } catch (error) {
    console.error('Error in debug streak:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
