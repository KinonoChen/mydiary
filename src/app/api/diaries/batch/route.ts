import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/diaries/batch - 批量操作日记
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, diaryIds } = body

    if (!action || !Array.isArray(diaryIds) || diaryIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and diaryIds are required' },
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

    // 验证所有日记都属于当前用户
    const userDiaries = await prisma.diary.findMany({
      where: {
        id: { in: diaryIds },
        userId: user.id
      },
      select: { id: true }
    })

    if (userDiaries.length !== diaryIds.length) {
      return NextResponse.json(
        { error: 'Some diaries not found or access denied' },
        { status: 403 }
      )
    }

    switch (action) {
      case 'delete':
        // 批量删除
        const deleteResult = await prisma.diary.deleteMany({
          where: {
            id: { in: diaryIds },
            userId: user.id
          }
        })

        return NextResponse.json({
          message: `Successfully deleted ${deleteResult.count} diaries`,
          deletedCount: deleteResult.count
        })

      case 'export':
        // 批量导出
        const exportDiaries = await prisma.diary.findMany({
          where: {
            id: { in: diaryIds },
            userId: user.id
          },
          orderBy: { createdAt: 'desc' },
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

        // 处理导出数据
        const processedExportData = exportDiaries.map(diary => ({
          ...diary,
          tags: diary.tags ? JSON.parse(diary.tags) : [],
          createdAt: diary.createdAt.toISOString(),
          updatedAt: diary.updatedAt.toISOString()
        }))

        return NextResponse.json({
          message: `Successfully exported ${processedExportData.length} diaries`,
          data: processedExportData,
          exportInfo: {
            totalCount: processedExportData.length,
            exportDate: new Date().toISOString(),
            user: session.user.email
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: delete, export' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in batch operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/diaries/batch/export-all - 导出所有日记
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

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
        content: true,
        tags: true,
        mood: true,
        weather: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // 处理导出数据
    const processedDiaries = allDiaries.map(diary => ({
      ...diary,
      tags: diary.tags ? JSON.parse(diary.tags) : [],
      createdAt: diary.createdAt.toISOString(),
      updatedAt: diary.updatedAt.toISOString()
    }))

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeaders = ['ID', 'Title', 'Content', 'Tags', 'Mood', 'Weather', 'Created At', 'Updated At']
      const csvRows = processedDiaries.map(diary => [
        diary.id,
        `"${diary.title.replace(/"/g, '""')}"`,
        `"${diary.content.replace(/"/g, '""')}"`,
        `"${diary.tags.join(', ')}"`,
        diary.mood || '',
        diary.weather || '',
        diary.createdAt,
        diary.updatedAt
      ])

      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="diaries-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // 默认JSON格式
    return NextResponse.json({
      message: `Successfully exported ${processedDiaries.length} diaries`,
      data: processedDiaries,
      exportInfo: {
        totalCount: processedDiaries.length,
        exportDate: new Date().toISOString(),
        user: session.user.email,
        format: 'json'
      }
    })

  } catch (error) {
    console.error('Error exporting all diaries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 