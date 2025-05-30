import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/diaries/[id] - 根据ID获取单个日记
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const diaryId = params.id

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 查找日记并验证所有权
    const diary = await prisma.diary.findFirst({
      where: {
        id: diaryId,
        userId: user.id
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

    if (!diary) {
      return NextResponse.json(
        { error: 'Diary not found or access denied' },
        { status: 404 }
      )
    }

    // 处理tags字段
    const processedDiary = {
      ...diary,
      tags: diary.tags ? JSON.parse(diary.tags) : []
    }

    return NextResponse.json(processedDiary)

  } catch (error) {
    console.error('Error fetching diary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/diaries/[id] - 更新日记
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const diaryId = params.id
    const body = await request.json()
    const { title, content, tags = [], mood, weather, createdAt } = body

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
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

    // 检查日记是否存在并属于当前用户
    const existingDiary = await prisma.diary.findFirst({
      where: {
        id: diaryId,
        userId: user.id
      }
    })

    if (!existingDiary) {
      return NextResponse.json(
        { error: 'Diary not found or access denied' },
        { status: 404 }
      )
    }

    // 确保 tags 是数组并进行序列化
    const processedTags = Array.isArray(tags) ? tags : []

    // 处理创建时间
    let diaryCreatedAt = existingDiary.createdAt
    if (createdAt) {
      const customDate = new Date(createdAt)
      if (!isNaN(customDate.getTime())) {
        diaryCreatedAt = customDate
      }
    }

    // 更新日记
    const updatedDiary = await prisma.diary.update({
      where: { id: diaryId },
      data: {
        title: title.trim(),
        content: content.trim(),
        tags: JSON.stringify(processedTags),
        mood: mood || null,
        weather: weather || null,
        updatedAt: new Date(),
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

    // 处理返回的 tags 字段
    const processedDiary = {
      ...updatedDiary,
      tags: processedTags
    }

    return NextResponse.json(processedDiary)

  } catch (error) {
    console.error('Error updating diary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/diaries/[id] - 删除日记
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const diaryId = params.id

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 检查日记是否存在并属于当前用户
    const existingDiary = await prisma.diary.findFirst({
      where: {
        id: diaryId,
        userId: user.id
      }
    })

    if (!existingDiary) {
      return NextResponse.json(
        { error: 'Diary not found or access denied' },
        { status: 404 }
      )
    }

    // 删除日记
    await prisma.diary.delete({
      where: { id: diaryId }
    })

    return NextResponse.json({ message: 'Diary deleted successfully' })

  } catch (error) {
    console.error('Error deleting diary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 