import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 定义从数据库获取的日记条目类型
interface DiaryFromDB {
  id: string;
  title: string;
  content: string;
  tags: string | null; // 从数据库读出时为 string 或 null
  mood: string | null; // 从数据库读出时为 string 或 null
  weather: string | null; // 从数据库读出时为 string 或 null
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/diaries - 获取用户的所有日记
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag') || ''
    const mood = searchParams.get('mood') || ''
    const weather = searchParams.get('weather') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'

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

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (tag) {
      where.tags = { contains: tag }
    }

    if (mood) {
      where.mood = mood
    }

    if (weather) {
      where.weather = weather
    }

    // 处理排序逻辑
    let orderBy: any = { createdAt: 'desc' } // 默认排序

    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'updated':
        orderBy = { updatedAt: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // 获取总数
    const total = await prisma.diary.count({ where })

    // 获取分页数据
    const diaries = await prisma.diary.findMany({
      where,
      orderBy,
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

    // 处理tags字段（从JSON字符串转换为数组）
    const processedDiaries = diaries.map((diary: DiaryFromDB) => ({
      ...diary,
      tags: diary.tags ? JSON.parse(diary.tags) : [],
      mood: diary.mood ? JSON.parse(diary.mood) : [],
      weather: diary.weather ? JSON.parse(diary.weather) : []
    }))

    return NextResponse.json({
      data: processedDiaries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching diaries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/diaries - 创建新日记
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, tags = [], mood, weather, createdAt } = body

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }
    
    // 验证去除末尾空白后的内容是否为空
    if (!title.trim() || !content.replace(/\s+$/, '').trim()) {
      return NextResponse.json(
        { error: 'Title and content cannot be empty' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 确保 tags 是数组并进行序列化
    const processedTags = Array.isArray(tags) ? tags : []

    // 新增：处理 mood 和 weather，确保是数组，并进行序列化
    const processedMood = Array.isArray(mood) && mood.length > 0 ? JSON.stringify(mood) : null
    const processedWeather = Array.isArray(weather) && weather.length > 0 ? JSON.stringify(weather) : null

    // 处理创建时间
    let diaryCreatedAt = new Date()
    if (createdAt) {
      const customDate = new Date(createdAt)
      if (!isNaN(customDate.getTime())) {
        diaryCreatedAt = customDate
      }
    }

    // 创建日记
    const diary = await prisma.diary.create({
      data: {
        title: title.trim(),
        content: content.replace(/\s+$/, ''),
        tags: JSON.stringify(processedTags),
        mood: processedMood,
        weather: processedWeather,
        userId: user.id,
        createdAt: diaryCreatedAt
      },
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

    // 处理返回的 tags, mood, weather 字段
    const processedDiary = {
      ...diary,
      tags: processedTags,
      mood: diary.mood ? JSON.parse(diary.mood) : [],
      weather: diary.weather ? JSON.parse(diary.weather) : []
    }

    return NextResponse.json(processedDiary, { status: 201 })

  } catch (error) {
    console.error('Error creating diary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 