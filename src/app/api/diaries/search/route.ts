import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/diaries/search - 高级搜索日记
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      query = '',
      tags = [],
      mood,
      weather,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = body

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 构建查询条件
    const where: any = {
      userId: user.id
    }

    // 全文搜索
    if (query.trim()) {
      where.OR = [
        { title: { contains: query.trim() } },
        { content: { contains: query.trim() } }
      ]
    }

    // 标签过滤
    if (tags.length > 0) {
      const tagConditions = tags.map((tag: string) => ({
        tags: { contains: tag }
      }))
      
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: tagConditions }
        ]
        delete where.OR
      } else {
        where.OR = tagConditions
      }
    }

    // 心情过滤
    if (mood) {
      where.mood = mood
    }

    // 天气过滤
    if (weather) {
      where.weather = weather
    }

    // 日期范围过滤
    if (dateFrom || dateTo) {
      where.createdAt = {}
      
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999) // 包含整天
        where.createdAt.lte = endDate
      }
    }

    // 排序选项验证
    const validSortFields = ['createdAt', 'updatedAt', 'title']
    const validSortOrders = ['asc', 'desc']
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc'

    // 获取总数
    const total = await prisma.diary.count({ where })

    // 获取分页数据
    const diaries = await prisma.diary.findMany({
      where,
      orderBy: { [finalSortBy]: finalSortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        mood: true,
        weather: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // 处理tags字段
    const processedDiaries = diaries.map(diary => ({
      ...diary,
      tags: diary.tags ? JSON.parse(diary.tags) : [],
      // 添加搜索高亮（简化版）
      highlightedTitle: query.trim() 
        ? diary.title.replace(
            new RegExp(query.trim(), 'gi'),
            (match) => `<mark>${match}</mark>`
          )
        : diary.title,
      highlightedContent: query.trim()
        ? diary.content.slice(0, 200).replace(
            new RegExp(query.trim(), 'gi'),
            (match) => `<mark>${match}</mark>`
          ) + (diary.content.length > 200 ? '...' : '')
        : diary.content.slice(0, 200) + (diary.content.length > 200 ? '...' : '')
    }))

    return NextResponse.json({
      data: processedDiaries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      searchInfo: {
        query: query.trim(),
        tags,
        mood,
        weather,
        dateFrom,
        dateTo,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder
      }
    })

  } catch (error) {
    console.error('Error searching diaries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/diaries/search - 快速搜索（查询参数方式）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query.trim()) {
      return NextResponse.json({ data: [] })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 快速搜索
    const diaries = await prisma.diary.findMany({
      where: {
        userId: user.id,
        OR: [
          { title: { contains: query.trim() } },
          { content: { contains: query.trim() } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true
      }
    })

    // 处理搜索结果，添加预览
    const processedDiaries = diaries.map(diary => ({
      id: diary.id,
      title: diary.title,
      preview: diary.content.slice(0, 100) + (diary.content.length > 100 ? '...' : ''),
      createdAt: diary.createdAt
    }))

    return NextResponse.json({ data: processedDiaries })

  } catch (error) {
    console.error('Error in quick search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 